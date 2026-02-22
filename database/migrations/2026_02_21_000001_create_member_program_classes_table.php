<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_program_classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->uuid('program_class_id');

            $table->timestamp('assigned_at')->useCurrent();
            $table->uuid('assigned_by')->nullable(); // admin who assigned
            $table->enum('status', ['active', 'dropped'])->default('active');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('program_class_id')->references('id')->on('program_classes')->cascadeOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();

            // Each member can only be assigned once per class slot
            $table->unique(['member_id', 'program_class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_program_classes');
    }
};
