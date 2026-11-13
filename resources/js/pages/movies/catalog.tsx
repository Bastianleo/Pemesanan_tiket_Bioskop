import { Head, Link, router } from '@inertiajs/react';
import { Film, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import MovieCard from '@/components/cinema/movie-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import CinemaLayout from '@/layouts/cinema-layout';
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
        genre?: string;
        status?: string;
        rating?: string;
        sort?: string;
    };
}

export default function MovieCatalog({ movies, genres, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedGenre, setSelectedGenre] = useState(filters.genre || 'all');
    const [selectedSort, setSelectedSort] = useState(filters.sort || 'latest');

    const applyFilterChange = (overrides: Partial<typeof filters>) => {
        const query: Record<string, string | undefined> = {
            ...filters,
            search: search.trim() || undefined,
            genre: selectedGenre !== 'all' ? selectedGenre : undefined,
            sort: selectedSort !== 'latest' ? selectedSort : undefined,
            ...overrides,
        };

        // Clean empty or undefined values
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get('/movies', query, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilterChange({ search: search.trim() || undefined });
    };

    const handleGenreSelect = (slug: string) => {
        setSelectedGenre(slug);
        applyFilterChange({ genre: slug !== 'all' ? slug : undefined });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedGenre('all');
        setSelectedSort('latest');
        router.get('/movies');
    };

    return (
        <CinemaLayout>
            <Head title="Film Bioskop - CinePass Cinema" />

            <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-8 xl:px-12">
                {/* Search & Genre Filter Toolbar */}
                <div className="flex flex-col gap-4 rounded-xl border border-[#27272A] bg-[#18181B] p-4">
                    {/* Top Row: Search Input & Sort/Count */}
                    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                        {/* Search Input Bar */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative max-w-md flex-1"
                        >
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#71717A]" />
                            <Input
                                placeholder="Cari judul film..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-full rounded-lg border-[#27272A] bg-[#111114] pr-8 pl-9 text-xs text-[#FAFAFA] placeholder:text-[#71717A] focus:border-[#E50914] focus:ring-0"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilterChange({
                                            search: undefined,
                                        });
                                    }}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#71717A] hover:text-white"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Right side: Count & Sort Dropdown */}
                        <div className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] sm:justify-end">
                            <span className="shrink-0">
                                Menampilkan{' '}
                                <strong className="text-white">
                                    {movies.total}
                                </strong>{' '}
                                film
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="hidden text-[#71717A] sm:inline">
                                    Urutan:
                                </span>
                                <Select
                                    value={selectedSort}
                                    onValueChange={(val) => {
                                        setSelectedSort(val);
                                        applyFilterChange({
                                            sort:
                                                val !== 'latest'
                                                    ? val
                                                    : undefined,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-36 rounded-lg border-[#27272A] bg-[#111114] text-xs text-zinc-200 sm:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-[#27272A] bg-[#18181B] text-zinc-200">
                                        <SelectItem value="latest">
                                            Rilis Terbaru
                                        </SelectItem>
                                        <SelectItem value="release_asc">
                                            Rilis Terlama
                                        </SelectItem>
                                        <SelectItem value="title_asc">
                                            Abjad (A - Z)
                                        </SelectItem>
                                        <SelectItem value="duration_desc">
                                            Durasi Terpanjang
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Genre Pills */}
                    {genres && genres.length > 0 && (
                        <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto border-t border-[#27272A] pt-2 pb-1">
                            <span className="mr-1.5 shrink-0 text-xs font-medium text-[#71717A]">
                                Genre:
                            </span>
                            <button
                                type="button"
                                onClick={() => handleGenreSelect('all')}
                                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    selectedGenre === 'all'
                                        ? 'bg-[#E50914] text-white'
                                        : 'border border-[#27272A] bg-[#111114] text-[#A1A1AA] hover:bg-zinc-800 hover:text-white'
                                }`}
                            >
                                Semua
                            </button>
                            {genres.map((g) => (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handleGenreSelect(g.slug)}
                                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                        selectedGenre === g.slug
                                            ? 'bg-[#E50914] text-white'
                                            : 'border border-[#27272A] bg-[#111114] text-[#A1A1AA] hover:bg-zinc-800 hover:text-white'
                                    }`}
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Movies Grid (Full Width) */}
                {movies.data.length === 0 ? (
                    <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-[#27272A] bg-[#111114] p-8 text-center text-[#A1A1AA]">
                        <Film className="mb-2.5 size-10 text-[#71717A]" />
                        <h3 className="text-sm font-semibold text-white">
                            Tidak Ada Film Ditemukan
                        </h3>
                        <p className="mt-1 max-w-sm text-xs text-[#71717A]">
                            Tidak ada data film yang sesuai dengan pencarian
                            atau genre terpilih.
                        </p>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            size="sm"
                            className="mt-4 border-[#27272A] bg-[#18181B] text-xs text-zinc-200 hover:text-white"
                        >
                            Reset Pencarian & Filter
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {movies.data.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}

                {/* Pagination Links */}
                {movies.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-6">
                        {movies.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-[#E50914] text-white'
                                        : link.url
                                          ? 'border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-zinc-700 hover:text-white'
                                          : 'cursor-not-allowed text-[#71717A]'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CinemaLayout>
    );
}
