<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Showtime;
use App\Models\Studio;
use App\Services\ScheduleValidationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowtimeController extends Controller
{
    public function __construct(
        protected ScheduleValidationService $scheduleValidator
    ) {}

    public function index(Request $request): Response
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        $cinemaId = $request->query('cinema_id');
        $movieId = $request->query('movie_id');

        $showtimes = Showtime::with(['movie', 'studio.cinema'])
            ->withCount(['bookingSeats as booked_count' => fn ($q) => $q->where('status', 'booked')])
            ->whereDate('show_date', $date)
            ->when($cinemaId, function ($query, $cinemaId) {
                $query->whereHas('studio', fn ($q) => $q->where('cinema_id', $cinemaId));
            })
            ->when($movieId, fn ($q) => $q->where('movie_id', $movieId))
            ->orderBy('start_time')
            ->paginate(15)
            ->withQueryString();

        $movies = Movie::where('status', 'now_showing')->get();
        $cinemas = Cinema::with('studios')->where('is_active', true)->get();

        return Inertia::render('admin/showtimes/index', [
            'showtimes' => $showtimes,
            'movies' => $movies,
            'cinemas' => $cinemas,
            'filters' => [
                'date' => $date,
                'cinema_id' => $cinemaId,
                'movie_id' => $movieId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'exists:movies,id'],
            'studio_id' => ['required', 'exists:studios,id'],
            'show_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'base_price' => ['required', 'numeric', 'min:10000'],
        ]);

        $movie = Movie::findOrFail($validated['movie_id']);
        $startTime = Carbon::createFromFormat('H:i', $validated['start_time']);

        // End time is start time + movie duration + 20 minutes studio cleaning buffer
        $endTime = (clone $startTime)->addMinutes($movie->duration_minutes + 20)->format('H:i');

        // Check for schedule conflict in the same studio on the same date
        if ($this->scheduleValidator->hasConflict(
            $validated['studio_id'],
            $validated['show_date'],
            $validated['start_time'],
            $endTime
        )) {
            return back()->withErrors([
                'start_time' => "Jadwal bentrok! Studio ini sudah memiliki penayangan pada jam {$validated['start_time']} - {$endTime} (termasuk buffer pembersihan studio).",
            ])->withInput();
        }

        $showtime = Showtime::create([
            'movie_id' => $validated['movie_id'],
            'studio_id' => $validated['studio_id'],
            'show_date' => $validated['show_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $endTime,
            'base_price' => $validated['base_price'],
            'is_active' => true,
        ]);

        return redirect()->route('admin.showtimes.index', ['date' => $showtime->show_date->toDateString()])
            ->with('success', 'Jadwal tayang berhasil ditambahkan.');
    }

    public function destroy(Showtime $showtime): RedirectResponse
    {
        // Check if showtime has active paid bookings
        $hasPaidBookings = $showtime->bookings()->where('status', 'paid')->exists();
        if ($hasPaidBookings) {
            return back()->withErrors([
                'error' => 'Jadwal tidak dapat dihapus karena sudah memiliki tiket yang dibayar oleh penonton.',
            ]);
        }

        $showtime->delete();

        return back()->with('success', 'Jadwal tayang berhasil dihapus.');
    }
}
