import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Heart,
    Film,
    Clock,
    Trash2,
    Ticket,
    ArrowLeft
} from 'lucide-react';
import { Movie } from '@/types/cinema';

interface Props {
    favorites: {
        data: Movie[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function MyFavoritesPage({ favorites }: Props) {
    const handleRemoveFavorite = (movieId: number) => {
        router.post(`/favorites/${movieId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <CinemaLayout>
            <Head title="Film Favorit Saya - CinePass Cinema" />

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10 overflow-x-clip">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
                    
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#27272A] pb-6">
                        <div className="space-y-1 text-left">
                            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                                Koleksi Pribadi
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Film Favorit Saya (Wishlist)
                            </h1>
                            <p className="text-[#A1A1AA] text-xs sm:text-sm max-w-xl">
                                Daftar film bioskop pilihan yang Anda simpan untuk ditonton.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <Link href="/dashboard">
                                <Button variant="outline" className="h-9 border-[#27272A] bg-[#18181B] hover:bg-zinc-800 text-zinc-200 text-xs rounded-lg">
                                    <ArrowLeft className="size-3.5 mr-1.5" />
                                    <span>Dashboard</span>
                                </Button>
                            </Link>
                            <Link href="/movies">
                                <Button className="h-9 bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium rounded-lg">
                                    <Film className="size-3.5 mr-1.5" />
                                    <span>Katalog Film</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Movie Grid */}
                    {favorites.data && favorites.data.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                            {favorites.data.map((movie) => (
                                <Card
                                    key={movie.id}
                                    className="bg-[#18181B] border-[#27272A] hover:border-zinc-700 shadow-none overflow-hidden rounded-xl group transition-colors flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="relative aspect-[2/3] overflow-hidden bg-[#111114]">
                                            <img
                                                src={movie.poster_path ? (movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/') ? movie.poster_path : `/storage/${movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                                alt={movie.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                            />

                                            <div className="absolute top-2 left-2">
                                                <span className="rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-800">
                                                    {movie.rating_age}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFavorite(movie.id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                                                title="Hapus dari Favorit"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>

                                        <CardContent className="p-3.5 space-y-1.5 text-left">
                                            <h3 className="font-semibold text-white text-sm truncate">
                                                {movie.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
                                                <Clock className="size-3 text-[#71717A]" />
                                                <span>{movie.duration_minutes} Menit</span>
                                            </div>
                                        </CardContent>
                                    </div>

                                    <div className="p-3.5 pt-0">
                                        <Link href={`/movies/${movie.slug}`} className="block">
                                            <Button className="w-full bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium py-1.5 h-8 rounded-lg flex items-center justify-center gap-1.5">
                                                <Ticket className="size-3.5" />
                                                <span>Pesan Tiket</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#111114] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center space-y-3">
                            <Heart className="size-8 text-[#71717A] mx-auto" />
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-semibold text-zinc-200">
                                    Belum Ada Film Favorit
                                </h3>
                                <p className="text-xs text-[#71717A]">
                                    Klik tombol Favorit pada film yang Anda sukai di katalog untuk menyimpannya di sini.
                                </p>
                            </div>
                            <Link href="/movies" className="inline-block pt-1">
                                <Button className="bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-lg">
                                    Jelajahi Film
                                </Button>
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </CinemaLayout>
    );
}
