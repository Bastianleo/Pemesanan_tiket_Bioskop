<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MovieCatalogController extends Controller
{
    /**
     * Display the searchable and filterable movie catalog.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $genreSlug = $request->query('genre');
        $status = $request->query('status', 'now_showing');
        $ratingAge = $request->query('rating');
        $sort = $request->query('sort', 'latest');

        $query = Movie::with('genres')
            ->withCount('showtimes')
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('director', 'like', "%{$search}%")
                        ->orWhere('cast', 'like', "%{$search}%");
                });
            })
            ->when($genreSlug && $genreSlug !== 'all', function ($q) use ($genreSlug) {
                $q->whereHas('genres', fn ($sub) => $sub->where('slug', $genreSlug));
            })
            ->when($status && $status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($ratingAge && $ratingAge !== 'all', function ($q) use ($ratingAge) {
                $q->where('rating_age', $ratingAge);
            });

        // Apply Sorting
        match ($sort) {
            'release_asc' => $query->orderBy('release_date', 'asc'),
            'title_asc' => $query->orderBy('title', 'asc'),
            'duration_desc' => $query->orderBy('duration_minutes', 'desc'),
            default => $query->latest('release_date'),
        };

        $movies = $query->paginate(12)->withQueryString();
        $genres = Genre::all();

        return Inertia::render('movies/catalog', [
            'movies' => $movies,
            'genres' => $genres,
            'filters' => [
                'search' => $search,
                'genre' => $genreSlug,
                'status' => $status,
                'rating' => $ratingAge,
                'sort' => $sort,
            ],
        ]);
    }
}
