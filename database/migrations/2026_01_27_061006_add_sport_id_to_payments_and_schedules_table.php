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
        // Add sport_id to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('sport_id')->nullable()->after('member_id')->constrained('sports')->onDelete('cascade');
        });

        // Add sport_id to member_payment_schedules and update unique constraint
        Schema::table('member_payment_schedules', function (Blueprint $table) {
            // Drop the old unique constraint first
            $table->dropUnique(['member_id', 'month_year']);
            
            $table->foreignUuid('sport_id')->nullable()->after('member_id')->constrained('sports')->onDelete('cascade');
            
            // Add new unique constraint including sport_id
            // Note: We use a name for the index to avoid auto-generation length issues
            $table->unique(['member_id', 'sport_id', 'month_year'], 'mps_member_sport_month_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_payment_schedules', function (Blueprint $table) {
            $table->dropUnique('mps_member_sport_month_unique');
            $table->dropForeign(['sport_id']);
            $table->dropColumn('sport_id');
            $table->unique(['member_id', 'month_year']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['sport_id']);
            $table->dropColumn('sport_id');
        });
    }
};
