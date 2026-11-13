<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Movie;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    /**
     * User dashboard summary with stats, active passes, and quick actions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // Active Tickets: not used & show date is today or in future
        $activeTickets = Ticket::whereHas('booking', fn ($q) => $q->where('user_id', $user->id)->where('status', 'paid'))
            ->where('is_used', false)
            ->whereHas('booking.showtime', fn ($q) => $q->where('show_date', '>=', $today))
            ->with([
                'seat',
                'booking.showtime.movie',
                'booking.showtime.studio.cinema',
            ])
            ->latest()
            ->take(6)
            ->get();

        // Recent Bookings
        $recentBookings = Booking::where('user_id', $user->id)
            ->with([
                'showtime.movie',
                'showtime.studio.cinema',
                'bookingSeats.seat',
                'payment',
            ])
            ->latest()
            ->take(8)
            ->get();

        // Favorite Movies
        $favoriteMovies = $user->favorites()
            ->with('genres')
            ->take(8)
            ->get();

        // Recommended Now Playing Movies
        $nowPlaying = Movie::where('status', 'now_showing')
            ->with('genres')
            ->latest('release_date')
            ->take(4)
            ->get();

        // Stats
        $stats = [
            'active_tickets_count' => Ticket::whereHas('booking', fn ($q) => $q->where('user_id', $user->id)->where('status', 'paid'))
                ->where('is_used', false)
                ->whereHas('booking.showtime', fn ($q) => $q->where('show_date', '>=', $today))
                ->count(),
            'total_bookings_count' => Booking::where('user_id', $user->id)->count(),
            'total_tickets_bought' => Ticket::whereHas('booking', fn ($q) => $q->where('user_id', $user->id))->count(),
            'total_spent' => (float) Booking::where('user_id', $user->id)->where('status', 'paid')->sum('total_amount'),
            'favorites_count' => $user->favorites()->count(),
        ];

        return Inertia::render('customer/dashboard', [
            'stats' => $stats,
            'activeTickets' => $activeTickets,
            'recentBookings' => $recentBookings,
            'favoriteMovies' => $favoriteMovies,
            'nowPlaying' => $nowPlaying,
        ]);
    }

    /**
     * User's dedicated My Tickets page.
     */
    public function myTickets(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $activeTickets = Ticket::whereHas('booking', fn ($q) => $q->where('user_id', $user->id)->where('status', 'paid'))
            ->where('is_used', false)
            ->whereHas('booking.showtime', fn ($q) => $q->where('show_date', '>=', $today))
            ->with([
                'seat',
                'booking.showtime.movie',
                'booking.showtime.studio.cinema',
            ])
            ->latest()
            ->get();

        $pastTickets = Ticket::whereHas('booking', fn ($q) => $q->where('user_id', $user->id)->where('status', 'paid'))
            ->where(function ($q) use ($today) {
                $q->where('is_used', true)
                    ->orWhereHas('booking.showtime', fn ($sub) => $sub->where('show_date', '<', $today));
            })
            ->with([
                'seat',
                'booking.showtime.movie',
                'booking.showtime.studio.cinema',
            ])
            ->latest()
            ->paginate(12);

        return Inertia::render('customer/my-tickets', [
            'activeTickets' => $activeTickets,
            'pastTickets' => $pastTickets,
        ]);
    }

    /**
     * User's dedicated Wishlist/Favorites page.
     */
    public function myFavorites(Request $request): Response
    {
        $favorites = $request->user()->favorites()
            ->with(['genres'])
            ->paginate(12);

        return Inertia::render('customer/favorites', [
            'favorites' => $favorites,
        ]);
    }

    /**
     * Toggle a movie in user's favorites.
     */
    public function toggleFavorite(Movie $movie, Request $request): RedirectResponse
    {
        $user = $request->user();
        $changes = $user->favorites()->toggle($movie->id);

        $attached = count($changes['attached']) > 0;
        $message = $attached
            ? "Film \"{$movie->title}\" berhasil ditambahkan ke daftar favorit."
            : "Film \"{$movie->title}\" dihapus dari daftar favorit.";

        return back()->with('success', $message);
    }

    /**
     * Cancel a pending booking voluntarily by the user.
     */
    public function cancelBooking(string $bookingCode, Request $request): RedirectResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $booking->update(['status' => 'cancelled']);
        $booking->bookingSeats()->update(['status' => 'released']);

        return back()->with('success', 'Pemesanan tiket berhasil dibatalkan.');
    }
}
