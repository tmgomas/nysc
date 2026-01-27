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
        Schema::create('member_sports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignUuid('sport_id')->constrained('sports')->onDelete('cascade');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            
            $table->unique(['member_id', 'sport_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_sports');
    }
};
