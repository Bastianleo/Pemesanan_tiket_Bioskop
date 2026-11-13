import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Ticket as TicketIcon,
    Download,
    Printer,
    Film,
    Calendar,
    Clock,
    MapPin,
    Armchair,
    CheckCircle2,
    Building2,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';
import { Booking, Ticket } from '@/types/cinema';

interface Props {
    booking: Booking & {
        tickets: Array<Ticket & { qr_data_uri: string }>;
    };
    cinemaApp: {
        name: string;
        contact: string;
    };
}

export default function TicketShowPage({ booking, cinemaApp }: Props) {
    const [selectedTicketIndex, setSelectedTicketIndex] = useState(0);
    const tickets = booking.tickets || [];
    const activeTicket = tickets[selectedTicketIndex] || tickets[0];

    const handlePrint = () => {
        window.print();
    };

    return (
        <CinemaLayout>
            <Head title={`E-Ticket - ${booking.showtime?.movie?.title ?? 'Tiket Bioskop'}`} />

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10 print:py-0 print:bg-white print:text-black overflow-x-clip">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">
                    
                    {/* Top Action & Navigation */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
                                Pemesanan Berhasil
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">
                                E-Ticket Bioskop Resmi
                            </h1>
                            <p className="text-xs text-[#71717A] mt-0.5">
                                Kode Pemesanan: <span className="font-mono font-semibold text-white">{booking.booking_code}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={`/tickets/${booking.booking_code}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button className="h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
                                    <Download className="size-3.5" />
                                    Download PDF
                                </Button>
                            </a>

                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="h-8.5 border-[#27272A] bg-[#18181B] text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs rounded-lg flex items-center gap-1.5"
                            >
                                <Printer className="size-3.5" />
                                Cetak
                            </Button>
                        </div>
                    </div>

                    {/* Ticket Tabs if user ordered multiple seats */}
                    {tickets.length > 1 && (
                        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 print:hidden">
                            <span className="text-xs text-[#71717A] shrink-0 mr-1">
                                Pilih Kursi:
                            </span>
                            {tickets.map((t, idx) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTicketIndex(idx)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                                        selectedTicketIndex === idx
                                            ? 'bg-[#E50914] text-white'
                                            : 'bg-[#18181B] text-[#A1A1AA] hover:text-white border border-[#27272A]'
                                    }`}
                                >
                                    <TicketIcon className="size-3" />
                                    <span>#{idx + 1} ({t.booking_seat?.seat?.row_label}{t.booking_seat?.seat?.seat_number})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* The Clean Cinema Pass Container */}
                    {activeTicket && (
                        <div className="relative bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden print:border-black print:bg-white print:text-black">
                            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
                                
                                {/* Left Section: Movie & Booking Details (8 Cols) */}
                                <div className="p-6 md:col-span-8 space-y-5">
                                    
                                    {/* Header Brand */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-[#E50914] flex items-center justify-center font-bold text-white text-xs">
                                                C
                                            </div>
                                            <span className="font-bold text-xs tracking-wider uppercase text-white">
                                                {cinemaApp.name}
                                            </span>
                                        </div>
                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                            {activeTicket.status === 'valid' ? 'TIKET AKTIF' : (activeTicket.status?.toUpperCase() ?? 'TIKET')}
                                        </span>
                                    </div>

                                    {/* Movie Title & Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded bg-[#111114] border border-[#27272A] px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                                {booking.showtime?.movie?.rating_age ?? '13+'}
                                            </span>
                                            <span className="text-xs text-[#71717A]">
                                                {booking.showtime?.movie?.duration_minutes} Menit
                                            </span>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                            {booking.showtime?.movie?.title}
                                        </h2>
                                    </div>

                                    {/* 2x2 Grid of details */}
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#27272A] text-xs">
                                        <div>
                                            <span className="text-[10px] uppercase text-[#71717A] block font-medium">
                                                Bioskop
                                            </span>
                                            <span className="font-semibold text-white block mt-0.5">
                                                {booking.showtime?.cinema?.name}
                                            </span>
                                            <span className="text-[#71717A] text-[11px]">
                                                {booking.showtime?.cinema?.city}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] uppercase text-[#71717A] block font-medium">
                                                Studio
                                            </span>
                                            <span className="font-semibold text-white block mt-0.5">
                                                {booking.showtime?.studio?.name}
                                            </span>
                                            <span className="text-[#A1A1AA] text-[11px] uppercase">
                                                {booking.showtime?.studio?.studio_type || (booking.showtime?.studio as any)?.type || 'Regular'}
                                            </span>
                                        </div>

                                        <div className="pt-1">
                                            <span className="text-[10px] uppercase text-[#71717A] block font-medium">
                                                Tanggal Tayang
                                            </span>
                                            <span className="font-semibold text-white block mt-0.5">
                                                {booking.showtime?.show_date}
                                            </span>
                                        </div>

                                        <div className="pt-1">
                                            <span className="text-[10px] uppercase text-[#71717A] block font-medium">
                                                Waktu
                                            </span>
                                            <span className="font-semibold text-white block mt-0.5 font-mono">
                                                {booking.showtime?.start_time ? booking.showtime.start_time.substring(0, 5) : ''} - {booking.showtime?.end_time ? booking.showtime.end_time.substring(0, 5) : ''} WIB
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seat Indicator */}
                                    <div className="p-3.5 bg-[#111114] rounded-lg border border-[#27272A] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-800 text-zinc-300 rounded">
                                                <Armchair className="size-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-[#71717A] font-medium">
                                                    Kursi
                                                </div>
                                                <div className="text-xl font-bold font-mono text-white">
                                                    {activeTicket.booking_seat?.seat?.row_label}{activeTicket.booking_seat?.seat?.seat_number}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-medium uppercase text-zinc-400">
                                                {activeTicket.booking_seat?.seat?.seat_type} Class
                                            </span>
                                        </div>
                                    </div>

                                </div>

                                {/* Right Section: QR Code & Verification (4 Cols) */}
                                <div className="p-6 md:col-span-4 flex flex-col items-center justify-center text-center bg-[#111114] relative">
                                    
                                    {/* Notch cutouts for cinema pass visual */}
                                    <div className="hidden md:block absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#09090B] border border-[#27272A]" />

                                    <div className="w-full max-w-[170px] bg-white p-2.5 rounded-lg">
                                        <img
                                            src={activeTicket.qr_data_uri}
                                            alt="Ticket QR Code"
                                            className="w-full h-auto aspect-square object-contain"
                                        />
                                    </div>

                                    <div className="mt-3 space-y-0.5">
                                        <div className="text-xs font-mono font-bold text-white tracking-wider">
                                            {activeTicket.ticket_code}
                                        </div>
                                        <div className="text-[10px] text-[#71717A]">
                                            Scan di pintu studio
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* Instructions footer */}
                    <div className="mt-6 bg-[#18181B] border border-[#27272A] rounded-xl p-4 text-xs text-[#A1A1AA] space-y-1.5 print:hidden">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                            <AlertCircle className="size-3.5 text-zinc-400" />
                            <span>Petunjuk Penggunaan:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[#71717A] pl-1 text-[11px]">
                            <li>Harap hadir di bioskop minimal 15 menit sebelum waktu tayang dimulai.</li>
                            <li>Tunjukkan kode QR tiket langsung kepada petugas scanner di pintu studio.</li>
                            <li>Tiket yang telah di-scan otomatis berubah status menjadi terpakai.</li>
                        </ul>
                    </div>

                    <div className="mt-6 flex justify-center print:hidden">
                        <Link href="/movies">
                            <Button variant="ghost" className="text-xs text-[#71717A] hover:text-white flex items-center gap-1">
                                <ChevronLeft className="size-3.5" /> Kembali ke Katalog Film
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        </CinemaLayout>
    );
}
