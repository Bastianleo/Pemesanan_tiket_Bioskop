<?php

namespace App\Http\Controllers;

use App\Models\Cinema;
use App\Models\Movie;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MovieDetailController extends Controller
{
    /**
     * Display movie detail with cinema and showtimes matrix.
     */
    public function show(string $slug, Request $request): Response
    {
        $movie = Movie::with('genres')
            ->where('slug', $slug)
            ->firstOrFail();

        // 5 available show dates starting from today
        $availableDates = [];
        for ($i = 0; $i < 5; $i++) {
            $d = Carbon::today()->addDays($i);
            $availableDates[] = [
                'date' => $d->toDateString(),
                'day_name' => $i === 0 ? 'Hari Ini' : ($i === 1 ? 'Besok' : $d->translatedFormat('l')),
                'formatted' => $d->translatedFormat('d M'),
            ];
        }

        $selectedDate = $request->query('date', Carbon::today()->toDateString());
        $selectedCity = $request->query('city', 'Jakarta Pusat');

        // Available cities with cinemas
        $cities = Cinema::where('is_active', true)
            ->distinct()
            ->pluck('city')
            ->toArray();

        // Get cinemas in selected city with their showtimes for this movie on selected date
        $cinemas = Cinema::where('is_active', true)
            ->when($selectedCity, fn ($q) => $q->where('city', $selectedCity))
            ->with(['studios' => function ($studioQuery) use ($movie, $selectedDate) {
                $studioQuery->with(['showtimes' => function ($showtimeQuery) use ($movie, $selectedDate) {
                    $showtimeQuery->where('movie_id', $movie->id)
                        ->whereDate('show_date', $selectedDate)
                        ->where('is_active', true)
                        ->withCount(['bookingSeats as booked_seats_count' => fn ($q) => $q->where('status', 'booked')])
                        ->orderBy('start_time');
                }]);
            }])
            ->get()
            ->map(function ($cinema) {
                // Filter out studios without showtimes
                $cinema->studios = $cinema->studios->filter(function ($studio) {
                    return $studio->showtimes->isNotEmpty();
                })->values();

                return $cinema;
            })
            ->filter(function ($cinema) {
                return $cinema->studios->isNotEmpty();
            })
            ->values();

        return Inertia::render('movies/detail', [
            'movie' => $movie,
            'availableDates' => $availableDates,
            'selectedDate' => $selectedDate,
            'selectedCity' => $selectedCity,
            'cities' => $cities,
            'cinemas' => $cinemas,
        ]);
    }
}
