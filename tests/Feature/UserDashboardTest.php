<?php

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Studio;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $this->movie = Movie::create([
        'title' => 'Oppenheimer',
        'slug' => 'oppenheimer',
        'synopsis' => 'Father of the atomic bomb',
        'director' => 'Christopher Nolan',
        'cast' => 'Cillian Murphy, Emily Blunt',
        'poster_path' => 'posters/oppenheimer.jpg',
        'duration_minutes' => 180,
        'rating_age' => '17+',
        'status' => 'now_showing',
        'release_date' => now()->subDays(2),
    ]);

    $this->cinema = Cinema::create([
        'name' => 'CinePass Epicentrum',
        'slug' => 'cinepass-epicentrum',
        'city' => 'Jakarta Selatan',
        'address' => 'Kuningan, Jakarta',
        'is_active' => true,
    ]);

    $this->studio = Studio::create([
        'cinema_id' => $this->cinema->id,
        'name' => 'Studio 1',
        'studio_type' => 'regular',
        'capacity' => 10,
        'price_multiplier' => 1.0,
        'is_active' => true,
    ]);

    $this->seat = Seat::create([
        'studio_id' => $this->studio->id,
        'row_label' => 'B',
        'seat_number' => 4,
        'seat_type' => 'regular',
        'is_active' => true,
    ]);

    $this->showtime = Showtime::create([
        'movie_id' => $this->movie->id,
        'cinema_id' => $this->cinema->id,
        'studio_id' => $this->studio->id,
        'show_date' => now()->addDays(2)->toDateString(),
        'start_time' => '19:00:00',
        'end_time' => '22:00:00',
        'base_price' => 50000,
        'is_active' => true,
    ]);
});

test('guest cannot access user dashboard', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('user can access dashboard and view statistics and active passes', function () {
    $response = $this->actingAs($this->user)->get(route('dashboard'));

    $response->assertOk();
});

test('user can view my tickets page', function () {
    $response = $this->actingAs($this->user)->get(route('customer.tickets'));

    $response->assertOk();
});

test('user can view favorite movies page', function () {
    $response = $this->actingAs($this->user)->get(route('customer.favorites'));

    $response->assertOk();
});

test('user can toggle a movie as favorite', function () {
    expect($this->user->favorites()->count())->toBe(0);

    // Toggle on
    $response = $this->actingAs($this->user)->post(route('favorites.toggle', $this->movie->id));
    $response->assertRedirect();
    expect($this->user->favorites()->count())->toBe(1);

    // Toggle off
    $response = $this->actingAs($this->user)->post(route('favorites.toggle', $this->movie->id));
    $response->assertRedirect();
    expect($this->user->favorites()->count())->toBe(0);
});

test('user can voluntarily cancel a pending booking', function () {
    $booking = Booking::create([
        'booking_code' => 'BK-PENDING-99',
        'user_id' => $this->user->id,
        'showtime_id' => $this->showtime->id,
        'subtotal' => 50000,
        'service_fee' => 3000,
        'total_amount' => 53000,
        'status' => 'pending',
        'held_until' => now()->addMinutes(10),
    ]);

    $bookingSeat = BookingSeat::create([
        'booking_id' => $booking->id,
        'showtime_id' => $this->showtime->id,
        'seat_id' => $this->seat->id,
        'price' => 50000,
        'status' => 'held',
        'held_until' => now()->addMinutes(10),
    ]);

    $response = $this->actingAs($this->user)->post(route('booking.cancel', $booking->booking_code));

    $response->assertRedirect();
    $booking->refresh();
    $bookingSeat->refresh();

    expect($booking->status)->toBe('cancelled');
    expect($bookingSeat->status)->toBe('released');
});
