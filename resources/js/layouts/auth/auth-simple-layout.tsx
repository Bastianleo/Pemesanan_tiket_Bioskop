import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070A11] p-6 text-white md:p-10">
            {/* Cinematic background lighting — a soft, low-key wash only; no glow bloom */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-red-600/5" />
            <div className="pointer-events-none absolute right-1/4 -bottom-40 -z-10 h-[400px] w-[500px] rounded-full bg-blue-900/5" />

            <div className="w-full max-w-md">
                <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link
                            href={home()}
                            className="transition-colors hover:text-white"
                        >
                            <AppLogo />
                        </Link>

                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-zinc-400">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
