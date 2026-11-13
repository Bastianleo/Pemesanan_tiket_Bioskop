<?php

use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\CinemaController as AdminCinemaController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MovieController as AdminMovieController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\ScannerController as AdminScannerController;
use App\Http\Controllers\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Admin\ShowtimeController as AdminShowtimeController;
use App\Http\Controllers\Admin\StudioController as AdminStudioController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MovieCatalogController;
use App\Http\Controllers\MovieDetailController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('movies', [MovieCatalogController::class, 'index'])->name('movies.catalog');
Route::get('movies/{slug}', [MovieDetailController::class, 'show'])->name('movies.show');

// Payment Webhook (CSRF excluded / API)
Route::post('api/payment/webhook', [CheckoutController::class, 'webhook'])->name('payment.webhook');

// Authenticated Customer Booking Routes
Route::middleware(['auth', 'verified', 'active'])->group(function () {
    // User Hub & Profile Dashboard
    Route::get('dashboard', [UserDashboardController::class, 'index'])->name('dashboard');
    Route::get('my-tickets', [UserDashboardController::class, 'myTickets'])->name('customer.tickets');
    Route::get('favorites', [UserDashboardController::class, 'myFavorites'])->name('customer.favorites');
    Route::post('favorites/{movie}/toggle', [UserDashboardController::class, 'toggleFavorite'])->name('favorites.toggle');
    Route::post('booking/{bookingCode}/cancel', [UserDashboardController::class, 'cancelBooking'])->name('booking.cancel');

    // Seat Selection
    Route::get('booking/{showtime}/seats', [BookingController::class, 'showSeats'])->name('booking.seats');
    Route::get('api/booking/{showtime}/seats', [BookingController::class, 'getSeatsApi'])->name('api.booking.seats');
    Route::post('booking/{showtime}/hold', [BookingController::class, 'holdSeats'])->name('booking.hold');

    // Checkout & Payment
    Route::get('booking/{bookingCode}/checkout', [CheckoutController::class, 'showCheckout'])->name('booking.checkout');
    Route::post('booking/{bookingCode}/voucher/apply', [CheckoutController::class, 'applyVoucher'])->name('booking.voucher.apply');
    Route::post('booking/{bookingCode}/voucher/remove', [CheckoutController::class, 'removeVoucher'])->name('booking.voucher.remove');
    Route::post('booking/{bookingCode}/pay', [CheckoutController::class, 'processPayment'])->name('booking.pay');

    // Sandbox Simulator
    Route::get('payment/simulator/{paymentCode}', [CheckoutController::class, 'showSimulator'])->name('payment.simulator');
    Route::post('payment/simulator/{paymentCode}/simulate', [CheckoutController::class, 'simulateAction'])->name('payment.simulate');

    // Digital E-Tickets
    Route::get('tickets/{bookingCode}', [TicketController::class, 'show'])->name('tickets.show');
    Route::get('tickets/{bookingCode}/pdf', [TicketController::class, 'downloadPdf'])->name('tickets.pdf');
});

// Admin Route Group
Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Movies Management
        Route::resource('movies', AdminMovieController::class)->except(['show']);

        // Cinemas & Studios
        Route::resource('cinemas', AdminCinemaController::class)->except(['show', 'create', 'edit']);
        Route::resource('studios', AdminStudioController::class)->except(['create', 'edit']);
        Route::post('seats/{seat}/toggle', [AdminStudioController::class, 'toggleSeat'])->name('seats.toggle');

        // Showtimes
        Route::resource('showtimes', AdminShowtimeController::class)->only(['index', 'store', 'destroy']);

        // Bookings
        Route::get('bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::post('bookings/{booking}/cancel', [AdminBookingController::class, 'cancel'])->name('bookings.cancel');

        // Users
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('users/{user}/toggle', [AdminUserController::class, 'toggleStatus'])->name('users.toggle');

        // Vouchers
        Route::resource('vouchers', AdminVoucherController::class)->only(['index', 'store', 'update', 'destroy']);

        // Ticket QR Scanner
        Route::get('scanner', [AdminScannerController::class, 'index'])->name('scanner.index');
        Route::post('scanner/verify', [AdminScannerController::class, 'verify'])->name('scanner.verify');

        // Reports
        Route::get('reports', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export/pdf', [AdminReportController::class, 'exportPdf'])->name('reports.pdf');

        // Settings
        Route::get('settings', [AdminSettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [AdminSettingController::class, 'update'])->name('settings.update');
    });

require __DIR__.'/settings.php';
