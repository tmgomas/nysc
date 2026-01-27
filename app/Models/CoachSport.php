<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CoachSport extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'coach_id',
        'sport_id',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    // Relationships
    public function coach()
    {
        return $this->belongsTo(Coach::class);
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }
}
