import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Lock, Search, Shield, UserX, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import type { User } from '@/types';

interface Props {
    users: {
        data: (User & { bookings_count: number })[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
}

export default function AdminUsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = (newSearch?: string, newRole?: string, newStatus?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const r = newRole !== undefined ? newRole : role;
        const st = newStatus !== undefined ? newStatus : status;

        router.get(
            '/admin/users',
            {
                search: s || undefined,
                role: r !== 'all' ? r : undefined,
                status: st !== 'all' ? st : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleToggleStatus = (u: User) => {
        const action = u.is_active ? 'blokir' : 'aktifkan kembali';
        if (confirm(`Apakah Anda yakin ingin me-${action} akun '${u.name}'?`)) {
            router.post(`/admin/users/${u.id}/toggle`);
        }
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Pengguna - Admin" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Manajemen Akun Pengguna
                    </h1>
                    <p className="text-sm text-zinc-400">
                        Kelola data pelanggan, role hak akses, dan blokir akun mencurigakan.
                    </p>
                </div>

                {/* Filters */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                                <Input
                                    placeholder="Cari nama, email, atau telepon..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter(search)}
                                    className="pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-200"
                                />
                            </div>

                            <Select
                                value={role}
                                onValueChange={(val) => {
                                    setRole(val);
                                    handleFilter(undefined, val);
                                }}
                            >
                                <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-zinc-200">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                    <SelectItem value="all">Semua Role</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                    <SelectItem value="user">Pelanggan Biasa</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    handleFilter(undefined, undefined, val);
                                }}
                            >
                                <SelectTrigger className="bg-zinc-950/60 border-zinc-800 text-zinc-200">
                                    <SelectValue placeholder="Status Akun" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="suspended">Diblokir / Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                                    <tr>
                                        <th className="py-3 px-4">Pengguna</th>
                                        <th className="py-3 px-4">Kontak</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Transaksi</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-zinc-500">
                                                Tidak ada data pengguna yang ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((u) => (
                                            <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 items-center justify-center rounded-full bg-zinc-800 font-bold text-white border border-zinc-700">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white">{u.name}</div>
                                                            <div className="text-xs text-zinc-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-zinc-400">
                                                    {u.phone || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {u.role === 'admin' ? (
                                                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                                                            <Shield className="mr-1 size-3" />
                                                            ADMIN
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-zinc-800 text-zinc-300">USER</Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-xs font-medium text-zinc-200">
                                                    {u.bookings_count} Pesanan
                                                </td>
                                                <td className="py-3 px-4">
                                                    {u.is_active ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">
                                                            Diblokir
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {u.role !== 'admin' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(u)}
                                                            className={`h-8 text-xs ${
                                                                u.is_active
                                                                    ? 'border-zinc-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-700'
                                                                    : 'border-zinc-800 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-700'
                                                            }`}
                                                        >
                                                            {u.is_active ? 'Blokir Akun' : 'Buka Blokir'}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

