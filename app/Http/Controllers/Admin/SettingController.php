<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display settings page
     */
    public function index()
    {
        $settings = Setting::getAllGrouped();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'required|string',
        ]);

        foreach ($validated['settings'] as $settingData) {
            Setting::set(
                $settingData['key'],
                $settingData['value'],
                $settingData['type'] ?? 'string'
            );
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Get a specific setting
     */
    public function show(string $key)
    {
        $value = Setting::get($key);

        return response()->json([
            'key' => $key,
            'value' => $value,
        ]);
    }

    /**
     * Update a single setting
     */
    public function updateSingle(Request $request, string $key)
    {
        $validated = $request->validate([
            'value' => 'required',
            'type' => 'sometimes|string',
        ]);

        $setting = Setting::where('key', $key)->first();
        
        Setting::set(
            $key,
            $validated['value'],
            $validated['type'] ?? $setting?->type ?? 'string'
        );

        return response()->json([
            'message' => 'Setting updated successfully',
            'key' => $key,
            'value' => $validated['value'],
        ]);
    }
}
