<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassCancellation extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $table = 'class_cancellations';

    protected $fillable = [
        'program_class_id',
        'cancelled_date',
        'reason',
    ];

    protected $casts = [
        'cancelled_date' => 'date',
    ];

    // Relationships
    public function programClass()
    {
        return $this->belongsTo(ProgramClass::class);
    }
}
