<?php

namespace Database\Seeders;

use App\Models\Cinema;
use App\Models\Seat;
use App\Models\Studio;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CinemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cinemasData = [
            [
                'name' => 'CinePass Grand Mall Jakarta',
                'city' => 'Jakarta Pusat',
                'address' => 'Jl. M.H. Thamrin No. 1, Grand Mall Lantai 5, Jakarta Pusat',
                'phone' => '021-23580001',
                'studios' => [
                    ['name' => 'Studio 1 - Dolby Atmos', 'type' => 'regular', 'multiplier' => 1.0, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'cols' => 10],
                    ['name' => 'Studio 2 - IMAX Laser', 'type' => 'imax', 'multiplier' => 1.5, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 'cols' => 12],
                    ['name' => 'Studio 3 - Premiere VIP', 'type' => 'vip_premiere', 'multiplier' => 2.0, 'rows' => ['A', 'B', 'C', 'D'], 'cols' => 8],
                ],
            ],
            [
                'name' => 'CinePass Mall of South Jakarta',
                'city' => 'Jakarta Selatan',
                'address' => 'Jl. Metro Pondok Indah Blok 3B, Lantai 3, Kebayoran Lama, Jakarta Selatan',
                'phone' => '021-75067890',
                'studios' => [
                    ['name' => 'Studio 1 - Deluxe', 'type' => 'deluxe', 'multiplier' => 1.25, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F'], 'cols' => 10],
                    ['name' => 'Studio 2 - Dolby 7.1', 'type' => 'regular', 'multiplier' => 1.0, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'cols' => 10],
                ],
            ],
            [
                'name' => 'CinePass Paris Van Java Bandung',
                'city' => 'Bandung',
                'address' => 'Jl. Sukajadi No. 131-139, Paris Van Java Mall Lantai 2, Bandung',
                'phone' => '022-82063456',
                'studios' => [
                    ['name' => 'Studio 1 - Regular', 'type' => 'regular', 'multiplier' => 1.0, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F'], 'cols' => 10],
                    ['name' => 'Studio 2 - IMAX', 'type' => 'imax', 'multiplier' => 1.5, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'cols' => 12],
                ],
            ],
            [
                'name' => 'CinePass Tunjungan Plaza Surabaya',
                'city' => 'Surabaya',
                'address' => 'Jl. Basuki Rahmat No. 8-12, Tunjungan Plaza 6 Lantai 4, Surabaya',
                'phone' => '031-5311234',
                'studios' => [
                    ['name' => 'Studio 1 - Ultra HD', 'type' => 'regular', 'multiplier' => 1.0, 'rows' => ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'cols' => 10],
                    ['name' => 'Studio 2 - VIP Suite', 'type' => 'vip_premiere', 'multiplier' => 2.0, 'rows' => ['A', 'B', 'C'], 'cols' => 6],
                ],
            ],
        ];

        foreach ($cinemasData as $cData) {
            $cinema = Cinema::updateOrCreate(
                ['slug' => Str::slug($cData['name'])],
                [
                    'name' => $cData['name'],
                    'city' => $cData['city'],
                    'address' => $cData['address'],
                    'phone' => $cData['phone'],
                    'is_active' => true,
                ]
            );

            foreach ($cData['studios'] as $sData) {
                $totalSeats = count($sData['rows']) * $sData['cols'];

                $studio = Studio::updateOrCreate(
                    [
                        'cinema_id' => $cinema->id,
                        'name' => $sData['name'],
                    ],
                    [
                        'type' => $sData['type'],
                        'total_seats' => $totalSeats,
                        'price_multiplier' => $sData['multiplier'],
                    ]
                );

                // Generate seats for this studio
                foreach ($sData['rows'] as $rowIndex => $rowLabel) {
                    // Last 2 rows can be VIP or couple depending on studio type
                    $isVipRow = in_array($sData['type'], ['vip_premiere']) || ($rowIndex >= count($sData['rows']) - 1 && $sData['type'] !== 'regular');

                    for ($col = 1; $col <= $sData['cols']; $col++) {
                        Seat::updateOrCreate(
                            [
                                'studio_id' => $studio->id,
                                'row_label' => $rowLabel,
                                'seat_number' => $col,
                            ],
                            [
                                'seat_type' => $isVipRow ? 'vip' : 'regular',
                                'is_active' => true,
                            ]
                        );
                    }
                }
            }
        }
    }
}
