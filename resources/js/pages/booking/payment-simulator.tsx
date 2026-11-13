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
    Shield,
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
        router.post(
            `/payment/simulator/${payment.payment_code}/simulate`,
            {
                action,
            },
            {
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    return (
        <CinemaLayout>
            <Head title={`Simulator Pembayaran - ${payment.payment_code}`} />

            <div className="min-h-screen bg-[#09090B] py-8 text-[#FAFAFA] lg:py-10">
                <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6">
                    {/* Sandbox Banner */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#27272A] bg-[#18181B] p-4">
                        <div className="flex items-center gap-3">
                            <div className="shrink-0 rounded-lg border border-[#27272A] bg-[#111114] p-2 text-zinc-300">
                                <Shield className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-xs font-semibold text-white">
                                    Simulasi Payment Gateway (Sandbox Mode)
                                </h2>
                                <p className="mt-0.5 text-[11px] text-[#A1A1AA]">
                                    Mensimulasikan proses pembayaran secara aman
                                    tanpa memotong saldo nyata.
                                </p>
                            </div>
                        </div>
                        <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-300">
                            SANDBOX
                        </span>
                    </div>

                    {/* Main Payment Card */}
                    <Card className="overflow-hidden rounded-xl border-[#27272A] bg-[#18181B] shadow-none">
                        {/* Header */}
                        <div className="flex flex-col justify-between gap-3 border-b border-[#27272A] p-5 sm:flex-row sm:items-center">
                            <div>
                                <span className="mb-0.5 block text-[10px] font-medium tracking-wider text-[#71717A] uppercase">
                                    Tagihan Pembayaran
                                </span>
                                <h1 className="text-base font-bold text-white sm:text-lg">
                                    {payment.booking?.showtime?.movie?.title ??
                                        'Tiket Bioskop'}
                                </h1>
                                <p className="mt-0.5 font-mono text-[11px] text-[#71717A]">
                                    No: {payment.payment_code}
                                </p>
                            </div>

                            <div className="text-left sm:text-right">
                                <div className="text-[10px] font-medium text-[#71717A] uppercase">
                                    Total Bayar
                                </div>
                                <div className="font-mono text-xl font-bold text-white">
                                    {formatRupiah(payment.amount)}
                                </div>
                            </div>
                        </div>

                        <CardContent className="space-y-5 p-5">
                            {/* Expiration Timer */}
                            <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#111114] p-3 text-xs">
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
                                <div className="space-y-3 py-2 text-center">
                                    <div className="inline-block rounded-xl bg-white p-3">
                                        {qrisDataUri ? (
                                            <img
                                                src={qrisDataUri}
                                                alt="QRIS Code"
                                                className="mx-auto h-48 w-48 object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-48 w-48 items-center justify-center text-zinc-400">
                                                <QrCode className="size-12" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="mx-auto max-w-sm text-xs text-[#A1A1AA]">
                                            Scan QRIS di atas menggunakan
                                            aplikasi m-Banking atau E-Wallet
                                            pilihan Anda.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(payment.payment_method || '').startsWith(
                                'va_',
                            ) && (
                                <div className="space-y-3 rounded-xl border border-[#27272A] bg-[#111114] p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-3.5 text-zinc-400" />
                                            <span className="text-xs font-semibold text-zinc-300 uppercase">
                                                {(payment.payment_method || '')
                                                    .replace('va_', '')
                                                    .toUpperCase()}{' '}
                                                Virtual Account
                                            </span>
                                        </div>
                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                                            Otomatis
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-[#27272A] bg-[#18181B] p-3">
                                        <span className="font-mono text-lg font-bold tracking-wider text-white">
                                            {payment.va_number ??
                                                '801239928192837'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleCopy(
                                                    payment.va_number ??
                                                        '801239928192837',
                                                )
                                            }
                                            className="h-7 rounded border-[#27272A] bg-[#111114] text-xs text-zinc-200 hover:bg-zinc-800"
                                        >
                                            {copied ? (
                                                <span className="flex items-center gap-1 text-white">
                                                    <Check className="size-3" />{' '}
                                                    Disalin
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Copy className="size-3" />{' '}
                                                    Salin
                                                </span>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="text-[11px] text-[#71717A]">
                                        Transfer tepat{' '}
                                        <strong>
                                            {formatRupiah(payment.amount)}
                                        </strong>{' '}
                                        ke nomor di atas.
                                    </p>
                                </div>
                            )}

                            {payment.payment_method.startsWith('ewallet_') && (
                                <div className="space-y-2 rounded-xl border border-[#27272A] bg-[#111114] p-4 text-center">
                                    <h3 className="text-xs font-semibold text-white capitalize">
                                        {payment.payment_method.replace(
                                            'ewallet_',
                                            '',
                                        )}{' '}
                                        Direct Pay
                                    </h3>
                                    <p className="mx-auto max-w-sm text-xs text-[#A1A1AA]">
                                        Permintaan otorisasi pembayaran telah
                                        dikirimkan ke aplikasi Anda. Klik tombol
                                        simulasi di bawah untuk menguji respon
                                        sistem.
                                    </p>
                                </div>
                            )}

                            {/* Booking details quick recap */}
                            <div className="space-y-1 border-t border-[#27272A] pt-3 text-xs text-[#A1A1AA]">
                                <div className="flex justify-between">
                                    <span>Bioskop & Studio:</span>
                                    <span className="text-white">
                                        {
                                            payment.booking?.showtime?.cinema
                                                ?.name
                                        }{' '}
                                        (
                                        {
                                            payment.booking?.showtime?.studio
                                                ?.name
                                        }
                                        )
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Jadwal:</span>
                                    <span className="text-white">
                                        {payment.booking?.showtime?.show_date} •{' '}
                                        {payment.booking?.showtime?.start_time
                                            ? payment.booking.showtime.start_time.substring(
                                                  0,
                                                  5,
                                              )
                                            : ''}{' '}
                                        WIB
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kursi:</span>
                                    <span className="font-mono text-white">
                                        {payment.booking?.booking_seats
                                            ?.map(
                                                (bs: BookingSeat) =>
                                                    `${bs.seat?.row_label}${bs.seat?.seat_number}`,
                                            )
                                            .join(', ')}
                                    </span>
                                </div>
                            </div>

                            {/* Action Simulation Box */}
                            <div className="space-y-3 border-t border-[#27272A] pt-4">
                                <div className="text-center text-[11px] font-medium tracking-wider text-[#71717A] uppercase">
                                    Aksi Simulasi Sandbox
                                </div>

                                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    <Button
                                        onClick={() => handleAction('success')}
                                        disabled={isSubmitting}
                                        className="h-9 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700"
                                    >
                                        <CheckCircle2 className="mr-1.5 size-3.5" />
                                        Sukses
                                    </Button>

                                    <Button
                                        onClick={() => handleAction('failed')}
                                        disabled={isSubmitting}
                                        className="h-9 rounded-lg bg-red-600 text-xs font-medium text-white hover:bg-red-700"
                                    >
                                        <XCircle className="mr-1.5 size-3.5" />
                                        Gagal
                                    </Button>

                                    <Button
                                        onClick={() => handleAction('expired')}
                                        disabled={isSubmitting}
                                        className="h-9 rounded-lg bg-amber-600 text-xs font-medium text-white hover:bg-amber-700"
                                    >
                                        <Clock className="mr-1.5 size-3.5" />
                                        Kadaluarsa
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="pt-2 text-center">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/')}
                            className="mx-auto h-8 text-xs text-[#71717A] hover:text-white"
                        >
                            <ArrowLeft className="mr-1 size-3.5" /> Kembali ke
                            Beranda
                        </Button>
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
