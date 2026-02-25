<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PracticeCancellation extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'practice_cancellations';

    protected $fillable = [
        'program_id',
        'cancelled_date',
        'reason',
    ];

    protected $casts = [
        'cancelled_date' => 'date',
    ];

    // Relationships
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
