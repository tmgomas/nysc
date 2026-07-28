<?php

$merchantId = '1220985';
$orderId = 'NYCSC-F42LKFCC-019f900e';
$amount = '2700.00';
$currency = 'LKR';
$secret = 'NDE4MzA5NzgzMjI0OTY1NjkxMzYxNTU2NzAyODk0NTgzOTI5MjA=';

// As-is secret
$secretHash1 = strtoupper(md5($secret));
$hash1 = strtoupper(md5($merchantId.$orderId.$amount.$currency.$secretHash1));

// Base64 decoded secret
$decodedSecret = base64_decode($secret);
$secretHash2 = strtoupper(md5($decodedSecret));
$hash2 = strtoupper(md5($merchantId.$orderId.$amount.$currency.$secretHash2));

echo 'Hash (As-Is): '.$hash1."\n";
echo 'Hash (Decoded): '.$hash2."\n";
