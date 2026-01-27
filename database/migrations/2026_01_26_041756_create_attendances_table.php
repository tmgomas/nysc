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
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignUuid('sport_id')->constrained('sports')->onDelete('cascade');
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();
            $table->integer('duration_minutes')->nullable();
            $table->foreignUuid('marked_by')->constrained('users')->onDelete('cascade');
            $table->enum('method', ['qr_code', 'manual', 'bulk']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
