<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MovieController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $genreId = $request->query('genre_id');

        $movies = Movie::with('genres')
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('director', 'like', "%{$search}%");
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($genreId, function ($query, $genreId) {
                $query->whereHas('genres', fn ($q) => $q->where('genres.id', $genreId));
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $genres = Genre::all();

        return Inertia::render('admin/movies/index', [
            'movies' => $movies,
            'genres' => $genres,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'genre_id' => $genreId,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/movies/form', [
            'movie' => null,
            'genres' => Genre::all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'synopsis' => ['required', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:500'],
            'rating_age' => ['required', Rule::in(['SU', '13+', '17+', '21+'])],
            'director' => ['required', 'string', 'max:255'],
            'cast' => ['required', 'string'],
            'language' => ['required', 'string', 'max:100'],
            'subtitle' => ['required', 'string', 'max:100'],
            'trailer_url' => ['nullable', 'url', 'max:255'],
            'poster_path' => ['required', 'string', 'max:500'],
            'banner_path' => ['nullable', 'string', 'max:500'],
            'release_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['now_showing', 'upcoming', 'archived'])],
            'genre_ids' => ['required', 'array', 'min:1'],
            'genre_ids.*' => ['exists:genres,id'],
        ]);

        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        while (Movie::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $movie = Movie::create([
            ...$validated,
            'slug' => $slug,
        ]);

        $movie->genres()->sync($validated['genre_ids']);

        return redirect()->route('admin.movies.index')
            ->with('success', "Film '{$movie->title}' berhasil ditambahkan.");
    }

    public function edit(Movie $movie): Response
    {
        $movie->load('genres');

        return Inertia::render('admin/movies/form', [
            'movie' => $movie,
            'genres' => Genre::all(),
        ]);
    }

    public function update(Request $request, Movie $movie): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'synopsis' => ['required', 'string'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:500'],
            'rating_age' => ['required', Rule::in(['SU', '13+', '17+', '21+'])],
            'director' => ['required', 'string', 'max:255'],
            'cast' => ['required', 'string'],
            'language' => ['required', 'string', 'max:100'],
            'subtitle' => ['required', 'string', 'max:100'],
            'trailer_url' => ['nullable', 'url', 'max:255'],
            'poster_path' => ['required', 'string', 'max:500'],
            'banner_path' => ['nullable', 'string', 'max:500'],
            'release_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['now_showing', 'upcoming', 'archived'])],
            'genre_ids' => ['required', 'array', 'min:1'],
            'genre_ids.*' => ['exists:genres,id'],
        ]);

        $movie->update($validated);
        $movie->genres()->sync($validated['genre_ids']);

        return redirect()->route('admin.movies.index')
            ->with('success', "Film '{$movie->title}' berhasil diperbarui.");
    }

    public function destroy(Movie $movie): RedirectResponse
    {
        $title = $movie->title;
        $movie->delete();

        return redirect()->route('admin.movies.index')
            ->with('success', "Film '{$title}' berhasil dihapus.");
    }
}
