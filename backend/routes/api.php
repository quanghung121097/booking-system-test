<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/token', [AuthController::class, 'token'])->name('auth.token');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::apiResource('rooms', RoomController::class)->only(['index', 'show']);
    Route::get('rooms/{room}/bookings', [BookingController::class, 'index'])->name('rooms.bookings');
    Route::post('bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::delete('bookings/{booking}', [BookingController::class, 'destroy'])->name('bookings.destroy');
});
