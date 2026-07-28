<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'gomistharindu@gmail.com';
$u = App\Models\User::where('email', $email)->first();
if ($u) {
    $u->password = Illuminate\Support\Facades\Hash::make('password');
    $u->save();
    echo "SUCCESS\n";
} else {
    echo "NOT_FOUND\n";
}
