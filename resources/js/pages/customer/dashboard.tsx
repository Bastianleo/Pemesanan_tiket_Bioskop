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
    TrendingUp,
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
    activeTickets: Array<
        TicketType & {
            seat?: {
                row_label: string;
                seat_number: number;
                seat_type: string;
            };
            booking?: Booking;
        }
    >;
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
            router.post(
                `/booking/${bookingCode}/cancel`,
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <CinemaLayout>
            <Head title="Dashboard Akun - CinePass Cinema" />

            <div className="min-h-screen overflow-x-clip bg-[#09090B] py-8 text-[#FAFAFA] lg:py-10">
                <div className="mx-auto w-full max-w-[1600px] space-y-10 px-4 sm:px-6 lg:px-8 xl:px-12">
                    {/* Hero Section: Minimalist Solid Banner */}
                    <div className="rounded-xl border border-[#27272A] bg-[#111114] p-6 sm:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            {/* Left Side: Brand Text */}
                            <div className="max-w-2xl space-y-2 text-left">
                                <span className="inline-block rounded border border-[#27272A] bg-[#18181B] px-2.5 py-1 text-xs font-medium text-zinc-300">
                                    Akun Member
                                </span>
                                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Dashboard Pengguna
                                </h1>
                                <p className="text-xs leading-relaxed text-[#A1A1AA] sm:text-sm">
                                    Kelola e-ticket aktif, pantau riwayat
                                    transaksi tiket, dan simpan film favorit
                                    Anda dalam satu tempat.
                                </p>
                            </div>

                            {/* Right Side: Action Buttons */}
                            <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
                                <Link href="/my-tickets">
                                    <Button className="h-10 rounded-lg bg-blue-600 px-5 text-xs font-medium text-white transition-colors hover:bg-blue-700 sm:text-sm">
                                        <Ticket className="mr-1.5 size-4" />
                                        <span>
                                            Tiket Saya (
                                            {stats.active_tickets_count})
                                        </span>
                                    </Button>
                                </Link>
                                <Link href="/movies">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[#27272A] bg-[#18181B] px-5 text-xs text-zinc-200 hover:bg-zinc-800 sm:text-sm"
                                    >
                                        <Film className="mr-1.5 size-4 text-zinc-400" />
                                        <span>Katalog Film</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid: 4 columns desktop, 2 columns tablet, 1 column mobile */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Card 1: Active Tickets */}
                        <Card className="rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs font-medium text-[#A1A1AA]">
                                        Tiket Aktif
                                    </p>
                                    <h3 className="font-mono text-2xl font-bold text-white sm:text-3xl">
                                        {stats.active_tickets_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Siap digunakan di studio
                                    </p>
                                </div>
                                <div className="shrink-0 rounded-lg border border-[#27272A] bg-[#111114] p-3 text-zinc-300">
                                    <Ticket className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Total Bookings */}
                        <Card className="rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs font-medium text-[#A1A1AA]">
                                        Total Transaksi
                                    </p>
                                    <h3 className="font-mono text-2xl font-bold text-white sm:text-3xl">
                                        {stats.total_bookings_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        {formatRupiah(stats.total_spent)}
                                    </p>
                                </div>
                                <div className="shrink-0 rounded-lg border border-[#27272A] bg-[#111114] p-3 text-zinc-300">
                                    <CreditCard className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 3: Total Seats */}
                        <Card className="rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs font-medium text-[#A1A1AA]">
                                        Tiket Terbeli
                                    </p>
                                    <h3 className="font-mono text-2xl font-bold text-white sm:text-3xl">
                                        {stats.total_tickets_bought}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Total kursi dipesan
                                    </p>
                                </div>
                                <div className="shrink-0 rounded-lg border border-[#27272A] bg-[#111114] p-3 text-zinc-300">
                                    <Film className="size-5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 4: Wishlist / Favorites */}
                        <Card className="rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <CardContent className="flex items-center justify-between p-5">
                                <div className="space-y-1 text-left">
                                    <p className="text-xs font-medium text-[#A1A1AA]">
                                        Film Favorit
                                    </p>
                                    <h3 className="font-mono text-2xl font-bold text-white sm:text-3xl">
                                        {stats.favorites_count}
                                    </h3>
                                    <p className="text-[11px] text-[#71717A]">
                                        Tersimpan di wishlist
                                    </p>
                                </div>
                                <div className="shrink-0 rounded-lg border border-[#27272A] bg-[#111114] p-3 text-zinc-300">
                                    <Heart className="size-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section: Active Cinema Tickets (Priority) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-white sm:text-xl">
                                    Tiket Bioskop Aktif
                                </h2>
                                <p className="text-xs text-[#71717A]">
                                    Tunjukkan QR Code e-ticket pada petugas
                                    studio
                                </p>
                            </div>
                            {activeTickets.length > 0 && (
                                <Link
                                    href="/my-tickets"
                                    className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-white"
                                >
                                    <span>Semua Tiket</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            )}
                        </div>

                        {activeTickets.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {activeTickets.map((t) => (
                                    <Card
                                        key={t.id}
                                        className="flex flex-col justify-between overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] shadow-none transition-colors hover:border-zinc-700"
                                    >
                                        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-[#27272A] bg-[#111114]">
                                                        <img
                                                            src={
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.movie
                                                                    ?.poster_path
                                                                    ? t.booking.showtime.movie.poster_path.startsWith(
                                                                          'http',
                                                                      ) ||
                                                                      t.booking.showtime.movie.poster_path.startsWith(
                                                                          '/',
                                                                      )
                                                                        ? t
                                                                              .booking
                                                                              .showtime
                                                                              .movie
                                                                              .poster_path
                                                                        : `/storage/${t.booking.showtime.movie.poster_path}`
                                                                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
                                                            }
                                                            alt={
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.movie
                                                                    ?.title
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1 space-y-1 text-left">
                                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                            AKTIF
                                                        </span>
                                                        <h3 className="truncate text-sm font-semibold text-white">
                                                            {
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.movie
                                                                    ?.title
                                                            }
                                                        </h3>
                                                        <p className="truncate text-xs text-[#A1A1AA]">
                                                            {
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.cinema
                                                                    ?.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-zinc-400">
                                                            {
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.studio
                                                                    ?.name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#111114] p-3 text-xs">
                                                    <div className="text-left">
                                                        <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                            Jadwal
                                                        </span>
                                                        <span className="font-medium text-zinc-200">
                                                            {
                                                                t.booking
                                                                    ?.showtime
                                                                    ?.show_date
                                                            }{' '}
                                                            •{' '}
                                                            {t.booking?.showtime
                                                                ?.start_time
                                                                ? t.booking.showtime.start_time.substring(
                                                                      0,
                                                                      5,
                                                                  )
                                                                : ''}
                                                        </span>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                            Kursi
                                                        </span>
                                                        <span className="font-mono text-sm font-bold text-white">
                                                            {t.seat?.row_label}
                                                            {
                                                                t.seat
                                                                    ?.seat_number
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <Link
                                                    href={`/tickets/${t.booking?.booking_code}`}
                                                    className="block"
                                                >
                                                    <Button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#27272A] bg-[#111114] py-2 text-xs font-medium text-white transition-colors hover:border-transparent hover:bg-blue-600">
                                                        <QrCode className="size-3.5" />
                                                        <span>
                                                            Lihat E-Ticket
                                                        </span>
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3 rounded-xl border border-[#27272A] bg-[#111114] p-8 text-center sm:p-10">
                                <Ticket className="mx-auto size-8 text-[#71717A]" />
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-semibold text-zinc-200">
                                        Belum Ada Tiket Bioskop Aktif
                                    </h3>
                                    <p className="text-xs text-[#71717A]">
                                        Saat ini Anda belum memiliki tiket untuk
                                        penayangan mendatang.
                                    </p>
                                </div>
                                <Link
                                    href="/movies"
                                    className="inline-block pt-1"
                                >
                                    <Button className="rounded-lg bg-[#E50914] px-4 py-2 text-xs font-medium text-white hover:bg-red-700">
                                        Pesan Tiket Sekarang
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section: Recent Booking Transactions */}
                    <div className="space-y-4">
                        <div className="border-b border-[#27272A] pb-3">
                            <h2 className="text-lg font-bold text-white sm:text-xl">
                                Riwayat Pemesanan Terakhir
                            </h2>
                            <p className="text-xs text-[#71717A]">
                                Daftar transaksi pembelian tiket bioskop Anda
                            </p>
                        </div>

                        <Card className="overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-[#27272A] bg-[#111114] text-[11px] tracking-wider text-[#A1A1AA] uppercase">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">
                                                Kode
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Film & Bioskop
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Kursi
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Total
                                            </th>
                                            <th className="px-4 py-3 font-semibold">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-semibold">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {recentBookings.length > 0 ? (
                                            recentBookings.map((b) => (
                                                <tr
                                                    key={b.id}
                                                    className="transition-colors hover:bg-zinc-800/30"
                                                >
                                                    <td className="px-4 py-3.5 font-mono font-medium text-white">
                                                        <span>
                                                            {b.booking_code}
                                                        </span>
                                                        <div className="text-[10px] text-[#71717A]">
                                                            {new Date(
                                                                b.created_at,
                                                            ).toLocaleDateString(
                                                                'id-ID',
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-medium text-zinc-100">
                                                            {
                                                                b.showtime
                                                                    ?.movie
                                                                    ?.title
                                                            }
                                                        </div>
                                                        <div className="text-xs text-[#71717A]">
                                                            {
                                                                b.showtime
                                                                    ?.cinema
                                                                    ?.name
                                                            }{' '}
                                                            (
                                                            {
                                                                b.showtime
                                                                    ?.studio
                                                                    ?.name
                                                            }
                                                            )
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="font-mono text-zinc-300">
                                                            {b.booking_seats
                                                                ?.map(
                                                                    (s) =>
                                                                        `${s.seat?.row_label}${s.seat?.seat_number}`,
                                                                )
                                                                .join(', ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono font-semibold text-white">
                                                        {formatRupiah(
                                                            b.total_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                                            {b.status === 'paid'
                                                                ? 'Lunas'
                                                                : b.status ===
                                                                    'pending'
                                                                  ? 'Menunggu'
                                                                  : b.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        {b.status ===
                                                            'paid' && (
                                                            <Link
                                                                href={`/tickets/${b.booking_code}`}
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 rounded-lg border-[#27272A] bg-[#111114] text-xs text-zinc-200 hover:text-white"
                                                                >
                                                                    Tiket
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {b.status ===
                                                            'pending' && (
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Link
                                                                    href={`/booking/${b.booking_code}/checkout`}
                                                                >
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                                                                    >
                                                                        Bayar
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        handleCancelBooking(
                                                                            b.booking_code,
                                                                        )
                                                                    }
                                                                    className="h-7 px-2 text-xs text-[#71717A] hover:text-red-400"
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
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-[#71717A]"
                                                >
                                                    Belum ada riwayat transaksi
                                                    pemesanan.
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
                                    <h2 className="text-lg font-bold text-white sm:text-xl">
                                        Film Sedang Tayang
                                    </h2>
                                    <p className="text-xs text-[#71717A]">
                                        Rekomendasi film pilihan untuk ditonton
                                        hari ini
                                    </p>
                                </div>
                                <Link
                                    href="/movies"
                                    className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-white"
                                >
                                    <span>Semua Film</span>
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
