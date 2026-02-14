<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class SpecialBooking extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'location_id',
        'title',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'reason',
        'cancels_classes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'cancels_classes' => 'boolean',
    ];

    // Relationships
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    // Scopes
    public function scopeForDateRange($query, string $start, string $end)
    {
        return $query->where('start_date', '<=', $end)
                     ->where('end_date', '>=', $start);
    }

    public function scopeForDate($query, string $date)
    {
        return $query->where('start_date', '<=', $date)
                     ->where('end_date', '>=', $date);
    }

    public function scopeCancelling($query)
    {
        return $query->where('cancels_classes', true);
    }

    /**
     * Check if this booking overlaps with a specific time.
     */
    public function overlapsTime(?string $startTime, ?string $endTime): bool
    {
        // If booking has no specific time range, it's all-day → always overlaps
        if (!$this->start_time || !$this->end_time) {
            return true;
        }

        // If class has no time info, assume overlap
        if (!$startTime || !$endTime) {
            return true;
        }

        // Check time overlap
        return $this->start_time < $endTime && $this->end_time > $startTime;
    }
}
