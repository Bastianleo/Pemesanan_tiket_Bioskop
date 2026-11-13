import { Link, usePage } from '@inertiajs/react';
import {
    Compass,
    Film,
    Heart,
    LogOut,
    MapPin,
    Shield,
    Sparkles,
    Ticket,
    User as UserIcon,
} from 'lucide-react';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';

interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}

export default function CinemaLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const [selectedCity, setSelectedCity] = useState('Jakarta Pusat');

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const cities = ['Jakarta Pusat', 'Jakarta Selatan', 'Bandung', 'Surabaya'];

    return (
        <div className="flex min-h-screen flex-col bg-[#09090B] text-[#FAFAFA] selection:bg-[#E50914] selection:text-white overflow-x-clip">
            <Toaster position="top-right" richColors theme="dark" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1600px] w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
                    {/* Brand Logo & City Selector */}
                    <div className="flex items-center gap-5 sm:gap-6 shrink-0">
                        <Link href="/" className="shrink-0">
                            <AppLogo />
                        </Link>

                        <div className="hidden sm:block h-5 w-px bg-[#27272A]" />

                        {/* City Selector Pill */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181B] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] transition-colors hover:border-zinc-700 hover:text-white">
                                    <MapPin className="size-3.5 text-zinc-400 shrink-0" />
                                    <span>{selectedCity}</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-[#27272A] bg-[#18181B] text-white">
                                {cities.map((city) => (
                                    <DropdownMenuItem
                                        key={city}
                                        onClick={() => setSelectedCity(city)}
                                        className="cursor-pointer hover:bg-zinc-800 text-xs text-[#FAFAFA]"
                                    >
                                        <MapPin className="mr-2 size-3 text-zinc-400" />
                                        {city}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Navigation Menu Links */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1AA]">
                        <Link href="/" className="transition-colors hover:text-white">
                            Beranda
                        </Link>
                        <Link href="/movies?status=now_showing" className="transition-colors hover:text-white">
                            Sedang Tayang
                        </Link>
                        <Link href="/movies?status=upcoming" className="transition-colors hover:text-white">
                            Akan Datang
                        </Link>
                        <Link href="/movies" className="transition-colors hover:text-white">
                            Katalog Lengkap
                        </Link>
                    </nav>

                    {/* User Action Buttons */}
                    <div className="flex items-center gap-3 shrink-0">

                        {/* Auth State Button */}
                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-lg border border-[#27272A] bg-[#18181B] p-1.5 pr-3 text-xs font-medium text-[#FAFAFA] transition-colors hover:border-zinc-700">
                                        <div className="flex size-6 items-center justify-center rounded bg-[#E50914] font-bold text-white text-[11px]">
                                            {auth.user.name.charAt(0)}
                                        </div>
                                        <span className="max-w-[100px] truncate">{auth.user.name}</span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 border-[#27272A] bg-[#18181B] text-white">
                                    <div className="px-3 py-2 text-xs">
                                        <div className="font-semibold text-zinc-200">{auth.user.name}</div>
                                        <div className="text-[#71717A] truncate">{auth.user.email}</div>
                                    </div>
                                    <DropdownMenuSeparator className="bg-[#27272A]" />

                                    {auth.user.role === 'admin' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="flex items-center gap-2 text-red-400 cursor-pointer">
                                                <Shield className="size-4" />
                                                <span>Admin Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                            <Sparkles className="size-4 text-zinc-400" />
                                            <span>Dashboard Akun</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link href="/my-tickets" className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                            <Ticket className="size-4 text-zinc-400" />
                                            <span>Tiket Bioskop Saya</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link href="/favorites" className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                            <Heart className="size-4 text-zinc-400" />
                                            <span>Film Favorit (Wishlist)</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile" className="flex items-center gap-2 cursor-pointer text-zinc-200">
                                            <UserIcon className="size-4 text-zinc-400" />
                                            <span>Pengaturan Profil</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-[#27272A]" />
                                    <DropdownMenuItem asChild>
                                        <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-2 text-red-400 cursor-pointer">
                                            <LogOut className="size-4" />
                                            <span>Keluar (Logout)</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-[#A1A1AA] hover:text-white">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="h-8 rounded-lg bg-[#E50914] hover:bg-red-700 text-xs font-medium text-white px-3.5">
                                        Daftar
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Minimalist Cinema Footer */}
            <footer className="border-t border-[#27272A] bg-[#09090B] text-[#71717A]">
                <div className="mx-auto max-w-[1600px] w-full px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div className="space-y-3">
                            <AppLogo />
                            <p className="text-xs leading-relaxed text-[#A1A1AA]">
                                Platform pemesanan tiket bioskop modern dengan pengalaman sinematik premium, pemilihan kursi visual interaktif, dan e-ticket terintegrasi.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">Film & Bioskop</h4>
                            <ul className="mt-4 space-y-2 text-xs">
                                <li><Link href="/movies?status=now_showing" className="text-[#A1A1AA] hover:text-white transition-colors">Sedang Tayang</Link></li>
                                <li><Link href="/movies?status=upcoming" className="text-[#A1A1AA] hover:text-white transition-colors">Segera Tayang</Link></li>
                                <li><Link href="/movies" className="text-[#A1A1AA] hover:text-white transition-colors">Semua Film</Link></li>
                                <li><Link href="/" className="text-[#A1A1AA] hover:text-white transition-colors">Lokasi Bioskop</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">Layanan & Bantuan</h4>
                            <ul className="mt-4 space-y-2 text-xs">
                                <li><span className="text-[#A1A1AA] hover:text-white cursor-pointer transition-colors">Panduan Pembelian</span></li>
                                <li><span className="text-[#A1A1AA] hover:text-white cursor-pointer transition-colors">Metode Pembayaran Sandbox</span></li>
                                <li><span className="text-[#A1A1AA] hover:text-white cursor-pointer transition-colors">Kebijakan Pembatalan</span></li>
                                <li><span className="text-[#A1A1AA] hover:text-white cursor-pointer transition-colors">Hubungi Layanan Pelanggan</span></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">Metode Pembayaran</h4>
                            <p className="mt-4 text-xs text-[#A1A1AA]">
                                Mendukung QRIS (GoPay, OVO, Dana), BCA Virtual Account, Mandiri, BNI, dan Kartu Kredit.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono">
                                <span className="rounded bg-[#18181B] border border-[#27272A] px-2 py-0.5 text-zinc-300">QRIS</span>
                                <span className="rounded bg-[#18181B] border border-[#27272A] px-2 py-0.5 text-zinc-300">BCA VA</span>
                                <span className="rounded bg-[#18181B] border border-[#27272A] px-2 py-0.5 text-zinc-300">MANDIRI</span>
                                <span className="rounded bg-[#18181B] border border-[#27272A] px-2 py-0.5 text-zinc-300">GOPAY</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-[#27272A] pt-6 text-center text-xs text-[#71717A]">
                        © {new Date().getFullYear()} CinePass Cinema. Seluruh Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
