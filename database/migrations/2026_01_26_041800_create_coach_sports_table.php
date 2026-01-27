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
        Schema::create('coach_sports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('coach_id')->constrained('coaches')->onDelete('cascade');
            $table->foreignUuid('sport_id')->constrained('sports')->onDelete('cascade');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['coach_id', 'sport_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coach_sports');
    }
};
