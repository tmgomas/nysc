<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\AttendanceMethod;

class Attendance extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'member_id',
        'program_id',
        'check_in_time',
        'check_out_time',
        'duration_minutes',
        'marked_by',
        'method',
        'notes',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'duration_minutes' => 'integer',
        'method' => AttendanceMethod::class,
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

    public function markedBy()
    {
        return $this->belongsTo(User::class, 'marked_by');
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('check_in_time', today());
    }

    public function scopeForProgram($query, $programId)
    {
        return $query->where('program_id', $programId);
    }

    public function scopeForMember($query, $memberId)
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    // Mutators
    public function setCheckOutTimeAttribute($value)
    {
        $this->attributes['check_out_time'] = $value;
        
        if ($value && $this->check_in_time) {
            $this->attributes['duration_minutes'] = $this->check_in_time->diffInMinutes($value);
        }
    }
}
