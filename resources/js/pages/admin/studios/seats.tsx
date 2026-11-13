import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ShieldAlert,
    Sparkles,
    Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import type { Seat, Studio } from '@/types';

interface Props {
    studio: Studio & {
        cinema: { name: string; city: string };
        seats: Seat[];
    };
}

export default function AdminStudioSeats({ studio }: Props) {
    // Group seats by row_label
    const seatRows: Record<string, Seat[]> = {};
    studio.seats.forEach((seat) => {
        if (!seatRows[seat.row_label]) {
            seatRows[seat.row_label] = [];
        }
        seatRows[seat.row_label].push(seat);
    });

    const sortedRows = Object.keys(seatRows).sort();

    const handleToggleSeat = (seat: Seat, action: 'active' | 'type') => {
        router.post(
            `/admin/seats/${seat.id}/toggle`,
            { action },
            { preserveScroll: true },
        );
    };

    return (
        <AdminLayout>
            <Head title={`Denah Kursi - ${studio.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/studios">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 border-zinc-800 bg-zinc-900/60 p-0"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-white">
                                    {studio.name}
                                </h1>
                                <Badge className="border-red-500/20 bg-red-500/10 text-red-400">
                                    {studio.cinema.name}
                                </Badge>
                            </div>
                            <p className="text-sm text-zinc-400">
                                Total {studio.seats.length} Kursi Terpasang.
                                Klik pada kursi untuk menonaktifkan kursi rusak
                                atau mengubah tipe VIP.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded border border-zinc-700 bg-zinc-800" />
                        <span className="text-zinc-300">
                            Kursi Regular (Aktif)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded border border-amber-500 bg-amber-500/20 text-[10px] font-bold text-amber-400">
                            VIP
                        </div>
                        <span className="text-zinc-300">Kursi VIP (Aktif)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded border border-rose-800 bg-rose-950/60 text-[10px] font-bold text-rose-400">
                            ✕
                        </div>
                        <span className="text-zinc-300">
                            Kursi Rusak / Nonaktif
                        </span>
                    </div>
                </div>

                {/* Cinema Screen & Seat Grid */}
                <Card className="overflow-hidden border-zinc-800/80 bg-zinc-900/30">
                    <CardHeader className="pb-2 text-center">
                        {/* Curved Screen */}
                        <div className="mx-auto w-3/4 max-w-xl">
                            <div className="h-2 w-full rounded-t-full bg-gradient-to-r from-zinc-700 via-white to-zinc-700 shadow-[0_0_25px_rgba(255,255,255,0.4)]" />
                            <div className="mt-2 text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
                                LAYAR BIOSKOP (CINEMA SCREEN)
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="overflow-x-auto pt-8 pb-12">
                        <div className="mx-auto flex min-w-fit flex-col items-center gap-2.5">
                            {sortedRows.map((rowLabel) => (
                                <div
                                    key={rowLabel}
                                    className="flex items-center gap-2.5"
                                >
                                    <span className="w-5 text-right font-mono text-xs font-bold text-zinc-500">
                                        {rowLabel}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        {seatRows[rowLabel].map((seat) => {
                                            const isVip =
                                                seat.seat_type === 'vip';
                                            const isActive = seat.is_active;

                                            return (
                                                <div
                                                    key={seat.id}
                                                    className="group relative"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleSeat(
                                                                seat,
                                                                'active',
                                                            )
                                                        }
                                                        className={`flex h-8 w-8 items-center justify-center rounded text-[11px] font-medium transition-all ${
                                                            !isActive
                                                                ? 'border border-rose-800 bg-rose-950/70 text-rose-400 hover:bg-rose-900'
                                                                : isVip
                                                                  ? 'border border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-sm hover:scale-105'
                                                                  : 'border border-zinc-700 bg-zinc-800/90 text-zinc-300 hover:scale-105 hover:border-zinc-500 hover:text-white'
                                                        }`}
                                                        title={`${rowLabel}${seat.seat_number} (${isVip ? 'VIP' : 'Regular'}) - Klik untuk toggle aktif/rusak`}
                                                    >
                                                        {!isActive
                                                            ? '✕'
                                                            : seat.seat_number}
                                                    </button>

                                                    {/* Quick popup actions on hover */}
                                                    <div className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        <div className="pointer-events-auto rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white shadow-xl">
                                                            {rowLabel}
                                                            {seat.seat_number}
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleToggleSeat(
                                                                        seat,
                                                                        'type',
                                                                    );
                                                                }}
                                                                className="ml-1.5 text-amber-400 hover:underline"
                                                            >
                                                                [
                                                                {isVip
                                                                    ? 'Jadikan Regular'
                                                                    : 'Jadikan VIP'}
                                                                ]
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <span className="w-5 text-left font-mono text-xs font-bold text-zinc-500">
                                        {rowLabel}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
