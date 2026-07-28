<?php

use App\Models\Program;

test('registration screen can be rendered', function () {
    $response = $this->get(route('registration.create'));

    $response->assertOk();
});

test('new members can submit a registration application', function () {
    $program = Program::factory()->create(['is_active' => true]);

    $response = $this->post(route('registration.store'), [
        'nic_passport' => 'NIC123456',
        'date_of_birth' => '1995-01-01',
        'gender' => 'male',
        'contact_number' => '0771234567',
        'address' => '123 Test Street',
        'emergency_contact' => 'Jane Doe',
        'emergency_number' => '0779876543',
        'program_ids' => [$program->id],
    ]);

    $response->assertRedirect(route('registration.success'));
});
