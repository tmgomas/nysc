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

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'coach_programs')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function programClasses()
    {
        return $this->hasMany(ProgramClass::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForProgram($query, $programId)
    {
        return $query->whereHas('programs', function ($q) use ($programId) {
            $q->where('programs.id', $programId);
        });
    }
}
