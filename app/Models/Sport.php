<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Sport extends Model
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
        'location',
        'schedule',
        'is_active',
    ];

    protected $casts = [
        'admission_fee' => 'decimal:2',
        'monthly_fee' => 'decimal:2',
        'capacity' => 'integer',
        'schedule' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function members()
    {
        return $this->belongsToMany(Member::class, 'member_sports')
            ->withPivot('enrolled_at', 'status')
            ->withTimestamps();
    }

    public function coaches()
    {
        return $this->belongsToMany(Coach::class, 'coach_sports')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
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
        
        $enrolledCount = $this->members()->where('member_sports.status', 'active')->count();
        return $this->capacity - $enrolledCount;
    }
}
