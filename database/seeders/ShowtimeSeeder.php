<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\Showtime;
use App\Models\Studio;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ShowtimeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nowShowingMovies = Movie::where('status', 'now_showing')->get();
        $studios = Studio::with('cinema')->get();

        if ($nowShowingMovies->isEmpty() || $studios->isEmpty()) {
            return;
        }

        $timeSlots = [
            ['11:00', '13:30'],
            ['14:00', '16:30'],
            ['17:00', '19:30'],
            ['20:00', '22:30'],
        ];

        // Seed showtimes for today and the next 4 days
        for ($day = 0; $day <= 4; $day++) {
            $date = Carbon::today()->addDays($day)->toDateString();

            foreach ($studios as $studioIndex => $studio) {
                // Distribute movies across studios
                $movie = $nowShowingMovies[$studioIndex % $nowShowingMovies->count()];

                $basePrice = match ($studio->type) {
                    'regular' => 45000,
                    'deluxe' => 60000,
                    'imax' => 75000,
                    'vip_premiere' => 100000,
                };

                foreach ($timeSlots as $slot) {
                    Showtime::updateOrCreate(
                        [
                            'movie_id' => $movie->id,
                            'studio_id' => $studio->id,
                            'show_date' => $date,
                            'start_time' => $slot[0],
                        ],
                        [
                            'end_time' => $slot[1],
                            'base_price' => $basePrice,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
