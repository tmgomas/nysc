<?php

use App\Models\Member;
use App\Models\Payment;
use App\Models\Program;
use App\Models\User;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->admin = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->admin->assignRole($role);
});

it('can process an admission payment', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create(['admission_fee' => 1000]);
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    actingAs($this->admin)
        ->post(route('admin.payments.store'), [
            'member_id' => $member->id,
            'type' => 'admission',
            'payment_method' => 'cash',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'member_id' => $member->id,
        'type' => 'admission',
        'payment_method' => 'cash',
    ]);
});

it('can process a monthly payment', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create(['monthly_fee' => 1000]);

    // Monthly payments require an active program enrollment in PaymentService
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    actingAs($this->admin)
        ->post(route('admin.payments.store'), [
            'member_id' => $member->id,
            'program_id' => $program->id,
            'type' => 'monthly',
            'month_year' => '2026-07',
            'payment_method' => 'bank_transfer',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'member_id' => $member->id,
        'type' => 'monthly',
        'month_year' => '2026-07',
        'payment_method' => 'bank_transfer',
    ]);
});

it('can process a bulk payment', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create(['monthly_fee' => 1000]);
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    actingAs($this->admin)
        ->post(route('admin.payments.store'), [
            'member_id' => $member->id,
            'type' => 'bulk',
            'months_count' => 3,
            'month_year' => '2026-07',
            'payment_method' => 'cash',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'member_id' => $member->id,
        'type' => 'bulk',
        'months_count' => 3,
        'month_year' => '2026-07',
    ]);
});

it('can verify a payment', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $payment = Payment::create([
        'member_id' => $member->id,
        'type' => 'monthly',
        'amount' => 1000,
        'status' => 'paid', // Must be paid to verify
        'payment_method' => 'bank_transfer',
        'due_date' => now(),
    ]);

    actingAs($this->admin)
        ->post(route('admin.payments.verify', $payment))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'id' => $payment->id,
        'status' => 'verified',
    ]);
});

it('can reject a payment', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $payment = Payment::create([
        'member_id' => $member->id,
        'type' => 'monthly',
        'amount' => 1000,
        'status' => 'pending',
        'payment_method' => 'bank_transfer',
        'due_date' => now(),
    ]);

    actingAs($this->admin)
        ->post(route('admin.payments.reject', $payment), [
            'reason' => 'Invalid receipt',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'id' => $payment->id,
        'status' => 'rejected',
        'notes' => 'Invalid receipt',
    ]);
});

it('can mark a pending payment as paid', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $payment = Payment::create([
        'member_id' => $member->id,
        'type' => 'monthly',
        'amount' => 1000,
        'status' => 'pending',
        'payment_method' => 'cash',
        'due_date' => now(),
    ]);

    actingAs($this->admin)
        ->put(route('admin.payments.mark-as-paid', $payment), [
            'payment_method' => 'cash',
            'paid_date' => now()->format('Y-m-d'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('payments', [
        'id' => $payment->id,
        'status' => 'paid',
        'payment_method' => 'cash',
    ]);
});
