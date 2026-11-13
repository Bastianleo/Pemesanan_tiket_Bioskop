import { Link } from '@inertiajs/react';
import { Clock, Film, Play, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Movie } from '@/types';

interface Props {
    movie: Movie;
}

export default function MovieCard({ movie }: Props) {
    const [trailerOpen, setTrailerOpen] = useState(false);

    // Extract YouTube embed ID if available
    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : url;
    };

    const embedUrl = getEmbedUrl(movie.trailer_url);

    return (
        <>
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B] transition-all duration-200 hover:border-zinc-700">
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#111114]">
                    <img
                        src={
                            movie.poster_path
                                ? movie.poster_path.startsWith('http') ||
                                  movie.poster_path.startsWith('/')
                                    ? movie.poster_path
                                    : `/storage/${movie.poster_path}`
                                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
                        }
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                    />

                    {/* Gradient Overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-80" />

                    {/* Age Rating Badge */}
                    <div className="absolute top-2.5 left-2.5">
                        <span className="rounded border border-zinc-800 bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm">
                            {movie.rating_age}
                        </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded border border-zinc-800 bg-black/75 px-2 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-sm">
                        <Clock className="size-3 text-zinc-400" />
                        <span>{movie.duration_minutes}m</span>
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/70 p-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                        <Link href={`/movies/${movie.slug}`} className="w-full">
                            <Button className="h-9 w-full rounded-lg bg-[#E50914] text-xs font-semibold text-white hover:bg-red-700">
                                <Ticket className="mr-1.5 size-3.5" />
                                Pesan Tiket
                            </Button>
                        </Link>

                        {embedUrl && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTrailerOpen(true)}
                                className="h-9 w-full rounded-lg border-zinc-700 bg-zinc-900/90 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white"
                            >
                                <Play className="mr-1.5 size-3 fill-current text-zinc-400" />
                                Trailer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Movie Details */}
                <div className="flex flex-1 flex-col p-3.5">
                    <div className="mb-1.5 flex flex-wrap gap-1">
                        {movie.genres?.slice(0, 2).map((g) => (
                            <span
                                key={g.id}
                                className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>

                    <h3 className="line-clamp-1 text-sm font-semibold text-[#FAFAFA] transition-colors group-hover:text-white">
                        <Link href={`/movies/${movie.slug}`}>
                            {movie.title}
                        </Link>
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#A1A1AA]">
                        {movie.synopsis}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-[#27272A] pt-3 text-xs">
                        <span className="text-[#71717A]">
                            {new Date(movie.release_date).toLocaleDateString(
                                'id-ID',
                                { month: 'short', year: 'numeric' },
                            )}
                        </span>
                        <Link
                            href={`/movies/${movie.slug}`}
                            className="font-medium text-zinc-300 transition-colors hover:text-white"
                        >
                            Beli Tiket →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cinematic Theater Trailer Modal */}
            {embedUrl && (
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                    <DialogContent className="overflow-hidden rounded-2xl border-[#27272A] bg-[#0E0E11] p-0 shadow-2xl shadow-red-950/20 sm:max-w-4xl lg:max-w-5xl">
                        {/* Cinema Header */}
                        <div className="flex items-center justify-between border-b border-[#27272A] bg-gradient-to-r from-[#141418] via-[#18181D] to-[#141418] px-5 py-3.5 pr-14">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#E50914]/30 bg-[#E50914]/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#E50914] uppercase">
                                    <span className="size-1.5 animate-pulse rounded-full bg-[#E50914]" />
                                    Official Trailer
                                </span>
                                <DialogTitle className="truncate text-sm font-bold text-white sm:text-base">
                                    {movie.title}
                                </DialogTitle>
                                {movie.rating_age && (
                                    <span className="hidden shrink-0 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 sm:inline-block">
                                        {movie.rating_age}
                                    </span>
                                )}
                                {movie.duration_minutes && (
                                    <span className="hidden shrink-0 text-xs text-zinc-400 sm:inline-block">
                                        {movie.duration_minutes} Menit
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Edge-to-Edge Theater Video Player */}
                        <div className="relative flex aspect-video w-full items-center justify-center bg-black">
                            <iframe
                                src={trailerOpen ? embedUrl : ''}
                                title={`Trailer ${movie.title}`}
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Cinema Lounge Footer */}
                        <div className="flex flex-col justify-between gap-3 border-t border-[#27272A] bg-[#111114] px-5 py-3.5 text-xs text-zinc-400 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-center gap-2">
                                <Film className="size-3.5 shrink-0 text-zinc-400" />
                                <span className="truncate">
                                    {movie.genres
                                        ?.map((g) => g.name)
                                        .join(' • ') || 'Bioskop Indonesia'}
                                </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTrailerOpen(false)}
                                    className="h-8 text-xs text-zinc-400 hover:text-white"
                                >
                                    Tutup
                                </Button>
                                <Link href={`/movies/${movie.slug}`}>
                                    <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 rounded-lg bg-[#E50914] px-4 text-xs font-medium text-white shadow-md hover:bg-red-700"
                                    >
                                        Beli Tiket Bioskop
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
