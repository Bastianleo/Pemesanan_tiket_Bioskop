import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Film, Clock, Trash2, Ticket, ArrowLeft } from 'lucide-react';
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
        router.post(
            `/favorites/${movieId}/toggle`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <CinemaLayout>
            <Head title="Film Favorit Saya - CinePass Cinema" />

            <div className="min-h-screen overflow-x-clip bg-[#09090B] py-8 text-[#FAFAFA] lg:py-10">
                <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 sm:px-6 lg:px-8 xl:px-12">
                    {/* Header Banner */}
                    <div className="flex flex-col gap-6 border-b border-[#27272A] pb-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1 text-left">
                            <span className="text-xs font-medium tracking-wider text-[#71717A] uppercase">
                                Koleksi Pribadi
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Film Favorit Saya (Wishlist)
                            </h1>
                            <p className="max-w-xl text-xs text-[#A1A1AA] sm:text-sm">
                                Daftar film bioskop pilihan yang Anda simpan
                                untuk ditonton.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                            <Link href="/dashboard">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-200 hover:bg-zinc-800"
                                >
                                    <ArrowLeft className="mr-1.5 size-3.5" />
                                    <span>Dashboard</span>
                                </Button>
                            </Link>
                            <Link href="/movies">
                                <Button className="h-9 rounded-lg bg-[#E50914] text-xs font-medium text-white hover:bg-red-700">
                                    <Film className="mr-1.5 size-3.5" />
                                    <span>Katalog Film</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Movie Grid */}
                    {favorites.data && favorites.data.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {favorites.data.map((movie) => (
                                <Card
                                    key={movie.id}
                                    className="group flex flex-col justify-between overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] shadow-none transition-colors hover:border-zinc-700"
                                >
                                    <div>
                                        <div className="relative aspect-[2/3] overflow-hidden bg-[#111114]">
                                            <img
                                                src={
                                                    movie.poster_path
                                                        ? movie.poster_path.startsWith(
                                                              'http',
                                                          ) ||
                                                          movie.poster_path.startsWith(
                                                              '/',
                                                          )
                                                            ? movie.poster_path
                                                            : `/storage/${movie.poster_path}`
                                                        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
                                                }
                                                alt={movie.title}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />

                                            <div className="absolute top-2 left-2">
                                                <span className="rounded border border-zinc-800 bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                    {movie.rating_age}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveFavorite(
                                                        movie.id,
                                                    )
                                                }
                                                className="absolute top-2 right-2 rounded-lg bg-black/70 p-1.5 text-white transition-colors hover:bg-red-600"
                                                title="Hapus dari Favorit"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>

                                        <CardContent className="space-y-1.5 p-3.5 text-left">
                                            <h3 className="truncate text-sm font-semibold text-white">
                                                {movie.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA]">
                                                <Clock className="size-3 text-[#71717A]" />
                                                <span>
                                                    {movie.duration_minutes}{' '}
                                                    Menit
                                                </span>
                                            </div>
                                        </CardContent>
                                    </div>

                                    <div className="p-3.5 pt-0">
                                        <Link
                                            href={`/movies/${movie.slug}`}
                                            className="block"
                                        >
                                            <Button className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-[#E50914] py-1.5 text-xs font-medium text-white hover:bg-red-700">
                                                <Ticket className="size-3.5" />
                                                <span>Pesan Tiket</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 rounded-xl border border-[#27272A] bg-[#111114] p-8 text-center sm:p-12">
                            <Heart className="mx-auto size-8 text-[#71717A]" />
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-semibold text-zinc-200">
                                    Belum Ada Film Favorit
                                </h3>
                                <p className="text-xs text-[#71717A]">
                                    Klik tombol Favorit pada film yang Anda
                                    sukai di katalog untuk menyimpannya di sini.
                                </p>
                            </div>
                            <Link href="/movies" className="inline-block pt-1">
                                <Button className="rounded-lg bg-[#E50914] px-4 py-2 text-xs font-medium text-white hover:bg-red-700">
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
