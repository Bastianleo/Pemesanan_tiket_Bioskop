import { Head, useForm } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
import InputError from '@/components/input-error';
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

interface Props {
    settings: {
        app_name?: string;
        contact_email?: string;
        contact_phone?: string;
        service_fee?: string;
        hold_duration_minutes?: string;
        cancellation_policy?: string;
        [key: string]: string | undefined;
    };
}

export default function AdminSettingsIndex({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name || 'CinePass Cinema',
        contact_email: settings.contact_email || 'support@cinepass.com',
        contact_phone: settings.contact_phone || '+62 21 8000 9999',
        service_fee: parseFloat(settings.service_fee || '3000'),
        hold_duration_minutes: parseInt(settings.hold_duration_minutes || '10'),
        cancellation_policy:
            settings.cancellation_policy ||
            'Pembatalan tiket dapat dilakukan maksimal 2 jam sebelum jadwal tayang dengan pengembalian saldo 80%.',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings');
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem - Admin" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Pengaturan Sistem Bioskop
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Konfigurasi nama aplikasi, biaya layanan pemesanan, dan
                        parameter reservasi kursi.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader>
                            <CardTitle className="text-base text-white">
                                Profil & Kontak Bioskop
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Identitas yang muncul pada invoice dan tiket
                                penonton.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="app_name">
                                    Nama Bioskop / Aplikasi *
                                </Label>
                                <Input
                                    id="app_name"
                                    value={data.app_name}
                                    onChange={(e) =>
                                        setData('app_name', e.target.value)
                                    }
                                    className="border-zinc-800 bg-zinc-950/60"
                                    required
                                />
                                <InputError message={errors.app_name} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contact_email">
                                        Email Bantuan *
                                    </Label>
                                    <Input
                                        id="contact_email"
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) =>
                                            setData(
                                                'contact_email',
                                                e.target.value,
                                            )
                                        }
                                        className="border-zinc-800 bg-zinc-950/60"
                                        required
                                    />
                                    <InputError
                                        message={errors.contact_email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_phone">
                                        Nomor Telepon Hotline *
                                    </Label>
                                    <Input
                                        id="contact_phone"
                                        value={data.contact_phone}
                                        onChange={(e) =>
                                            setData(
                                                'contact_phone',
                                                e.target.value,
                                            )
                                        }
                                        className="border-zinc-800 bg-zinc-950/60"
                                        required
                                    />
                                    <InputError
                                        message={errors.contact_phone}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800/80 bg-zinc-900/40">
                        <CardHeader>
                            <CardTitle className="text-base text-white">
                                Parameter Transaksi & Reservasi
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Waktu batas pembayaran dan biaya pemesanan
                                online.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="service_fee">
                                        Biaya Layanan per Transaksi (Rp) *
                                    </Label>
                                    <Input
                                        id="service_fee"
                                        type="number"
                                        value={data.service_fee}
                                        onChange={(e) =>
                                            setData(
                                                'service_fee',
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="border-zinc-800 bg-zinc-950/60"
                                        required
                                    />
                                    <InputError message={errors.service_fee} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hold_duration">
                                        Durasi Lock Kursi (Menit) *
                                    </Label>
                                    <Input
                                        id="hold_duration"
                                        type="number"
                                        min={3}
                                        max={30}
                                        value={data.hold_duration_minutes}
                                        onChange={(e) =>
                                            setData(
                                                'hold_duration_minutes',
                                                parseInt(e.target.value) || 10,
                                            )
                                        }
                                        className="border-zinc-800 bg-zinc-950/60"
                                        required
                                    />
                                    <InputError
                                        message={errors.hold_duration_minutes}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cancellation_policy">
                                    Kebijakan Pembatalan & Refund *
                                </Label>
                                <textarea
                                    id="cancellation_policy"
                                    rows={3}
                                    value={data.cancellation_policy}
                                    onChange={(e) =>
                                        setData(
                                            'cancellation_policy',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                    required
                                />
                                <InputError
                                    message={errors.cancellation_policy}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-600 font-medium text-white hover:bg-emerald-700"
                        >
                            <Save className="mr-2 size-4" />
                            Simpan Pengaturan
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
