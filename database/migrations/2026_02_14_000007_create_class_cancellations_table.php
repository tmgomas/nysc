<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_cancellations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('program_class_id');
            $table->date('cancelled_date');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->foreign('program_class_id')->references('id')->on('program_classes')->cascadeOnDelete();
            $table->unique(['program_class_id', 'cancelled_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_cancellations');
    }
};
