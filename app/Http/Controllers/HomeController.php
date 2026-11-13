<?php

namespace App\Http\Controllers;

use App\Models\Cinema;
use App\Models\Genre;
use App\Models\Movie;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the cinema public landing page.
     */
    public function index(Request $request): Response
    {
        // 3 Featured blockbuster movies for Hero Slider
        $heroMovies = Movie::with('genres')
            ->where('status', 'now_showing')
            ->whereNotNull('banner_path')
            ->latest('release_date')
            ->take(3)
            ->get();

        // Now showing movies
        $nowShowing = Movie::with('genres')
            ->where('status', 'now_showing')
            ->withCount('showtimes')
            ->latest('release_date')
            ->take(8)
            ->get();

        // Upcoming movies
        $upcoming = Movie::with('genres')
            ->where('status', 'upcoming')
            ->orderBy('release_date')
            ->take(6)
            ->get();

        // Active Promos
        $promos = Voucher::where('is_active', true)
            ->where('end_date', '>=', now())
            ->take(3)
            ->get();

        // Available Cinemas
        $cinemas = Cinema::where('is_active', true)
            ->withCount('studios')
            ->get();

        // Genres list
        $genres = Genre::all();

        return Inertia::render('welcome', [
            'heroMovies' => $heroMovies,
            'nowShowing' => $nowShowing,
            'upcoming' => $upcoming,
            'promos' => $promos,
            'cinemas' => $cinemas,
            'genres' => $genres,
        ]);
    }
}
