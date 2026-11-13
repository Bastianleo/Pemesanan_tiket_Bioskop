<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Setting;
use App\Models\Showtime;
use App\Models\Voucher;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService
    ) {}

    /**
     * Show interactive visual seat selection page.
     */
    public function showSeats(Showtime $showtime, Request $request): Response
    {
        $showtime->load(['movie', 'studio.cinema']);
        $seats = $this->bookingService->getSeatLayout($showtime, $request->user()?->id);
        $serviceFee = (float) Setting::get('service_fee', '3000');
        $holdDurationMinutes = (int) Setting::get('hold_duration_minutes', '10');

        $availableVouchers = Voucher::where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->where(function ($q) {
                $q->whereNull('quota')
                    ->orWhereColumn('used_count', '<', 'quota');
            })
            ->select('id', 'code', 'title', 'discount_type', 'discount_value', 'min_purchase', 'max_discount')
            ->get();

        return Inertia::render('booking/seat-picker', [
            'showtime' => $showtime,
            'seats' => $seats,
            'availableVouchers' => $availableVouchers,
            'config' => [
                'service_fee' => $serviceFee,
                'max_seats' => 8,
                'hold_duration_minutes' => $holdDurationMinutes,
            ],
        ]);
    }

    /**
     * API for real-time seat polling.
     */
    public function getSeatsApi(Showtime $showtime, Request $request): JsonResponse
    {
        $seats = $this->bookingService->getSeatLayout($showtime, $request->user()?->id);

        return response()->json([
            'seats' => $seats,
        ]);
    }

    /**
     * Lock the selected seats and create a pending booking.
     */
    public function holdSeats(Request $request, Showtime $showtime): RedirectResponse
    {
        $request->validate([
            'seat_ids' => ['required', 'array', 'min:1', 'max:8'],
            'seat_ids.*' => ['integer', 'exists:seats,id'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
        ]);

        $booking = $this->bookingService->holdSeats(
            $request->user(),
            $showtime,
            $request->input('seat_ids'),
            $request->input('voucher_code')
        );

        return redirect()->route('booking.checkout', ['bookingCode' => $booking->booking_code]);
    }
}
