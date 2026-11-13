import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock, Play, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Movie } from '@/types';

interface Props {
    movies: Movie[];
}

export default function HeroSlider({ movies }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

    // Auto rotate every 6 seconds
    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [movies.length]);

    if (!movies || movies.length === 0) return null;

    const currentMovie = movies[currentIndex];

    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : url;
    };

    return (
        <div className="relative h-[480px] w-full overflow-hidden bg-[#09090B] sm:h-[560px]">
            {/* Banner Background Image with Fade Effect */}
            <div className="absolute inset-0">
                <img
                    src={currentMovie.banner_path || currentMovie.poster_path}
                    alt={currentMovie.title}
                    className="h-full w-full scale-100 object-cover object-center brightness-[0.4] filter transition-all duration-700"
                />
                {/* Cinema Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/80 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col justify-end px-4 pb-14 sm:px-6 lg:px-8 xl:px-12">
                <div className="max-w-2xl space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#E50914] px-2.5 py-0.5 text-xs font-semibold text-white">
                            Pilihan Utama
                        </span>
                        <span className="rounded border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 text-xs font-medium text-zinc-300">
                            {currentMovie.rating_age}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Clock className="size-3.5 text-zinc-400" />
                            <span>{currentMovie.duration_minutes} Menit</span>
                        </div>
                    </div>

                    {/* Movie Title */}
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {currentMovie.title}
                    </h1>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1.5">
                        {currentMovie.genres?.map((g) => (
                            <span
                                key={g.id}
                                className="rounded border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-400"
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>

                    {/* Synopsis */}
                    <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-[#A1A1AA] sm:line-clamp-3">
                        {currentMovie.synopsis}
                    </p>

                    {/* Cast Info */}
                    {currentMovie.cast && (
                        <div className="text-xs text-[#71717A]">
                            <span className="text-zinc-400">Pemeran: </span>
                            {currentMovie.cast}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link href={`/movies/${currentMovie.slug}`}>
                            <Button className="h-10 rounded-lg bg-[#E50914] px-6 text-sm font-medium text-white hover:bg-red-700">
                                <Ticket className="mr-2 size-4" />
                                Pesan Tiket
                            </Button>
                        </Link>

                        {currentMovie.trailer_url && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setTrailerUrl(
                                        getEmbedUrl(currentMovie.trailer_url),
                                    )
                                }
                                className="h-10 rounded-lg border-zinc-700 bg-zinc-900/80 px-5 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-white"
                            >
                                <Play className="mr-2 size-3.5 fill-current text-zinc-300" />
                                Tonton Trailer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Slider Controls */}
                {movies.length > 1 && (
                    <div className="absolute right-4 bottom-8 flex items-center gap-3 sm:right-8">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentIndex(
                                    (prev) =>
                                        (prev - 1 + movies.length) %
                                        movies.length,
                                )
                            }
                            className="size-8 rounded-lg border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>

                        <div className="flex gap-1.5">
                            {movies.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        currentIndex === idx
                                            ? 'w-6 bg-[#E50914]'
                                            : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                                    }`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setCurrentIndex(
                                    (prev) => (prev + 1) % movies.length,
                                )
                            }
                            className="size-8 rounded-lg border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Trailer Modal */}
            {trailerUrl && (
                <Dialog
                    open={!!trailerUrl}
                    onOpenChange={() => setTrailerUrl(null)}
                >
                    <DialogContent className="overflow-hidden border-[#27272A] bg-[#111114] p-0 sm:max-w-3xl">
                        <DialogHeader className="p-4 pb-0">
                            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Play className="size-4 fill-current text-[#E50914]" />
                                Trailer: {currentMovie.title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="aspect-video w-full p-4 pt-2">
                            <iframe
                                src={trailerUrl}
                                title={`Trailer ${currentMovie.title}`}
                                className="h-full w-full rounded-lg border border-[#27272A]"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
