<?php

use App\Models\Movie;

test('movie detail page can be rendered', function () {
    $movie = Movie::factory()->create([
        'title' => 'Avatar 3',
        'slug' => 'avatar-3',
        'status' => 'now_showing',
        'duration_minutes' => 180,
        'rating_age' => '13+',
        'director' => 'James Cameron',
        'cast' => 'Sam Worthington, Zoe Saldana',
        'language' => 'Inggris',
        'subtitle' => 'Indonesia',
        'poster_path' => 'https://example.com/poster.jpg',
        'release_date' => now()->toDateString(),
    ]);

    $response = $this->get("/movies/{$movie->slug}");

    $response->assertStatus(200);
});
