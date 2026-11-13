import { Head, router, useForm } from '@inertiajs/react';
import { Building2, Edit, MapPin, Phone, Plus, Trash2 } from 'lucide-react';
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
import AdminLayout from '@/layouts/admin-layout';
import type { Cinema } from '@/types';

interface Props {
    cinemas: {
        data: (Cinema & { studios_count: number })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function AdminCinemasIndex({ cinemas }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCinema, setEditingCinema] = useState<Cinema | null>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        city: '',
        address: '',
        phone: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingCinema(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (c: Cinema) => {
        setEditingCinema(c);
        setData({
            name: c.name,
            city: c.city,
            address: c.address,
            phone: c.phone || '',
            is_active: c.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCinema) {
            put(`/admin/cinemas/${editingCinema.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/admin/cinemas', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (c: Cinema) => {
        if (confirm(`Hapus bioskop '${c.name}'? Seluruh studio di dalamnya juga akan terhapus.`)) {
            router.delete(`/admin/cinemas/${c.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Bioskop - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Manajemen Lokasi Bioskop
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Kelola cabang bioskop CinePass di berbagai kota dan wilayah.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Plus className="mr-1.5 size-4" />
                        Tambah Bioskop Baru
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cinemas.data.map((c) => (
                        <Card key={c.id} className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-500">
                                        <Building2 className="size-5" />
                                    </div>
                                    <Badge className={c.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}>
                                        {c.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-base font-semibold text-white">{c.name}</h3>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                                        <MapPin className="size-3.5 text-red-400 shrink-0" />
                                        <span>{c.city}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                                        {c.address}
                                    </p>
                                    {c.phone && (
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                                            <Phone className="size-3 shrink-0" />
                                            <span>{c.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                                    <span className="text-xs font-medium text-zinc-400">
                                        {c.studios_count} Studio Teater
                                    </span>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(c)}
                                            className="h-8 text-zinc-400 hover:text-white"
                                        >
                                            <Edit className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(c)}
                                            className="h-8 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Add / Edit Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingCinema ? 'Edit Bioskop' : 'Tambah Bioskop Baru'}</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Masukkan nama cabang, kota, dan kontak operasional.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="cinema_name">Nama Bioskop *</Label>
                                <Input
                                    id="cinema_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: CinePass Grand Mall"
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city">Kota *</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Contoh: Jakarta Pusat"
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat Lengkap *</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Jl. Thamrin No. 1..."
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="021-xxxxxx"
                                    className="bg-zinc-900 border-zinc-800"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-zinc-800"
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}

