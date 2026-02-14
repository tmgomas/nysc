<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sport_classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('sport_id')->constrained('sports')->cascadeOnDelete();
            $table->string('label')->nullable();
            $table->string('day_of_week'); // Monday, Tuesday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->foreignUuid('coach_id')->nullable()->constrained('coaches')->nullOnDelete();
            $table->unsignedInteger('capacity')->nullable();
            $table->string('recurrence')->default('weekly'); // weekly, monthly, term
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['sport_id', 'day_of_week']);
            $table->index(['sport_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sport_classes');
    }
};
