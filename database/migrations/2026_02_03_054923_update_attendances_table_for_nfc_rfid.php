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
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignUuid('program_id')->nullable()->change();
            $table->enum('method', ['qr_code', 'nfc', 'rfid', 'manual', 'bulk'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignUuid('program_id')->nullable(false)->change();
            $table->enum('method', ['qr_code', 'manual', 'bulk'])->change();
        });
    }
};
