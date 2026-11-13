import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Calendar,
    Clapperboard,
    DollarSign,
    Film,
    Sparkles,
    Ticket,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    metrics: {
        total_revenue: number;
        total_bookings: number;
        total_tickets: number;
        total_users: number;
        active_movies: number;
        today_showtimes: number;
        occupancy_rate: number;
    };
    chartData: Array<{
        date: string;
        revenue: number;
        bookings: number;
    }>;
    popularMovies: Array<{
        id: number;
        title: string;
        poster_path: string;
        rating_age: string;
        total_sold: number;
    }>;
    recentBookings: Array<{
        id: number;
        booking_code: string;
        total_amount: number;
        status: string;
        created_at: string;
        user: {
            name: string;
            email: string;
        };
        showtime: {
            start_time: string;
            movie: {
                title: string;
            };
            studio: {
                name: string;
                cinema: {
                    name: string;
                };
            };
        };
        payment?: {
            payment_method: string;
            status: string;
        };
    }>;
}

export default function AdminDashboard({
    metrics,
    chartData,
    popularMovies,
    recentBookings,
}: Props) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const metricCards = [
        {
            title: 'Total Pendapatan',
            value: formatCurrency(metrics.total_revenue),
            description: 'Akumulasi transaksi berhasil',
            icon: DollarSign,
        },
        {
            title: 'Total Transaksi',
            value: metrics.total_bookings.toLocaleString(),
            description: 'Seluruh pesanan masuk',
            icon: Ticket,
        },
        {
            title: 'Okupansi Studio',
            value: `${metrics.occupancy_rate}%`,
            description: 'Keterisian kursi hari ini',
            icon: Activity,
        },
        {
            title: 'Penayangan Hari Ini',
            value: `${metrics.today_showtimes} Jadwal`,
            description: `${metrics.active_movies} Film aktif tayang`,
            icon: Calendar,
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-white border border-zinc-700">Lunas</span>;
            case 'pending':
                return <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-800">Menunggu</span>;
            case 'cancelled':
                return <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-[#71717A] border border-zinc-800">Dibatalkan</span>;
            default:
                return <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-[#71717A] border border-zinc-800">{status}</span>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard - CinePass" />

            <div className="space-y-6">
                {/* Header Welcome */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#27272A] pb-5">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            Executive Dashboard
                        </h1>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">
                            Ringkasan performa penjualan tiket, jadwal studio, dan aktivitas bioskop.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/admin/scanner">
                            <Button className="h-8.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg">
                                <Sparkles className="mr-1.5 size-3.5" />
                                Scanner Pintu Masuk
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {metricCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <Card key={idx} className="border-[#27272A] bg-[#18181B] rounded-xl shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wider text-[#71717A]">
                                        {card.title}
                                    </CardTitle>
                                    <div className="rounded-lg border border-[#27272A] bg-[#111114] p-1.5 text-zinc-400">
                                        <Icon className="size-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                                        {card.value}
                                    </div>
                                    <p className="mt-1 text-xs text-[#71717A]">
                                        {card.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts & Popular Movies Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Trend Chart (2 columns) */}
                    <Card className="border-[#27272A] bg-[#18181B] rounded-xl shadow-none lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-sm font-semibold text-white">
                                    Tren Pendapatan 7 Hari Terakhir
                                </CardTitle>
                                <CardDescription className="text-xs text-[#71717A]">
                                    Grafik omzet harian tiket bioskop
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#E50914" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#71717A"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#71717A"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `Rp ${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181B',
                                                borderColor: '#27272A',
                                                borderRadius: '8px',
                                                color: '#FAFAFA',
                                                fontSize: '12px',
                                            }}
                                            formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Pendapatan']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#E50914"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Movies Widget */}
                    <Card className="border-[#27272A] bg-[#18181B] rounded-xl shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold text-white">
                                    Film Terpopuler
                                </CardTitle>
                                <CardDescription className="text-xs text-[#71717A]">
                                    Berdasarkan jumlah tiket terjual
                                </CardDescription>
                            </div>
                            <Film className="size-4 text-[#71717A]" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {popularMovies.map((movie, idx) => (
                                <div key={movie.id} className="flex items-center gap-3">
                                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-[#111114] border border-[#27272A]">
                                        <img
                                            src={movie.poster_path ? (movie.poster_path.startsWith('http') || movie.poster_path.startsWith('/') ? movie.poster_path : `/storage/${movie.poster_path}`) : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'}
                                            alt={movie.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute top-0 right-0 rounded bg-black/80 px-1 text-[8px] font-bold text-white">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-semibold text-white">
                                            {movie.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                                            <span>{movie.rating_age}</span>
                                            <span>•</span>
                                            <span>{movie.total_sold} tiket</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions Table */}
                <Card className="border-[#27272A] bg-[#18181B] rounded-xl shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-sm font-semibold text-white">
                                Transaksi Pemesanan Terbaru
                            </CardTitle>
                            <CardDescription className="text-xs text-[#71717A]">
                                Aktivitas pemesanan tiket bioskop dari pelanggan
                            </CardDescription>
                        </div>
                        <Link href="/admin/bookings">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-[#A1A1AA] hover:text-white">
                                Semua
                                <ArrowUpRight className="ml-1 size-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-[#A1A1AA]">
                                <thead className="border-b border-[#27272A] text-[11px] text-[#71717A] uppercase">
                                    <tr>
                                        <th className="py-2.5 px-3">Kode Booking</th>
                                        <th className="py-2.5 px-3">Pelanggan</th>
                                        <th className="py-2.5 px-3">Film & Bioskop</th>
                                        <th className="py-2.5 px-3">Studio</th>
                                        <th className="py-2.5 px-3">Total</th>
                                        <th className="py-2.5 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]">
                                    {recentBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-6 text-center text-[#71717A]">
                                                Belum ada transaksi pemesanan.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentBookings.map((b) => (
                                            <tr key={b.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="py-3 px-3 font-mono font-medium text-white">
                                                    {b.booking_code}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-medium text-zinc-100">{b.user.name}</div>
                                                    <div className="text-[11px] text-[#71717A]">{b.user.email}</div>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="font-medium text-zinc-100">
                                                        {b.showtime.movie.title}
                                                    </div>
                                                    <div className="text-[11px] text-[#71717A]">
                                                        {b.showtime.studio.cinema.name}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-zinc-400">
                                                    {b.showtime.studio.name} ({b.showtime.start_time.substring(0, 5)})
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-white font-mono">
                                                    {formatCurrency(b.total_amount)}
                                                </td>
                                                <td className="py-3 px-3">
                                                    {getStatusBadge(b.status)}
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
