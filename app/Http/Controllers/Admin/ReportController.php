<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->query('start_date', Carbon::today()->subDays(30)->toDateString());
        $endDate = $request->query('end_date', Carbon::today()->toDateString());

        $bookingsQuery = Booking::where('status', 'paid')
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ]);

        $totalRevenue = (float) (clone $bookingsQuery)->sum('total_amount');
        $totalTransactions = (clone $bookingsQuery)->count();
        $totalTickets = Ticket::whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay(),
        ])->count();

        // Revenue by Cinema
        $cinemas = Cinema::with(['studios.showtimes' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('show_date', [$startDate, $endDate])
                ->with(['bookings' => fn ($b) => $b->where('status', 'paid')]);
        }])->get()->map(function ($cinema) {
            $revenue = 0;
            $tickets = 0;
            foreach ($cinema->studios as $studio) {
                foreach ($studio->showtimes as $showtime) {
                    foreach ($showtime->bookings as $booking) {
                        $revenue += $booking->total_amount;
                    }
                    $tickets += $showtime->bookingSeats()->where('status', 'booked')->count();
                }
            }

            return [
                'id' => $cinema->id,
                'name' => $cinema->name,
                'city' => $cinema->city,
                'revenue' => (float) $revenue,
                'tickets_sold' => $tickets,
            ];
        });

        // Top movies in period
        $topMovies = Movie::withCount(['showtimes as tickets_sold' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('show_date', [$startDate, $endDate])
                ->join('booking_seats', 'showtimes.id', '=', 'booking_seats.showtime_id')
                ->where('booking_seats.status', 'booked');
        }])
            ->orderByDesc('tickets_sold')
            ->take(5)
            ->get();

        return Inertia::render('admin/reports/index', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_tickets' => $totalTickets,
            ],
            'cinemasReport' => $cinemas,
            'topMovies' => $topMovies,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function exportPdf(Request $request): HttpResponse
    {
        $startDate = $request->query('start_date', Carbon::today()->subDays(30)->toDateString());
        $endDate = $request->query('end_date', Carbon::today()->toDateString());

        $bookings = Booking::with(['user', 'showtime.movie', 'showtime.studio.cinema', 'payment'])
            ->where('status', 'paid')
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay(),
            ])
            ->latest()
            ->get();

        $totalRevenue = $bookings->sum('total_amount');

        $pdf = Pdf::loadView('reports.financial', [
            'bookings' => $bookings,
            'totalRevenue' => $totalRevenue,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'generatedAt' => now()->translatedFormat('d F Y H:i'),
        ]);

        return $pdf->download("Laporan-Penjualan-CinePass-{$startDate}-sd-{$endDate}.pdf");
    }
}
