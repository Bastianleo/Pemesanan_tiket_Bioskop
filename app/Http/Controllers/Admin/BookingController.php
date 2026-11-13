<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $bookings = Booking::with([
            'user',
            'showtime.movie',
            'showtime.studio.cinema',
            'bookingSeats.seat',
            'payment',
        ])
            ->when($search, function ($query, $search) {
                $query->where('booking_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        if ($booking->status === 'cancelled') {
            return back()->with('error', 'Pesanan ini sudah dibatalkan sebelumnya.');
        }

        // Release seats
        $booking->bookingSeats()->update(['status' => 'released']);
        $booking->update(['status' => 'cancelled']);

        if ($booking->payment) {
            $booking->payment()->update(['status' => 'refunded']);
        }

        return back()->with('success', "Pesanan {$booking->booking_code} berhasil dibatalkan dan kursi telah dilepaskan.");
    }
}
