<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Coach extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'name',
        'contact_number',
        'specialization',
        'experience_years',
        'is_active',
    ];

    protected $casts = [
        'experience_years' => 'integer',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sports()
    {
        return $this->belongsToMany(Sport::class, 'coach_sports')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForSport($query, $sportId)
    {
        return $query->whereHas('sports', function ($q) use ($sportId) {
            $q->where('sports.id', $sportId);
        });
    }
}
