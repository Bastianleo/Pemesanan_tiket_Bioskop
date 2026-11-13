import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clapperboard,
    Copy,
    Film,
    Flame,
    Layers,
    MapPin,
    Search,
    Sparkles,
    Tag,
    Ticket,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import HeroSlider from '@/components/cinema/hero-slider';
import MovieCard from '@/components/cinema/movie-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CinemaLayout from '@/layouts/cinema-layout';
import type { Cinema, Genre, Movie, Voucher } from '@/types';

interface Props {
    heroMovies: Movie[];
    nowShowing: Movie[];
    upcoming: Movie[];
    promos: Voucher[];
    cinemas: (Cinema & { studios_count: number })[];
    genres: Genre[];
}

export default function Welcome({
    heroMovies,
    nowShowing,
    upcoming,
    promos,
    cinemas,
    genres,
}: Props) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyVoucher = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Kode voucher '${code}' berhasil disalin!`);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    return (
        <CinemaLayout>
            <Head title="CinePass Cinema - Pemesanan Tiket Bioskop Modern" />

            {/* Hero Blockbuster Slider */}
            <HeroSlider movies={heroMovies} />

            <div className="mx-auto w-full max-w-[1600px] space-y-16 px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
                {/* Genre Quick Filter Bar */}
                <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
                    <span className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#71717A]">
                        Genre:
                    </span>
                    <Link href="/movies">
                        <span className="cursor-pointer rounded-lg bg-[#E50914] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700">
                            Semua Film
                        </span>
                    </Link>
                    {genres.map((g) => (
                        <Link key={g.id} href={`/movies?genre=${g.slug}`}>
                            <span className="inline-block shrink-0 cursor-pointer rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-1 text-xs font-medium text-[#A1A1AA] transition-colors hover:border-zinc-700 hover:text-white">
                                {g.name}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Section: Sedang Tayang (Now Showing) */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-1 border-b border-[#27272A] pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-[#FAFAFA] sm:text-2xl">
                                Sedang Tayang di Bioskop
                            </h2>
                            <p className="mt-0.5 text-xs text-[#A1A1AA] sm:text-sm">
                                Pilih jadwal tayang dan pesan kursi bioskop Anda
                                sekarang.
                            </p>
                        </div>

                        <Link href="/movies?status=now_showing">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 p-0 text-xs text-[#A1A1AA] hover:bg-transparent hover:text-white"
                            >
                                Lihat Semua ({nowShowing.length})
                                <ArrowRight className="ml-1.5 size-3.5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {nowShowing.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>

                {/* Section: Promo & Voucher */}
                {promos.length > 0 && (
                    <section className="space-y-6 rounded-xl border border-[#27272A] bg-[#111114] p-6 sm:p-8">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[#FAFAFA]">
                                    Promo & Voucher Bioskop
                                </h3>
                                <p className="mt-0.5 text-xs text-[#A1A1AA]">
                                    Gunakan kode voucher saat checkout untuk
                                    menikmati potongan harga tiket.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {promos.map((p) => (
                                <Card
                                    key={p.id}
                                    className="border border-[#27272A] bg-[#18181B] transition-colors hover:border-zinc-700"
                                >
                                    <CardContent className="space-y-3 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="rounded border border-[#27272A] bg-black/60 px-2 py-1 font-mono text-xs font-semibold tracking-wider text-white">
                                                {p.code}
                                            </span>
                                            <span className="text-[11px] font-medium text-red-400">
                                                {p.discount_type ===
                                                'percentage'
                                                    ? `Diskon ${p.discount_value}%`
                                                    : `Hemat Rp ${p.discount_value.toLocaleString('id-ID')}`}
                                            </span>
                                        </div>

                                        <div className="text-xs font-semibold text-zinc-100">
                                            {p.title}
                                        </div>
                                        <p className="line-clamp-2 text-[11px] text-[#A1A1AA]">
                                            {p.description}
                                        </p>

                                        <div className="flex items-center justify-between border-t border-[#27272A] pt-3">
                                            <span className="text-[11px] text-[#71717A]">
                                                Min. Beli: Rp{' '}
                                                {p.min_purchase.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleCopyVoucher(p.code)
                                                }
                                                className="h-7 border-[#27272A] bg-zinc-900 text-[11px] text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                            >
                                                {copiedCode === p.code ? (
                                                    <>
                                                        <CheckCircle2 className="mr-1 size-3 text-red-400" />
                                                        Tersalin
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="mr-1 size-3 text-zinc-400" />
                                                        Salin Kode
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Film Segera Tayang (Upcoming) */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-1 border-b border-[#27272A] pb-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-[#FAFAFA] sm:text-2xl">
                                Segera Tayang (Coming Soon)
                            </h2>
                            <p className="mt-0.5 text-xs text-[#A1A1AA] sm:text-sm">
                                Nantikan film-film spektakuler yang akan segera
                                hadir di layar lebar.
                            </p>
                        </div>

                        <Link href="/movies?status=upcoming">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 p-0 text-xs text-[#A1A1AA] hover:bg-transparent hover:text-white"
                            >
                                Lihat Semua ({upcoming.length})
                                <ArrowRight className="ml-1.5 size-3.5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {upcoming.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                </section>

                {/* Section: Teater Studio Experience */}
                <section className="space-y-6 rounded-xl border border-[#27272A] bg-[#111114] p-6 sm:p-8">
                    <div>
                        <h2 className="text-lg font-bold text-[#FAFAFA] sm:text-xl">
                            Pilihan Studio Teater
                        </h2>
                        <p className="mt-0.5 text-xs text-[#A1A1AA] sm:text-sm">
                            Menghadirkan standar proyeksi resolusi tinggi dan
                            tata suara sinematik terbaik.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2.5 rounded-lg border border-[#27272A] bg-[#18181B] p-5">
                            <div className="flex size-8 items-center justify-center rounded bg-zinc-800 text-zinc-300">
                                <Layers className="size-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">
                                IMAX Laser
                            </h3>
                            <p className="text-xs leading-relaxed text-[#A1A1AA]">
                                Layar berdimensi besar dengan visual 4K
                                ultra-bright dan audio surround multichannel
                                terkalibrasi presisi.
                            </p>
                        </div>

                        <div className="space-y-2.5 rounded-lg border border-[#27272A] bg-[#18181B] p-5">
                            <div className="flex size-8 items-center justify-center rounded bg-zinc-800 text-zinc-300">
                                <Sparkles className="size-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">
                                VIP Premiere Suite
                            </h3>
                            <p className="text-xs leading-relaxed text-[#A1A1AA]">
                                Kursi sofa kulit elektrik *recliner* ergonomis
                                dengan kenyamanan maksimal dan ruang privat yang
                                lapang.
                            </p>
                        </div>

                        <div className="space-y-2.5 rounded-lg border border-[#27272A] bg-[#18181B] p-5">
                            <div className="flex size-8 items-center justify-center rounded bg-zinc-800 text-zinc-300">
                                <Clapperboard className="size-4" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">
                                Dolby Atmos Teater
                            </h3>
                            <p className="text-xs leading-relaxed text-[#A1A1AA]">
                                Audio spasial multidimensi yang bergerak
                                realistis di sekeliling ruangan untuk kedalaman
                                suara sempurna.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section: Lokasi Bioskop */}
                <section className="space-y-6">
                    <div className="border-b border-[#27272A] pb-4">
                        <h2 className="text-xl font-bold text-[#FAFAFA] sm:text-2xl">
                            Lokasi Bioskop
                        </h2>
                        <p className="mt-0.5 text-xs text-[#A1A1AA] sm:text-sm">
                            Jaringan bioskop CinePass yang tersebar di kota-kota
                            strategis.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cinemas.map((c) => (
                            <div
                                key={c.id}
                                className="space-y-2 rounded-lg border border-[#27272A] bg-[#18181B] p-4 transition-colors hover:border-zinc-700"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-3.5 shrink-0 text-red-500" />
                                    <span className="text-sm font-semibold text-white">
                                        {c.name}
                                    </span>
                                </div>
                                <div className="text-xs text-[#A1A1AA]">
                                    {c.city}
                                </div>
                                <p className="line-clamp-2 text-xs text-[#71717A]">
                                    {c.address}
                                </p>
                                <div className="border-t border-[#27272A] pt-2 text-xs font-medium text-zinc-300">
                                    {c.studios_count} Studio Teater
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </CinemaLayout>
    );
}
