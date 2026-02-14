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
        'sport_class_id',
        'cancelled_date',
        'reason',
    ];

    protected $casts = [
        'cancelled_date' => 'date',
    ];

    // Relationships
    public function sportClass()
    {
        return $this->belongsTo(SportClass::class);
    }
}
