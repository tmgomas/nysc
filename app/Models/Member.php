<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Enums\MemberStatus;
use App\Traits\{HasPayments, HasAttendance, HasSports, Loggable};

class Member extends Model
{
    use HasFactory, SoftDeletes, HasUuids;
    use HasPayments, HasAttendance, HasSports, Loggable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'member_number',
        'full_name',
        'calling_name',
        'email',
        'nic_passport',
        'date_of_birth',
        'gender',
        'contact_number',
        'address',
        'emergency_contact',
        'emergency_number',
        'photo_url',
        'nic_photo_url',
        'blood_group',
        'medical_history',
        'allergies',
        'school_occupation',
        'fitness_level',
        'previous_club_experience',
        'guardian_name',
        'guardian_nic',
        'guardian_relationship',
        'membership_type',
        'jersey_size',
        'preferred_training_days',
        'preferred_contact_method',
        'referral_source',
        'registration_date',
        'status',
        'approved_by',
        'approved_at',
        'terms_accepted',
        'terms_accepted_at',
        'photo_consent',
        'photo_consent_at',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'registration_date' => 'date',
        'approved_at' => 'datetime',
        'terms_accepted_at' => 'datetime',
        'photo_consent_at' => 'datetime',
        'status' => MemberStatus::class,
        'preferred_training_days' => 'array',
        'terms_accepted' => 'boolean',
        'photo_consent' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function sports()
    {
        return $this->belongsToMany(Sport::class, 'member_sports')
            ->using(MemberSport::class)
            ->withPivot('enrolled_at', 'status')
            ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function paymentSchedules()
    {
        return $this->hasMany(MemberPaymentSchedule::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }
}
