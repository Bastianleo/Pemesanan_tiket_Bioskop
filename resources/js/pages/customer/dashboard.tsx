import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MovieCard from '@/components/cinema/movie-card';
import {
    Ticket,
    Film,
    Calendar,
    Clock,
    MapPin,
    Armchair,
    Heart,
    CreditCard,
    ArrowRight,
    QrCode,
    Building2,
    TrendingUp
} from 'lucide-react';
import { Booking, Movie, Ticket as TicketType } from '@/types/cinema';

interface Props {
    stats: {
        active_tickets_count: number;
        total_bookings_count: number;
        total_tickets_bought: number;
        total_spent: number;
        favorites_count: number;
    };
    activeTickets: Array<TicketType & {
        seat?: { row_label: string; seat_number: number; seat_type: string };
        booking?: Booking;
    }>;
    recentBookings: Booking[];
    favoriteMovies: Movie[];
    nowPlaying: Movie[];
}

export default function CustomerDashboardPage({
    stats,
    activeTickets,
    recentBookings,
    favoriteMovies,
    nowPlaying,
}: Props) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleCancelBooking = (bookingCode: string) => {
        if (confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) {
            router.post(`/booking/${bookingCode}/cancel`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <CinemaLayout>
            <Head title="Dashboard Akun - CinePass Cinema" />

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10 overflow-x-clip">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
                    
                    {/* Hero Section: Minimalist Solid Banner */}
                    <div className="rounded-xl border border-[#27272A] bg-[#111114] p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            {/* Left Side: Brand Text */}
                            <div className="space-y-2 text-left max-w-2xl">
                                <span className="inline-block rounded bg-[#18181B] px-2.5 py-1 text-xs font-medium text-zinc-300 border border-[#27272A]">
                                    Akun Member
                                </span>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Dashboard Pengguna
                                </h1>
                                <p className="text-[#A1A1AA] text-xs sm:text-sm leading-relaxed">
                                    Kelola e-ticket aktif, pantau riwayat transaksi tiket, dan simpan film favorit Anda dalam satu tempat.
                                </p>
                            </div>

                            {/* Right Side: Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 md:justify-end shrink-0">
                                <Link href="/my-tickets">
                                    <Button className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors">
                                        <Ticket className="size-4 mr-1.5" />
                                        <span>Tiket Saya ({stats.active_tickets_count})</span>
                                    </Button>
                                </Link>
                                <Link href="/movies">
                                    <Button variant="outline" className="h-10 px-5 border-[#27272A] bg-[#18181B] hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm rounded-lg">
                                        <Film className="size-4 mr-1.5 text-zinc-400" />
                                        <span>Katalog Film</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid: 4 columns desktop, 2 columns tablet, 1 column mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Card 1: Active Tickets */}
                        <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs text-[#A1A1AA] font-medium">
                                        Tiket Aktif
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                                        {stats.active_tickets_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Siap digunakan di studio
                                    </p>
                                </div>
                                <div className="p-3 bg-[#111114] border border-[#27272A] text-zinc-300 rounded-lg shrink-0">
                                    <Ticket className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Total Bookings */}
                        <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs text-[#A1A1AA] font-medium">
                                        Total Transaksi
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                                        {stats.total_bookings_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        {formatRupiah(stats.total_spent)}
                                    </p>
                                </div>
                                <div className="p-3 bg-[#111114] border border-[#27272A] text-zinc-300 rounded-lg shrink-0">
                                    <CreditCard className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Total Seats */}
                        <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs text-[#A1A1AA] font-medium">
                                        Tiket Terbeli
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                                        {stats.total_tickets_bought}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Total kursi dipesan
                                    </p>
                                </div>
                                <div className="p-3 bg-[#111114] border border-[#27272A] text-zinc-300 rounded-lg shrink-0">
                                    <Film className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 4: Wishlist / Favorites */}
                        <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs text-[#A1A1AA] font-medium">
                                        Film Favorit
                                    </p>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono">
                                        {stats.favorites_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Tersimpan di wishlist
                                    </p>
                                </div>
                                <div className="p-3 bg-[#111114] border border-[#27272A] text-zinc-300 rounded-lg shrink-0">
                                    <Heart className="size-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section: Active Cinema Tickets (Priority) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">
                                    Tiket Bioskop Aktif
                                </h2>
                                <p className="text-xs text-[#71717A]">
                                    Tunjukkan QR Code e-ticket pada petugas studio
                                </p>
                            </div>
                            {activeTickets.length > 0 && (
                                <Link href="/my-tickets" className="text-xs text-[#A1A1AA] hover:text-white font-medium flex items-center gap-1">
                                    <span>Semua Tiket</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            )}
                        </div>

                        {activeTickets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {activeTickets.map((t) => (
                                    <Card
                                        key={t.id}
                                        className="bg-[#18181B] border-[#27272A] rounded-xl overflow-hidden flex flex-col justify-between shadow-none hover:border-zinc-700 transition-colors"
                                    >
                                        <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-14 h-20 rounded-lg bg-[#111114] overflow-hidden shrink-0 border border-[#27272A]">
                                                        <img
                                                            src={t.booking?.showtime?.movie?.poster_path ? (t.booking.showtime.movie.poster_path.startsWith('http') || t.booking.showtime.movie.poster_path.startsWith('/') ? t.booking.showtime.movie.poster_path : `/storage/${t.booking.showtime.movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                                            alt={t.booking?.showtime?.movie?.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-1 text-left">
                                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                            AKTIF
                                                        </span>
                                                        <h3 className="text-sm font-semibold text-white truncate">
                                                            {t.booking?.showtime?.movie?.title}
                                                        </h3>
                                                        <p className="text-xs text-[#A1A1AA] truncate">
                                                            {t.booking?.showtime?.cinema?.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-400">
                                                            {t.booking?.showtime?.studio?.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="bg-[#111114] rounded-lg p-3 border border-[#27272A] flex items-center justify-between text-xs">
                                                    <div className="text-left">
                                                        <span className="text-[#71717A] text-[10px] uppercase font-medium block">
                                                            Jadwal
                                                        </span>
                                                        <span className="font-medium text-zinc-200">
                                                            {t.booking?.showtime?.show_date} • {t.booking?.showtime?.start_time ? t.booking.showtime.start_time.substring(0, 5) : ''}
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-[#71717A] text-[10px] uppercase font-medium block">
                                                            Kursi
                                                        </span>
                                                        <span className="font-mono font-bold text-white text-sm">
                                                            {t.seat?.row_label}{t.seat?.seat_number}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link href={`/tickets/${t.booking?.booking_code}`} className="block">
                                                    <Button className="w-full bg-[#111114] hover:bg-blue-600 text-white text-xs font-medium py-2 rounded-lg border border-[#27272A] hover:border-transparent flex items-center justify-center gap-1.5 transition-colors">
                                                        <QrCode className="size-3.5" />
                                                        <span>Lihat E-Ticket</span>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#111114] border border-[#27272A] rounded-xl p-8 sm:p-10 text-center space-y-3">
                                <Ticket className="size-8 text-[#71717A] mx-auto" />
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-semibold text-zinc-200">
                                        Belum Ada Tiket Bioskop Aktif
                                    </h3>
                                    <p className="text-xs text-[#71717A]">
                                        Saat ini Anda belum memiliki tiket untuk penayangan mendatang.
                                    </p>
                                </div>
                                <Link href="/movies" className="inline-block pt-1">
                                    <Button className="bg-[#E50914] hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-lg">
                                        Pesan Tiket Sekarang
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Recent Booking Transactions */}
                    <div className="space-y-4">
                        <div className="border-b border-[#27272A] pb-3">
                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                Riwayat Pemesanan Terakhir
                            </h2>
                            <p className="text-xs text-[#71717A]">
                                Daftar transaksi pembelian tiket bioskop Anda
                            </p>
                        </div>

                        <Card className="bg-[#18181B] border-[#27272A] rounded-xl overflow-hidden shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#111114] text-[#A1A1AA] border-b border-[#27272A] uppercase tracking-wider text-[11px]">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold">Kode</th>
                                            <th className="py-3 px-4 font-semibold">Film & Bioskop</th>
                                            <th className="py-3 px-4 font-semibold">Kursi</th>
                                            <th className="py-3 px-4 font-semibold">Total</th>
                                            <th className="py-3 px-4 font-semibold">Status</th>
                                            <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {recentBookings.length > 0 ? (
                                            recentBookings.map((b) => (
                                                <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-medium text-white">
                                                        <span>{b.booking_code}</span>
                                                        <div className="text-[10px] text-[#71717A]">
                                                            {new Date(b.created_at).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="font-medium text-zinc-100">
                                                            {b.showtime?.movie?.title}
                                                        </div>
                                                        <div className="text-xs text-[#71717A]">
                                                            {b.showtime?.cinema?.name} ({b.showtime?.studio?.name})
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="font-mono text-zinc-300">
                                                            {b.booking_seats?.map(s => `${s.seat?.row_label}${s.seat?.seat_number}`).join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                                                        {formatRupiah(b.total_amount)}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">
                                                            {b.status === 'paid' ? 'Lunas' : b.status === 'pending' ? 'Menunggu' : b.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        {b.status === 'paid' && (
                                                            <Link href={`/tickets/${b.booking_code}`}>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs border-[#27272A] bg-[#111114] text-zinc-200 hover:text-white rounded-lg">
                                                                    Tiket
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {b.status === 'pending' && (
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link href={`/booking/${b.booking_code}/checkout`}>
                                                                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg">
                                                                        Bayar
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleCancelBooking(b.booking_code)}
                                                                    className="h-7 text-xs text-[#71717A] hover:text-red-400 px-2"
                                                                >
                                                                    Batal
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="py-8 text-center text-[#71717A]">
                                                    Belum ada riwayat transaksi pemesanan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Section: Recommended Now Playing Movies */}
                    {nowPlaying.length > 0 && (
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">
                                        Film Sedang Tayang
                                    </h2>
                                    <p className="text-xs text-[#71717A]">
                                        Rekomendasi film pilihan untuk ditonton hari ini
                                    </p>
                                </div>
                                <Link href="/movies" className="text-xs text-[#A1A1AA] hover:text-white font-medium flex items-center gap-1">
                                    <span>Semua Film</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {nowPlaying.map((m) => (
                                    <MovieCard key={m.id} movie={m} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </CinemaLayout>
    );
}
