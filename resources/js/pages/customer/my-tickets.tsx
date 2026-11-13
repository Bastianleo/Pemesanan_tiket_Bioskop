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
    ArrowLeft
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

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10 overflow-x-clip">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
                    
                    {/* Header Banner */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#27272A] pb-6">
                        <div className="space-y-1 text-left">
                            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                                Dompet Digital
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Tiket Bioskop Saya
                            </h1>
                            <p className="text-[#A1A1AA] text-xs sm:text-sm max-w-xl">
                                Akses tiket aktif Anda untuk langsung scan QR code di depan pintu studio bioskop.
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
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                activeTab === 'active'
                                    ? 'bg-[#E50914] text-white'
                                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                            }`}
                        >
                            Tiket Aktif ({activeTickets.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('past')}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                activeTab === 'past'
                                    ? 'bg-[#E50914] text-white'
                                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                            }`}
                        >
                            Riwayat Lampau ({pastTickets.data?.length ?? 0})
                        </button>
                    </div>

                    {/* Active Tickets Tab */}
                    {activeTab === 'active' && (
                        <div>
                            {activeTickets.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                    {activeTickets.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-[#18181B] border-[#27272A] rounded-xl overflow-hidden flex flex-col justify-between shadow-none hover:border-zinc-700 transition-colors"
                                        >
                                            <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="w-14 h-20 rounded-lg bg-[#111114] overflow-hidden shrink-0 border border-[#27272A]">
                                                            <img
                                                                src={ticket.booking?.showtime?.movie?.poster_path ? (ticket.booking.showtime.movie.poster_path.startsWith('http') || ticket.booking.showtime.movie.poster_path.startsWith('/') ? ticket.booking.showtime.movie.poster_path : `/storage/${ticket.booking.showtime.movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                                                alt={ticket.booking?.showtime?.movie?.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-1 text-left">
                                                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                                AKTIF
                                                            </span>
                                                            <h3 className="font-semibold text-white text-sm truncate">
                                                                {ticket.booking?.showtime?.movie?.title}
                                                            </h3>
                                                            <p className="text-xs text-[#A1A1AA] truncate">
                                                                {ticket.booking?.showtime?.cinema?.name}
                                                            </p>
                                                            <p className="text-xs text-zinc-400">
                                                                {ticket.booking?.showtime?.studio?.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#111114] rounded-lg p-3 border border-[#27272A] flex items-center justify-between text-xs">
                                                        <div className="text-left">
                                                            <span className="text-[#71717A] text-[10px] uppercase font-medium block">
                                                                Jadwal
                                                            </span>
                                                            <span className="font-medium text-zinc-200">
                                                                {ticket.booking?.showtime?.show_date} • {ticket.booking?.showtime?.start_time ? ticket.booking.showtime.start_time.substring(0, 5) : ''}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[#71717A] text-[10px] uppercase font-medium block">
                                                                Kursi
                                                            </span>
                                                            <span className="font-mono font-bold text-white text-sm">
                                                                {ticket.seat?.row_label}{ticket.seat?.seat_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27272A]">
                                                    <Link href={`/tickets/${ticket.booking?.booking_code}`} className="block">
                                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 h-8 rounded-lg flex items-center justify-center gap-1.5">
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
                                                        <Button variant="outline" className="w-full border-[#27272A] bg-[#111114] hover:bg-zinc-800 text-zinc-200 text-xs py-1.5 h-8 rounded-lg flex items-center justify-center gap-1.5">
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
                                <div className="bg-[#111114] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center space-y-3">
                                    <Ticket className="size-8 text-[#71717A] mx-auto" />
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-semibold text-zinc-200">
                                            Tidak Ada Tiket Aktif
                                        </h3>
                                        <p className="text-xs text-[#71717A]">
                                            Anda belum memiliki tiket untuk penayangan bioskop yang akan datang.
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
                    )}

                    {/* Past Tickets Tab */}
                    {activeTab === 'past' && (
                        <div>
                            {pastTickets.data && pastTickets.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                    {pastTickets.data.map((ticket) => (
                                        <Card
                                            key={ticket.id}
                                            className="bg-[#18181B] border-[#27272A] opacity-75 hover:opacity-100 transition-opacity rounded-xl overflow-hidden flex flex-col justify-between shadow-none"
                                        >
                                            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="w-12 h-16 rounded bg-[#111114] overflow-hidden shrink-0 border border-[#27272A] grayscale">
                                                            <img
                                                                src={ticket.booking?.showtime?.movie?.poster_path ? (ticket.booking.showtime.movie.poster_path.startsWith('http') || ticket.booking.showtime.movie.poster_path.startsWith('/') ? ticket.booking.showtime.movie.poster_path : `/storage/${ticket.booking.showtime.movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                                                alt={ticket.booking?.showtime?.movie?.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-1 text-left">
                                                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                                                {ticket.is_used ? 'Sudah Dipakai' : 'Selesai'}
                                                            </span>
                                                            <h3 className="font-medium text-zinc-300 text-xs truncate">
                                                                {ticket.booking?.showtime?.movie?.title}
                                                            </h3>
                                                            <p className="text-[11px] text-[#71717A] truncate">
                                                                {ticket.booking?.showtime?.cinema?.name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#111114] rounded-lg p-2.5 text-xs text-[#A1A1AA] flex justify-between border border-[#27272A]">
                                                        <span>{ticket.booking?.showtime?.show_date}</span>
                                                        <span className="font-mono text-zinc-300 font-semibold">
                                                            {ticket.seat?.row_label}{ticket.seat?.seat_number}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Link href={`/tickets/${ticket.booking?.booking_code}`} className="block">
                                                        <Button variant="outline" className="w-full border-[#27272A] bg-[#111114] text-zinc-400 hover:text-white text-xs h-8 rounded-lg">
                                                            Detail Tiket
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-[#111114] border border-[#27272A] rounded-xl p-8 sm:p-12 text-center text-[#71717A] text-xs">
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
