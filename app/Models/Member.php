<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Notifications\Notifiable;
use App\Enums\MemberStatus;
use App\Traits\{HasPayments, HasAttendance, HasPrograms, Loggable};

class Member extends Model
{
    use HasFactory, SoftDeletes, HasUuids, Notifiable;
    use HasPayments, HasAttendance, HasPrograms, Loggable;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'member_number',
        'registration_reference',
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
        'nfc_tag_id',
        'rfid_card_id',
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

    public function programs()
    {
        return $this->belongsToMany(Program::class, 'member_programs')
            ->using(MemberProgram::class)
            ->withPivot('enrolled_at', 'status','program_reference')
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

    public function programClasses()
    {
        return $this->hasMany(MemberProgramClass::class);
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

    /**
     * Route notification for TextLK SMS channel
     * Text.lk expects phone numbers in format: 947XXXXXXXX (without + prefix)
     */
    public function routeNotificationForTextlk($notification): ?string
    {
        if (empty($this->contact_number)) {
            return null;
        }

        $phone = $this->contact_number;
        
        // Remove + prefix if present
        if (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        }
        
        // Remove leading 0 and add 94 country code if needed
        if (str_starts_with($phone, '0')) {
            $phone = '94' . substr($phone, 1);
        }
        
        // If doesn't start with 94, assume it's a local number
        if (!str_starts_with($phone, '94')) {
            $phone = '94' . $phone;
        }
        
        return $phone;
    }

    /**
     * Check if member prefers SMS notifications
     */
    public function prefersSms(): bool
    {
        return $this->preferred_contact_method === 'sms';
    }
}

