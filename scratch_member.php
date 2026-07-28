<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$u = App\Models\User::where('email', 'damore.margarete@example.net')->first();
if ($u && $u->member) {
    $m = $u->member;
    echo 'ID: '.$m->id."\n";
    if (isset($m->member_id)) {
        echo 'Member_ID: '.$m->member_id."\n";
    }
} else {
    echo "Member not found\n";
}
