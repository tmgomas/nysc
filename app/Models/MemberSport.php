<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MemberSport extends Pivot
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'sport_id',
        'enrolled_at',
        'status',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    // Relationships
    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function sport()
    {
        return $this->belongsTo(Sport::class);
    }
}
