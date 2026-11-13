import { Head, Link, router, useForm } from '@inertiajs/react';
import { Grid3X3, Layers, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { Cinema, Studio } from '@/types';

interface Props {
    studios: {
        data: (Studio & { cinema: Cinema; seats_count: number })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    cinemas: Cinema[];
    filters: {
        cinema_id?: string;
    };
}

export default function AdminStudiosIndex({ studios, cinemas }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        cinema_id: cinemas[0]?.id?.toString() || '',
        name: '',
        type: 'regular',
        price_multiplier: 1.0,
        rows_count: 6,
        cols_count: 10,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/studios', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (s: Studio) => {
        if (confirm(`Hapus studio '${s.name}'? Seluruh denah kursi dan jadwal di dalamnya akan terhapus.`)) {
            router.delete(`/admin/studios/${s.id}`);
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'imax':
                return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">IMAX Laser</Badge>;
            case 'vip_premiere':
                return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">VIP Premiere</Badge>;
            case 'deluxe':
                return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Deluxe</Badge>;
            default:
                return <Badge className="bg-zinc-800 text-zinc-300">Regular</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Studio & Denah Kursi - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Manajemen Studio & Teater
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Kelola kapasitas, tipe audio visual studio, dan denah kursi per teater.
                        </p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Plus className="mr-1.5 size-4" />
                        Tambah Studio Baru
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {studios.data.map((s) => (
                        <Card key={s.id} className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-500">
                                        <Layers className="size-5" />
                                    </div>
                                    {getTypeBadge(s.studio_type || s.type || 'regular')}
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-base font-semibold text-white">{s.name}</h3>
                                    <p className="mt-1 text-xs text-zinc-400 font-medium">
                                        {s.cinema?.name} ({s.cinema?.city})
                                    </p>
                                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                                        <span>Kapasitas: <strong className="text-zinc-200">{s.seats_count || s.total_seats} Kursi</strong></span>
                                        <span>•</span>
                                        <span>Multiplier: <strong className="text-zinc-200">{s.price_multiplier}x</strong></span>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                                    <Link href={`/admin/studios/${s.id}`}>
                                        <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-800/60 text-xs text-zinc-200 hover:border-red-600 hover:text-white">
                                            <Grid3X3 className="mr-1.5 size-3.5 text-red-400" />
                                            Denah Kursi
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(s)}
                                        className="h-8 text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Create Studio Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tambah Studio & Buat Denah Kursi</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Generator denah otomatis akan membuat baris A-Z dan nomor kursi.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="cinema_select">Pilih Lokasi Bioskop *</Label>
                                <Select
                                    value={data.cinema_id}
                                    onValueChange={(val) => setData('cinema_id', val)}
                                >
                                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        <SelectValue placeholder="Pilih Bioskop" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                        {cinemas.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>
                                                {c.name} - {c.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="studio_name">Nama Studio *</Label>
                                <Input
                                    id="studio_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Studio 1 - Dolby Atmos"
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="studio_type">Tipe Studio *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(val: any) => setData('type', val)}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectItem value="regular">Regular</SelectItem>
                                            <SelectItem value="deluxe">Deluxe</SelectItem>
                                            <SelectItem value="imax">IMAX Laser</SelectItem>
                                            <SelectItem value="vip_premiere">VIP Premiere</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price_multiplier">Pengali Harga *</Label>
                                    <Input
                                        id="price_multiplier"
                                        type="number"
                                        step="0.05"
                                        value={data.price_multiplier}
                                        onChange={(e) => setData('price_multiplier', parseFloat(e.target.value) || 1.0)}
                                        className="bg-zinc-900 border-zinc-800"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-4">
                                <div className="text-xs font-semibold text-zinc-300">Generator Grid Kursi Otomatis</div>
                                <p className="text-[11px] text-zinc-500">
                                    Tentukan jumlah baris (A, B, C..) dan kolom per baris (1, 2, 3..).
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="rows_count" className="text-xs">Jumlah Baris (A-Z)</Label>
                                        <Input
                                            id="rows_count"
                                            type="number"
                                            min={2}
                                            max={15}
                                            value={data.rows_count}
                                            onChange={(e) => setData('rows_count', parseInt(e.target.value) || 6)}
                                            className="bg-zinc-950 border-zinc-800 h-8 text-xs"
                                        />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="cols_count" className="text-xs">Kursi per Baris</Label>
                                        <Input
                                            id="cols_count"
                                            type="number"
                                            min={4}
                                            max={20}
                                            value={data.cols_count}
                                            onChange={(e) => setData('cols_count', parseInt(e.target.value) || 10)}
                                            className="bg-zinc-950 border-zinc-800 h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 text-right text-xs font-medium text-red-400">
                                    Total: {data.rows_count * data.cols_count} Kursi
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-800">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                    Buat Studio & Denah
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}

