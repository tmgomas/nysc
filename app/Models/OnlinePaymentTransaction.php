<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnlinePaymentTransaction extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'member_id',
        'order_id',
        'amount',
        'currency',
        'gateway',
        'gateway_transaction_id',
        'gateway_method',
        'status',
        'gateway_response',
        'hash',
        'initiated_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gateway_response' => 'array',
            'initiated_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function markAsSuccess(string $gatewayTransactionId, string $gatewayMethod, array $gatewayResponse): void
    {
        $this->update([
            'status' => 'success',
            'gateway_transaction_id' => $gatewayTransactionId,
            'gateway_method' => $gatewayMethod,
            'gateway_response' => $gatewayResponse,
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(array $gatewayResponse): void
    {
        $this->update([
            'status' => 'failed',
            'gateway_response' => $gatewayResponse,
            'completed_at' => now(),
        ]);
    }

    public function markAsCancelled(array $gatewayResponse = []): void
    {
        $this->update([
            'status' => 'cancelled',
            'gateway_response' => $gatewayResponse,
            'completed_at' => now(),
        ]);
    }
}
