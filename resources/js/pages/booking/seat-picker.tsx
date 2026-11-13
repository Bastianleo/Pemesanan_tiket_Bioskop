import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    DollarSign,
    Film,
    Info,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Tag,
    Ticket,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import CinemaLayout from '@/layouts/cinema-layout';
import type { Cinema, Movie, Seat, Showtime, Studio } from '@/types';

interface VoucherItem {
    id: number;
    code: string;
    title: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_discount: number | null;
}

interface SeatLayoutItem {
    id: number;
    studio_id: number;
    row_label: string;
    seat_number: number;
    seat_code: string;
    seat_type: 'regular' | 'vip' | 'couple';
    is_active: boolean;
    status: 'available' | 'held' | 'held_by_me' | 'booked' | 'unavailable';
    price: number;
}

interface Props {
    showtime: Showtime & {
        movie: Movie;
        studio: Studio & { cinema: Cinema };
    };
    seats: SeatLayoutItem[];
    availableVouchers?: VoucherItem[];
    config: {
        service_fee: number;
        max_seats: number;
        hold_duration_minutes: number;
    };
}

export default function SeatPicker({
    showtime,
    seats: initialSeats,
    availableVouchers = [],
    config,
}: Props) {
    const [seats, setSeats] = useState<SeatLayoutItem[]>(initialSeats);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [isPolling, setIsPolling] = useState(false);
    const [voucherInput, setVoucherInput] = useState<string>('');
    const [appliedVoucher, setAppliedVoucher] = useState<VoucherItem | null>(
        null,
    );
    const [voucherError, setVoucherError] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        seat_ids: [] as number[],
        voucher_code: '',
    });

    // Auto polling every 8 seconds to synchronize seat status
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                setIsPolling(true);
                const res = await fetch(`/api/booking/${showtime.id}/seats`);
                const json = await res.json();
                if (json.seats) {
                    setSeats(json.seats);

                    // If a currently selected seat was taken by someone else during polling, deselect and notify
                    setSelectedSeatIds((prevSelected) => {
                        const stillAvailable = prevSelected.filter((id) => {
                            const found = json.seats.find(
                                (s: SeatLayoutItem) => s.id === id,
                            );
                            return (
                                found &&
                                (found.status === 'available' ||
                                    found.status === 'held_by_me')
                            );
                        });
                        if (stillAvailable.length !== prevSelected.length) {
                            toast.warning(
                                'Beberapa kursi yang Anda pilih telah dipesan oleh pengguna lain.',
                            );
                            setData('seat_ids', stillAvailable);
                        }
                        return stillAvailable;
                    });
                }
            } catch (err) {
                // Silently ignore background polling network blips
            } finally {
                setIsPolling(false);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [showtime.id]);

    // Group seats by row_label
    const seatRows: Record<string, SeatLayoutItem[]> = {};
    seats.forEach((seat) => {
        if (!seatRows[seat.row_label]) {
            seatRows[seat.row_label] = [];
        }
        seatRows[seat.row_label].push(seat);
    });

    const sortedRows = Object.keys(seatRows).sort();

    // Toggle seat selection
    const handleSeatClick = (seat: SeatLayoutItem) => {
        if (seat.status !== 'available' && seat.status !== 'held_by_me') {
            return;
        }

        const isAlreadySelected = selectedSeatIds.includes(seat.id);

        if (isAlreadySelected) {
            const next = selectedSeatIds.filter((id) => id !== seat.id);
            setSelectedSeatIds(next);
            setData('seat_ids', next);
        } else {
            if (selectedSeatIds.length >= config.max_seats) {
                toast.error(
                    `Maksimal pembelian adalah ${config.max_seats} kursi per pesanan.`,
                );
                return;
            }
            const next = [...selectedSeatIds, seat.id];
            setSelectedSeatIds(next);
            setData('seat_ids', next);
        }
    };

    // Calculate selected seats details & total
    const selectedSeatObjects = seats.filter((s) =>
        selectedSeatIds.includes(s.id),
    );
    const subtotal = selectedSeatObjects.reduce((acc, s) => acc + s.price, 0);

    // Calculate voucher discount
    let discount = 0;
    if (appliedVoucher && subtotal > 0) {
        if (appliedVoucher.discount_type === 'percentage') {
            const calculated = (subtotal * appliedVoucher.discount_value) / 100;
            discount = appliedVoucher.max_discount
                ? Math.min(calculated, appliedVoucher.max_discount)
                : calculated;
        } else {
            discount = Math.min(appliedVoucher.discount_value, subtotal);
        }
    }

    const totalAmount =
        subtotal > 0
            ? Math.max(0, subtotal - discount + config.service_fee)
            : 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleApplyVoucher = (codeToApply?: string) => {
        setVoucherError('');
        const code = (codeToApply ?? voucherInput).trim().toUpperCase();
        if (!code) {
            setVoucherError('Silakan ketik kode promo.');
            return;
        }
        if (subtotal === 0) {
            setVoucherError('Pilih minimal 1 kursi terlebih dahulu.');
            return;
        }

        const found = availableVouchers.find(
            (v) => v.code.toUpperCase() === code,
        );
        if (!found) {
            // Also allow applying general code by passing it to backend
            setAppliedVoucher({
                id: 0,
                code,
                title: 'Kode Promo',
                discount_type: 'fixed',
                discount_value: 0,
                min_purchase: 0,
                max_discount: null,
            });
            setVoucherInput(code);
            setData('voucher_code', code);
            toast.info(`Kode promo "${code}" akan divalidasi saat checkout.`);
            return;
        }

        if (subtotal < found.min_purchase) {
            setVoucherError(
                `Minimal pembelian untuk promo ini adalah ${formatCurrency(found.min_purchase)}`,
            );
            return;
        }

        setAppliedVoucher(found);
        setVoucherInput(found.code);
        setData('voucher_code', found.code);
        toast.success(`Kode promo ${found.code} berhasil diterapkan!`);
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherInput('');
        setVoucherError('');
        setData('voucher_code', '');
        toast.info('Kode promo dihapus.');
    };

    const handleProceedCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSeatIds.length === 0) {
            toast.error('Silakan pilih minimal 1 kursi.');
            return;
        }

        post(`/booking/${showtime.id}/hold`);
    };

    return (
        <CinemaLayout>
            <Head title={`Pilih Kursi - ${showtime.movie.title}`} />

            <div className="mx-auto w-full max-w-[1600px] space-y-8 overflow-x-clip px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
                {/* Header Info Bar */}
                <div className="flex flex-col gap-4 border-b border-[#27272A] pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/movies/${showtime.movie.slug}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8.5 w-8.5 rounded-lg border-[#27272A] bg-[#18181B] p-0 text-zinc-300 hover:text-white"
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                    {showtime.movie.title}
                                </h1>
                                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                                    {(
                                        showtime.studio.studio_type ||
                                        showtime.studio.type ||
                                        'regular'
                                    ).toUpperCase()}
                                </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
                                <span>{showtime.studio.cinema.name}</span>
                                <span>•</span>
                                <span>{showtime.studio.name}</span>
                                <span>•</span>
                                <span className="text-zinc-200">
                                    {showtime.show_date
                                        ? new Date(
                                              showtime.show_date,
                                          ).toLocaleDateString('id-ID', {
                                              weekday: 'short',
                                              day: 'numeric',
                                              month: 'short',
                                          })
                                        : ''}{' '}
                                    ({showtime.start_time.substring(0, 5)} WIB)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        {isPolling && (
                            <span className="flex items-center gap-1 text-[11px] text-[#71717A]">
                                <RefreshCw className="size-3 animate-spin text-zinc-400" />
                                Memperbarui...
                            </span>
                        )}
                        <span className="rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-1 text-zinc-300">
                            Maks. {config.max_seats} Kursi
                        </span>
                    </div>
                </div>

                {/* Error Banner if any */}
                {((errors as Record<string, string | undefined>).seats ||
                    errors.seat_ids) && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-[#18181B] p-4 text-xs text-red-300">
                        <AlertCircle className="size-4 shrink-0 text-red-500" />
                        <div>
                            {(errors as Record<string, string | undefined>)
                                .seats || errors.seat_ids}
                        </div>
                    </div>
                )}

                {/* Legend Bar - Minimalist */}
                <div className="flex flex-wrap items-center justify-center gap-6 rounded-xl border border-[#27272A] bg-[#111114] p-3 text-xs">
                    {/* Tersedia: Abu-abu / border */}
                    <div className="flex items-center gap-2">
                        <div className="h-4.5 w-4.5 rounded border border-zinc-700 bg-[#18181B]" />
                        <span className="text-[#A1A1AA]">Tersedia</span>
                    </div>

                    {/* Dipilih: Merah */}
                    <div className="flex items-center gap-2">
                        <div className="h-4.5 w-4.5 rounded bg-[#E50914]" />
                        <span className="font-medium text-[#FAFAFA]">
                            Pilihan Anda
                        </span>
                    </div>

                    {/* VIP: Gold/Amber tint */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-4.5 w-4.5 items-center justify-center rounded border border-amber-500/50 bg-amber-950/30 text-[8px] font-semibold text-amber-300">
                            VIP
                        </div>
                        <span className="text-[#A1A1AA]">VIP (+25%)</span>
                    </div>

                    {/* Terisi / Locked */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-4.5 w-4.5 items-center justify-center rounded border border-[#27272A] bg-zinc-900 text-[9px] text-zinc-600">
                            ✕
                        </div>
                        <span className="text-[#71717A]">Terisi</span>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cinema Screen & Interactive Seats Grid (2 Columns) */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="overflow-hidden rounded-xl border-[#27272A] bg-[#111114] shadow-none">
                            <CardContent className="overflow-x-auto pt-8 pb-12">
                                {/* Curved Cinema Screen */}
                                <div className="mx-auto mb-10 w-3/4 max-w-md text-center">
                                    <div className="h-1 w-full rounded-full bg-zinc-600" />
                                    <div className="mt-2 text-[10px] font-semibold tracking-widest text-[#71717A] uppercase">
                                        Layar Bioskop
                                    </div>
                                </div>

                                {/* Seat Matrix */}
                                <div className="mx-auto flex min-w-fit flex-col items-center gap-2.5">
                                    {sortedRows.map((rowLabel) => (
                                        <div
                                            key={rowLabel}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="w-5 text-right font-mono text-xs font-semibold text-[#71717A]">
                                                {rowLabel}
                                            </span>

                                            <div className="flex items-center gap-1.5">
                                                {seatRows[rowLabel].map(
                                                    (seat) => {
                                                        const isSelected =
                                                            selectedSeatIds.includes(
                                                                seat.id,
                                                            );
                                                        const isVip =
                                                            seat.seat_type ===
                                                            'vip';
                                                        const isBooked =
                                                            seat.status ===
                                                                'booked' ||
                                                            seat.status ===
                                                                'held';
                                                        const isUnavailable =
                                                            !seat.is_active ||
                                                            seat.status ===
                                                                'unavailable';

                                                        let seatClass = '';
                                                        if (isSelected) {
                                                            // Pilihan Anda: Merah
                                                            seatClass =
                                                                'bg-[#E50914] text-white font-bold border-transparent';
                                                        } else if (
                                                            isBooked ||
                                                            isUnavailable
                                                        ) {
                                                            // Terisi / Dikunci
                                                            seatClass =
                                                                'border border-[#27272A] bg-zinc-900/60 text-zinc-700 cursor-not-allowed';
                                                        } else if (isVip) {
                                                            // VIP: Amber accent
                                                            seatClass =
                                                                'border border-amber-500/50 bg-amber-950/20 text-amber-300 hover:border-amber-400';
                                                        } else {
                                                            // Tersedia
                                                            seatClass =
                                                                'border border-[#27272A] bg-[#18181B] text-zinc-300 hover:border-zinc-500 hover:text-white';
                                                        }

                                                        return (
                                                            <button
                                                                key={seat.id}
                                                                type="button"
                                                                disabled={
                                                                    isBooked ||
                                                                    isUnavailable
                                                                }
                                                                onClick={() =>
                                                                    handleSeatClick(
                                                                        seat,
                                                                    )
                                                                }
                                                                className={`flex h-7.5 w-7.5 items-center justify-center rounded text-[11px] font-medium transition-colors ${seatClass}`}
                                                                title={`Kursi ${rowLabel}${seat.seat_number} - Rp ${seat.price.toLocaleString('id-ID')} (${isBooked ? 'Sudah Dipesan' : 'Tersedia'})`}
                                                            >
                                                                {isBooked
                                                                    ? '✕'
                                                                    : seat.seat_number}
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            <span className="w-5 text-left font-mono text-xs font-semibold text-[#71717A]">
                                                {rowLabel}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary & Proceed Checkout (Sticky Side) */}
                    <div className="space-y-6">
                        <Card className="sticky top-24 rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                            <CardContent className="space-y-5 p-5">
                                <div className="border-b border-[#27272A] pb-3">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                                        <Ticket className="size-4 text-[#E50914]" />
                                        Ringkasan Pesanan
                                    </h3>
                                    <p className="mt-0.5 text-xs text-[#71717A]">
                                        Kursi dikunci selama{' '}
                                        {config.hold_duration_minutes} menit di
                                        checkout.
                                    </p>
                                </div>

                                {/* Selected Seats List */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#A1A1AA]">
                                            Kursi ({selectedSeatIds.length}):
                                        </span>
                                        <span className="font-medium text-white">
                                            {selectedSeatIds.length > 0
                                                ? `${selectedSeatIds.length} Kursi`
                                                : '-'}
                                        </span>
                                    </div>

                                    {selectedSeatObjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 rounded-lg border border-[#27272A] bg-[#111114] p-2.5">
                                            {selectedSeatObjects.map((s) => (
                                                <span
                                                    key={s.id}
                                                    className="rounded bg-[#E50914] px-2 py-0.5 font-mono text-xs text-white"
                                                >
                                                    {s.seat_code}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[#27272A] p-3 text-center text-xs text-[#71717A]">
                                            Klik kursi pada denah untuk memilih
                                            tempat duduk.
                                        </div>
                                    )}
                                </div>

                                {/* Promo Code / Voucher Section */}
                                <div className="space-y-2 border-t border-[#27272A] pt-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 font-medium text-white">
                                            <Tag className="size-3.5 text-[#E50914]" />
                                            Kode Promo / Voucher
                                        </span>
                                        {availableVouchers.length > 0 &&
                                            !appliedVoucher && (
                                                <span className="text-[10px] text-zinc-400">
                                                    {availableVouchers.length}{' '}
                                                    tersedia
                                                </span>
                                            )}
                                    </div>

                                    {appliedVoucher ? (
                                        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-2.5 text-xs">
                                            <div>
                                                <div className="flex items-center gap-1 font-mono font-semibold text-emerald-400">
                                                    <CheckCircle2 className="size-3 text-emerald-400" />
                                                    {appliedVoucher.code}
                                                </div>
                                                <div className="text-[11px] text-zinc-300">
                                                    {discount > 0
                                                        ? `Hemat ${formatCurrency(discount)}`
                                                        : appliedVoucher.title}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveVoucher}
                                                className="h-7 w-7 p-0 text-zinc-400 hover:bg-transparent hover:text-red-400"
                                                title="Hapus voucher"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex gap-1.5">
                                                <Input
                                                    placeholder="Ketik kode promo"
                                                    value={voucherInput}
                                                    onChange={(e) => {
                                                        setVoucherInput(
                                                            e.target.value,
                                                        );
                                                        setVoucherError('');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleApplyVoucher();
                                                        }
                                                    }}
                                                    className="h-8 rounded-lg border-[#27272A] bg-[#111114] text-xs text-white uppercase placeholder:text-zinc-600 placeholder:normal-case"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        handleApplyVoucher()
                                                    }
                                                    disabled={
                                                        !voucherInput.trim() ||
                                                        selectedSeatIds.length ===
                                                            0
                                                    }
                                                    className="h-8 shrink-0 rounded-lg bg-zinc-800 px-3 text-xs text-white hover:bg-zinc-700"
                                                >
                                                    Pakai
                                                </Button>
                                            </div>

                                            {voucherError && (
                                                <p className="flex items-center gap-1 text-[11px] text-red-400">
                                                    <AlertCircle className="size-3 shrink-0" />
                                                    {voucherError}
                                                </p>
                                            )}

                                            {/* Quick Click Available Vouchers */}
                                            {availableVouchers.length > 0 && (
                                                <div className="space-y-1 pt-0.5">
                                                    <div className="text-[10px] tracking-wider text-zinc-500 uppercase">
                                                        Pilih Promo:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {availableVouchers.map(
                                                            (v) => (
                                                                <button
                                                                    key={v.id}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleApplyVoucher(
                                                                            v.code,
                                                                        )
                                                                    }
                                                                    className="rounded border border-dashed border-[#27272A] bg-[#111114] px-2 py-0.5 text-[10px] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                                                                >
                                                                    {v.code}
                                                                </button>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 rounded-lg border border-[#27272A] bg-[#111114] p-3.5 text-xs">
                                    <div className="flex justify-between text-[#A1A1AA]">
                                        <span>Subtotal Tiket:</span>
                                        <span className="font-medium text-white">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[#A1A1AA]">
                                        <span>Biaya Layanan:</span>
                                        <span className="font-medium text-white">
                                            {selectedSeatIds.length > 0
                                                ? formatCurrency(
                                                      config.service_fee,
                                                  )
                                                : 'Rp 0'}
                                        </span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between font-medium text-emerald-400">
                                            <span>
                                                Diskon Promo (
                                                {appliedVoucher?.code}):
                                            </span>
                                            <span>
                                                -{formatCurrency(discount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t border-[#27272A] pt-2.5 text-sm font-semibold text-white">
                                        <span>Total:</span>
                                        <span className="font-bold text-white">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Button
                                        onClick={handleProceedCheckout}
                                        disabled={
                                            selectedSeatIds.length === 0 ||
                                            processing
                                        }
                                        className="h-10 w-full rounded-lg bg-[#E50914] text-sm font-medium text-white hover:bg-red-700"
                                    >
                                        <ShieldCheck className="mr-1.5 size-4" />
                                        Lanjutkan ke Pembayaran{' '}
                                        {totalAmount > 0 &&
                                            `• ${formatCurrency(totalAmount)}`}
                                    </Button>

                                    <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#71717A]">
                                        <Info className="size-3 shrink-0 text-[#71717A]" />
                                        <span>
                                            Pencegahan double-booking aktif
                                            secara otomatis.
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
