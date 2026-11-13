import { Head } from '@inertiajs/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Film,
    History,
    QrCode,
    Search,
    ShieldAlert,
    Ticket as TicketIcon,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';

interface ScanResult {
    status: 'valid' | 'already_used' | 'invalid';
    message: string;
    ticket?: {
        ticket_code: string;
        movie: string;
        cinema: string;
        studio: string;
        show_date: string;
        time: string;
        seat: string;
        seat_type: string;
        user: string;
    };
}

interface RecentScan {
    id: number;
    scanned_at: string;
    status: string;
    notes: string;
    staff: { name: string };
    ticket: {
        ticket_code: string;
        seat: {
            row_label: string;
            seat_number: number;
        };
        booking: {
            user: { name: string };
            showtime: {
                movie: { title: string };
                studio: {
                    name: string;
                    cinema: { name: string };
                };
            };
        };
    };
}

interface Props {
    recentScans: RecentScan[];
}

export default function AdminTicketScanner({
    recentScans: initialScans,
}: Props) {
    const [tokenInput, setTokenInput] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [recentScans, setRecentScans] = useState<RecentScan[]>(initialScans);

    const handleVerify = async (codeToVerify: string) => {
        if (!codeToVerify.trim() || isVerifying) return;

        setIsVerifying(true);
        try {
            const csrfToken = (
                document.querySelector(
                    'meta[name="csrf-token"]',
                ) as HTMLMetaElement
            )?.content;

            const res = await fetch('/admin/scanner/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ token: codeToVerify.trim() }),
            });

            const data = await res.json();
            setScanResult(data);
            setTokenInput('');
        } catch (err) {
            setScanResult({
                status: 'invalid',
                message: 'Gagal menghubungi server verifikasi tiket.',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        // Initialize HTML5 QR Code scanner
        const scanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            false,
        );

        scanner.render(
            (decodedText) => {
                handleVerify(decodedText);
            },
            (error) => {
                // Ignore background frame errors
            },
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, []);

    return (
        <AdminLayout>
            <Head title="Verifikasi Tiket QR Scanner - Admin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Pemindai Tiket Digital (QR Scanner)
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Pindai QR code tiket penonton via kamera perangkat atau
                        masukkan kode tiket secara manual.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Camera Scanner Card */}
                    <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <Camera className="size-4.5 text-red-500" />
                                Kamera Pemindai Aktif
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Arahkan kode QR tiket penonton tepat ke area
                                kamera di bawah ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                                <div
                                    id="reader"
                                    className="w-full text-zinc-300"
                                />
                            </div>

                            <div className="mt-4 border-t border-zinc-800/80 pt-4">
                                <div className="mb-2 text-xs font-semibold text-zinc-400">
                                    Atau Masukkan Kode Tiket / Token Manual:
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleVerify(tokenInput);
                                    }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        placeholder="Contoh: TCK-A04-X89K atau token..."
                                        value={tokenInput}
                                        onChange={(e) =>
                                            setTokenInput(e.target.value)
                                        }
                                        className="border-zinc-800 bg-zinc-950 font-mono text-xs uppercase"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={
                                            isVerifying || !tokenInput.trim()
                                        }
                                        className="shrink-0 bg-blue-600 font-medium text-white hover:bg-blue-700"
                                    >
                                        <Search className="mr-1.5 size-3.5" />
                                        Verifikasi
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Result Card */}
                    <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-white">
                                <TicketIcon className="size-4.5 text-amber-400" />
                                Hasil Validasi Pintu Studio
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Status kepemilikan dan keabsahan kursi penonton.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!scanResult ? (
                                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
                                    <QrCode className="mb-3 size-12 animate-pulse text-zinc-600" />
                                    <div className="text-sm font-medium text-zinc-400">
                                        Belum ada pemindaian
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Scan kode QR dari aplikasi tiket
                                        penonton untuk melihat detail kursi.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Status Alert Banner */}
                                    {scanResult.status === 'valid' && (
                                        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-400 shadow-lg shadow-emerald-950/30">
                                            <CheckCircle2 className="size-6 shrink-0" />
                                            <div>
                                                <div className="text-base font-bold">
                                                    TIKET VALID & RESMI
                                                </div>
                                                <div className="text-xs text-emerald-300">
                                                    {scanResult.message}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {scanResult.status === 'already_used' && (
                                        <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-400 shadow-lg shadow-amber-950/30">
                                            <ShieldAlert className="size-6 shrink-0" />
                                            <div>
                                                <div className="text-base font-bold">
                                                    TIKET SUDAH DIGUNAKAN
                                                </div>
                                                <div className="text-xs text-amber-300">
                                                    {scanResult.message}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {scanResult.status === 'invalid' && (
                                        <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-400 shadow-lg shadow-rose-950/30">
                                            <XCircle className="size-6 shrink-0" />
                                            <div>
                                                <div className="text-base font-bold">
                                                    TIKET TIDAK DITEMUKAN
                                                </div>
                                                <div className="text-xs text-rose-300">
                                                    {scanResult.message}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ticket Details Box */}
                                    {scanResult.ticket && (
                                        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                                            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                                <div>
                                                    <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
                                                        Kode Tiket
                                                    </span>
                                                    <div className="font-mono text-sm font-bold text-red-400">
                                                        {
                                                            scanResult.ticket
                                                                .ticket_code
                                                        }
                                                    </div>
                                                </div>
                                                <Badge className="bg-red-600 px-3 py-1 text-sm font-bold text-white">
                                                    KURSI{' '}
                                                    {scanResult.ticket.seat}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <span className="text-zinc-500">
                                                        Film:
                                                    </span>
                                                    <div className="mt-0.5 font-semibold text-white">
                                                        {
                                                            scanResult.ticket
                                                                .movie
                                                        }
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500">
                                                        Pelanggan:
                                                    </span>
                                                    <div className="mt-0.5 font-semibold text-white">
                                                        {scanResult.ticket.user}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500">
                                                        Bioskop & Teater:
                                                    </span>
                                                    <div className="mt-0.5 text-zinc-300">
                                                        {
                                                            scanResult.ticket
                                                                .cinema
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            scanResult.ticket
                                                                .studio
                                                        }
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-zinc-500">
                                                        Waktu Tayang:
                                                    </span>
                                                    <div className="mt-0.5 font-mono text-zinc-300">
                                                        {scanResult.ticket.time}{' '}
                                                        WIB
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Scans Audit Log */}
                <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base text-white">
                                Log Riwayat Pemindaian Terkini
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Audit jejak digital check-in tiket oleh petugas
                                di pintu studio.
                            </CardDescription>
                        </div>
                        <History className="size-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Waktu Scan
                                        </th>
                                        <th className="px-4 py-3">
                                            Kode Tiket
                                        </th>
                                        <th className="px-4 py-3">
                                            Film & Teater
                                        </th>
                                        <th className="px-4 py-3">Kursi</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Petugas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {recentScans.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-6 text-center text-zinc-500"
                                            >
                                                Belum ada riwayat pemindaian
                                                tiket hari ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentScans.map((scan) => (
                                            <tr
                                                key={scan.id}
                                                className="transition-colors hover:bg-zinc-800/30"
                                            >
                                                <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                                                    {new Date(
                                                        scan.scanned_at,
                                                    ).toLocaleTimeString(
                                                        'id-ID',
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-mono font-medium text-white">
                                                    {scan.ticket?.ticket_code}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-200">
                                                        {
                                                            scan.ticket?.booking
                                                                ?.showtime
                                                                ?.movie?.title
                                                        }
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {
                                                            scan.ticket?.booking
                                                                ?.showtime
                                                                ?.studio?.cinema
                                                                ?.name
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold text-red-400">
                                                        {
                                                            scan.ticket?.seat
                                                                ?.row_label
                                                        }
                                                        {
                                                            scan.ticket?.seat
                                                                ?.seat_number
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {scan.status === 'valid' ? (
                                                        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                                            VALID
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                                                            RE-SCAN
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-400">
                                                    {scan.staff?.name}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
