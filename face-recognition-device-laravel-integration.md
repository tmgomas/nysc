# Face Recognition Device - Laravel Integration Guide

## Device Information

| Field | Value |
|-------|-------|
| Serial Number | ZXOK05006260 |
| Released | 2020-11-05 |
| Firmware | vkl800tm100_v2.19 |
| Engine | fispro-V200-10000-115 |
| Device IP | 192.168.1.89 |
| MAC Address | 38:01:46:2a:82:c8 |

---

## Network Configuration

- **WiFi Network:** SLT-4G-FDFEA0
- **Device IP:** 192.168.1.89
- **Gateway:** 192.168.1.1
- **Netmask:** 255.255.255.0
- **DHCP:** Enabled

---

## Server Settings (on Device)

| Setting | Value |
|---------|-------|
| Server Req | Yes (Enabled) |
| Server IP | 192.168.0.109 (your PC/server IP) |
| Server Port | 80 |

> The device pushes attendance data via **HTTP POST** to your Laravel server every time a face is scanned.

---

## Laravel Integration

### 1. Route (`routes/web.php`)

```php
Route::post('/attendance', [AttendanceController::class, 'receive']);
```

---

### 2. Controller

```bash
php artisan make:controller AttendanceController
```

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function receive(Request $request)
    {
        // Log incoming data for debugging
        \Log::info('Device Data:', $request->all());

        // Save to database
        Attendance::create([
            'user_id'   => $request->input('userid') ?? $request->input('id'),
            'timestamp' => Carbon::now(),
            'raw_data'  => json_encode($request->all()),
        ]);

        // Device expects 0 = success
        return response()->json(['result' => 0]);
    }
}
```

---

### 3. Migration

```bash
php artisan make:migration create_attendances_table
```

```php
Schema::create('attendances', function (Blueprint $table) {
    $table->id();
    $table->string('user_id')->nullable();
    $table->datetime('timestamp');
    $table->text('raw_data')->nullable();
    $table->timestamps();
});
```

```bash
php artisan migrate
```

---

### 4. Model (`app/Models/Attendance.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['user_id', 'timestamp', 'raw_data'];
}
```

---

### 5. Disable CSRF for Device Endpoint

**`app/Http/Middleware/VerifyCsrfToken.php`**

```php
protected $except = [
    '/attendance',
];
```

---

## Important Notes

### Your Server IP Must Match
The device is configured to send data to **192.168.0.109**.
Make sure your Laravel server's IP address is **192.168.0.109** on the same WiFi network.

Check your PC IP:
```bash
# Windows
ipconfig

# Mac / Linux
ifconfig
```

### Both Devices Must Be on Same WiFi
- Device WiFi: `SLT-4G-FDFEA0`
- Your PC/Server must also be connected to: `SLT-4G-FDFEA0`

### Test the Connection
Open your browser and visit:
```
http://192.168.1.89
```
If the device responds, the network is working correctly.

---

## Data Flow Summary

```
Face Scan → Device (192.168.1.89)
         → HTTP POST
         → Your Laravel Server (192.168.0.109:80)
         → /attendance endpoint
         → Database saved
         → Returns { "result": 0 }
```

---

## Comm Menu Options Reference

| Option | Purpose |
|--------|---------|
| Comm | General communication settings |
| Server | Set your Laravel server IP & port |
| NTP | Time synchronization (internet time) |
| Ethernet | LAN cable connection settings |
| Wifi | WiFi network connection |
