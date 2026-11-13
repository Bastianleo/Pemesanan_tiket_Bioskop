import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { type FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { Genre, Movie } from '@/types';

interface Props {
    movie: Movie | null;
    genres: Genre[];
}

export default function AdminMovieForm({ movie, genres }: Props) {
    const isEdit = !!movie;

    const { data, setData, post, put, processing, errors } = useForm({
        title: movie?.title || '',
        synopsis: movie?.synopsis || '',
        duration_minutes: movie?.duration_minutes || 120,
        rating_age: movie?.rating_age || '13+',
        director: movie?.director || '',
        cast: movie?.cast || '',
        language: movie?.language || 'Indonesia',
        subtitle: movie?.subtitle || 'Indonesia',
        trailer_url: movie?.trailer_url || '',
        poster_path: movie?.poster_path || '',
        banner_path: movie?.banner_path || '',
        release_date: movie?.release_date ? movie.release_date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        status: movie?.status || 'now_showing',
        genre_ids: movie?.genres?.map((g) => g.id) || [],
    });

    const toggleGenre = (genreId: number) => {
        if (data.genre_ids.includes(genreId)) {
            setData('genre_ids', data.genre_ids.filter((id) => id !== genreId));
        } else {
            setData('genre_ids', [...data.genre_ids, genreId]);
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/movies/${movie.id}`);
        } else {
            post('/admin/movies');
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit Film: ${movie.title}` : 'Tambah Film Baru'} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/movies">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-zinc-800 bg-zinc-900/60">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {isEdit ? `Edit Film: ${movie.title}` : 'Tambah Film Baru'}
                            </h1>
                            <p className="text-sm text-zinc-400">
                                Lengkapi informasi sinopsis, poster, usia rating, dan durasi.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader>
                            <CardTitle className="text-base text-white">Informasi Dasar Film</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul Film *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Dune: Part Two"
                                    className="bg-zinc-950/60 border-zinc-800"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="synopsis">Sinopsis Lengkap *</Label>
                                <textarea
                                    id="synopsis"
                                    rows={4}
                                    value={data.synopsis}
                                    onChange={(e) => setData('synopsis', e.target.value)}
                                    placeholder="Tuliskan jalan cerita atau rangkuman film..."
                                    className="w-full rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                    required
                                />
                                <InputError message={errors.synopsis} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Durasi (Menit) *</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                        className="bg-zinc-950/60 border-zinc-800"
                                        required
                                    />
                                    <InputError message={errors.duration_minutes} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rating_age">Rating Usia *</Label>
                                    <Select
                                        value={data.rating_age}
                                        onValueChange={(val: any) => setData('rating_age', val)}
                                    >
                                        <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectItem value="SU">Semua Umur (SU)</SelectItem>
                                            <SelectItem value="13+">Remaja (13+)</SelectItem>
                                            <SelectItem value="17+">Dewasa (17+)</SelectItem>
                                            <SelectItem value="21+">21+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.rating_age} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status Penayangan *</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val: any) => setData('status', val)}
                                    >
                                        <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectItem value="now_showing">Sedang Tayang (Now Showing)</SelectItem>
                                            <SelectItem value="upcoming">Akan Datang (Upcoming)</SelectItem>
                                            <SelectItem value="archived">Diarsipkan (Archived)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="director">Sutradara *</Label>
                                    <Input
                                        id="director"
                                        value={data.director}
                                        onChange={(e) => setData('director', e.target.value)}
                                        className="bg-zinc-950/60 border-zinc-800"
                                        required
                                    />
                                    <InputError message={errors.director} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="release_date">Tanggal Rilis *</Label>
                                    <Input
                                        id="release_date"
                                        type="date"
                                        value={data.release_date}
                                        onChange={(e) => setData('release_date', e.target.value)}
                                        className="bg-zinc-950/60 border-zinc-800"
                                        required
                                    />
                                    <InputError message={errors.release_date} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cast">Pemeran Utama (Cast) *</Label>
                                <Input
                                    id="cast"
                                    value={data.cast}
                                    onChange={(e) => setData('cast', e.target.value)}
                                    placeholder="Contoh: Timothée Chalamet, Zendaya, Rebecca Ferguson"
                                    className="bg-zinc-950/60 border-zinc-800"
                                    required
                                />
                                <InputError message={errors.cast} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="language">Bahasa Audio *</Label>
                                    <Input
                                        id="language"
                                        value={data.language}
                                        onChange={(e) => setData('language', e.target.value)}
                                        className="bg-zinc-950/60 border-zinc-800"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subtitle">Subtitle *</Label>
                                    <Input
                                        id="subtitle"
                                        value={data.subtitle}
                                        onChange={(e) => setData('subtitle', e.target.value)}
                                        className="bg-zinc-950/60 border-zinc-800"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Genres Selection */}
                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader>
                            <CardTitle className="text-base text-white">Pilih Genre Film *</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {genres.map((g) => {
                                    const selected = data.genre_ids.includes(g.id);
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => toggleGenre(g.id)}
                                            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                                                selected
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40 ring-2 ring-red-500'
                                                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {g.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.genre_ids} className="mt-2" />
                        </CardContent>
                    </Card>

                    {/* Media & Posters */}
                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader>
                            <CardTitle className="text-base text-white">Media, Poster, & Trailer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="poster_path">URL Gambar Poster (Vertikal) *</Label>
                                <Input
                                    id="poster_path"
                                    value={data.poster_path}
                                    onChange={(e) => setData('poster_path', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="bg-zinc-950/60 border-zinc-800"
                                    required
                                />
                                <InputError message={errors.poster_path} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="banner_path">URL Banner Horizontal (Opsional)</Label>
                                <Input
                                    id="banner_path"
                                    value={data.banner_path}
                                    onChange={(e) => setData('banner_path', e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="bg-zinc-950/60 border-zinc-800"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="trailer_url">URL Trailer YouTube (Opsional)</Label>
                                <Input
                                    id="trailer_url"
                                    value={data.trailer_url}
                                    onChange={(e) => setData('trailer_url', e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="bg-zinc-950/60 border-zinc-800"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/admin/movies">
                            <Button type="button" variant="outline" className="border-zinc-800 text-zinc-300">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                            <Save className="mr-2 size-4" />
                            {isEdit ? 'Simpan Perubahan' : 'Terbitkan Film'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
