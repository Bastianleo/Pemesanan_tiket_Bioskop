<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Seat;
use App\Models\Setting;
use App\Models\Showtime;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * Release expired held seats for a given showtime (or globally).
     */
    public function releaseExpiredSeats(?int $showtimeId = null): void
    {
        $now = now();

        DB::transaction(function () use ($showtimeId, $now) {
            // Find bookings that have passed their held_until timestamp
            $expiredBookings = Booking::where('status', 'pending')
                ->where('held_until', '<', $now)
                ->when($showtimeId, fn ($q) => $q->where('showtime_id', $showtimeId))
                ->lockForUpdate()
                ->get();

            foreach ($expiredBookings as $b) {
                $b->update(['status' => 'expired']);
                $b->bookingSeats()->update(['status' => 'released']);
            }
        });
    }

    /**
     * Get complete visual seat layout with current availability status and calculated prices.
     */
    public function getSeatLayout(Showtime $showtime, ?int $currentUserId = null): array
    {
        // Auto-clean expired holds first
        $this->releaseExpiredSeats($showtime->id);

        $showtime->load(['studio.seats', 'movie', 'studio.cinema']);

        $seats = $showtime->studio->seats()
            ->orderBy('row_label')
            ->orderBy('seat_number')
            ->get();

        // Get active booked or held seats
        $activeBookingSeats = BookingSeat::where('showtime_id', $showtime->id)
            ->where(function ($q) {
                $q->where('status', 'booked')
                    ->orWhere(function ($sub) {
                        $sub->where('status', 'held')
                            ->where('held_until', '>', now());
                    });
            })
            ->with('booking')
            ->get()
            ->keyBy('seat_id');

        $multiplier = $showtime->studio->price_multiplier ?? 1.0;
        $basePrice = $showtime->base_price;

        $seatItems = [];
        foreach ($seats as $seat) {
            $vipMultiplier = $seat->seat_type === 'vip' ? 1.25 : 1.0;
            $calculatedPrice = round($basePrice * $multiplier * $vipMultiplier);

            $status = 'available';
            if (! $seat->is_active) {
                $status = 'unavailable';
            } elseif (isset($activeBookingSeats[$seat->id])) {
                $bs = $activeBookingSeats[$seat->id];
                if ($bs->status === 'booked') {
                    $status = 'booked';
                } elseif ($bs->status === 'held') {
                    // Check if held by the current user
                    if ($currentUserId && $bs->booking && $bs->booking->user_id === $currentUserId && $bs->booking->status === 'pending') {
                        $status = 'held_by_me';
                    } else {
                        $status = 'held';
                    }
                }
            }

            $seatItems[] = [
                'id' => $seat->id,
                'studio_id' => $seat->studio_id,
                'row_label' => $seat->row_label,
                'seat_number' => $seat->seat_number,
                'seat_code' => $seat->getSeatCode(),
                'seat_type' => $seat->seat_type,
                'is_active' => $seat->is_active,
                'status' => $status,
                'price' => $calculatedPrice,
            ];
        }

        return $seatItems;
    }

    /**
     * Lock seats with database transaction and row-level locking (Pessimistic Locking).
     * Guaranteed to prevent race conditions and double bookings.
     *
     * @param  array<int>  $seatIds
     *
     * @throws ValidationException
     */
    public function holdSeats(User $user, Showtime $showtime, array $seatIds, ?string $voucherCode = null): Booking
    {
        if (count($seatIds) < 1) {
            throw ValidationException::withMessages([
                'seats' => 'Silakan pilih minimal 1 kursi.',
            ]);
        }

        if (count($seatIds) > 8) {
            throw ValidationException::withMessages([
                'seats' => 'Maksimal pembelian adalah 8 kursi per transaksi.',
            ]);
        }

        // Release any stale holds first
        $this->releaseExpiredSeats($showtime->id);

        $holdMinutes = (int) Setting::get('hold_duration_minutes', '10');
        $serviceFee = (float) Setting::get('service_fee', '3000');
        $heldUntil = now()->addMinutes($holdMinutes);

        return DB::transaction(function () use ($user, $showtime, $seatIds, $heldUntil, $serviceFee, $voucherCode) {
            // 1. Pessimistic lock query: Lock the requested seats
            $takenSeats = BookingSeat::where('showtime_id', $showtime->id)
                ->whereIn('seat_id', $seatIds)
                ->where(function ($q) {
                    $q->where('status', 'booked')
                        ->orWhere(function ($sub) {
                            $sub->where('status', 'held')
                                ->where('held_until', '>', now());
                        });
                })
                ->lockForUpdate()
                ->with('seat')
                ->get();

            if ($takenSeats->isNotEmpty()) {
                $takenLabels = $takenSeats->map(fn ($ts) => $ts->seat?->getSeatCode() ?? "#{$ts->seat_id}")->implode(', ');
                throw ValidationException::withMessages([
                    'seats' => "Kursi {$takenLabels} baru saja dipesan atau sedang dalam proses pembayaran oleh pelanggan lain. Silakan pilih kursi lain.",
                ]);
            }

            // 2. Retrieve physical seat models and calculate prices
            $physicalSeats = Seat::whereIn('id', $seatIds)
                ->where('studio_id', $showtime->studio_id)
                ->where('is_active', true)
                ->get();

            if ($physicalSeats->count() !== count($seatIds)) {
                throw ValidationException::withMessages([
                    'seats' => 'Beberapa kursi yang dipilih tidak valid atau sedang dalam masa perbaikan.',
                ]);
            }

            $multiplier = $showtime->studio->price_multiplier ?? 1.0;
            $basePrice = $showtime->base_price;
            $subtotal = 0;

            foreach ($physicalSeats as $seat) {
                $vipMultiplier = $seat->seat_type === 'vip' ? 1.25 : 1.0;
                $seatPrice = round($basePrice * $multiplier * $vipMultiplier);
                $subtotal += $seatPrice;
            }

            // Calculate optional voucher discount
            $voucher = null;
            $discount = 0;
            if ($voucherCode) {
                $code = strtoupper(trim($voucherCode));
                $foundVoucher = Voucher::where('code', $code)
                    ->where('is_active', true)
                    ->where('start_date', '<=', now()->toDateString())
                    ->where('end_date', '>=', now()->toDateString())
                    ->first();

                if ($foundVoucher && $foundVoucher->isValidForAmount($subtotal)) {
                    $voucher = $foundVoucher;
                    $discount = $voucher->calculateDiscount($subtotal);
                }
            }

            $totalAmount = max(0, ($subtotal - $discount) + $serviceFee);

            // 3. Cancel any previous active pending bookings of this user for this showtime to avoid orphan locks
            $previousPending = Booking::where('user_id', $user->id)
                ->where('showtime_id', $showtime->id)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->get();

            foreach ($previousPending as $pb) {
                $pb->update(['status' => 'cancelled']);
                $pb->bookingSeats()->update(['status' => 'released']);
            }

            // 4. Create new Booking
            $bookingCode = 'BK-'.date('Ymd').'-'.strtoupper(Str::random(6));

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'user_id' => $user->id,
                'showtime_id' => $showtime->id,
                'voucher_id' => $voucher?->id,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'service_fee' => $serviceFee,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'held_until' => $heldUntil,
            ]);

            // 5. Create BookingSeats with 'held' status
            foreach ($physicalSeats as $seat) {
                $vipMultiplier = $seat->seat_type === 'vip' ? 1.25 : 1.0;
                $seatPrice = round($basePrice * $multiplier * $vipMultiplier);

                BookingSeat::create([
                    'booking_id' => $booking->id,
                    'showtime_id' => $showtime->id,
                    'seat_id' => $seat->id,
                    'price' => $seatPrice,
                    'status' => 'held',
                    'held_until' => $heldUntil,
                ]);
            }

            return $booking;
        });
    }
}
