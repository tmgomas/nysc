<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Member\ProfileController as MemberProfileController;
use App\Http\Controllers\Api\Member\PaymentController as MemberPaymentController;
use App\Http\Controllers\Api\Member\AttendanceController as MemberAttendanceController;
use App\Http\Controllers\Api\Member\ScheduleController as MemberScheduleController;
use App\Http\Controllers\Api\Coach\DashboardController as CoachDashboardController;
use App\Http\Controllers\Api\Coach\AttendanceController as CoachAttendanceController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Member routes
    Route::middleware('role:member')->prefix('member')->name('api.member.')->group(function () {
        Route::get('/profile', [MemberProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [MemberProfileController::class, 'update'])->name('profile.update');
        Route::get('/payments', [MemberPaymentController::class, 'index'])->name('payments.index');
        Route::get('/attendance', [MemberAttendanceController::class, 'index'])->name('attendance.index');
        Route::get('/schedule', [MemberScheduleController::class, 'index'])->name('schedule.index');

        // Class Assignments & Absences
        Route::get('/classes', [\App\Http\Controllers\Api\ClassAbsenceApiController::class, 'myClasses'])->name('classes.index');
        Route::get('/absences', [\App\Http\Controllers\Api\ClassAbsenceApiController::class, 'myAbsences'])->name('absences.index');
        Route::post('/absences', [\App\Http\Controllers\Api\ClassAbsenceApiController::class, 'reportAbsence'])->name('absences.store');
        Route::get('/absences/{absence}/makeup-slots', [\App\Http\Controllers\Api\ClassAbsenceApiController::class, 'availableMakeupSlots'])->name('absences.makeup-slots');
        Route::post('/absences/{absence}/select-makeup', [\App\Http\Controllers\Api\ClassAbsenceApiController::class, 'selectMakeup'])->name('absences.select-makeup');
    });

    // Coach routes
    Route::middleware('role:coach')->prefix('coach')->name('api.coach.')->group(function () {
        Route::get('/dashboard', [CoachDashboardController::class, 'index'])->name('dashboard');
        Route::get('/schedule/today', [CoachDashboardController::class, 'today'])->name('schedule.today');
        Route::get('/attendance', [CoachAttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance/mark', [CoachAttendanceController::class, 'mark'])->name('attendance.mark');
    });
});
