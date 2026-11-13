import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Tag, Trash2 } from 'lucide-react';
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
import type { Voucher } from '@/types';

interface Props {
    vouchers: {
        data: (Voucher & { usages_count: number })[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function AdminVouchersIndex({ vouchers }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        code: '',
        title: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 20,
        min_purchase: 50000,
        max_discount: 25000,
        quota: 100,
        start_date: new Date().toISOString().substring(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().substring(0, 10),
        is_active: true,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/vouchers', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (v: Voucher) => {
        if (confirm(`Hapus voucher promo '${v.code}'?`)) {
            router.delete(`/admin/vouchers/${v.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Promo & Voucher - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Manajemen Promo & Kupon Diskon
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Buat kode voucher promo potongan persentase maupun nominal tunai.
                        </p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Plus className="mr-1.5 size-4" />
                        Buat Voucher Baru
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vouchers.data.map((v) => (
                        <Card key={v.id} className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-500">
                                            <Tag className="size-4" />
                                        </div>
                                        <span className="font-mono text-base font-bold text-white tracking-wider">
                                            {v.code}
                                        </span>
                                    </div>

                                    <Badge className={v.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}>
                                        {v.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <h3 className="text-sm font-semibold text-zinc-200">{v.title}</h3>
                                    {v.description && (
                                        <p className="text-xs text-zinc-400 line-clamp-2">{v.description}</p>
                                    )}

                                    <div className="rounded-lg bg-zinc-950/60 p-3 border border-zinc-800/60 space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Nilai Diskon:</span>
                                            <span className="font-semibold text-emerald-400">
                                                {v.discount_type === 'percentage' ? `${v.discount_value}%` : `Rp ${v.discount_value.toLocaleString('id-ID')}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Min. Transaksi:</span>
                                            <span className="text-zinc-300">Rp {v.min_purchase.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-500">Kuota Terpakai:</span>
                                            <span className="font-medium text-white">{v.used_count} / {v.quota}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                                    <span className="text-[11px] text-zinc-500">
                                        Exp: {v.end_date.substring(0, 10)}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(v)}
                                        className="h-7 text-red-400 hover:text-red-300"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Create Modal */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="border-zinc-800 bg-zinc-950 text-white sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Buat Kode Voucher Baru</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Tentukan parameter kupon diskon dan batas maksimal pemakaian.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="v_code">Kode Kupon *</Label>
                                    <Input
                                        id="v_code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        placeholder="CINEPASS20"
                                        className="bg-zinc-900 border-zinc-800 font-mono uppercase"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="v_type">Tipe Diskon *</Label>
                                    <Select
                                        value={data.discount_type}
                                        onValueChange={(val: any) => setData('discount_type', val)}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                            <SelectItem value="percentage">Persentase (%)</SelectItem>
                                            <SelectItem value="fixed">Nominal Tunai (Rp)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="v_title">Judul Promo *</Label>
                                <Input
                                    id="v_title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Diskon Pelanggan Baru 20%"
                                    className="bg-zinc-900 border-zinc-800"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="v_val" className="text-xs">Nilai Diskon *</Label>
                                    <Input
                                        id="v_val"
                                        type="number"
                                        value={data.discount_value}
                                        onChange={(e) => setData('discount_value', parseFloat(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="v_min" className="text-xs">Min. Beli (Rp)</Label>
                                    <Input
                                        id="v_min"
                                        type="number"
                                        value={data.min_purchase}
                                        onChange={(e) => setData('min_purchase', parseFloat(e.target.value) || 0)}
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        required
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="v_quota" className="text-xs">Kuota Pakai</Label>
                                    <Input
                                        id="v_quota"
                                        type="number"
                                        value={data.quota}
                                        onChange={(e) => setData('quota', parseInt(e.target.value) || 100)}
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="v_start">Mulai Berlaku *</Label>
                                    <Input
                                        id="v_start"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="v_end">Berakhir Pada *</Label>
                                    <Input
                                        id="v_end"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className="bg-zinc-900 border-zinc-800 text-xs"
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-800">
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                    Simpan Voucher
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}

