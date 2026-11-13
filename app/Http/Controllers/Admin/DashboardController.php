<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Movie;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $totalRevenue = (float) Booking::where('status', 'paid')->sum('total_amount');
        $totalBookings = Booking::count();
        $totalTicketsSold = Ticket::count();
        $totalUsers = User::where('role', 'user')->count();

        $activeMoviesCount = Movie::where('status', 'now_showing')->count();
        $todayShowtimesCount = Showtime::whereDate('show_date', today())->count();

        // 7-day revenue and booking count chart data
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dateString = $date->toDateString();
            $dayLabel = $date->translatedFormat('d M');

            $revenue = (float) Booking::where('status', 'paid')
                ->whereDate('created_at', $dateString)
                ->sum('total_amount');

            $bookingsCount = Booking::whereDate('created_at', $dateString)->count();

            $chartData[] = [
                'date' => $dayLabel,
                'revenue' => $revenue,
                'bookings' => $bookingsCount,
            ];
        }

        // Popular movies (by total bookings)
        $popularMovies = Movie::select('movies.id', 'movies.title', 'movies.poster_path', 'movies.rating_age')
            ->withCount(['showtimes as total_sold' => function ($query) {
                $query->join('bookings', 'showtimes.id', '=', 'bookings.showtime_id')
                    ->where('bookings.status', 'paid');
            }])
            ->orderByDesc('total_sold')
            ->take(5)
            ->get();

        // Recent bookings
        $recentBookings = Booking::with(['user', 'showtime.movie', 'showtime.studio.cinema', 'payment'])
            ->latest()
            ->take(6)
            ->get();

        // Studio occupancy calculation
        $totalPhysicalSeats = Seat::where('is_active', true)->count();
        $todayShowtimes = Showtime::whereDate('show_date', today())->pluck('id');
        $bookedSeatsToday = DB::table('booking_seats')
            ->whereIn('showtime_id', $todayShowtimes)
            ->where('status', 'booked')
            ->count();

        $potentialTotalCapacity = $todayShowtimes->count() > 0
            ? ($todayShowtimes->count() * 60) // average capacity estimation
            : 1;

        $occupancyRate = round(($bookedSeatsToday / max($potentialTotalCapacity, 1)) * 100, 1);

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_bookings' => $totalBookings,
                'total_tickets' => $totalTicketsSold,
                'total_users' => $totalUsers,
                'active_movies' => $activeMoviesCount,
                'today_showtimes' => $todayShowtimesCount,
                'occupancy_rate' => $occupancyRate,
            ],
            'chartData' => $chartData,
            'popularMovies' => $popularMovies,
            'recentBookings' => $recentBookings,
        ]);
    }
}
