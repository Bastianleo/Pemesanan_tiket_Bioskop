<?php

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Payment;
use App\Models\Seat;
use App\Models\Showtime;
use App\Models\Studio;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Services\PaymentGatewayService;

beforeEach(function () {
    $this->user = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $this->movie = Movie::create([
        'title' => 'Interstellar Test',
        'slug' => 'interstellar-test',
        'synopsis' => 'Wormhole journey',
        'director' => 'Christopher Nolan',
        'cast' => 'Matthew McConaughey, Anne Hathaway',
        'poster_path' => 'posters/test.jpg',
        'duration_minutes' => 169,
        'rating_age' => '13+',
        'status' => 'now_showing',
        'release_date' => now()->subDays(10),
    ]);

    $this->cinema = Cinema::create([
        'name' => 'Cinema XXI Test',
        'slug' => 'cinema-xxi-test',
        'city' => 'Jakarta Selatan',
        'address' => 'Jl. Senayan No. 5',
        'is_active' => true,
    ]);

    $this->studio = Studio::create([
        'cinema_id' => $this->cinema->id,
        'name' => 'Studio IMAX',
        'studio_type' => 'imax',
        'capacity' => 10,
        'price_multiplier' => 1.5,
        'is_active' => true,
    ]);

    $this->seat = Seat::create([
        'studio_id' => $this->studio->id,
        'row_label' => 'C',
        'seat_number' => 5,
        'seat_type' => 'regular',
        'is_active' => true,
    ]);

    $this->showtime = Showtime::create([
        'movie_id' => $this->movie->id,
        'cinema_id' => $this->cinema->id,
        'studio_id' => $this->studio->id,
        'show_date' => now()->addDay()->toDateString(),
        'start_time' => '14:00:00',
        'end_time' => '17:00:00',
        'base_price' => 50000,
        'is_active' => true,
    ]);

    $this->voucher = Voucher::create([
        'code' => 'TESTDISKON20',
        'title' => 'Diskon 20%',
        'discount_type' => 'percentage',
        'discount_value' => 20,
        'min_purchase' => 50000,
        'max_discount' => 50000,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'is_active' => true,
    ]);

    // Create a pending booking
    $this->booking = Booking::create([
        'booking_code' => 'BK-TEST-123456',
        'user_id' => $this->user->id,
        'showtime_id' => $this->showtime->id,
        'subtotal' => 75000,
        'service_fee' => 3000,
        'total_amount' => 78000,
        'status' => 'pending',
        'held_until' => now()->addMinutes(10),
    ]);

    $this->bookingSeat = BookingSeat::create([
        'booking_id' => $this->booking->id,
        'showtime_id' => $this->showtime->id,
        'seat_id' => $this->seat->id,
        'price' => 75000,
        'status' => 'held',
        'held_until' => now()->addMinutes(10),
    ]);
});

test('user can view checkout page for their pending booking', function () {
    $response = $this->actingAs($this->user)->get(route('booking.checkout', $this->booking->booking_code));

    $response->assertOk();
});

test('user can apply valid voucher code and discount is calculated', function () {
    $response = $this->actingAs($this->user)->post(route('booking.voucher.apply', $this->booking->booking_code), [
        'voucher_code' => 'TESTDISKON20',
    ]);

    $response->assertRedirect();
    $this->booking->refresh();

    // 20% of 75000 = 15000, total = (75000 - 15000) + 3000 = 63000
    expect($this->booking->voucher_id)->toBe($this->voucher->id);
    expect((int) $this->booking->discount_amount)->toBe(15000);
    expect((int) $this->booking->total_amount)->toBe(63000);
});

test('user can remove voucher from booking', function () {
    $this->booking->update([
        'voucher_id' => $this->voucher->id,
        'discount_amount' => 15000,
        'total_amount' => 63000,
    ]);

    $response = $this->actingAs($this->user)->post(route('booking.voucher.remove', $this->booking->booking_code));

    $response->assertRedirect();
    $this->booking->refresh();

    expect($this->booking->voucher_id)->toBeNull();
    expect((int) $this->booking->discount_amount)->toBe(0);
    expect((int) $this->booking->total_amount)->toBe(78000);
});

test('user can select payment method and is redirected to simulator', function () {
    $response = $this->actingAs($this->user)->post(route('booking.pay', $this->booking->booking_code), [
        'payment_method' => 'qris',
    ]);

    $payment = Payment::where('booking_id', $this->booking->id)->first();
    expect($payment)->not->toBeNull();
    expect($payment->payment_method)->toBe('qris');
    expect($payment->status)->toBe('pending');

    $response->assertRedirect(route('payment.simulator', $payment->payment_code));
});

