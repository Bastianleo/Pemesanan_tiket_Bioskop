import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import CinemaLayout from '@/layouts/cinema-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    CheckCircle2,
    XCircle,
    Clock,
    QrCode,
    CreditCard,
    Building2,
    Copy,
    Check,
    ArrowLeft,
    AlertTriangle,
    Shield
} from 'lucide-react';
import { Payment, BookingSeat } from '@/types/cinema';

interface Props {
    payment: Payment;
    qrisDataUri?: string | null;
}

export default function PaymentSimulatorPage({ payment, qrisDataUri }: Props) {
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate remaining seconds
    const calculateRemaining = () => {
        if (!payment.expired_at) return 600;
        const target = new Date(payment.expired_at).getTime();
        const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
        return diff;
    };

    const [remaining, setRemaining] = useState(calculateRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            const rem = calculateRemaining();
            setRemaining(rem);
            if (rem <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [payment.expired_at]);

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

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleAction = (action: 'success' | 'failed' | 'expired') => {
        setIsSubmitting(true);
        router.post(`/payment/simulator/${payment.payment_code}/simulate`, {
            action,
        }, {
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <CinemaLayout>
            <Head title={`Simulator Pembayaran - ${payment.payment_code}`} />

            <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 lg:py-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
                    
                    {/* Sandbox Banner */}
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#111114] border border-[#27272A] text-zinc-300 rounded-lg shrink-0">
                                <Shield className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-white">
                                    Simulasi Payment Gateway (Sandbox Mode)
                                </h2>
                                <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                                    Mensimulasikan proses pembayaran secara aman tanpa memotong saldo nyata.
                                </p>
                            </div>
                        </div>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300">
                            SANDBOX
                        </span>
                    </div>

                    {/* Main Payment Card */}
                    <Card className="bg-[#18181B] border-[#27272A] rounded-xl shadow-none overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-5 border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider block mb-0.5">
                                    Tagihan Pembayaran
                                </span>
                                <h1 className="text-base sm:text-lg font-bold text-white">
                                    {payment.booking?.showtime?.movie?.title ?? 'Tiket Bioskop'}
                                </h1>
                                <p className="text-[11px] text-[#71717A] font-mono mt-0.5">
                                    No: {payment.payment_code}
                                </p>
                            </div>

                            <div className="text-left sm:text-right">
                                <div className="text-[10px] text-[#71717A] uppercase font-medium">
                                    Total Bayar
                                </div>
                                <div className="text-xl font-bold text-white font-mono">
                                    {formatRupiah(payment.amount)}
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-5 space-y-5">
                            
                            {/* Expiration Timer */}
                            <div className="bg-[#111114] border border-[#27272A] rounded-lg p-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-[#A1A1AA]">
                                    <Clock className="size-3.5 text-zinc-400" />
                                    <span>Batas waktu pembayaran:</span>
                                </div>
                                <span className="font-mono font-bold text-white">
                                    {formatTimer(remaining)}
                                </span>
                            </div>

                            {/* Payment Method Specific Content */}
                            {payment.payment_method === 'qris' && (
                                <div className="text-center space-y-3 py-2">
                                    <div className="inline-block p-3 bg-white rounded-xl">
                                        {qrisDataUri ? (
                                            <img
                                                src={qrisDataUri}
                                                alt="QRIS Code"
                                                className="w-48 h-48 mx-auto object-contain"
                                            />
                                        ) : (
                                            <div className="w-48 h-48 flex items-center justify-center text-zinc-400">
                                                <QrCode className="size-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                                            Scan QRIS di atas menggunakan aplikasi m-Banking atau E-Wallet pilihan Anda.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(payment.payment_method || '').startsWith('va_') && (
                                <div className="bg-[#111114] border border-[#27272A] rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-3.5 text-zinc-400" />
                                            <span className="text-xs font-semibold uppercase text-zinc-300">
                                                {(payment.payment_method || '').replace('va_', '').toUpperCase()} Virtual Account
                                            </span>
                                        </div>
                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                            Otomatis
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between bg-[#18181B] border border-[#27272A] rounded-lg p-3">
                                        <span className="text-lg font-mono font-bold text-white tracking-wider">
                                            {payment.va_number ?? '801239928192837'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopy(payment.va_number ?? '801239928192837')}
                                            className="text-xs border-[#27272A] bg-[#111114] hover:bg-zinc-800 text-zinc-200 h-7 rounded"
                                        >
                                            {copied ? (
                                                <span className="flex items-center gap-1 text-white">
                                                    <Check className="size-3" /> Disalin
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Copy className="size-3" /> Salin
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[11px] text-[#71717A]">
                                        Transfer tepat <strong>{formatRupiah(payment.amount)}</strong> ke nomor di atas.
                                    </p>
                                </div>
                            )}

                            {payment.payment_method.startsWith('ewallet_') && (
                                <div className="bg-[#111114] border border-[#27272A] rounded-xl p-4 space-y-2 text-center">
                                    <h3 className="text-xs font-semibold text-white capitalize">
                                        {payment.payment_method.replace('ewallet_', '')} Direct Pay
                                    </h3>
                                    <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
                                        Permintaan otorisasi pembayaran telah dikirimkan ke aplikasi Anda. Klik tombol simulasi di bawah untuk menguji respon sistem.
                                    </p>
                                </div>
                            )}

                            {/* Booking details quick recap */}
                            <div className="pt-3 border-t border-[#27272A] text-xs text-[#A1A1AA] space-y-1">
                                <div className="flex justify-between">
                                    <span>Bioskop & Studio:</span>
                                    <span className="text-white">
                                        {payment.booking?.showtime?.cinema?.name} ({payment.booking?.showtime?.studio?.name})
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Jadwal:</span>
                                    <span className="text-white">
                                        {payment.booking?.showtime?.show_date} • {payment.booking?.showtime?.start_time ? payment.booking.showtime.start_time.substring(0, 5) : ''} WIB
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kursi:</span>
                                    <span className="font-mono text-white">
                                        {payment.booking?.booking_seats?.map((bs: BookingSeat) => `${bs.seat?.row_label}${bs.seat?.seat_number}`).join(', ')}
                                    </span>
                                </div>
                            </div>

                            {/* Action Simulation Box */}
                            <div className="pt-4 border-t border-[#27272A] space-y-3">
                                <div className="text-[11px] font-medium text-[#71717A] text-center uppercase tracking-wider">
                                    Aksi Simulasi Sandbox
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <Button
                                        onClick={() => handleAction('success')}
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg"
                                    >
                                        <CheckCircle2 className="size-3.5 mr-1.5" />
                                        Sukses
                                    </Button>

                                    <Button
                                        onClick={() => handleAction('failed')}
                                        disabled={isSubmitting}
                                        className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs h-9 rounded-lg"
                                    >
                                        <XCircle className="size-3.5 mr-1.5" />
                                        Gagal
                                    </Button>

                                    <Button
                                        onClick={() => handleAction('expired')}
                                        disabled={isSubmitting}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-9 rounded-lg"
                                    >
                                        <Clock className="size-3.5 mr-1.5" />
                                        Kadaluarsa
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="text-center pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/')}
                            className="text-xs text-[#71717A] hover:text-white mx-auto h-8"
                        >
                            <ArrowLeft className="size-3.5 mr-1" /> Kembali ke Beranda
                        </Button>
                    </div>

                </div>
            </div>
        </CinemaLayout>
    );
}
