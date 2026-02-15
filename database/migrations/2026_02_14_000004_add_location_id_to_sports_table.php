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
        Schema::table('programs', function (Blueprint $table) {
            $table->uuid('location_id')->nullable()->after('location');
            $table->foreign('location_id')->references('id')->on('locations')->nullOnDelete();
        });

        // Migrate existing location strings to location records
        $existingLocations = DB::table('programs')
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

            DB::table('programs')
                ->where('location', $locationName)
                ->update(['location_id' => $id]);
        }

        // Drop old location string column
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('location');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('location')->nullable()->after('capacity');
        });

        // Migrate back
        $programs = DB::table('programs')
            ->join('locations', 'programs.location_id', '=', 'locations.id')
            ->select('programs.id', 'locations.name')
            ->get();

        foreach ($programs as $program) {
            DB::table('programs')
                ->where('id', $program->id)
                ->update(['location' => $program->name]);
        }

        Schema::table('programs', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn('location_id');
        });
    }
};
