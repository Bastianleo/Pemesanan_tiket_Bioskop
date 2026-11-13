<?php

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Studio;
use App\Models\User;
use App\Models\Voucher;

beforeEach(function () {
    $this->user = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $this->movie = Movie::create([
        'title' => 'Test Inception',
        'slug' => 'test-inception',
        'synopsis' => 'Dream within a dream',
        'director' => 'Christopher Nolan',
        'cast' => 'Leonardo DiCaprio, Joseph Gordon-Levitt',
        'poster_path' => 'posters/test.jpg',
        'duration_minutes' => 148,
        'rating_age' => '13+',
        'status' => 'now_showing',
        'release_date' => now()->subDays(5),
    ]);

    $this->cinema = Cinema::create([
        'name' => 'Grand Cinema',
        'slug' => 'grand-cinema',
        'city' => 'Jakarta Pusat',
        'address' => 'Jl. Thamrin No. 1',
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

    // Create 10 seats (Row A, 1 to 10)
    for ($i = 1; $i <= 10; $i++) {
        Seat::create([
            'studio_id' => $this->studio->id,
            'row_label' => 'A',
            'seat_number' => $i,
            'seat_type' => $i === 10 ? 'vip' : 'regular',
            'is_active' => true,
        ]);
    }

    $this->showtime = Showtime::create([
        'movie_id' => $this->movie->id,
        'cinema_id' => $this->cinema->id,
        'studio_id' => $this->studio->id,
        'show_date' => now()->addDay()->toDateString(),
        'start_time' => '19:00:00',
        'end_time' => '21:30:00',
        'base_price' => 50000,
        'is_active' => true,
    ]);
});

test('user can view seat picker page', function () {
    $response = $this->actingAs($this->user)->get(route('booking.seats', $this->showtime->id));

    $response->assertOk();
});

test('guest is redirected to login when accessing seat picker', function () {
    $response = $this->get(route('booking.seats', $this->showtime->id));

    $response->assertRedirect(route('login'));
});

test('user can poll seat layout via api', function () {
    $response = $this->actingAs($this->user)->getJson(route('api.booking.seats', $this->showtime->id));

    $response->assertOk()
        ->assertJsonStructure(['seats' => [['id', 'seat_code', 'status', 'price']]]);
});

test('user can hold available seats successfully', function () {
    $seats = $this->studio->seats()->take(2)->get();
    $seatIds = $seats->pluck('id')->toArray();

    $response = $this->actingAs($this->user)->post(route('booking.hold', $this->showtime->id), [
        'seat_ids' => $seatIds,
    ]);

    $booking = Booking::where('user_id', $this->user->id)->first();
    expect($booking)->not->toBeNull();
    expect($booking->status)->toBe('pending');
    expect($booking->bookingSeats)->toHaveCount(2);

    $response->assertRedirect(route('booking.checkout', $booking->booking_code));
});

test('user cannot hold seats that are already booked', function () {
    $otherUser = User::factory()->create();
    $seat = $this->studio->seats()->first();

    // Create an existing booking
    $existingBooking = Booking::create([
        'booking_code' => 'BK-EXISTING',
        'user_id' => $otherUser->id,
        'showtime_id' => $this->showtime->id,
        'subtotal' => 50000,
        'service_fee' => 3000,
        'total_amount' => 53000,
        'status' => 'paid',
        'held_until' => now()->addMinutes(10),
    ]);

    BookingSeat::create([
        'booking_id' => $existingBooking->id,
        'showtime_id' => $this->showtime->id,
        'seat_id' => $seat->id,
        'price' => 50000,
        'status' => 'booked',
    ]);

    $response = $this->actingAs($this->user)->post(route('booking.hold', $this->showtime->id), [
        'seat_ids' => [$seat->id],
    ]);

    $response->assertSessionHasErrors('seats');
});

test('user cannot select more than 8 seats', function () {
    $allSeats = $this->studio->seats()->take(9)->pluck('id')->toArray();

    $response = $this->actingAs($this->user)->post(route('booking.hold', $this->showtime->id), [
        'seat_ids' => $allSeats,
    ]);

    $response->assertSessionHasErrors('seat_ids');
});

test('user can hold available seats with promo voucher code applied', function () {
    $voucher = Voucher::create([
        'code' => 'SEATPROMO20',
        'title' => 'Diskon 20%',
        'discount_type' => 'percentage',
        'discount_value' => 20,
        'min_purchase' => 50000,
        'max_discount' => 50000,
        'quota' => 100,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'is_active' => true,
    ]);

    $seats = $this->studio->seats()->take(2)->get();
    $seatIds = $seats->pluck('id')->toArray();

    $response = $this->actingAs($this->user)->post(route('booking.hold', $this->showtime->id), [
        'seat_ids' => $seatIds,
        'voucher_code' => 'SEATPROMO20',
    ]);

    $booking = Booking::where('user_id', $this->user->id)->first();
    expect($booking)->not->toBeNull();
    expect($booking->voucher_id)->toBe($voucher->id);
    expect((int) $booking->discount_amount)->toBe(20000); // 20% of 100000 = 20000
    expect((int) $booking->total_amount)->toBe(83000); // (100000 - 20000) + 3000

    $response->assertRedirect(route('booking.checkout', $booking->booking_code));
});
