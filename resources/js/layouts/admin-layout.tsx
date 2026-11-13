import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    Clapperboard,
    Compass,
    Film,
    Grid3X3,
    LayoutDashboard,
    LogOut,
    QrCode,
    Receipt,
    Settings,
    Tag,
    Users,
} from 'lucide-react';
import { type PropsWithChildren, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

interface PageProps {
    auth: {
        user: User;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}

export default function AdminLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const currentUrl = usePage().url;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
        { label: 'Katalog Film', href: '/admin/movies', icon: Film },
        { label: 'Bioskop', href: '/admin/cinemas', icon: Clapperboard },
        { label: 'Studio & Kursi', href: '/admin/studios', icon: Grid3X3 },
        { label: 'Jadwal Tayang', href: '/admin/showtimes', icon: Calendar },
        { label: 'Pemesanan', href: '/admin/bookings', icon: Receipt },
        { label: 'Pelanggan', href: '/admin/users', icon: Users },
        { label: 'Promo & Voucher', href: '/admin/vouchers', icon: Tag },
        { label: 'Scanner QR Tiket', href: '/admin/scanner', icon: QrCode },
        { label: 'Laporan & Export', href: '/admin/reports', icon: BarChart3 },
        { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
    ];

    const isLinkActive = (item: typeof navItems[0]) => {
        if (item.exact) {
            return currentUrl === item.href;
        }
        return currentUrl.startsWith(item.href);
    };

    return (
        <div className="flex min-h-screen bg-[#09090B] text-[#FAFAFA]">
            <Toaster position="top-right" richColors theme="dark" />

            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#27272A] bg-[#111114] md:flex">
                <div className="flex h-16 items-center border-b border-[#27272A] px-6">
                    <Link href="/admin">
                        <AppLogo />
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-3.5 py-5">
                    <div className="mb-2.5 px-3 text-[10px] font-semibold tracking-wider text-[#71717A] uppercase">
                        Menu Administrasi
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isLinkActive(item);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                        active
                                            ? 'bg-[#E50914] text-white font-semibold'
                                            : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
                                    }`}
                                >
                                    <Icon className="size-4 shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer User Info */}
                <div className="border-t border-[#27272A] p-3.5">
                    <div className="flex items-center gap-3 rounded-lg bg-[#18181B] border border-[#27272A] p-2.5">
                        <div className="flex size-7 items-center justify-center rounded bg-[#E50914] font-bold text-white text-xs">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-white">
                                {auth.user.name}
                            </div>
                            <div className="text-[10px] text-[#71717A]">
                                Administrator
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded p-1 text-[#71717A] hover:text-red-400"
                            title="Logout"
                        >
                            <LogOut className="size-3.5" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col md:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#27272A] bg-[#09090B]/95 px-6 backdrop-blur-md">
                    <div className="text-xs font-medium text-[#71717A]">
                        CinePass Cinema Backoffice
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/" target="_blank">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-[#27272A] bg-[#18181B] text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                            >
                                <Compass className="mr-1.5 size-3.5 text-zinc-400" />
                                Situs Publik
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
