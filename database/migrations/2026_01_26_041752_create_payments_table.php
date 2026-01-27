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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('member_id')->constrained('members')->onDelete('cascade');
            $table->enum('type', ['admission', 'monthly', 'bulk']);
            $table->decimal('amount', 10, 2);
            $table->string('month_year')->nullable(); // "2026-01"
            $table->integer('months_count')->default(1);
            $table->enum('status', ['pending', 'paid', 'verified', 'rejected'])->default('pending');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->enum('payment_method', ['cash', 'bank_transfer', 'online'])->nullable();
            $table->string('receipt_url')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
