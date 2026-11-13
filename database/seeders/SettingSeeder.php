<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            'app_name' => 'CinePass Cinema',
            'contact_email' => 'support@cinepass.com',
            'contact_phone' => '+62 21 8000 9999',
            'service_fee' => '3000',
            'hold_duration_minutes' => '10',
            'cancellation_policy' => 'Pembatalan tiket dapat dilakukan maksimal 2 jam sebelum jadwal tayang dengan pengembalian saldo 80%.',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
