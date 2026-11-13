<?php

namespace Database\Seeders;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MovieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $genresMap = Genre::all()->pluck('id', 'name');

        $movies = [
            [
                'title' => 'Dune: Part Two',
                'synopsis' => 'Paul Atreides bersatu dengan Chani dan kaum Fremen sambil membalas dendam terhadap para konspirator yang menghancurkan keluarganya. Menghadapi pilihan antara cinta dalam hidupnya dan nasib alam semesta, ia berusaha mencegah masa depan yang mengerikan.',
                'duration_minutes' => 166,
                'rating_age' => '13+',
                'director' => 'Denis Villeneuve',
                'cast' => 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler',
                'language' => 'Inggris',
                'subtitle' => 'Indonesia',
                'trailer_url' => 'https://www.youtube.com/watch?v=Way9Dexny3w',
                'poster_path' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-03-01',
                'status' => 'now_showing',
                'genres' => ['Sci-Fi', 'Adventure', 'Action'],
            ],
            [
                'title' => 'Interstellar Horizon',
                'synopsis' => 'Ketika bumi mulai kehabisan sumber daya alam dan oksigen menipis, sekelompok astronaut dan ilmuwan melintasi lubang cacing melintasi galaksi untuk menemukan hunian baru bagi kelangsungan hidup umat manusia.',
                'duration_minutes' => 169,
                'rating_age' => '13+',
                'director' => 'Christopher Nolan',
                'cast' => 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
                'language' => 'Inggris',
                'subtitle' => 'Indonesia',
                'trailer_url' => 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
                'poster_path' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-04-10',
                'status' => 'now_showing',
                'genres' => ['Sci-Fi', 'Drama', 'Adventure'],
            ],
            [
                'title' => 'Midnight Whisper: Terror Nusantara',
                'synopsis' => 'Sebuah keluarga yang mewarisi vila tua peninggalan kolonial di kaki gunung mendapati rahasia gelap dan teror mistis yang bangkit kembali setelah 70 tahun terkubur.',
                'duration_minutes' => 108,
                'rating_age' => '17+',
                'director' => 'Joko Anwar',
                'cast' => 'Tara Basro, Bront Palarae, Christine Hakim, Endy Arfian',
                'language' => 'Indonesia',
                'subtitle' => 'Inggris',
                'trailer_url' => 'https://www.youtube.com/watch?v=0hBqsmec5q0',
                'poster_path' => 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-05-15',
                'status' => 'now_showing',
                'genres' => ['Horror', 'Thriller', 'Mystery'],
            ],
            [
                'title' => 'Cyber Shadow: Neon Protocol',
                'synopsis' => 'Di era megacity tahun 2085, seorang detektif cyborg memburu organisasi hacker rahasia yang mengancam akan menghapus memori digital seluruh penduduk kota.',
                'duration_minutes' => 135,
                'rating_age' => '17+',
                'director' => 'Chad Stahelski',
                'cast' => 'Keanu Reeves, Hiroyuki Sanada, Donnie Yen, Bill Skarsgård',
                'language' => 'Inggris',
                'subtitle' => 'Indonesia',
                'trailer_url' => 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
                'poster_path' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-06-01',
                'status' => 'now_showing',
                'genres' => ['Action', 'Sci-Fi', 'Thriller'],
            ],
            [
                'title' => 'Chronicles of the Celestial Kingdom',
                'synopsis' => 'Kisah epik petualangan seorang putri klan naga yang harus mengumpulkan tujuh pecahan giok surgawi sebelum gerhana abadi melanda kerajaannya.',
                'duration_minutes' => 122,
                'rating_age' => 'SU',
                'director' => 'Makoto Shinkai',
                'cast' => 'Nana Mori, Kotaro Daigo, Shun Oguri, Tsubasa Honda',
                'language' => 'Jepang',
                'subtitle' => 'Indonesia',
                'trailer_url' => 'https://www.youtube.com/watch?v=k4xGqY5IDBE',
                'poster_path' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-07-20',
                'status' => 'upcoming',
                'genres' => ['Animation', 'Fantasy', 'Adventure'],
            ],
            [
                'title' => 'The Quantum Paradox',
                'synopsis' => 'Dua fisikawan jenius menemukan mesin penjelajah waktu portabel. Namun setiap kali mereka mengubah masa lalu, realitas masa kini mereka terhapus satu per satu.',
                'duration_minutes' => 140,
                'rating_age' => '13+',
                'director' => 'Guillermo del Toro',
                'cast' => 'Benedict Cumberbatch, Rachel McAdams, Chiwetel Ejiofor',
                'language' => 'Inggris',
                'subtitle' => 'Indonesia',
                'trailer_url' => 'https://www.youtube.com/watch?v=aWzlQ2N6qqg',
                'poster_path' => 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
                'banner_path' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
                'release_date' => '2026-08-15',
                'status' => 'upcoming',
                'genres' => ['Sci-Fi', 'Thriller'],
            ],
        ];

        foreach ($movies as $mData) {
            $genres = $mData['genres'];
            unset($mData['genres']);

            $movie = Movie::updateOrCreate(
                ['slug' => Str::slug($mData['title'])],
                $mData
            );

            $genreIds = [];
            foreach ($genres as $gName) {
                if (isset($genresMap[$gName])) {
                    $genreIds[] = $genresMap[$gName];
                }
            }

            if (! empty($genreIds)) {
                $movie->genres()->sync($genreIds);
            }
        }
    }
}
