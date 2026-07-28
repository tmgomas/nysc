<?php

use App\Models\Attendance;
use App\Models\Member;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->admin = User::factory()->create();
    $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    $this->admin->assignRole($role);
});

it('can check in a member via scan', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    $date = now()->format('Y-m-d');

    actingAs($this->admin)
        ->post(route('admin.attendance.scan'), [
            'date' => $date,
            'program_id' => $program->id,
            'member_number' => $member->member_number,
            'method' => 'qr_code',
        ])
        ->assertSessionHasNoErrors()
        ->assertSuccessful()
        ->assertJsonPath('status', 'checked_in');

    assertDatabaseHas('attendances', [
        'member_id' => $member->id,
        'program_id' => $program->id,
        'method' => 'qr_code',
    ]);
});

it('can check out a member via scan', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);
    $date = now()->format('Y-m-d');

    // Create existing check-in 10 minutes ago
    $attendance = Attendance::create([
        'member_id' => $member->id,
        'program_id' => $program->id,
        'check_in_time' => Carbon::now()->subMinutes(10),
        'method' => 'qr_code',
        'marked_by' => $this->admin->id,
    ]);

    actingAs($this->admin)
        ->post(route('admin.attendance.scan'), [
            'date' => $date,
            'program_id' => $program->id,
            'member_number' => $member->member_number,
            'method' => 'qr_code',
        ])
        ->assertSessionHasNoErrors()
        ->assertSuccessful()
        ->assertJsonPath('status', 'checked_out');

    expect($attendance->fresh()->check_out_time)->not->toBeNull();
});

it('prevents scan check-in for suspended members', function () {
    $member = Member::factory()->create(['status' => 'suspended']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);
    $date = now()->format('Y-m-d');

    actingAs($this->admin)
        ->post(route('admin.attendance.scan'), [
            'date' => $date,
            'program_id' => $program->id,
            'member_number' => $member->member_number,
            'method' => 'qr_code',
        ])
        ->assertStatus(400)
        ->assertJsonPath('success', false);
});

it('prevents double-punching (check-out immediately after check-in)', function () {
    $member = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);
    $date = now()->format('Y-m-d');

    // Create existing check-in just 1 minute ago
    $attendance = Attendance::create([
        'member_id' => $member->id,
        'program_id' => $program->id,
        'check_in_time' => Carbon::now()->subMinutes(1),
        'method' => 'qr_code',
        'marked_by' => $this->admin->id,
    ]);

    actingAs($this->admin)
        ->post(route('admin.attendance.scan'), [
            'date' => $date,
            'program_id' => $program->id,
            'member_number' => $member->member_number,
            'method' => 'qr_code',
        ])
        ->assertSuccessful()
        ->assertJsonPath('message', 'Already Checked In (Duplicate scan ignored) - Wait 5m to checkout');

    expect($attendance->fresh()->check_out_time)->toBeNull();
});

it('can bulk mark attendance manually', function () {
    $member1 = Member::factory()->create(['status' => 'active']);
    $member2 = Member::factory()->create(['status' => 'active']);
    $program = Program::factory()->create();

    $date = now()->format('Y-m-d');

    actingAs($this->admin)
        ->post(route('admin.attendance.bulk'), [
            'date' => $date,
            'program_id' => $program->id,
            'attendances' => [
                [
                    'member_id' => $member1->id,
                    'present' => true,
                    'check_in' => '08:00',
                    'check_out' => '10:00',
                ],
                [
                    'member_id' => $member2->id,
                    'present' => false,
                ],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    assertDatabaseHas('attendances', [
        'member_id' => $member1->id,
        'program_id' => $program->id,
        'method' => 'bulk',
    ]);

    $this->assertDatabaseMissing('attendances', [
        'member_id' => $member2->id,
        'program_id' => $program->id,
    ]);
});
