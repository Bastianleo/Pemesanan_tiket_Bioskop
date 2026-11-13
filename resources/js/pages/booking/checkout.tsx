import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Film,
    Calendar,
    Clock,
    MapPin,
    Armchair,
    Ticket,
    ShieldCheck,
    CreditCard,
    QrCode,
    Building2,
    Wallet,
    ChevronRight,
    Tag,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Lock
} from 'lucide-react';
import { Booking, Voucher } from '@/types/cinema';

interface Props {
    booking: Booking;
    serviceFee: number;
    availableVouchers: Voucher[];
    now: string;
}

export default function CheckoutPage({ booking, serviceFee, availableVouchers, now }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;
    const [selectedMethod, setSelectedMethod] = useState<string>('qris');
    const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
    const [voucherError, setVoucherError] = useState<string>('');
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Calculate remaining seconds
    const calculateRemaining = () => {
        if (!booking.held_until) return 600;
        const target = new Date(booking.held_until).getTime();
        const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
        return diff;
    };

    const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            const rem = calculateRemaining();
            setRemainingSeconds(rem);
            if (rem <= 0) {
                clearInterval(interval);
                router.visit(`/booking/${booking.showtime_id}/seats`, {
                    data: { error: 'Waktu pembayaran telah habis. Kursi Anda telah dilepas.' }
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking.held_until]);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleApplyVoucher = (codeToApply?: string) => {
        const code = (codeToApply ?? voucherCodeInput).trim().toUpperCase();
        if (!code) {
            setVoucherError('Silakan masukkan kode promo.');
            return;
        }

        setVoucherError('');
        setIsApplyingVoucher(true);
        router.post(`/booking/${booking.booking_code}/voucher/apply`, {
            voucher_code: code,
        }, {
            preserveScroll: true,
            onError: (errs) => {
                if (errs.voucher_code) {
                    setVoucherError(errs.voucher_code);
                    toast.error(errs.voucher_code);
                }
            },
            onSuccess: () => {
                setVoucherCodeInput('');
                toast.success('Kode promo berhasil digunakan!');
            },
            onFinish: () => setIsApplyingVoucher(false),
        });
    };

    const handleRemoveVoucher = () => {
        router.post(`/booking/${booking.booking_code}/voucher/remove`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.info('Voucher berhasil dihapus.');
            },
        });
    };

    const handleProceedToPayment = () => {
        setIsPaying(true);
        router.post(`/booking/${booking.booking_code}/pay`, {
            payment_method: selectedMethod,
        }, {
            onFinish: () => setIsPaying(false),
        });
    };

    interface PaymentItem {
        id: string;
        name: string;
        desc: string;
        icon: React.ComponentType<{ className?: string }>;
        popular?: boolean;
    }

    interface PaymentCategory {
        category: string;
        items: PaymentItem[];
    }

    const paymentMethods: PaymentCategory[] = [
        {
            category: 'QRIS & Instant Pay',
            items: [
                { id: 'qris', name: 'QRIS (Semua E-Wallet & Bank)', desc: 'Scan dengan GoPay, OVO, Dana, BCA, Livin, dll.', icon: QrCode, popular: true },
            ],
        },
        {
            category: 'Virtual Account Bank',
            items: [
                { id: 'va_bca', name: 'BCA Virtual Account', desc: 'Verifikasi otomatis 24 Jam', icon: Building2 },
                { id: 'va_mandiri', name: 'Mandiri Virtual Account', desc: 'Verifikasi instan via Livin', icon: Building2 },
                { id: 'va_bni', name: 'BNI Virtual Account', desc: 'Verifikasi instan via BNI Mobile', icon: Building2 },
                { id: 'va_bri', name: 'BRI Virtual Account (BRIVA)', desc: 'Verifikasi instan via BRImo', icon: Building2 },
            ],
        },
        {
            category: 'E-Wallet',
            items: [
                { id: 'ewallet_gopay', name: 'GoPay', desc: 'Bayar cepat via aplikasi Gojek', icon: Wallet },
                { id: 'ewallet_ovo', name: 'OVO', desc: 'Notifikasi pembayaran instan di ponsel', icon: Wallet },
                { id: 'ewallet_dana', name: 'DANA', desc: 'Saldo DANA / DANA Protection', icon: Wallet },
            ],
        },
        {
            category: 'Kartu Kredit / Debit Online',
            items: [
                { id: 'credit_card', name: 'Kartu Kredit / Debit Visa & Mastercard', desc: 'Didukung 3D Secure Sandbox', icon: CreditCard },
            ],
        },
    ];

    return (
        <CinemaLayout>
            <Head title={`Konfirmasi Pemesanan - ${booking.showtime?.movie?.title ?? 'Cinema'}`} />

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10 overflow-x-clip">
                <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
                    
                    {/* Header with countdown timer */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
                        <div>
                            <span className="text-xs font-medium text-[#71717A] uppercase tracking-wider block mb-1">
                                Langkah 2 dari 3: Checkout & Pembayaran
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                Ringkasan Pemesanan Tiket
                            </h1>
                            <p className="text-[#A1A1AA] text-xs sm:text-sm mt-0.5">
                                Kode Booking: <span className="text-white font-mono font-semibold">{booking.booking_code}</span>
                            </p>
                        </div>

                        {/* Hold Timer Widget */}
                        <div className="flex items-center gap-3 bg-[#18181B] border border-[#27272A] rounded-xl px-4 py-2.5">
                            <Clock className="size-5 text-[#E50914]" />
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-medium">
                                    Sisa Waktu
                                </div>
                                <div className="text-xl font-bold font-mono text-white">
                                    {formatTimer(remainingSeconds)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Movie & Showtime Summary + Payment Methods (7 Cols) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Movie Card Details */}
                            <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-lg overflow-hidden shrink-0 bg-[#111114] border border-[#27272A]">
                                            <img
                                                src={booking.showtime?.movie?.poster_path ? (booking.showtime.movie.poster_path.startsWith('http') || booking.showtime.movie.poster_path.startsWith('/') ? booking.showtime.movie.poster_path : `/storage/${booking.showtime.movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                                alt={booking.showtime?.movie?.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 space-y-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                                                    {booking.showtime?.movie?.rating_age ?? '13+'}
                                                </span>
                                                <span className="text-xs text-[#71717A]">
                                                    {booking.showtime?.movie?.duration_minutes} Menit
                                                </span>
                                            </div>

                                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                                {booking.showtime?.movie?.title}
                                            </h2>

                                            <div className="space-y-1 text-xs text-[#A1A1AA]">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="size-3.5 text-zinc-400 shrink-0" />
                                                    <span>{booking.showtime?.cinema?.name} ({booking.showtime?.cinema?.city})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-3.5 text-zinc-400 shrink-0" />
                                                    <span>{booking.showtime?.studio?.name} • Tipe {(booking.showtime?.studio?.studio_type || (booking.showtime?.studio as any)?.type || 'regular').toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="size-3.5 text-zinc-400 shrink-0" />
                                                    <span>{booking.showtime?.show_date} • {booking.showtime?.start_time ? booking.showtime.start_time.substring(0, 5) : ''} WIB</span>
                                                </div>
                                            </div>

                                            {/* Chosen Seats */}
                                            <div className="pt-2 border-t border-[#27272A]">
                                                <div className="text-[11px] text-[#71717A] uppercase font-medium mb-1">
                                                    Kursi Terpilih ({booking.booking_seats?.length ?? 0}):
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {booking.booking_seats?.map((bs) => (
                                                        <span
                                                            key={bs.id}
                                                            className="px-2 py-0.5 rounded bg-[#111114] border border-[#27272A] text-xs font-mono text-zinc-200"
                                                        >
                                                            {bs.seat?.row_label}{bs.seat?.seat_number}
                                                            {bs.seat?.seat_type === 'vip' && ' (VIP)'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method Selector */}
                            <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-[#27272A]">
                                        <CreditCard className="size-4 text-[#E50914]" />
                                        <h3 className="text-sm font-semibold text-white">
                                            Pilih Metode Pembayaran
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {paymentMethods.map((grp) => (
                                            <div key={grp.category} className="space-y-2">
                                                <div className="text-xs font-medium text-[#71717A] uppercase tracking-wider">
                                                    {grp.category}
                                                </div>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {grp.items.map((m) => {
                                                        const Icon = m.icon;
                                                        const isSelected = selectedMethod === m.id;
                                                        return (
                                                            <div
                                                                key={m.id}
                                                                onClick={() => setSelectedMethod(m.id)}
                                                                className={`cursor-pointer rounded-lg p-3 border transition-colors flex items-center justify-between ${
                                                                    isSelected
                                                                        ? 'bg-zinc-900 border-[#E50914]'
                                                                        : 'bg-[#111114] border-[#27272A] hover:border-zinc-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#E50914] text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                                                                        <Icon className="size-4" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs font-semibold text-white">
                                                                                {m.name}
                                                                            </span>
                                                                            {m.popular && (
                                                                                <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[9px] font-medium text-zinc-300">
                                                                                    Rekomendasi
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[11px] text-[#71717A] mt-0.5">{m.desc}</p>
                                                                    </div>
                                                                </div>

                                                                <div className={`size-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E50914] bg-[#E50914]' : 'border-zinc-700'}`}>
                                                                    {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Right Column: Pricing Breakdown, Vouchers, & Action (5 Cols) */}
                        <div className="lg:col-span-5 space-y-6">
                            
                            {/* Voucher Card */}
                            <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Tag className="size-4 text-[#E50914]" />
                                        <h3 className="text-sm font-semibold text-white">
                                            Voucher & Promo Diskon
                                        </h3>
                                    </div>

                                    {booking.voucher ? (
                                        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                                                    <CheckCircle2 className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-white font-mono flex items-center gap-1.5">
                                                        <span>{booking.voucher.code}</span>
                                                        <span className="text-[10px] text-emerald-400 font-sans font-normal">• Aktif</span>
                                                    </div>
                                                    <div className="text-xs text-emerald-400 font-medium">
                                                        Hemat {formatRupiah(booking.discount_amount)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveVoucher}
                                                className="text-[#71717A] hover:text-red-400 h-8 px-2"
                                                title="Hapus voucher"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <form onSubmit={(e) => { e.preventDefault(); handleApplyVoucher(); }} className="flex gap-2">
                                                <Input
                                                    placeholder="Ketik kode promo (e.g. CINEPASS20)"
                                                    value={voucherCodeInput}
                                                    onChange={(e) => {
                                                        setVoucherCodeInput(e.target.value);
                                                        setVoucherError('');
                                                    }}
                                                    className="bg-[#111114] border-[#27272A] text-white uppercase text-xs h-9 rounded-lg"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={isApplyingVoucher || !voucherCodeInput.trim()}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 h-9 shrink-0 rounded-lg"
                                                >
                                                    {isApplyingVoucher ? '...' : 'Terapkan'}
                                                </Button>
                                            </form>

                                            {(voucherError || pageErrors.voucher_code) && (
                                                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                                                    <AlertCircle className="size-3.5 shrink-0 text-red-400" />
                                                    <span>{voucherError || pageErrors.voucher_code}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Available clickable vouchers */}
                                    {!booking.voucher && availableVouchers.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-[#27272A]">
                                            <div className="text-[11px] text-[#71717A] uppercase font-medium mb-1.5 flex items-center justify-between">
                                                <span>Promo Tersedia:</span>
                                                <span className="text-[10px] text-zinc-500">{availableVouchers.length} voucher</span>
                                            </div>
                                            <div className="space-y-1.5">
                                                {availableVouchers.map((v) => (
                                                    <div
                                                        key={v.id}
                                                        onClick={() => handleApplyVoucher(v.code)}
                                                        className="cursor-pointer bg-[#111114] hover:bg-zinc-800 border border-[#27272A] rounded-lg p-2.5 flex items-center justify-between transition-colors"
                                                    >
                                                        <div>
                                                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                                                <span className="text-emerald-400 font-mono">{v.code}</span>
                                                                <span>•</span>
                                                                <span className="text-[#A1A1AA]">{v.title}</span>
                                                            </div>
                                                            <div className="text-[10px] text-[#71717A]">
                                                                Min. {formatRupiah(v.min_purchase)}
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="outline" className="h-6 text-[11px] border-[#27272A] bg-[#18181B] text-zinc-300 hover:text-white rounded">
                                                            Pakai
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Price Breakdown Card */}
                            <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none">
                                <CardContent className="p-5 space-y-4">
                                    <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272A]">
                                        Rincian Pembayaran
                                    </h3>

                                    <div className="space-y-2 text-xs text-[#A1A1AA]">
                                        <div className="flex justify-between">
                                            <span>Harga Tiket ({booking.booking_seats?.length} kursi)</span>
                                            <span className="font-medium text-white">{formatRupiah(booking.subtotal)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Biaya Layanan & Pajak</span>
                                            <span className="font-medium text-white">{formatRupiah(booking.service_fee)}</span>
                                        </div>

                                        {booking.discount_amount > 0 && (
                                            <div className="flex justify-between text-emerald-400 font-medium">
                                                <span>Diskon Promo ({booking.voucher?.code})</span>
                                                <span>-{formatRupiah(booking.discount_amount)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-[#71717A] uppercase font-medium">
                                                Total Pembayaran
                                            </div>
                                            <div className="text-xl font-bold text-white font-mono">
                                                {formatRupiah(booking.total_amount)}
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleProceedToPayment}
                                            disabled={isPaying || remainingSeconds <= 0}
                                            className="bg-[#E50914] hover:bg-red-700 text-white font-medium px-5 h-10 text-xs sm:text-sm rounded-lg"
                                        >
                                            {isPaying ? (
                                                'Memproses...'
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    Bayar Sekarang <ChevronRight className="size-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="text-[11px] text-[#71717A] text-center flex items-center justify-center gap-1.5 pt-1">
                                        <Lock className="size-3 text-[#71717A]" />
                                        <span>Transaksi aman dengan enkripsi 256-bit SSL Sandbox</span>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                    </div>

                </div>
            </div>
        </CinemaLayout>
    );
}