test('user can view sandbox payment simulator page', function () {
    $gateway = app(PaymentGatewayService::class);
    $payment = $gateway->createPayment($this->booking, 'va_bca');

    $response = $this->actingAs($this->user)->get(route('payment.simulator', $payment->payment_code));

    $response->assertOk();
});

test('simulating payment success issues tickets and sets status to paid', function () {
    $gateway = app(PaymentGatewayService::class);
    $payment = $gateway->createPayment($this->booking, 'qris');

    $response = $this->actingAs($this->user)->post(route('payment.simulate', $payment->payment_code), [
        'action' => 'success',
    ]);

    $payment->refresh();
    $this->booking->refresh();
    $this->bookingSeat->refresh();

    expect($payment->status)->toBe('paid');
    expect($this->booking->status)->toBe('paid');
    expect($this->bookingSeat->status)->toBe('booked');

    // E-Ticket must be generated
    $tickets = Ticket::where('booking_id', $this->booking->id)->get();
    expect($tickets)->toHaveCount(1);
    expect($tickets->first()->is_used)->toBeFalse();
    expect($tickets->first()->qr_code_token)->not->toBeEmpty();

    $response->assertRedirect(route('tickets.show', $this->booking->booking_code));
});

test('simulating payment success with voucher records voucher usage and updates count', function () {
    $this->booking->update([
        'voucher_id' => $this->voucher->id,
        'discount_amount' => 15000,
        'total_amount' => 63000,
    ]);

    $gateway = app(PaymentGatewayService::class);
    $payment = $gateway->createPayment($this->booking, 'qris');

    $initialUsedCount = $this->voucher->used_count;

    $response = $this->actingAs($this->user)->post(route('payment.simulate', $payment->payment_code), [
        'action' => 'success',
    ]);

    $payment->refresh();
    $this->booking->refresh();
    $this->voucher->refresh();

    expect($payment->status)->toBe('paid');
    expect($this->booking->status)->toBe('paid');
    expect($this->voucher->used_count)->toBe($initialUsedCount + 1);

    $usage = VoucherUsage::where('booking_id', $this->booking->id)->first();
    expect($usage)->not->toBeNull();
    expect((int) $usage->discount_applied)->toBe(15000);
    expect($usage->user_id)->toBe($this->user->id);

    $response->assertRedirect(route('tickets.show', $this->booking->booking_code));
});

test('user can view e-ticket page after payment', function () {
    // Pay and generate ticket
    $this->booking->update(['status' => 'paid']);
    Ticket::create([
        'ticket_code' => 'TCK-20261113-001',
        'booking_id' => $this->booking->id,
        'seat_id' => $this->seat->id,
        'qr_code_token' => 'SAMPLE_QR_DATA',
        'is_used' => false,
    ]);

    $response = $this->actingAs($this->user)->get(route('tickets.show', $this->booking->booking_code));

    $response->assertOk();
});

test('user can download e-ticket as pdf', function () {
    $this->booking->update(['status' => 'paid']);
    Ticket::create([
        'ticket_code' => 'TCK-20261113-001',
        'booking_id' => $this->booking->id,
        'seat_id' => $this->seat->id,
        'qr_code_token' => 'SAMPLE_QR_DATA',
        'is_used' => false,
    ]);

    $response = $this->actingAs($this->user)->get(route('tickets.pdf', $this->booking->booking_code));

    $response->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('webhook verifies signature and marks payment paid', function () {
    $gateway = app(PaymentGatewayService::class);
    $payment = $gateway->createPayment($this->booking, 'qris');

    $signature = $gateway->generateSignature($payment->payment_code, (float) $payment->amount, 'paid');

    $response = $this->postJson(route('payment.webhook'), [
        'payment_code' => $payment->payment_code,
        'amount' => $payment->amount,
        'status' => 'paid',
        'signature' => $signature,
    ]);

    $response->assertOk();
    $payment->refresh();
    expect($payment->status)->toBe('paid');
});

test('webhook rejects invalid signature', function () {
    $gateway = app(PaymentGatewayService::class);
    $payment = $gateway->createPayment($this->booking, 'qris');

    $response = $this->postJson(route('payment.webhook'), [
        'payment_code' => $payment->payment_code,
        'amount' => $payment->amount,
        'status' => 'paid',
        'signature' => 'INVALID_SIGNATURE_HASH',
    ]);

    $response->assertStatus(403);
});
