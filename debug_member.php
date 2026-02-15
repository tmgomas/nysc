<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

try {
    echo "Attempting to create suspended member...\n";
    $admin = App\Models\User::role('admin')->first();
    
    if (!$admin) {
        $admin = App\Models\User::factory()->create();
        $admin->assignRole('admin');
    }

    $member = App\Models\Member::factory()->create([
        'status' => 'suspended',
        'approved_by' => $admin->id,
        'approved_at' => now()->subMonths(6),
    ]);
    
    echo "Member created successfully explicitly.\n";
    
    echo "Attempting to create via state...\n";
    App\Models\Member::factory()
        ->state(function (array $attributes) use ($admin) {
            return [
                'status' => 'suspended',
                'approved_by' => $admin->id,
                'approved_at' => now()->subMonths(6),
            ];
        })
        ->create();
        
    echo "Member created via state successfully.\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
