import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Clock, DollarSign, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { Cinema, Movie, Showtime, Studio } from '@/types';

interface Props {
    showtimes: {
        data: (Showtime & {
            movie: Movie;
            studio: Studio & { cinema: Cinema };
            booked_count: number;
        })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    movies: Movie[];
    cinemas: (Cinema & { studios: Studio[] })[];
    filters: {
        date: string;
        cinema_id?: string;
        movie_id?: string;
    };
}

export default function AdminShowtimesIndex({
    showtimes,
    movies,
    cinemas,
    filters,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCinemaId, setSelectedCinemaId] = useState(
        cinemas[0]?.id?.toString() || '',
    );

    const selectedCinema =
        cinemas.find((c) => c.id.toString() === selectedCinemaId) || cinemas[0];

    const { data, setData, post, processing, reset, errors } = useForm({
        movie_id: movies[0]?.id?.toString() || '',
        studio_id: selectedCinema?.studios[0]?.id?.toString() || '',
        show_date: filters.date,
        start_time: '14:00',
        base_price: 50000,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/showtimes', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (s: Showtime) => {
        if (
            confirm(
                `Hapus jadwal tayang '${s.movie?.title}' di ${s.studio?.name} jam ${s.start_time.substring(0, 5)}?`,
            )
        ) {
            router.delete(`/admin/showtimes/${s.id}`);
        }
    };

    const handleDateChange = (newDate: string) => {
        router.get(
            '/admin/showtimes',
            {
                date: newDate,
                cinema_id: filters.cinema_id,
                movie_id: filters.movie_id,
            },
            { preserveState: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Jadwal Tayang - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Jadwal Tayang Film
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Atur slot jam tayang studio dan harga tiket bioskop.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-blue-600 font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-1.5 size-4" />
                        Tambah Jadwal Tayang
                    </Button>
                </div>

                {/* Filter Date & Movie */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor="date_filter"
                                    className="text-xs text-zinc-400"
                                >
                                    Tanggal:
                                </Label>
                                <Input
                                    id="date_filter"
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) =>
                                        handleDateChange(e.target.value)
                                    }
                                    className="w-44 border-zinc-800 bg-zinc-950/60 text-xs text-white"
                                />
                            </div>

                            <div className="text-xs text-zinc-500">
                                Menampilkan {showtimes.total} penayangan
                                terdaftar pada tanggal terpilih.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Showtimes Table */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Film</th>
                                        <th className="px-4 py-3">
                                            Bioskop & Studio
                                        </th>
                                        <th className="px-4 py-3">
                                            Jam Tayang
                                        </th>
                                        <th className="px-4 py-3">
                                            Harga Tiket
                                        </th>
                                        <th className="px-4 py-3">
                                            Kursi Terjual
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {showtimes.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-zinc-500"
                                            >
                                                Tidak ada jadwal tayang pada
                                                tanggal ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        showtimes.data.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="transition-colors hover:bg-zinc-800/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                s.movie
                                                                    .poster_path
                                                            }
                                                            alt={s.movie.title}
                                                            className="h-14 w-10 shrink-0 rounded border border-zinc-800 bg-zinc-950 object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-white">
                                                                {s.movie.title}
                                                            </div>
                                                            <div className="text-xs text-zinc-500">
                                                                Durasi:{' '}
                                                                {
                                                                    s.movie
                                                                        .duration_minutes
                                                                }
                                                                m •{' '}
                                                                {
                                                                    s.movie
                                                                        .rating_age
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-zinc-200">
                                                        {s.studio.cinema.name}
                                                    </div>
                                                    <div className="text-xs text-zinc-400">
                                                        {s.studio.name} (
                                                        {(
                                                            s.studio
                                                                .studio_type ||
                                                            s.studio.type ||
                                                            'regular'
                                                        ).toUpperCase()}
                                                        )
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-white">
                                                        <Clock className="size-3.5 text-red-500" />
                                                        <span>
                                                            {s.start_time.substring(
                                                                0,
                                                                5,
                                                            )}{' '}
                                                            -{' '}
                                                            {s.end_time.substring(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-emerald-400">
                                                    Rp{' '}
                                                    {s.base_price.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={
                                                            s.booked_count > 0
                                                                ? 'border-red-500/20 bg-red-500/10 text-red-400'
                                                                : 'bg-zinc-800 text-zinc-400'
                                                        }
                                                    >
                                                        {s.booked_count} Kursi
                                                        Terisi
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(s)
                                                        }
                                                        className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Showtime Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Buat Jadwal Tayang Baru</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Sistem otomatis memvalidasi jadwal agar tidak
                                terjadi bentrok studio.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleCreate}
                            className="space-y-4 pt-2"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="movie_select">
                                    Pilih Film *
                                </Label>
                                <Select
                                    value={data.movie_id}
                                    onValueChange={(val) =>
                                        setData('movie_id', val)
                                    }
                                >
                                    <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                        <SelectValue placeholder="Pilih Film" />
                                    </SelectTrigger>
                                    <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                        {movies.map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={m.id.toString()}
                                            >
                                                {m.title} ({m.duration_minutes}{' '}
                                                Menit)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.movie_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cinema_studio">
                                    Pilih Lokasi & Studio *
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        value={selectedCinemaId}
                                        onValueChange={(cId) => {
                                            setSelectedCinemaId(cId);
                                            const cinemaObj = cinemas.find(
                                                (c) => c.id.toString() === cId,
                                            );
                                            if (
                                                cinemaObj &&
                                                cinemaObj.studios.length > 0
                                            ) {
                                                setData(
                                                    'studio_id',
                                                    cinemaObj.studios[0].id.toString(),
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                            {cinemas.map((c) => (
                                                <SelectItem
                                                    key={c.id}
                                                    value={c.id.toString()}
                                                >
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={data.studio_id}
                                        onValueChange={(val) =>
                                            setData('studio_id', val)
                                        }
                                    >
                                        <SelectTrigger className="border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                            {selectedCinema?.studios?.map(
                                                (st) => (
                                                    <SelectItem
                                                        key={st.id}
                                                        value={st.id.toString()}
                                                    >
                                                        {st.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={errors.studio_id} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="show_date">
                                        Tanggal Tayang *
                                    </Label>
                                    <Input
                                        id="show_date"
                                        type="date"
                                        value={data.show_date}
                                        onChange={(e) =>
                                            setData('show_date', e.target.value)
                                        }
                                        className="border-zinc-800 bg-zinc-900 text-xs"
                                        required
                                    />
                                    <InputError message={errors.show_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">
                                        Jam Mulai (HH:MM) *
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData(
                                                'start_time',
                                                e.target.value,
                                            )
                                        }
                                        className="border-zinc-800 bg-zinc-900 text-xs"
                                        required
                                    />
                                    <InputError message={errors.start_time} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="base_price">
                                    Harga Dasar Tiket (Rp) *
                                </Label>
                                <Input
                                    id="base_price"
                                    type="number"
                                    step="5000"
                                    value={data.base_price}
                                    onChange={(e) =>
                                        setData(
                                            'base_price',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="border-zinc-800 bg-zinc-900"
                                    required
                                />
                                <InputError message={errors.base_price} />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="border-zinc-800"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                                >
                                    Simpan Jadwal
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
