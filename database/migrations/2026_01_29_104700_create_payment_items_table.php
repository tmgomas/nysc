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
        Schema::create('payment_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->onDelete('cascade');
            $table->foreignUuid('sport_id')->nullable()->constrained('sports')->onDelete('cascade');
            $table->enum('type', ['admission', 'monthly'])->comment('Type of payment item');
            $table->decimal('amount', 10, 2);
            $table->string('month_year')->nullable()->comment('For monthly fees: Y-m format');
            $table->text('description')->nullable();
            $table->timestamps();

            // Index for faster queries
            $table->index(['payment_id', 'sport_id']);
            $table->index(['type', 'month_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_items');
    }
};
