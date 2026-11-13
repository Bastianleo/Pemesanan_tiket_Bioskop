<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vouchers = [
            [
                'code' => 'CINEPASS20',
                'title' => 'Diskon Pelanggan Baru 20%',
                'description' => 'Hemat 20% untuk semua pembelian tiket nonton bioskop (Maksimal potongan Rp 25.000).',
                'discount_type' => 'percentage',
                'discount_value' => 20.00,
                'min_purchase' => 50000.00,
                'max_discount' => 25000.00,
                'quota' => 200,
                'used_count' => 5,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'WEEKENDSERU',
                'title' => 'Potongan Langsung Rp 15.000',
                'description' => 'Potongan langsung Rp 15.000 untuk transaksi akhir pekan minimum pembelian 2 tiket.',
                'discount_type' => 'fixed',
                'discount_value' => 15000.00,
                'min_purchase' => 80000.00,
                'max_discount' => 15000.00,
                'quota' => 150,
                'used_count' => 12,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'code' => 'IMAXVIP50',
                'title' => 'Spesial Studio IMAX & VIP Rp 30.000',
                'description' => 'Nikmati pengalaman sinematik premium dengan diskon Rp 30.000 untuk tiket IMAX atau VIP Premiere.',
                'discount_type' => 'fixed',
                'discount_value' => 30000.00,
                'min_purchase' => 120000.00,
                'max_discount' => 30000.00,
                'quota' => 100,
                'used_count' => 2,
                'start_date' => now()->subDays(1),
                'end_date' => now()->addMonth(),
                'is_active' => true,
            ],
        ];

        foreach ($vouchers as $v) {
            Voucher::updateOrCreate(
                ['code' => $v['code']],
                $v
            );
        }
    }
}
