<?php

namespace Database\Factories;

use App\Models\Movie;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Movie>
 */
class MovieFactory extends Factory
{
    protected $model = Movie::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'synopsis' => fake()->paragraph(),
            'duration_minutes' => fake()->numberBetween(90, 180),
            'rating_age' => fake()->randomElement(['SU', '13+', '17+', '21+']),
            'director' => fake()->name(),
            'cast' => fake()->name().', '.fake()->name(),
            'language' => 'Indonesia',
            'subtitle' => 'Indonesia',
            'trailer_url' => 'https://www.youtube.com/watch?v=Way9Dexny3w',
            'poster_path' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
            'banner_path' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
            'release_date' => now()->toDateString(),
            'status' => 'now_showing',
        ];
    }
}
