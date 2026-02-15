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
        // Add program_id to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('program_id')->nullable()->after('member_id')->constrained('programs')->onDelete('cascade');
        });

        // Step 1: Add a simple index on member_id so the generic FK has something to latch onto
        Schema::table('member_payment_schedules', function (Blueprint $table) {
             $table->index('member_id');
        });

        // Step 2: Drop the unique index (now safe) and modify columns
        Schema::table('member_payment_schedules', function (Blueprint $table) {
            $table->dropUnique(['member_id', 'month_year']);
            $table->foreignUuid('program_id')->nullable()->after('member_id')->constrained('programs')->onDelete('cascade');
            $table->unique(['member_id', 'program_id', 'month_year'], 'mps_member_program_month_unique');
        });
        
        // Remove Step 3 since we didn't drop the FK
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_payment_schedules', function (Blueprint $table) {
            $table->dropUnique('mps_member_program_month_unique');
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
            $table->unique(['member_id', 'month_year']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
        });
    }
};
