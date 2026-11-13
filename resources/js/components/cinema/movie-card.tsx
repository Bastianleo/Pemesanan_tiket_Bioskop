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
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
                        src={movie.poster_path ? (movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/') ? movie.poster_path : `/storage/${movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                    />

                    {/* Gradient Overlay for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent opacity-80" />

                    {/* Age Rating Badge */}
                    <div className="absolute top-2.5 left-2.5">
                        <span className="rounded bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-800 backdrop-blur-sm">
                            {movie.rating_age}
                        </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-800 backdrop-blur-sm">
                        <Clock className="size-3 text-zinc-400" />
                        <span>{movie.duration_minutes}m</span>
                    </div>

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/70 p-4 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                        <Link href={`/movies/${movie.slug}`} className="w-full">
                            <Button className="w-full rounded-lg bg-[#E50914] hover:bg-red-700 text-xs font-semibold text-white h-9">
                                <Ticket className="mr-1.5 size-3.5" />
                                Pesan Tiket
                            </Button>
                        </Link>

                        {embedUrl && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setTrailerOpen(true)}
                                className="w-full rounded-lg border-zinc-700 bg-zinc-900/90 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white h-9"
                            >
                                <Play className="mr-1.5 size-3 fill-current text-zinc-400" />
                                Trailer
                            </Button>
                        )}
                    </div>
                </div>

                {/* Movie Details */}
                <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                        {movie.genres?.slice(0, 2).map((g) => (
                            <span
                                key={g.id}
                                className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400"
                            >
                                {g.name}
                            </span>
                        ))}
                    </div>

                    <h3 className="line-clamp-1 text-sm font-semibold text-[#FAFAFA] group-hover:text-white transition-colors">
                        <Link href={`/movies/${movie.slug}`}>
                            {movie.title}
                        </Link>
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-[#A1A1AA] leading-relaxed">
                        {movie.synopsis}
                    </p>

                    <div className="mt-auto pt-3 border-t border-[#27272A] flex items-center justify-between text-xs">
                        <span className="text-[#71717A]">
                            {new Date(movie.release_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                        </span>
                        <Link href={`/movies/${movie.slug}`} className="text-zinc-300 hover:text-white font-medium transition-colors">
                            Beli Tiket →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Cinematic Theater Trailer Modal */}
            {embedUrl && (
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
                    <DialogContent className="border-[#27272A] bg-[#0E0E11] p-0 overflow-hidden sm:max-w-4xl lg:max-w-5xl rounded-2xl shadow-2xl shadow-red-950/20">
                        {/* Cinema Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#141418] via-[#18181D] to-[#141418] border-b border-[#27272A] pr-14">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-[10px] font-bold tracking-wider uppercase shrink-0">
                                    <span className="size-1.5 rounded-full bg-[#E50914] animate-pulse" />
                                    Official Trailer
                                </span>
                                <DialogTitle className="text-sm sm:text-base font-bold text-white truncate">
                                    {movie.title}
                                </DialogTitle>
                                {movie.rating_age && (
                                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-zinc-700 shrink-0">
                                        {movie.rating_age}
                                    </span>
                                )}
                                {movie.duration_minutes && (
                                    <span className="hidden sm:inline-block text-xs text-zinc-400 shrink-0">
                                        {movie.duration_minutes} Menit
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Edge-to-Edge Theater Video Player */}
                        <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                            <iframe
                                src={trailerOpen ? embedUrl : ''}
                                title={`Trailer ${movie.title}`}
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Cinema Lounge Footer */}
                        <div className="px-5 py-3.5 bg-[#111114] border-t border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
                            <div className="flex items-center gap-2 min-w-0">
                                <Film className="size-3.5 text-zinc-400 shrink-0" />
                                <span className="truncate">
                                    {movie.genres?.map((g) => g.name).join(' • ') || 'Bioskop Indonesia'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
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
                                        className="h-8 bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium px-4 rounded-lg shadow-md"
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
