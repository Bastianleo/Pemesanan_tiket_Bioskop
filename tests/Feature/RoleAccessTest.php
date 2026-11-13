<?php

use App\Models\User;

test('guest is redirected to login when trying to access admin dashboard', function () {
    $response = $this->get('/admin');

    $response->assertRedirect(route('login'));
});

test('regular user receives 403 forbidden when trying to access admin dashboard', function () {
    $user = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
});

test('admin can successfully access admin dashboard', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->get('/admin');

    $response->assertStatus(200);
});

test('inactive user is blocked and redirected to login', function () {
    $inactiveUser = User::factory()->create([
        'role' => 'user',
        'is_active' => false,
    ]);

    $response = $this->actingAs($inactiveUser)->get('/dashboard');

    $response->assertRedirect(route('login'));
    $this->assertGuest();
});
