import { Head, Link, router } from '@inertiajs/react';
import { Edit, Film, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { Genre, Movie } from '@/types';

interface Props {
    movies: {
        data: Movie[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    genres: Genre[];
    filters: {
        search?: string;
        status?: string;
        genre_id?: string;
    };
}

export default function AdminMoviesIndex({ movies, genres, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [genreId, setGenreId] = useState(filters.genre_id || 'all');

    const handleFilter = (
        newSearch?: string,
        newStatus?: string,
        newGenre?: string,
    ) => {
        const s = newSearch !== undefined ? newSearch : search;
        const st = newStatus !== undefined ? newStatus : status;
        const g = newGenre !== undefined ? newGenre : genreId;

        router.get(
            '/admin/movies',
            {
                search: s || undefined,
                status: st !== 'all' ? st : undefined,
                genre_id: g !== 'all' ? g : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (movie: Movie) => {
        if (
            confirm(`Apakah Anda yakin ingin menghapus film '${movie.title}'?`)
        ) {
            router.delete(`/admin/movies/${movie.id}`);
        }
    };

    const getStatusBadge = (st: string) => {
        switch (st) {
            case 'now_showing':
                return (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        Now Showing
                    </Badge>
                );
            case 'upcoming':
                return (
                    <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                        Upcoming
                    </Badge>
                );
            case 'archived':
                return (
                    <Badge className="border-zinc-700 bg-zinc-800 text-zinc-400">
                        Archived
                    </Badge>
                );
            default:
                return <Badge>{st}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Film - Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Manajemen Katalog Film
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Kelola judul film, status tayang, poster, durasi,
                            dan trailer.
                        </p>
                    </div>

                    <Link href="/admin/movies/create">
                        <Button className="bg-red-600 text-white shadow-lg shadow-red-900/30 hover:bg-red-700">
                            <Plus className="mr-1.5 size-4" />
                            Tambah Film Baru
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
                                <Input
                                    placeholder="Cari judul film atau sutradara..."
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
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="now_showing">
                                        Sedang Tayang (Now Showing)
                                    </SelectItem>
                                    <SelectItem value="upcoming">
                                        Akan Datang (Upcoming)
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Diarsipkan (Archived)
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={genreId}
                                onValueChange={(val) => {
                                    setGenreId(val);
                                    handleFilter(undefined, undefined, val);
                                }}
                            >
                                <SelectTrigger className="border-zinc-800 bg-zinc-950/60 text-zinc-200">
                                    <SelectValue placeholder="Filter Genre" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="all">
                                        Semua Genre
                                    </SelectItem>
                                    {genres.map((g) => (
                                        <SelectItem
                                            key={g.id}
                                            value={g.id.toString()}
                                        >
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs text-zinc-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Film</th>
                                        <th className="px-4 py-3">Genre</th>
                                        <th className="px-4 py-3">
                                            Durasi & Rating
                                        </th>
                                        <th className="px-4 py-3">Rilis</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {movies.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-8 text-center text-zinc-500"
                                            >
                                                Tidak ada data film yang sesuai.
                                            </td>
                                        </tr>
                                    ) : (
                                        movies.data.map((m) => (
                                            <tr
                                                key={m.id}
                                                className="transition-colors hover:bg-zinc-800/30"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={m.poster_path}
                                                            alt={m.title}
                                                            className="h-16 w-11 shrink-0 rounded border border-zinc-800 bg-zinc-950 object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-white">
                                                                {m.title}
                                                            </div>
                                                            <div className="text-xs text-zinc-500">
                                                                Dir:{' '}
                                                                {m.director}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {m.genres?.map((g) => (
                                                            <span
                                                                key={g.id}
                                                                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300"
                                                            >
                                                                {g.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        {m.duration_minutes}{' '}
                                                        Menit
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="border-zinc-700 text-[10px] text-zinc-400"
                                                    >
                                                        {m.rating_age}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-zinc-400">
                                                    {m.release_date}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(m.status)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/movies/${m.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 border-zinc-700 bg-zinc-800/60 text-xs hover:border-zinc-600 hover:text-white"
                                                            >
                                                                <Edit className="size-3.5" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(m)
                                                            }
                                                            className="h-8 border-zinc-700 bg-zinc-800/60 text-xs text-red-400 hover:border-red-600 hover:bg-red-600/10 hover:text-red-300"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
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
            </div>
        </AdminLayout>
    );
}
