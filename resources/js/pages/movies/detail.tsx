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
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11
            ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
            : url;
    };

    const embedUrl = getEmbedUrl(movie.trailer_url);

    const formatReleaseDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const handleDateChange = (date: string) => {
        router.get(
            `/movies/${movie.slug}`,
            { date, city: selectedCity },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCityChange = (city: string) => {
        router.get(
            `/movies/${movie.slug}`,
            { date: selectedDate, city },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Tautan film berhasil disalin ke clipboard!');
    };

    const getStudioBadge = (type: string) => {
        switch (type) {
            case 'imax':
                return (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        IMAX Laser
                    </span>
                );
            case 'vip_premiere':
                return (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        VIP Premiere
                    </span>
                );
            case 'deluxe':
                return (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        Deluxe
                    </span>
                );
            default:
                return (
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                        Regular 2D
                    </span>
                );
        }
    };

    return (
        <CinemaLayout>
            <Head title={`${movie.title} - Jadwal Tayang & Tiket Online`} />

            {/* Backdrop Banner Section */}
            <div className="relative h-[280px] w-full overflow-hidden bg-[#09090B] sm:h-[380px] lg:h-[440px]">
                <img
                    src={movie.banner_path || movie.poster_path}
                    alt={movie.title}
                    className="h-full w-full object-cover brightness-[0.4] filter"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent" />
            </div>

            {/* Main Movie Info & Schedule Picker */}
            <div className="relative z-10 mx-auto -mt-28 w-full max-w-[1600px] space-y-12 px-4 pb-16 sm:-mt-36 sm:px-6 lg:px-8 xl:px-12">
                {/* Header Profile Card */}
                <div className="flex flex-col gap-8 md:flex-row md:items-start">
                    {/* Poster */}
                    <div className="group relative w-44 shrink-0 overflow-hidden rounded-2xl border border-[#27272A] bg-[#111114] shadow-2xl shadow-black/80 sm:w-56">
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
                            className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Metadata Details */}
                    <div className="min-w-0 flex-1 space-y-5 pt-2">
                        {/* Rating, Status, Duration Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="rounded-md border border-[#27272A] bg-[#18181B] px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
                                {movie.rating_age}
                            </span>
                            <span
                                className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${
                                    movie.status === 'now_showing'
                                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                        : 'border border-amber-500/20 bg-amber-500/10 text-amber-400'
                                }`}
                            >
                                {movie.status === 'now_showing'
                                    ? 'Sedang Tayang'
                                    : 'Segera Tayang'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA]">
                                <Clock className="size-3.5 text-zinc-400" />
                                <span>{movie.duration_minutes} Menit</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {movie.title}
                        </h1>

                        {/* Genre Tags */}
                        <div className="flex flex-wrap gap-2">
                            {movie.genres?.map((g) => (
                                <span
                                    key={g.id}
                                    className="rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-1 text-xs font-medium text-zinc-300"
                                >
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        {/* Production Info Grid */}
                        <div className="grid grid-cols-2 gap-4 border-y border-[#27272A] py-4 text-xs text-zinc-300 sm:grid-cols-4">
                            <div>
                                <span className="mb-1 block text-[11px] font-medium text-[#71717A]">
                                    Sutradara
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {movie.director || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-[11px] font-medium text-[#71717A]">
                                    Tanggal Rilis
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {formatReleaseDate(movie.release_date)}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-[11px] font-medium text-[#71717A]">
                                    Bahasa
                                </span>
                                <span className="font-semibold text-zinc-200">
                                    {movie.language || 'Indonesia'} (Sub:{' '}
                                    {movie.subtitle || 'Indonesia'})
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block text-[11px] font-medium text-[#71717A]">
                                    Pemeran
                                </span>
                                <span
                                    className="line-clamp-1 font-semibold text-zinc-200"
                                    title={movie.cast || '-'}
                                >
                                    {movie.cast || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div className="space-y-1.5">
                            <h3 className="text-xs font-semibold tracking-wider text-[#71717A] uppercase">
                                Sinopsis Cerita
                            </h3>
                            <p className="max-w-3xl text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">
                                {movie.synopsis}
                            </p>
                        </div>

                        {/* Action Row: Trailer, Favorit, Bagikan */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {embedUrl && (
                                <Button
                                    type="button"
                                    onClick={() => setTrailerOpen(true)}
                                    className="h-9 cursor-pointer rounded-lg bg-[#E50914] px-4 text-xs font-semibold text-white shadow-lg shadow-red-950/40 transition-all hover:scale-[1.02] hover:bg-red-700"
                                >
                                    <Play className="mr-1.5 size-3.5 fill-current" />
                                    Tonton Trailer
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.post(
                                        `/favorites/${movie.id}/toggle`,
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                                className="h-9 cursor-pointer rounded-lg border-[#27272A] bg-[#18181B] text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white"
                            >
                                <Heart className="mr-1.5 size-3.5 text-red-500" />
                                Favorit
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="h-9 cursor-pointer rounded-lg border-[#27272A] bg-[#18181B] text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white"
                            >
                                <Share2 className="mr-1.5 size-3.5" />
                                Bagikan
                            </Button>
                        </div>
                    </div>
                </div>

                {/* SHOWTIMES BOOKING WIDGET */}
                <div id="jadwal-tayang" className="scroll-mt-24 space-y-6 pt-2">
                    <div className="flex flex-col gap-4 border-b border-[#27272A] pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                                Jadwal Tayang Bioskop
                            </h2>
                            <p className="mt-0.5 text-xs text-[#A1A1AA]">
                                Pilih tanggal dan jam tayang yang sesuai untuk
                                memesan tiket.
                            </p>
                        </div>

                        {/* City Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#71717A]">
                                Kota:
                            </span>
                            <Select
                                value={selectedCity}
                                onValueChange={handleCityChange}
                            >
                                <SelectTrigger className="h-8.5 w-44 rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-[#27272A] bg-[#18181B] text-zinc-200">
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
                    <div className="flex scrollbar-none items-center gap-2.5 overflow-x-auto pb-2">
                        {availableDates.map((item) => {
                            const isSelected = item.date === selectedDate;
                            return (
                                <button
                                    key={item.date}
                                    type="button"
                                    onClick={() => handleDateChange(item.date)}
                                    className={`flex min-w-[76px] cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-2.5 transition-all ${
                                        isSelected
                                            ? 'scale-[1.02] bg-[#E50914] font-semibold text-white shadow-lg shadow-red-950/40'
                                            : 'border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-zinc-700 hover:text-white'
                                    }`}
                                >
                                    <span className="text-[10px] uppercase tracking-wider opacity-80">
                                        {item.day_name}
                                    </span>
                                    <span className="mt-0.5 text-xs font-bold">
                                        {item.formatted}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Cinemas & Studios Showtimes Matrix */}
                    {cinemas.length === 0 ? (
                        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#111114] p-6 text-center text-[#A1A1AA]">
                            <Calendar className="mb-2 size-8 text-[#71717A]" />
                            <h3 className="text-sm font-semibold text-white">
                                Tidak Ada Jadwal Tayang
                            </h3>
                            <p className="mt-1 max-w-sm text-xs text-[#71717A]">
                                Belum ada penayangan film ini di kota{' '}
                                <strong>{selectedCity}</strong> pada tanggal
                                terpilih. Silakan coba pilih kota atau tanggal
                                lain.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cinemas.map((cinema) => (
                                <Card
                                    key={cinema.id}
                                    className="overflow-hidden rounded-xl border-[#27272A] bg-[#111114] shadow-none"
                                >
                                    <CardContent className="space-y-5 p-5">
                                        {/* Cinema Header */}
                                        <div className="border-b border-[#27272A] pb-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                                                    <MapPin className="size-3.5 text-red-500" />
                                                    {cinema.name}
                                                </h3>
                                                <span className="text-xs text-[#71717A]">
                                                    {cinema.city}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-[#71717A]">
                                                {cinema.address}
                                            </p>
                                        </div>

                                        {/* Studios list inside Cinema */}
                                        <div className="space-y-4">
                                            {cinema.studios.map((studio) => (
                                                <div
                                                    key={studio.id}
                                                    className="space-y-2.5"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-zinc-200">
                                                                {studio.name}
                                                            </span>
                                                            {getStudioBadge(
                                                                studio.studio_type ||
                                                                    studio.type ||
                                                                    'regular',
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-[#A1A1AA]">
                                                            Mulai Rp{' '}
                                                            {(
                                                                studio
                                                                    .showtimes[0]
                                                                    ?.base_price ||
                                                                45000
                                                            ).toLocaleString(
                                                                'id-ID',
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Showtime Buttons */}
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {studio.showtimes.map(
                                                             (st) => {
                                                                const totalSeats =
                                                                    studio.total_seats ||
                                                                    60;
                                                                const remainingSeats =
                                                                    Math.max(
                                                                        0,
                                                                        totalSeats -
                                                                            st.booked_seats_count,
                                                                    );

                                                                return (
                                                                    <Link
                                                                        key={
                                                                            st.id
                                                                        }
                                                                        href={`/booking/${st.id}/seats`}
                                                                        className="group"
                                                                    >
                                                                        <div className="flex flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#18181B] px-4 py-2.5 transition-all group-hover:scale-105 group-hover:border-[#E50914] group-hover:bg-zinc-800">
                                                                            <span className="text-sm font-semibold text-white group-hover:text-red-400">
                                                                                {st.start_time.substring(
                                                                                    0,
                                                                                    5,
                                                                                )}
                                                                            </span>
                                                                            <span className="mt-0.5 text-[10px] text-[#71717A]">
                                                                                {
                                                                                    remainingSeats
                                                                                }{' '}
                                                                                kursi
                                                                            </span>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            },
                                                        )}
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
                    <DialogContent className="overflow-hidden rounded-2xl border-[#27272A] bg-[#0E0E11] p-0 shadow-2xl shadow-red-950/20 sm:max-w-4xl lg:max-w-5xl">
                        {/* Cinema Header */}
                        <div className="flex items-center justify-between border-b border-[#27272A] bg-[#141418] px-5 py-3.5 pr-14">
                            <div className="flex min-w-0 items-center gap-2.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#E50914]">
                                    Trailer
                                </span>
                                <span className="text-zinc-600">•</span>
                                <DialogTitle className="truncate text-sm font-bold text-white sm:text-base">
                                    {movie.title}
                                </DialogTitle>
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
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        setTrailerOpen(false);
                                        const scheduleSection =
                                            document.getElementById(
                                                'jadwal-tayang',
                                            );
                                        if (scheduleSection) {
                                            scheduleSection.scrollIntoView({
                                                behavior: 'smooth',
                                            });
                                        }
                                    }}
                                    className="h-8 rounded-lg bg-[#E50914] px-4 text-xs font-medium text-white hover:bg-red-700"
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
