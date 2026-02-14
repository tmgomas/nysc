<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Holiday extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'date',
        'is_recurring',
    ];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
    ];

    // Scopes
    public function scopeForDate($query, $date)
    {
        $date = \Carbon\Carbon::parse($date);

        return $query->where(function ($q) use ($date) {
            // Exact date match
            $q->where('date', $date->toDateString());
        })->orWhere(function ($q) use ($date) {
            // Recurring: same month and day, any year
            $q->where('is_recurring', true)
              ->whereMonth('date', $date->month)
              ->whereDay('date', $date->day);
        });
    }

    public function scopeUpcoming($query, int $days = 30)
    {
        return $query->where('date', '>=', now()->toDateString())
                     ->where('date', '<=', now()->addDays($days)->toDateString())
                     ->orderBy('date');
    }

    public function scopeInRange($query, string $start, string $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->whereBetween('date', [$start, $end]);
        })->orWhere(function ($q) use ($start, $end) {
            // Recurring holidays: match month/day range
            $q->where('is_recurring', true);
        });
    }
}
