import { Head, router } from '@inertiajs/react';
import { Ban, Eye, Receipt, Search, User } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { Booking } from '@/types';

interface Props {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function AdminBookingsIndex({ bookings, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );

    const handleFilter = (newSearch?: string, newStatus?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const st = newStatus !== undefined ? newStatus : status;

        router.get(
            '/admin/bookings',
            {
                search: s || undefined,
                status: st !== 'all' ? st : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleCancel = (b: Booking) => {
        if (
            confirm(
                `Batalkan pesanan '${b.booking_code}' dan lepaskan seluruh kursi kembali ke publik?`,
            )
        ) {
            router.post(`/admin/bookings/${b.id}/cancel`);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const getStatusBadge = (st: string) => {
        switch (st) {
            case 'paid':
                return (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        PAID
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                        PENDING
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className="border-zinc-700 bg-zinc-800 text-zinc-400">
                        CANCELLED
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-400">
                        EXPIRED
                    </Badge>
                );
            default:
                return <Badge>{st}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Pemesanan - Admin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Manajemen Transaksi Pemesanan
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Pantau seluruh tiket yang dipesan, status verifikasi
                        gateway, dan riwayat kursi penonton.
                    </p>
                </div>

                {/* Filters */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    placeholder="Cari kode booking, nama, atau email pemesan..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        handleFilter(search)
                                    }
                                    className="border-zinc-800 bg-zinc-950/60 pl-9 text-zinc-200"
                                />
                            </div>

                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    handleFilter(undefined, val);
                                }}
                            >
                                <SelectTrigger className="border-zinc-800 bg-zinc-950/60 text-zinc-200">
                                    <SelectValue placeholder="Pilih Status Transaksi" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="paid">
                                        Sudah Dibayar (PAID)
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Menunggu Pembayaran (PENDING)
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Dibatalkan (CANCELLED)
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Kedaluwarsa (EXPIRED)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Kode Booking
                                        </th>
                                        <th className="px-4 py-3">Pelanggan</th>
                                        <th className="px-4 py-3">
                                            Film & Teater
                                        </th>
                                        <th className="px-4 py-3">Kursi</th>
                                        <th className="px-4 py-3">Total</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {bookings.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-8 text-center text-zinc-500"
                                            >
                                                Tidak ada data transaksi yang
                                                ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.data.map((b) => (
                                            <tr
                                                key={b.id}
                                                className="transition-colors hover:bg-zinc-800/30"
                                            >
                                                <td className="px-4 py-3 font-mono font-medium text-white">
                                                    {b.booking_code}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-200">
                                                        {b.user?.name}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {b.user?.email}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-200">
                                                        {
                                                            b.showtime?.movie
                                                                ?.title
                                                        }
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {
                                                            b.showtime?.studio
                                                                ?.cinema?.name
                                                        }{' '}
                                                        (
                                                        {
                                                            b.showtime?.studio
                                                                ?.name
                                                        }
                                                        )
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {b.booking_seats?.map(
                                                            (bs) => (
                                                                <span
                                                                    key={bs.id}
                                                                    className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] font-bold text-red-400"
                                                                >
                                                                    {
                                                                        bs.seat
                                                                            ?.row_label
                                                                    }
                                                                    {
                                                                        bs.seat
                                                                            ?.seat_number
                                                                    }
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-white">
                                                    {formatCurrency(
                                                        b.total_amount,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(b.status)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedBooking(
                                                                    b,
                                                                )
                                                            }
                                                            className="h-8 text-zinc-400 hover:text-white"
                                                            title="Detail Transaksi"
                                                        >
                                                            <Eye className="size-3.5" />
                                                        </Button>

                                                        {b.status ===
                                                            'paid' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleCancel(
                                                                        b,
                                                                    )
                                                                }
                                                                className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                                title="Batalkan & Refund"
                                                            >
                                                                <Ban className="size-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Detail Booking Modal */}
                <Dialog
                    open={!!selectedBooking}
                    onOpenChange={() => setSelectedBooking(null)}
                >
                    <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Rincian Pemesanan Tiket</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Kode Booking:{' '}
                                <span className="font-mono text-red-400">
                                    {selectedBooking?.booking_code}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="space-y-4 pt-2 text-sm">
                                <div className="space-y-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Film:
                                        </span>
                                        <span className="font-semibold text-white">
                                            {
                                                selectedBooking.showtime?.movie
                                                    ?.title
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Bioskop:
                                        </span>
                                        <span>
                                            {
                                                selectedBooking.showtime?.studio
                                                    ?.cinema?.name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Studio:
                                        </span>
                                        <span>
                                            {
                                                selectedBooking.showtime?.studio
                                                    ?.name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Jam Tayang:
                                        </span>
                                        <span className="font-mono">
                                            {selectedBooking.showtime?.start_time.substring(
                                                0,
                                                5,
                                            )}{' '}
                                            WIB
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Subtotal Kursi:
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                selectedBooking.subtotal,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Diskon Kupon:</span>
                                        <span>
                                            -
                                            {formatCurrency(
                                                selectedBooking.discount_amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">
                                            Biaya Layanan:
                                        </span>
                                        <span>
                                            {formatCurrency(
                                                selectedBooking.service_fee,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-bold text-white">
                                        <span>Total Bayar:</span>
                                        <span className="text-red-400">
                                            {formatCurrency(
                                                selectedBooking.total_amount,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
