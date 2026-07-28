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
        Schema::create('user_device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_id')->nullable()->comment('Unique identifier for the physical device');
            $table->string('device_type')->nullable()->comment('android, ios, web, etc.');
            $table->string('fcm_token')->unique();
            $table->timestamps();

            $table->unique(['user_id', 'device_id']); // A single user can't have multiple entries for the same device
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_device_tokens');
    }
};
