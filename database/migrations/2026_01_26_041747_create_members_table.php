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
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('member_number')->unique(); // M0001, M0002
            $table->string('nic_passport')->unique();
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('contact_number');
            $table->text('address');
            $table->string('emergency_contact');
            $table->string('emergency_number');
            $table->string('photo_url')->nullable();
            $table->date('registration_date');
            $table->enum('status', ['pending', 'active', 'suspended', 'inactive'])->default('pending');
            $table->foreignUuid('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
