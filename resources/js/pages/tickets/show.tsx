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
    AlertCircle,
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
            <Head
                title={`E-Ticket - ${booking.showtime?.movie?.title ?? 'Tiket Bioskop'}`}
            />

            <div className="min-h-screen overflow-x-clip bg-[#09090B] py-8 text-[#FAFAFA] lg:py-10 print:bg-white print:py-0 print:text-black">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    {/* Top Action & Navigation */}
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                        <div>
                            <span className="mb-1 block text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                                Pemesanan Berhasil
                            </span>
                            <h1 className="text-xl font-bold text-white sm:text-2xl">
                                E-Ticket Bioskop Resmi
                            </h1>
                            <p className="mt-0.5 text-xs text-[#71717A]">
                                Kode Pemesanan:{' '}
                                <span className="font-mono font-semibold text-white">
                                    {booking.booking_code}
                                </span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={`/tickets/${booking.booking_code}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Button className="flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 text-xs font-medium text-white hover:bg-blue-700">
                                    <Download className="size-3.5" />
                                    Download PDF
                                </Button>
                            </a>

                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="flex h-8.5 items-center gap-1.5 rounded-lg border-[#27272A] bg-[#18181B] text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white"
                            >
                                <Printer className="size-3.5" />
                                Cetak
                            </Button>
                        </div>
                    </div>

                    {/* Ticket Tabs if user ordered multiple seats */}
                    {tickets.length > 1 && (
                        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-1 print:hidden">
                            <span className="mr-1 shrink-0 text-xs text-[#71717A]">
                                Pilih Kursi:
                            </span>
                            {tickets.map((t, idx) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTicketIndex(idx)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                                        selectedTicketIndex === idx
                                            ? 'bg-[#E50914] text-white'
                                            : 'border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white'
                                    }`}
                                >
                                    <TicketIcon className="size-3" />
                                    <span>
                                        #{idx + 1} (
                                        {t.booking_seat?.seat?.row_label}
                                        {t.booking_seat?.seat?.seat_number})
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* The Clean Cinema Pass Container */}
                    {activeTicket && (
                        <div className="relative overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B] print:border-black print:bg-white print:text-black">
                            <div className="grid grid-cols-1 divide-y divide-[#27272A] md:grid-cols-12 md:divide-x md:divide-y-0">
                                {/* Left Section: Movie & Booking Details (8 Cols) */}
                                <div className="space-y-5 p-6 md:col-span-8">
                                    {/* Header Brand */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E50914] text-xs font-bold text-white">
                                                C
                                            </div>
                                            <span className="text-xs font-bold tracking-wider text-white uppercase">
                                                {cinemaApp.name}
                                            </span>
                                        </div>
                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                            {activeTicket.status === 'valid'
                                                ? 'TIKET AKTIF'
                                                : (activeTicket.status?.toUpperCase() ??
                                                  'TIKET')}
                                        </span>
                                    </div>

                                    {/* Movie Title & Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded border border-[#27272A] bg-[#111114] px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                                                {booking.showtime?.movie
                                                    ?.rating_age ?? '13+'}
                                            </span>
                                            <span className="text-xs text-[#71717A]">
                                                {
                                                    booking.showtime?.movie
                                                        ?.duration_minutes
                                                }{' '}
                                                Menit
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                            {booking.showtime?.movie?.title}
                                        </h2>
                                    </div>

                                    {/* 2x2 Grid of details */}
                                    <div className="grid grid-cols-2 gap-4 border-t border-[#27272A] pt-3 text-xs">
                                        <div>
                                            <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                Bioskop
                                            </span>
                                            <span className="mt-0.5 block font-semibold text-white">
                                                {booking.showtime?.cinema?.name}
                                            </span>
                                            <span className="text-[11px] text-[#71717A]">
                                                {booking.showtime?.cinema?.city}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                Studio
                                            </span>
                                            <span className="mt-0.5 block font-semibold text-white">
                                                {booking.showtime?.studio?.name}
                                            </span>
                                            <span className="text-[11px] text-[#A1A1AA] uppercase">
                                                {booking.showtime?.studio
                                                    ?.studio_type ||
                                                    (
                                                        booking.showtime
                                                            ?.studio as any
                                                    )?.type ||
                                                    'Regular'}
                                            </span>
                                        </div>

                                        <div className="pt-1">
                                            <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                Tanggal Tayang
                                            </span>
                                            <span className="mt-0.5 block font-semibold text-white">
                                                {booking.showtime?.show_date}
                                            </span>
                                        </div>

                                        <div className="pt-1">
                                            <span className="block text-[10px] font-medium text-[#71717A] uppercase">
                                                Waktu
                                            </span>
                                            <span className="mt-0.5 block font-mono font-semibold text-white">
                                                {booking.showtime?.start_time
                                                    ? booking.showtime.start_time.substring(
                                                          0,
                                                          5,
                                                      )
                                                    : ''}{' '}
                                                -{' '}
                                                {booking.showtime?.end_time
                                                    ? booking.showtime.end_time.substring(
                                                          0,
                                                          5,
                                                      )
                                                    : ''}{' '}
                                                WIB
                                            </span>
                                        </div>
                                    </div>

                                    {/* Seat Indicator */}
                                    <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#111114] p-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded bg-zinc-800 p-2 text-zinc-300">
                                                <Armchair className="size-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-medium text-[#71717A] uppercase">
                                                    Kursi
                                                </div>
                                                <div className="font-mono text-xl font-bold text-white">
                                                    {
                                                        activeTicket
                                                            .booking_seat?.seat
                                                            ?.row_label
                                                    }
                                                    {
                                                        activeTicket
                                                            .booking_seat?.seat
                                                            ?.seat_number
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-medium text-zinc-400 uppercase">
                                                {
                                                    activeTicket.booking_seat
                                                        ?.seat?.seat_type
                                                }{' '}
                                                Class
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: QR Code & Verification (4 Cols) */}
                                <div className="relative flex flex-col items-center justify-center bg-[#111114] p-6 text-center md:col-span-4">
                                    {/* Notch cutouts for cinema pass visual */}
                                    <div className="absolute top-1/2 -left-2.5 hidden h-5 w-5 -translate-y-1/2 rounded-full border border-[#27272A] bg-[#09090B] md:block" />

                                    <div className="w-full max-w-[170px] rounded-lg bg-white p-2.5">
                                        <img
                                            src={activeTicket.qr_data_uri}
                                            alt="Ticket QR Code"
                                            className="aspect-square h-auto w-full object-contain"
                                        />
                                    </div>

                                    <div className="mt-3 space-y-0.5">
                                        <div className="font-mono text-xs font-bold tracking-wider text-white">
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
                    <div className="mt-6 space-y-1.5 rounded-xl border border-[#27272A] bg-[#18181B] p-4 text-xs text-[#A1A1AA] print:hidden">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                            <AlertCircle className="size-3.5 text-zinc-400" />
                            <span>Petunjuk Penggunaan:</span>
                        </div>
                        <ul className="list-inside list-disc space-y-0.5 pl-1 text-[11px] text-[#71717A]">
                            <li>
                                Harap hadir di bioskop minimal 15 menit sebelum
                                waktu tayang dimulai.
                            </li>
                            <li>
                                Tunjukkan kode QR tiket langsung kepada petugas
                                scanner di pintu studio.
                            </li>
                            <li>
                                Tiket yang telah di-scan otomatis berubah status
                                menjadi terpakai.
                            </li>
                        </ul>
                    </div>

                    <div className="mt-6 flex justify-center print:hidden">
                        <Link href="/movies">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1 text-xs text-[#71717A] hover:text-white"
                            >
                                <ChevronLeft className="size-3.5" /> Kembali ke
                                Katalog Film
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
