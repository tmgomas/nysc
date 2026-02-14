<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Add location_id FK column
        Schema::table('sports', function (Blueprint $table) {
            $table->uuid('location_id')->nullable()->after('location');
            $table->foreign('location_id')->references('id')->on('locations')->nullOnDelete();
        });

        // Migrate existing location strings to location records
        $existingLocations = DB::table('sports')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->pluck('location');

        foreach ($existingLocations as $locationName) {
            $id = Str::uuid()->toString();
            DB::table('locations')->insert([
                'id' => $id,
                'name' => $locationName,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('sports')
                ->where('location', $locationName)
                ->update(['location_id' => $id]);
        }

        // Drop old location string column
        Schema::table('sports', function (Blueprint $table) {
            $table->dropColumn('location');
        });
    }

    public function down(): void
    {
        Schema::table('sports', function (Blueprint $table) {
            $table->string('location')->nullable()->after('capacity');
        });

        // Migrate back
        $sports = DB::table('sports')
            ->join('locations', 'sports.location_id', '=', 'locations.id')
            ->select('sports.id', 'locations.name')
            ->get();

        foreach ($sports as $sport) {
            DB::table('sports')
                ->where('id', $sport->id)
                ->update(['location' => $sport->name]);
        }

        Schema::table('sports', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};
