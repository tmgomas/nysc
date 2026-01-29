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
        Schema::table('member_sports', function (Blueprint $table) {
            $table->string('sport_reference')->nullable()->after('sport_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_sports', function (Blueprint $table) {
            $table->dropColumn('sport_reference');
        });
    }
};
