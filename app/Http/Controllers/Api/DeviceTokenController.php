<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Store or update the user's FCM device token.
     */
    public function store(Request $request)
    {
        $request->validate([
            'fcm_token' => ['required', 'string'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'device_type' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $deviceId = $request->input('device_id');

        if ($deviceId) {
            // Update or create based on device ID
            $user->deviceTokens()->updateOrCreate(
                ['device_id' => $deviceId],
                [
                    'fcm_token' => $request->input('fcm_token'),
                    'device_type' => $request->input('device_type'),
                ]
            );
        } else {
            // Update or create based on the token itself (fallback if device_id isn't provided)
            $user->deviceTokens()->updateOrCreate(
                ['fcm_token' => $request->input('fcm_token')],
                [
                    'device_type' => $request->input('device_type'),
                ]
            );
        }

        return response()->json([
            'message' => 'Device token successfully registered.',
        ]);
    }
}
