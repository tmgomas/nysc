<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tx = App\Models\OnlinePaymentTransaction::latest()->first();
if ($tx) {
    echo 'Transaction Status: '.$tx->status."\n";
    echo 'Payment Status: '.$tx->payment->status->value."\n";
} else {
    echo "No transaction\n";
}
