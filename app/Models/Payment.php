<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\{PaymentType, PaymentStatus, PaymentMethod};

class Payment extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_id', // Added
        'type',
        'amount',
        'month_year',
        'months_count',
        'status',
        'due_date',
        'paid_date',
        'payment_method',
        'receipt_url',
        'reference_number',
        'receipt_number',
        'notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'months_count' => 'integer',
        'due_date' => 'date',
        'paid_date' => 'date',
        'verified_at' => 'datetime',
        'type' => PaymentType::class,
        'status' => PaymentStatus::class,
        'payment_method' => PaymentMethod::class,
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function schedules()
    {
        return $this->hasMany(MemberPaymentSchedule::class);
    }

    public function items()
    {
        return $this->hasMany(PaymentItem::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
            ->where('due_date', '<', now());
    }

    // Accessors
    public function getIsOverdueAttribute()
    {
        return $this->status === 'pending' && $this->due_date < now();
    }
}
