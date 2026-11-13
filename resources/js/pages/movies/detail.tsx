import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    ChevronRight,
    Clock,
    Film,
    Globe,
    Heart,
    Layers,
    MapPin,
    Play,
    Share2,
    Ticket,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import CinemaLayout from '@/layouts/cinema-layout';
import type { Cinema, Movie, Showtime, Studio } from '@/types';

interface AvailableDate {
    date: string;
    day_name: string;
    formatted: string;
}

interface CinemaWithShowtimes extends Cinema {
    studios: (Studio & {
        showtimes: (Showtime & {
            booked_seats_count: number;
        })[];
    })[];
}

interface Props {
    movie: Movie;
    availableDates: AvailableDate[];
    selectedDate: string;
    selectedCity: string;
    cities: string[];
    cinemas: CinemaWithShowtimes[];
}

export default function MovieDetail({
    movie,
    availableDates,
    selectedDate,
    selectedCity,
    cities,
    cinemas,
}: Props) {
    const [trailerOpen, setTrailerOpen] = useState(false);

    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
            : url;
    };

    const embedUrl = getEmbedUrl(movie.trailer_url);

    const handleDateChange = (date: string) => {
        router.get(
            `/movies/${movie.slug}`,
            { date, city: selectedCity },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCityChange = (city: string) => {
        router.get(
            `/movies/${movie.slug}`,
            { date: selectedDate, city },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan film berhasil disalin ke clipboard!');
    };

    const getStudioBadge = (type: string) => {
        switch (type) {
            case 'imax':
                return <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">IMAX Laser</span>;
            case 'vip_premiere':
                return <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">VIP Premiere</span>;
            case 'deluxe':
                return <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">Deluxe</span>;
            default:
                return <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">Regular 2D</span>;
        }
    };

    return (
        <CinemaLayout>
            <Head title={`${movie.title} - Jadwal Tayang & Tiket Online`} />

            {/* Backdrop Banner Section */}
            <div className="relative h-[300px] w-full overflow-hidden bg-[#09090B] sm:h-[400px]">
                <img
                    src={movie.banner_path || movie.poster_path}
                    alt={movie.title}
                    className="h-full w-full object-cover filter brightness-[0.35]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent pointer-events-none" />
            </div>

            {/* Main Movie Info & Schedule Picker */}
            <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 xl:px-12 -mt-24 sm:-mt-32 relative z-10 pb-16 space-y-12">
                {/* Header Profile Card */}
                <div className="flex flex-col gap-6 md:flex-row md:items-start justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start flex-1 min-w-0">
                        {/* Poster */}
                        <div className="w-40 shrink-0 overflow-hidden rounded-xl border border-[#27272A] bg-[#111114] shadow-2xl sm:w-52">
                            <img
                                src={movie.poster_path ? (movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/') ? movie.poster_path : `/storage/${movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                alt={movie.title}
                                className="aspect-[2/3] w-full object-cover"
                            />
                        </div>

                        {/* Metadata Details */}
                        <div className="flex-1 space-y-4 pt-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded bg-[#18181B] px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-[#27272A]">
                                    {movie.rating_age}
                                </span>
                                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300 border border-zinc-700">
                                    {movie.status === 'now_showing' ? 'Sedang Tayang' : 'Segera Tayang'}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
                                    <Clock className="size-3.5 text-zinc-400" />
                                    <span>{movie.duration_minutes} Menit</span>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap gap-1.5">
                                {movie.genres?.map((g) => (
                                    <span
                                        key={g.id}
                                        className="rounded bg-[#18181B] border border-[#27272A] px-2.5 py-1 text-xs font-medium text-[#A1A1AA]"
                                    >
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                        <div className="grid gap-2 border-y border-[#27272A] py-3.5 text-xs text-zinc-300 sm:grid-cols-2">
                            <div><strong className="text-[#71717A]">Sutradara:</strong> {movie.director}</div>
                            <div><strong className="text-[#71717A]">Tanggal Rilis:</strong> {movie.release_date}</div>
                            <div><strong className="text-[#71717A]">Bahasa:</strong> {movie.language} (Sub: {movie.subtitle})</div>
                            <div className="line-clamp-1"><strong className="text-[#71717A]">Pemeran:</strong> {movie.cast}</div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">Sinopsis Cerita</h3>
                            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-3xl">
                                {movie.synopsis}
                            </p>
                        </div>

                        <div className="pt-1 flex flex-wrap items-center gap-2">
                            {embedUrl && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setTrailerOpen(true)}
                                    className="h-8 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 rounded-lg cursor-pointer"
                                >
                                    <Play className="mr-1.5 size-3 fill-current text-red-500" />
                                    Putar Trailer
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.post(`/favorites/${movie.id}/toggle`, {}, { preserveScroll: true })}
                                className="h-8 border-[#27272A] bg-[#18181B] text-xs text-zinc-300 hover:text-white hover:border-zinc-700 rounded-lg"
                            >
                                <Heart className="mr-1.5 size-3.5 text-red-500" />
                                Favorit
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="h-8 border-[#27272A] bg-[#18181B] text-xs text-zinc-300 hover:text-white hover:border-zinc-700 rounded-lg"
                            >
                                <Share2 className="mr-1.5 size-3.5" />
                                Bagikan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Trailer Button on Top Right (Desktop) */}
                {embedUrl && (
                    <div className="shrink-0 pt-2 hidden md:block">
                        <Button
                            type="button"
                            onClick={() => setTrailerOpen(true)}
                            size="sm"
                            className="rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-white font-medium px-4 h-9 border border-zinc-700 shadow-xl cursor-pointer transition-transform hover:scale-105 backdrop-blur-md"
                        >
                            <Play className="mr-1.5 size-3.5 fill-current text-white" />
                            Putar Trailer
                        </Button>
                    </div>
                )}
            </div>

                {/* SHOWTIMES BOOKING WIDGET */}
                <div id="jadwal-tayang" className="space-y-6 pt-2 scroll-mt-24">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#27272A] pb-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                                Jadwal Tayang Bioskop
                            </h2>
                            <p className="text-xs text-[#A1A1AA] mt-0.5">
                                Pilih tanggal dan jam tayang yang sesuai untuk memesan tiket.
                            </p>
                        </div>

                        {/* City Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#71717A]">Kota:</span>
                            <Select value={selectedCity} onValueChange={handleCityChange}>
                                <SelectTrigger className="w-44 bg-[#18181B] border-[#27272A] text-xs text-zinc-200 rounded-lg h-8.5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#18181B] border-[#27272A] text-zinc-200">
                                    {cities.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="size-3 text-red-500" />
                                                <span>{city}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Available Date Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {availableDates.map((item) => {
                            const isSelected = item.date === selectedDate;
                            return (
                                <button
                                    key={item.date}
                                    type="button"
                                    onClick={() => handleDateChange(item.date)}
                                    className={`flex flex-col items-center justify-center rounded-lg px-4 py-2 transition-colors shrink-0 ${
                                        isSelected
                                            ? 'bg-[#E50914] text-white font-semibold'
                                            : 'border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-zinc-700 hover:text-white'
                                    }`}
                                >
                                    <span className="text-[10px] opacity-80">{item.day_name}</span>
                                    <span className="text-xs font-semibold">{item.formatted}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Cinemas & Studios Showtimes Matrix */}
                    {cinemas.length === 0 ? (
                        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#111114] text-center p-6 text-[#A1A1AA]">
                            <Calendar className="size-8 mb-2 text-[#71717A]" />
                            <h3 className="text-sm font-semibold text-white">Tidak Ada Jadwal Tayang</h3>
                            <p className="mt-1 text-xs text-[#71717A] max-w-sm">
                                Belum ada penayangan film ini di kota <strong>{selectedCity}</strong> pada tanggal terpilih. Silakan coba pilih kota atau tanggal lain.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cinemas.map((cinema) => (
                                <Card key={cinema.id} className="border-[#27272A] bg-[#111114] rounded-xl overflow-hidden shadow-none">
                                    <CardContent className="p-5 space-y-5">
                                        {/* Cinema Header */}
                                        <div className="border-b border-[#27272A] pb-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                                    <MapPin className="size-3.5 text-red-500" />
                                                    {cinema.name}
                                                </h3>
                                                <span className="text-xs text-[#71717A]">{cinema.city}</span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#71717A]">{cinema.address}</p>
                                        </div>

                                        {/* Studios list inside Cinema */}
                                        <div className="space-y-4">
                                            {cinema.studios.map((studio) => (
                                                <div key={studio.id} className="space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-xs text-zinc-200">
                                                                {studio.name}
                                                            </span>
                                                            {getStudioBadge(studio.studio_type || studio.type || 'regular')}
                                                        </div>
                                                        <span className="text-xs text-[#A1A1AA]">
                                                            Mulai Rp {((studio.showtimes[0]?.base_price || 45000)).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>

                                                    {/* Showtime Buttons */}
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {studio.showtimes.map((st) => {
                                                            const totalSeats = studio.total_seats || 60;
                                                            const remainingSeats = Math.max(0, totalSeats - st.booked_seats_count);

                                                            return (
                                                                <Link
                                                                    key={st.id}
                                                                    href={`/booking/${st.id}/seats`}
                                                                    className="group"
                                                                >
                                                                    <div className="flex flex-col items-center justify-center rounded-lg border border-[#27272A] bg-[#18181B] px-3.5 py-2 transition-colors group-hover:border-[#E50914] group-hover:bg-zinc-800">
                                                                        <span className="font-mono text-sm font-semibold text-white group-hover:text-red-400">
                                                                            {st.start_time.substring(0, 5)}
                                                                        </span>
                                                                        <span className="text-[10px] text-[#71717A] mt-0.5">
                                                                            {remainingSeats} kursi
                                                                        </span>
                                                                    </div>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
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
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        setTrailerOpen(false);
                                        const scheduleSection = document.getElementById('jadwal-tayang');
                                        if (scheduleSection) {
                                            scheduleSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="h-8 bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium px-4 rounded-lg shadow-md"
                                >
                                    Pilih Jadwal & Pesan
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </CinemaLayout>
    );
}
