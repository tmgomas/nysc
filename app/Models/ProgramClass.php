<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ProgramClass extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'program_classes';

    protected $fillable = [
        'program_id',
        'label',
        'day_of_week',
        'start_time',
        'end_time',
        'coach_id',
        'capacity',
        'recurrence',
        'valid_from',
        'valid_to',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'valid_from' => 'date',
        'valid_to' => 'date',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }

    public function cancellations()
    {
        return $this->hasMany(ClassCancellation::class);
    }

    public function assignedMembers()
    {
        return $this->hasMany(MemberProgramClass::class)
                    ->where('status', 'active');
    }

    public function absences()
    {
        return $this->hasMany(ClassAbsence::class, 'program_class_id');
    }

    public function makeupAbsences()
    {
        return $this->hasMany(ClassAbsence::class, 'makeup_class_id');
    }

    // Count of members currently assigned to this slot
    public function getAssignedCountAttribute(): int
    {
        return $this->assignedMembers()->count();
    }

    // Available slots remaining (regular + makeup)
    public function getAvailableSlotsAttribute(): int
    {
        if (!$this->capacity) return PHP_INT_MAX;
        $makeupCount = $this->makeupAbsences()
            ->whereIn('status', ['makeup_selected', 'completed'])
            ->count();
        return max(0, $this->capacity - $this->assigned_count - $makeupCount);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForDay($query, string $day)
    {
        return $query->where('day_of_week', $day);
    }

    public function scopeCurrent($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('valid_from')
              ->orWhere('valid_from', '<=', now());
        })->where(function ($q) {
            $q->whereNull('valid_to')
              ->orWhere('valid_to', '>=', now());
        });
    }

    // Helpers
    public function getFormattedTimeAttribute(): string
    {
        $start = \Carbon\Carbon::parse($this->start_time)->format('g:i A');
        $end = \Carbon\Carbon::parse($this->end_time)->format('g:i A');
        return "{$start} - {$end}";
    }
}
