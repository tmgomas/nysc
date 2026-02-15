<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Program extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'short_code',
        'description',
        'admission_fee',
        'monthly_fee',
        'capacity',
        'location_id',
        'schedule',
        'schedule_type',
        'weekly_limit',
        'is_active',
    ];

    protected $casts = [
        'admission_fee' => 'decimal:2',
        'monthly_fee' => 'decimal:2',
        'capacity' => 'integer',
        'schedule' => 'array',
        'weekly_limit' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function members()
    {
        return $this->belongsToMany(Member::class, 'member_programs')
            ->withPivot('enrolled_at', 'status')
            ->withTimestamps();
    }

    public function coaches()
    {
        return $this->belongsToMany(Coach::class, 'coach_programs')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function classes()
    {
        return $this->hasMany(ProgramClass::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getTotalFeeAttribute()
    {
        return $this->admission_fee + $this->monthly_fee;
    }

    public function getAvailableSlotsAttribute()
    {
        if (!$this->capacity) {
            return null;
        }
        
        $enrolledCount = $this->members()->where('member_programs.status', 'active')->count();
        return $this->capacity - $enrolledCount;
    }
}
