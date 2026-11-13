import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Ticket,
    Calendar,
    Clock,
    MapPin,
    Armchair,
    QrCode,
    Download,
    History,
    Building2,
    Film,
    ArrowLeft,
} from 'lucide-react';
import { Booking, Movie, Ticket as TicketType } from '@/types/cinema';

type TicketItem = TicketType;

interface Props {
    activeTickets: TicketItem[];
    pastTickets: {
        data: TicketItem[];
        current_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
}

export default function MyTicketsPage({ activeTickets, pastTickets }: Props) {
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    return (
        <CinemaLayout>
            <Head title="Tiket Bioskop Saya - CinePass Cinema" />

            <div className="min-h-screen overflow-x-clip bg-[#09090B] py-8 text-[#FAFAFA] lg:py-10">
                <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 sm:px-6 lg:px-8 xl:px-12">
                    {/* Header Banner */}
                    <div className="flex flex-col gap-6 border-b border-[#27272A] pb-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1 text-left">
                            <span className="text-xs font-medium tracking-wider text-[#71717A] uppercase">
                                Dompet Digital
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Tiket Bioskop Saya
                            </h1>
                            <p className="max-w-xl text-xs text-[#A1A1AA] sm:text-sm">
                                Akses tiket aktif Anda untuk langsung scan QR
                                code di depan pintu studio bioskop.
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
                                    <span>Beli Tiket</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('active')}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                                activeTab === 'active'
                                    ? 'bg-[#E50914] text-white'
                                    : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                            }`}
                        >
                            Tiket Aktif ({activeTickets.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('past')}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                                activeTab === 'past'
                                    ? 'bg-[#E50914] text-white'
                                    : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                            }`}
                        >
                            Riwayat Lampau ({pastTickets.data?.length ?? 0})
                        </button>
                    </div>

                    {/* Active Tickets Tab */}
                    {activeTab === 'active' && (
                        <div>
                            {activeTickets.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                    {activeTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="flex flex-col justify-between overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] shadow-none transition-colors hover:border-zinc-700"
                                        >
                                            <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4">
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-[#27272A] bg-[#111114]">
                                                            <img
                                                                src={
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.movie
                                                                        ?.poster_path
                                                                        ? ticket.booking.showtime.movie.poster_path.startsWith(
                                                                              'http',
                                                                          ) ||
                                                                          ticket.booking.showtime.movie.poster_path.startsWith(
                                                                              '/',
                                                                          )
                                                                            ? ticket
                                                                                  .booking
                                                                                  .showtime
                                                                                  .movie
                                                                                  .poster_path
                                                                            : `/storage/${ticket.booking.showtime.movie.poster_path}`
                                                                        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
                                                                }
                                                                alt={
                                                                    ticket
                                                                        .booking
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
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.movie
                                                                        ?.title
                                                                }
                                                            </h3>
                                                            <p className="truncate text-xs text-[#A1A1AA]">
                                                                {
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.cinema
                                                                        ?.name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-zinc-400">
                                                                {
                                                                    ticket
                                                                        .booking
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
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.show_date
                                                                }{' '}
                                                                •{' '}
                                                                {ticket.booking
                                                                    ?.showtime
                                                                    ?.start_time
                                                                    ? ticket.booking.showtime.start_time.substring(
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
                                                                {
                                                                    ticket.seat
                                                                        ?.row_label
                                                                }
                                                                {
                                                                    ticket.seat
                                                                        ?.seat_number
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 border-t border-[#27272A] pt-2">
                                                    <Link
                                                        href={`/tickets/${ticket.booking?.booking_code}`}
                                                        className="block"
                                                    >
                                                        <Button className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                                                            <QrCode className="size-3.5" />
                                                            <span>Scan QR</span>
                                                        </Button>
                                                    </Link>

                                                    <a
                                                        href={`/tickets/${ticket.booking?.booking_code}/pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="block"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border-[#27272A] bg-[#111114] py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
                                                        >
                                                            <Download className="size-3.5" />
                                                            <span>PDF</span>
                                                        </Button>
                                                    </a>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-[#27272A] bg-[#111114] p-8 text-center sm:p-12">
                                    <Ticket className="mx-auto size-8 text-[#71717A]" />
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-zinc-200">
                                            Tidak Ada Tiket Aktif
                                        </h3>
                                        <p className="text-xs text-[#71717A]">
                                            Anda belum memiliki tiket untuk
                                            penayangan bioskop yang akan datang.
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
                    )}

                    {/* Past Tickets Tab */}
                    {activeTab === 'past' && (
                        <div>
                            {pastTickets.data && pastTickets.data.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                    {pastTickets.data.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="flex flex-col justify-between overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] opacity-75 shadow-none transition-opacity hover:opacity-100"
                                        >
                                            <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-4">
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="h-16 w-12 shrink-0 overflow-hidden rounded border border-[#27272A] bg-[#111114] grayscale">
                                                            <img
                                                                src={
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.movie
                                                                        ?.poster_path
                                                                        ? ticket.booking.showtime.movie.poster_path.startsWith(
                                                                              'http',
                                                                          ) ||
                                                                          ticket.booking.showtime.movie.poster_path.startsWith(
                                                                              '/',
                                                                          )
                                                                            ? ticket
                                                                                  .booking
                                                                                  .showtime
                                                                                  .movie
                                                                                  .poster_path
                                                                            : `/storage/${ticket.booking.showtime.movie.poster_path}`
                                                                        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'
                                                                }
                                                                alt={
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.movie
                                                                        ?.title
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="min-w-0 flex-1 space-y-1 text-left">
                                                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                                                {ticket.is_used
                                                                    ? 'Sudah Dipakai'
                                                                    : 'Selesai'}
                                                            </span>
                                                            <h3 className="truncate text-xs font-medium text-zinc-300">
                                                                {
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.movie
                                                                        ?.title
                                                                }
                                                            </h3>
                                                            <p className="truncate text-[11px] text-[#71717A]">
                                                                {
                                                                    ticket
                                                                        .booking
                                                                        ?.showtime
                                                                        ?.cinema
                                                                        ?.name
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between rounded-lg border border-[#27272A] bg-[#111114] p-2.5 text-xs text-[#A1A1AA]">
                                                        <span>
                                                            {
                                                                ticket.booking
                                                                    ?.showtime
                                                                    ?.show_date
                                                            }
                                                        </span>
                                                        <span className="font-mono font-semibold text-zinc-300">
                                                            {
                                                                ticket.seat
                                                                    ?.row_label
                                                            }
                                                            {
                                                                ticket.seat
                                                                    ?.seat_number
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Link
                                                        href={`/tickets/${ticket.booking?.booking_code}`}
                                                        className="block"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 w-full rounded-lg border-[#27272A] bg-[#111114] text-xs text-zinc-400 hover:text-white"
                                                        >
                                                            Detail Tiket
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-[#27272A] bg-[#111114] p-8 text-center text-xs text-[#71717A] sm:p-12">
                                    Belum ada riwayat tiket lampau.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CinemaLayout>
    );
}
