<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin Master
        User::updateOrCreate(
            ['email' => 'admin@cinepass.com'],
            [
                'name' => 'Cinema Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '081234567890',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );

        // Regular Customer
        User::updateOrCreate(
            ['email' => 'user@cinepass.com'],
            [
                'name' => 'John Doe Cinema Lover',
                'password' => Hash::make('password'),
                'role' => 'user',
                'phone' => '089876543210',
                'email_verified_at' => now(),
                'is_active' => true,
            ]
        );
    }
}
