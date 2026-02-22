<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_absences', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Who & which class
            $table->uuid('member_id');
            $table->uuid('program_class_id'); // the original assigned class slot

            // Absence details
            $table->date('absent_date');       // which specific date they cannot attend
            $table->text('reason')->nullable();

            // Status lifecycle:
            // pending → approved/rejected
            // approved → makeup_selected / expired / no_makeup
            // makeup_selected → completed
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'makeup_selected',
                'completed',
                'expired',
                'no_makeup',
            ])->default('pending');

            // Admin action
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('admin_notes')->nullable();

            // Makeup class selection
            $table->uuid('makeup_class_id')->nullable();         // selected alternate class slot
            $table->date('makeup_date')->nullable();             // specific date for makeup
            $table->date('makeup_deadline')->nullable();         // approved_at + 7 days

            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('program_class_id')->references('id')->on('program_classes')->cascadeOnDelete();
            $table->foreign('makeup_class_id')->references('id')->on('program_classes')->nullOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();

            // One absence record per member per class per date
            $table->unique(['member_id', 'program_class_id', 'absent_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_absences');
    }
};
