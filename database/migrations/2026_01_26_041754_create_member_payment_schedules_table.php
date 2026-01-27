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
        Schema::create('member_payment_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_id')->constrained('members')->onDelete('cascade');
            $table->string('month_year'); // "2026-01"
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'overdue', 'waived'])->default('pending');
            $table->date('due_date');
            $table->foreignUuid('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->timestamps();
            
            $table->unique(['member_id', 'month_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_payment_schedules');
    }
};
