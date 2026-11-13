import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Download,
    Film,
    Filter,
    MapPin,
    Receipt,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import type { Movie } from '@/types';

interface CinemaReport {
    id: number;
    name: string;
    city: string;
    revenue: number;
    tickets_sold: number;
}

interface Props {
    metrics: {
        total_revenue: number;
        total_transactions: number;
        total_tickets: number;
    };
    cinemasReport: CinemaReport[];
    topMovies: (Movie & { tickets_sold: number })[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function AdminReportsIndex({
    metrics,
    cinemasReport,
    topMovies,
    filters,
}: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(
            '/admin/reports',
            {
                start_date: startDate,
                end_date: endDate,
            },
            { preserveState: true },
        );
    };

    const handleExportPdf = () => {
        window.open(
            `/admin/reports/export/pdf?start_date=${startDate}&end_date=${endDate}`,
            '_blank',
        );
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <AdminLayout>
            <Head title="Laporan & Export Finansial - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Laporan Finansial & Okupansi
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Analisis pendapatan kotor, tiket terjual, dan
                            performa cabang bioskop.
                        </p>
                    </div>

                    <Button
                        onClick={handleExportPdf}
                        className="bg-blue-600 font-medium text-white shadow-lg shadow-blue-900/30 hover:bg-blue-700"
                    >
                        <Download className="mr-1.5 size-4" />
                        Download Laporan PDF
                    </Button>
                </div>

                {/* Date Filter Bar */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="start_d"
                                    className="text-xs text-zinc-400"
                                >
                                    Dari Tanggal:
                                </Label>
                                <Input
                                    id="start_d"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="border-zinc-800 bg-zinc-950/60 text-xs text-white"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label
                                    htmlFor="end_d"
                                    className="text-xs text-zinc-400"
                                >
                                    Sampai Tanggal:
                                </Label>
                                <Input
                                    id="end_d"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="border-zinc-800 bg-zinc-950/60 text-xs text-white"
                                />
                            </div>

                            <Button
                                onClick={handleFilter}
                                variant="outline"
                                className="border-zinc-700 text-xs text-zinc-300"
                            >
                                <Filter className="mr-1.5 size-3.5" />
                                Terapkan Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Metrics */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-zinc-400 uppercase">
                                Total Pendapatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-400">
                                {formatCurrency(metrics.total_revenue)}
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Omzet tiket periode ini
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-zinc-400 uppercase">
                                Total Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">
                                {metrics.total_transactions.toLocaleString()}{' '}
                                Pesanan
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Transaksi lunas
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-zinc-400 uppercase">
                                Total Tiket Terjual
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-400">
                                {metrics.total_tickets.toLocaleString()} Tiket
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                Lembar tiket fisik/digital
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Cinema Performance Table */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-white">
                            Rincian Pendapatan per Cabang Bioskop
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Distribusi omzet tiket di setiap lokasi bioskop
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">
                                            Nama Bioskop
                                        </th>
                                        <th className="px-4 py-3">Kota</th>
                                        <th className="px-4 py-3">
                                            Tiket Terjual
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Pendapatan Kotor
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {cinemasReport.map((c) => (
                                        <tr
                                            key={c.id}
                                            className="transition-colors hover:bg-zinc-800/30"
                                        >
                                            <td className="px-4 py-3 font-semibold text-white">
                                                {c.name}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="size-3 text-red-500" />
                                                    <span>{c.city}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-medium text-zinc-200">
                                                {c.tickets_sold} Kursi
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-400">
                                                {formatCurrency(c.revenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
