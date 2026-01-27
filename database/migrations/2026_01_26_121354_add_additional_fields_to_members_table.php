<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Essential Personal Information
            $table->string('first_name')->nullable()->after('user_id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('email')->nullable()->unique()->after('last_name');
            
            // Medical Information
            $table->string('blood_group')->nullable()->after('photo_url');
            $table->text('medical_history')->nullable()->after('blood_group');
            $table->text('allergies')->nullable()->after('medical_history');
            
            // Background Information
            $table->string('school_occupation')->nullable()->after('emergency_number');
            $table->enum('fitness_level', ['beginner', 'intermediate', 'advanced'])->default('beginner')->after('school_occupation');
            $table->text('previous_club_experience')->nullable()->after('fitness_level');
            
            // Guardian Information (for minors)
            $table->string('guardian_name')->nullable()->after('previous_club_experience');
            $table->string('guardian_nic')->nullable()->after('guardian_name');
            $table->string('guardian_relationship')->nullable()->after('guardian_nic');
            
            // Membership Preferences
            $table->enum('membership_type', ['regular', 'student', 'senior'])->default('regular')->after('guardian_relationship');
            $table->string('jersey_size')->nullable()->after('membership_type');
            $table->json('preferred_training_days')->nullable()->after('jersey_size');
            $table->string('preferred_contact_method')->default('email')->after('preferred_training_days'); // email, sms, whatsapp
            $table->string('referral_source')->nullable()->after('preferred_contact_method');
            
            // Document Storage
            $table->string('nic_photo_url')->nullable()->after('referral_source');
            
            // Legal Consents
            $table->boolean('terms_accepted')->default(false)->after('nic_photo_url');
            $table->timestamp('terms_accepted_at')->nullable()->after('terms_accepted');
            $table->boolean('photo_consent')->default(false)->after('terms_accepted_at');
            $table->timestamp('photo_consent_at')->nullable()->after('photo_consent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'email',
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
                'nic_photo_url',
                'terms_accepted',
                'terms_accepted_at',
                'photo_consent',
                'photo_consent_at',
            ]);
        });
    }
};
