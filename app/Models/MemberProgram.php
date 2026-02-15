<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MemberProgram extends Pivot
{
    use HasFactory, HasUuids;

    protected $table = 'member_programs';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_id',
        'program_reference',
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

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
