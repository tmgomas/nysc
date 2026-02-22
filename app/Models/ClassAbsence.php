<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;

class ClassAbsence extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_class_id',
        'absent_date',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'admin_notes',
        'makeup_class_id',
        'makeup_date',
        'makeup_deadline',
    ];

    protected $casts = [
        'absent_date'     => 'date',
        'makeup_date'     => 'date',
        'makeup_deadline' => 'date',
        'approved_at'     => 'datetime',
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function programClass()
    {
        return $this->belongsTo(ProgramClass::class, 'program_class_id');
    }

    public function makeupClass()
    {
        return $this->belongsTo(ProgramClass::class, 'makeup_class_id');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeAwaitingMakeup($query)
    {
        return $query->where('status', 'approved')
                     ->where('makeup_deadline', '>=', now()->toDateString());
    }

    // Helpers
    public function isDeadlineExpired(): bool
    {
        return $this->makeup_deadline && now()->toDateString() > $this->makeup_deadline->toDateString();
    }

    public function daysLeftForMakeup(): ?int
    {
        if (!$this->makeup_deadline || $this->status !== 'approved') {
            return null;
        }
        return max(0, now()->startOfDay()->diffInDays($this->makeup_deadline, false));
    }

    /**
     * Number of makeups already used in the same month as the absence
     */
    public function memberMakeupCountThisMonth(): int
    {
        return static::where('member_id', $this->member_id)
            ->whereMonth('absent_date', $this->absent_date->month)
            ->whereYear('absent_date', $this->absent_date->year)
            ->whereIn('status', ['makeup_selected', 'completed'])
            ->where('id', '!=', $this->id)
            ->count();
    }
}
