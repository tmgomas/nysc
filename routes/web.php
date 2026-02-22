<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PublicRegistrationController;
use App\Http\Controllers\Admin\{
    DashboardController as AdminDashboardController,
    MemberController as AdminMemberController,
    MemberImportController as AdminMemberImportController,
    PaymentController as AdminPaymentController,
    AttendanceController as AdminAttendanceController,
    ProgramController as AdminProgramController,
    ReportController as AdminReportController,
    SettingController as AdminSettingController,
    SmsTemplateController as AdminSmsTemplateController,
    QRCodeController as AdminQRCodeController
};

// Public Routes
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public Registration
Route::controller(PublicRegistrationController::class)->group(function () {
    Route::get('/register', 'create')->name('registration.create');
    Route::post('/register', 'store')->name('registration.store');
    Route::get('/registration/success', 'success')->name('registration.success');
});

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:super_admin|admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // Members
    Route::resource('members', AdminMemberController::class);
    Route::post('members/{member}/approve', [AdminMemberController::class, 'approve'])->name('members.approve');
    Route::post('members/{member}/suspend', [AdminMemberController::class, 'suspend'])->name('members.suspend');
    Route::post('members/{member}/reactivate', [AdminMemberController::class, 'reactivate'])->name('members.reactivate');
    Route::put('members/{member}/programs', [AdminMemberController::class, 'updatePrograms'])->name('members.update-programs');
    
    // Member Import
    Route::get('members/import/create', [AdminMemberImportController::class, 'create'])->name('members.import.create');
    Route::get('members/import/template', [AdminMemberImportController::class, 'downloadTemplate'])->name('members.import.template');
    Route::post('members/import/preview', [AdminMemberImportController::class, 'preview'])->name('members.import.preview');
    Route::post('members/import', [AdminMemberImportController::class, 'import'])->name('members.import');
    Route::get('members/import/history', [AdminMemberImportController::class, 'history'])->name('members.import.history');
    
    Route::put('payments/{payment}/mark-as-paid', [AdminPaymentController::class, 'markAsPaid'])->name('payments.mark-as-paid');
    Route::post('payments/bulk', [AdminPaymentController::class, 'bulkSchedulePayment'])->name('payments.bulk');
    
    // Payments
    Route::resource('payments', AdminPaymentController::class)->except(['edit', 'update', 'destroy']);
    Route::post('payments/{payment}/verify', [AdminPaymentController::class, 'verify'])->name('payments.verify');
    Route::post('payments/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('payments.reject');
    
    // Attendance
    Route::get('attendance', [AdminAttendanceController::class, 'index'])->name('attendance.index');
    Route::get('attendance/qr-scanner', function () {
        return inertia('Admin/Attendance/QRScanner');
    })->name('attendance.qr-scanner');
    Route::post('attendance/scan', [AdminAttendanceController::class, 'scan'])->name('attendance.scan');
    Route::post('attendance/mark', [AdminAttendanceController::class, 'markAttendance'])->name('attendance.mark');
    Route::post('attendance/check-out', [AdminAttendanceController::class, 'checkOut'])->name('attendance.check-out');
    Route::post('attendance/bulk', [AdminAttendanceController::class, 'bulkMark'])->name('attendance.bulk');
    Route::get('attendance/today', [AdminAttendanceController::class, 'getTodayAttendance'])->name('attendance.today');
    Route::post('attendance/quick-scan', [AdminAttendanceController::class, 'quickScan'])->name('attendance.quick-scan');
    Route::get('members/{member}/attendance', [AdminAttendanceController::class, 'getMemberAttendance'])->name('members.attendance');
    
    // Programs
    Route::resource('programs', AdminProgramController::class);
    Route::resource('programs.classes', \App\Http\Controllers\Admin\ProgramClassController::class)
        ->only(['store', 'update', 'destroy'])
        ->parameters(['classes' => 'class']);
    Route::post('programs/{program}/classes/{class}/toggle', [\App\Http\Controllers\Admin\ProgramClassController::class, 'toggleActive'])->name('programs.classes.toggle');
    Route::post('programs/{program}/classes/{class}/cancel-date', [\App\Http\Controllers\Admin\ProgramClassController::class, 'cancelDate'])->name('programs.classes.cancel-date');
    Route::delete('programs/{program}/classes/{class}/cancellations/{cancellation}', [\App\Http\Controllers\Admin\ProgramClassController::class, 'restoreDate'])->name('programs.classes.restore-date');

    // Class Assignments (assign members to specific class slots)
    Route::post('class-assignments/assign', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'assignMember'])->name('class-assignments.assign');
    Route::post('class-assignments/unassign', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'unassignMember'])->name('class-assignments.unassign');

    // Class Absences
    Route::get('class-absences', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'index'])->name('class-absences.index');
    Route::post('class-absences/{absence}/approve', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'approve'])->name('class-absences.approve');
    Route::post('class-absences/{absence}/reject', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'reject'])->name('class-absences.reject');
    Route::get('class-absences/{absence}/makeup-slots', [\App\Http\Controllers\Admin\ClassAbsenceController::class, 'availableMakeupSlots'])->name('class-absences.makeup-slots');

    // Locations
    Route::resource('locations', \App\Http\Controllers\Admin\LocationController::class)->except(['show', 'create', 'edit']);

    // Schedule
    Route::get('schedule', [\App\Http\Controllers\Admin\ScheduleController::class, 'index'])->name('schedule.index');
    Route::get('schedule/events', [\App\Http\Controllers\Admin\ScheduleController::class, 'events'])->name('schedule.events');
    Route::get('schedule/today', [\App\Http\Controllers\Admin\ScheduleController::class, 'today'])->name('schedule.today');

    // Holidays
    Route::get('holidays', [\App\Http\Controllers\Admin\HolidayController::class, 'index'])->name('holidays.index');
    Route::post('holidays', [\App\Http\Controllers\Admin\HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('holidays/{holiday}', [\App\Http\Controllers\Admin\HolidayController::class, 'destroy'])->name('holidays.destroy');

    // Special Bookings
    Route::get('special-bookings', [\App\Http\Controllers\Admin\SpecialBookingController::class, 'index'])->name('special-bookings.index');
    Route::post('special-bookings', [\App\Http\Controllers\Admin\SpecialBookingController::class, 'store'])->name('special-bookings.store');
    Route::delete('special-bookings/{specialBooking}', [\App\Http\Controllers\Admin\SpecialBookingController::class, 'destroy'])->name('special-bookings.destroy');
    // Reports
    Route::get('reports/members', [AdminReportController::class, 'members'])->name('reports.members');
    Route::get('reports/payments', [AdminReportController::class, 'payments'])->name('reports.payments');
    Route::get('reports/attendance', [AdminReportController::class, 'attendance'])->name('reports.attendance');
    Route::get('reports/revenue', [AdminReportController::class, 'revenue'])->name('reports.revenue');
    
    // Settings
    Route::get('settings', [AdminSettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [AdminSettingController::class, 'update'])->name('settings.update');
    Route::get('settings/{key}', [AdminSettingController::class, 'show'])->name('settings.show');
    Route::put('settings/{key}', [AdminSettingController::class, 'updateSingle'])->name('settings.update-single');
    
    // SMS Templates
    Route::get('sms-templates', [AdminSmsTemplateController::class, 'index'])->name('sms-templates.index');
    Route::put('sms-templates/{id}', [AdminSmsTemplateController::class, 'update'])->name('sms-templates.update');
    
    // QR Codes
    Route::prefix('qr-codes')->name('qr-codes.')->group(function () {
        Route::get('members/{member}', [AdminQRCodeController::class, 'getMemberQRCode'])->name('members.get');
        Route::post('members/{member}/generate', [AdminQRCodeController::class, 'generateMemberQRCode'])->name('members.generate');
        Route::get('members/{member}/download', [AdminQRCodeController::class, 'downloadMemberQRCode'])->name('members.download');
        Route::post('verify', [AdminQRCodeController::class, 'verifyQRCode'])->name('verify');
        Route::post('scan-checkin', [AdminQRCodeController::class, 'scanCheckIn'])->name('scan-checkin');
        Route::post('bulk-generate', [AdminQRCodeController::class, 'bulkGenerateQRCodes'])->name('bulk-generate');
    });

    // NFC
    Route::prefix('nfc')->name('nfc.')->group(function () {
        Route::post('verify', [App\Http\Controllers\Admin\NFCController::class, 'verify'])->name('verify');
        Route::post('associate', [App\Http\Controllers\Admin\NFCController::class, 'associate'])->name('associate');
        Route::post('disassociate', [App\Http\Controllers\Admin\NFCController::class, 'disassociate'])->name('disassociate');
    });

    // RFID
    Route::prefix('rfid')->name('rfid.')->group(function () {
        Route::post('verify', [App\Http\Controllers\Admin\RFIDController::class, 'verify'])->name('verify');
        Route::post('associate', [App\Http\Controllers\Admin\RFIDController::class, 'associate'])->name('associate');
        Route::post('disassociate', [App\Http\Controllers\Admin\RFIDController::class, 'disassociate'])->name('disassociate');
        Route::post('scan-checkin', [App\Http\Controllers\Admin\RFIDController::class, 'scanCheckIn'])->name('scan-checkin');
    });

    // Unified Scanner Page
    Route::get('attendance/unified-scanner', function () {
        return inertia('Admin/Attendance/UnifiedScanner');
    })->name('attendance.unified-scanner');
});

// Member Routes
Route::middleware(['auth', 'verified', 'role:member'])->prefix('member')->name('member.')->group(function () {
    Route::get('/profile', [\App\Http\Controllers\Member\ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [\App\Http\Controllers\Member\ProfileController::class, 'update'])->name('profile.update');
    
    Route::get('/payments', [\App\Http\Controllers\Member\PaymentController::class, 'index'])->name('payments.index');
    Route::get('/attendance', [\App\Http\Controllers\Member\AttendanceController::class, 'index'])->name('attendance.index');
});

// Coach Routes
Route::middleware(['auth', 'verified', 'role:coach'])->prefix('coach')->name('coach.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Coach\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/attendance', [\App\Http\Controllers\Coach\AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance/mark', [\App\Http\Controllers\Coach\AttendanceController::class, 'mark'])->name('attendance.mark');
});

require __DIR__.'/settings.php';
