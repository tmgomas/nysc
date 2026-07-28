<?php

use App\Models\Member;
use App\Models\Program;
use App\Models\User;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    // Create an admin user with necessary permissions
    $this->admin = User::factory()->create();

    // Create the 'admin' and 'member' roles if they don't exist
    $role = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'member', 'guard_name' => 'web']);

    $this->admin->assignRole($role);
});

it('can view members index', function () {
    Member::factory()->count(3)->create();

    actingAs($this->admin)
        ->get(route('admin.members.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Admin/Members/Index'));
});

it('can store a new member', function () {
    $program = Program::factory()->create();

    $payload = [
        'full_name' => 'John Admin Doe',
        'calling_name' => 'John',
        'email' => 'john.admin@example.com',
        'nic_passport' => '123456789V',
        'date_of_birth' => '1990-01-01',
        'gender' => 'male',
        'contact_number' => '0771112222',
        'address' => '123 Test Street',
        'emergency_contact' => 'Jane Doe',
        'emergency_number' => '0773334444',
        'membership_type' => 'regular',
        'fitness_level' => 'beginner',
        'preferred_contact_method' => 'email',
        'program_ids' => [$program->id],
        'terms_accepted' => true,
        'photo_consent' => true,
    ];

    actingAs($this->admin)
        ->post(route('admin.members.store'), $payload)
        ->assertRedirect();

    assertDatabaseHas('members', [
        'full_name' => 'John Admin Doe',
        'email' => 'john.admin@example.com',
        'status' => 'pending', // Usually defaults to pending
    ]);
});

it('can approve a member and create a user account', function () {
    $member = Member::factory()->create(['status' => 'pending']);
    $program = Program::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    actingAs($this->admin)
        ->post(route('admin.members.approve', $member))
        ->assertRedirect();

    $member->refresh();

    expect($member->status->value)->toBe('active'); // MemberStatus enum
    expect($member->user_id)->not->toBeNull();

    assertDatabaseHas('users', [
        'id' => $member->user_id,
        'email' => $member->email,
    ]);
});

it('can suspend a member', function () {
    $member = Member::factory()->create(['status' => 'active']);

    actingAs($this->admin)
        ->post(route('admin.members.suspend', $member), [
            'reason' => 'Violation of rules',
        ])
        ->assertRedirect();

    assertDatabaseHas('members', [
        'id' => $member->id,
        'status' => 'suspended',
    ]);
});

it('can reactivate a suspended member', function () {
    $member = Member::factory()->create(['status' => 'suspended']);

    actingAs($this->admin)
        ->post(route('admin.members.reactivate', $member))
        ->assertRedirect();

    assertDatabaseHas('members', [
        'id' => $member->id,
        'status' => 'active',
    ]);
});

it('can update member programs', function () {
    $member = Member::factory()->create();
    $program = Program::factory()->create();

    actingAs($this->admin)
        ->put(route('admin.members.update-programs', $member), [
            'program_ids' => [$program->id],
        ])
        ->assertRedirect();

    assertDatabaseHas('member_programs', [
        'member_id' => $member->id,
        'program_id' => $program->id,
        'status' => 'active',
    ]);
});

it('can assign a member to a class', function () {
    $program = Program::factory()->create();
    $member = Member::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    $class = \App\Models\ProgramClass::create([
        'program_id' => $program->id,
        'label' => 'Morning Slot',
        'day_of_week' => 'Monday',
        'start_time' => '08:00:00',
        'end_time' => '10:00:00',
        'is_active' => true,
    ]);

    actingAs($this->admin)
        ->post(route('admin.class-assignments.assign'), [
            'member_id' => $member->id,
            'program_class_id' => $class->id,
            'notes' => 'Assigned',
        ])
        ->assertRedirect();

    assertDatabaseHas('member_program_classes', [
        'member_id' => $member->id,
        'program_class_id' => $class->id,
        'status' => 'active',
    ]);
});

it('can unassign a member from a class', function () {
    $program = Program::factory()->create();
    $member = Member::factory()->create();
    $member->programs()->attach($program->id, ['status' => 'active', 'enrolled_at' => now()]);

    $class = \App\Models\ProgramClass::create([
        'program_id' => $program->id,
        'label' => 'Morning Slot',
        'day_of_week' => 'Monday',
        'start_time' => '08:00:00',
        'end_time' => '10:00:00',
        'is_active' => true,
    ]);

    \App\Models\MemberProgramClass::create([
        'member_id' => $member->id,
        'program_class_id' => $class->id,
        'assigned_by' => $this->admin->id,
        'status' => 'active',
    ]);

    actingAs($this->admin)
        ->post(route('admin.class-assignments.unassign'), [
            'member_id' => $member->id,
            'program_class_id' => $class->id,
        ])
        ->assertRedirect();

    assertDatabaseHas('member_program_classes', [
        'member_id' => $member->id,
        'program_class_id' => $class->id,
        'status' => 'dropped',
    ]);
});
