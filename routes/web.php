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
    SportController as AdminSportController,
    ReportController as AdminReportController,
    SettingController as AdminSettingController,
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
    Route::put('members/{member}/sports', [AdminMemberController::class, 'updateSports'])->name('members.update-sports');
    
    // Member Import
    Route::get('members/import/create', [AdminMemberImportController::class, 'create'])->name('members.import.create');
    Route::get('members/import/template', [AdminMemberImportController::class, 'downloadTemplate'])->name('members.import.template');
    Route::post('members/import/preview', [AdminMemberImportController::class, 'preview'])->name('members.import.preview');
    Route::post('members/import', [AdminMemberImportController::class, 'import'])->name('members.import');
    Route::get('members/import/history', [AdminMemberImportController::class, 'history'])->name('members.import.history');
    
    Route::put('payments/{payment}/mark-as-paid', [AdminPaymentController::class, 'markAsPaid'])->name('payments.mark-as-paid');
    
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
    Route::post('attendance/mark', [AdminAttendanceController::class, 'mark'])->name('attendance.mark');
    Route::post('attendance/bulk', [AdminAttendanceController::class, 'bulkMark'])->name('attendance.bulk');
    
    // Sports
    Route::resource('sports', AdminSportController::class);
    
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
    
    // QR Codes
    Route::prefix('qr-codes')->name('qr-codes.')->group(function () {
        Route::get('members/{member}', [AdminQRCodeController::class, 'getMemberQRCode'])->name('members.get');
        Route::post('members/{member}/generate', [AdminQRCodeController::class, 'generateMemberQRCode'])->name('members.generate');
        Route::get('members/{member}/download', [AdminQRCodeController::class, 'downloadMemberQRCode'])->name('members.download');
        Route::post('verify', [AdminQRCodeController::class, 'verifyQRCode'])->name('verify');
        Route::post('scan-checkin', [AdminQRCodeController::class, 'scanCheckIn'])->name('scan-checkin');
        Route::post('bulk-generate', [AdminQRCodeController::class, 'bulkGenerateQRCodes'])->name('bulk-generate');
    });
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
