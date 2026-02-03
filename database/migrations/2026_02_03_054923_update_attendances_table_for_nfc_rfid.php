<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Make sport_id nullable for general attendance
            $table->foreignUuid('sport_id')->nullable()->change();
        });

        // Update method enum to include NFC and RFID
        DB::statement("ALTER TABLE attendances MODIFY COLUMN method ENUM('qr_code', 'nfc', 'rfid', 'manual', 'bulk') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Revert sport_id to required
            $table->foreignUuid('sport_id')->nullable(false)->change();
        });

        // Revert method enum to original values
        DB::statement("ALTER TABLE attendances MODIFY COLUMN method ENUM('qr_code', 'manual', 'bulk') NOT NULL");
    }
};
