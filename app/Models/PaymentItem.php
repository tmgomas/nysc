<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\PaymentType;

class PaymentItem extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'payment_id',
        'sport_id',
        'type',
        'amount',
        'month_year',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'type' => PaymentType::class,
    ];

    // Relationships
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }

    // Accessors
    public function getFormattedAmountAttribute(): string
    {
        return 'Rs. ' . number_format($this->amount, 2);
    }

    public function getTypeDescriptionAttribute(): string
    {
        return match($this->type) {
            PaymentType::ADMISSION => 'Admission Fee',
            PaymentType::MONTHLY => 'Monthly Fee',
            default => 'Fee',
        };
    }
}
