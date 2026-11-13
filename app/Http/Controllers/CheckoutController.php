<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use App\Services\PaymentGatewayService;
use App\Services\QrCodeService;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected PaymentGatewayService $paymentGatewayService,
        protected TicketService $ticketService,
        protected QrCodeService $qrCodeService
    ) {}

    /**
     * Display checkout summary page.
     */
    public function showCheckout(string $bookingCode, Request $request): Response|RedirectResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->with([
                'showtime.movie',
                'showtime.studio.cinema',
                'bookingSeats.seat',
                'voucher',
            ])
            ->firstOrFail();

        // Check if expired
        if ($booking->status === 'expired' || ($booking->status === 'pending' && $booking->held_until && $booking->held_until < now())) {
            $booking->update(['status' => 'expired']);
            $booking->bookingSeats()->update(['status' => 'released']);

            return redirect()->route('booking.seats', $booking->showtime_id)
                ->with('error', 'Waktu reservasi kursi telah berakhir. Silakan pilih kembali kursi Anda.');
        }

        // If already paid, redirect straight to tickets
        if ($booking->status === 'paid') {
            return redirect()->route('tickets.show', $booking->booking_code);
        }

        $serviceFee = (float) Setting::get('service_fee', '3000');
        $availableVouchers = Voucher::where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->where(function ($q) {
                $q->whereNull('quota')
                    ->orWhereColumn('used_count', '<', 'quota');
            })
            ->where('min_purchase', '<=', $booking->subtotal)
            ->select('id', 'code', 'title', 'discount_type', 'discount_value', 'min_purchase', 'max_discount')
            ->get();

        return Inertia::render('booking/checkout', [
            'booking' => $booking,
            'serviceFee' => $serviceFee,
            'availableVouchers' => $availableVouchers,
            'now' => now()->toIso8601String(),
        ]);
    }

    /**
     * Apply voucher code to booking.
     */
    public function applyVoucher(string $bookingCode, Request $request): RedirectResponse
    {
        $request->validate([
            'voucher_code' => ['required', 'string', 'max:50'],
        ]);

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $code = strtoupper(trim($request->input('voucher_code')));
        $voucher = Voucher::where('code', $code)
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->first();

        if (! $voucher) {
            return back()->withErrors(['voucher_code' => 'Kode voucher tidak valid atau telah kadaluarsa.']);
        }

        if ($voucher->quota && $voucher->used_count >= $voucher->quota) {
            return back()->withErrors(['voucher_code' => 'Kuota penggunaan voucher telah habis.']);
        }

        if ($booking->subtotal < $voucher->min_purchase) {
            return back()->withErrors([
                'voucher_code' => 'Minimal total pembelian untuk voucher ini adalah Rp '.number_format($voucher->min_purchase, 0, ',', '.'),
            ]);
        }

        // Calculate discount
        $discount = 0;
        if ($voucher->discount_type === 'percentage') {
            $discount = ($booking->subtotal * $voucher->discount_value) / 100;
            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = $voucher->max_discount;
            }
        } else {
            $discount = min($voucher->discount_value, $booking->subtotal);
        }

        $newTotal = max(0, ($booking->subtotal - $discount) + $booking->service_fee);

        $booking->update([
            'voucher_id' => $voucher->id,
            'discount_amount' => $discount,
            'total_amount' => $newTotal,
        ]);

        return back()->with('success', "Voucher {$voucher->code} berhasil digunakan! Diskon Rp ".number_format($discount, 0, ',', '.'));
    }

    /**
     * Remove voucher from booking.
     */
    public function removeVoucher(string $bookingCode, Request $request): RedirectResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $newTotal = $booking->subtotal + $booking->service_fee;

        $booking->update([
            'voucher_id' => null,
            'discount_amount' => 0,
            'total_amount' => $newTotal,
        ]);

        return back()->with('success', 'Voucher berhasil dihapus.');
    }

    /**
     * Process payment selection and forward to sandbox gateway.
     */
    public function processPayment(string $bookingCode, Request $request): RedirectResponse
    {
        $request->validate([
            'payment_method' => ['required', 'string'],
        ]);

        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        if ($booking->held_until && $booking->held_until < now()) {
            return redirect()->route('booking.seats', $booking->showtime_id)
                ->with('error', 'Waktu pembayaran telah habis.');
        }

        $normalized = $this->paymentGatewayService->normalizeMethod($request->input('payment_method'));

        $payment = Payment::where('booking_id', $booking->id)
            ->where('status', 'pending')
            ->first();

        if (! $payment || $payment->payment_method !== $normalized) {
            $payment = $this->paymentGatewayService->createPayment($booking, $normalized);
        }

        return redirect()->route('payment.simulator', ['paymentCode' => $payment->payment_code]);
    }

    /**
     * Display Sandbox Payment Simulator page.
     */
    public function showSimulator(string $paymentCode, Request $request): Response|RedirectResponse
    {
        $payment = Payment::where('payment_code', $paymentCode)
            ->whereHas('booking', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with([
                'booking.showtime.movie',
                'booking.showtime.studio.cinema',
                'booking.bookingSeats.seat',
            ])
            ->firstOrFail();

        if ($payment->status === 'paid') {
            return redirect()->route('tickets.show', $payment->booking->booking_code)
                ->with('success', 'Pembayaran telah sukses diproses.');
        }

        $payload = $payment->payload_response ?? [];
        $qrPayload = $payload['qr_payload'] ?? null;
        $qrisDataUri = null;

        if ($payment->payment_method === 'qris' && $qrPayload) {
            $qrisDataUri = $this->qrCodeService->generateDataUri($qrPayload, 280);
        }

        $paymentData = $payment->toArray();
        $paymentData['va_number'] = $payload['va_number'] ?? null;
        $paymentData['expired_at'] = $payload['expired_at'] ?? $payment->booking?->held_until?->toIso8601String();

        return Inertia::render('booking/payment-simulator', [
            'payment' => $paymentData,
            'qrisDataUri' => $qrisDataUri,
        ]);
    }

    /**
     * Simulate Sandbox Payment Action (Success, Fail, Expire) & Webhook Callback.
     */
    public function simulateAction(string $paymentCode, Request $request): RedirectResponse
    {
        $request->validate([
            'action' => ['required', 'string', 'in:success,failed,expired'],
        ]);

        $payment = Payment::where('payment_code', $paymentCode)
            ->whereHas('booking', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['booking.bookingSeats'])
            ->firstOrFail();

        $action = $request->input('action');

        if ($action === 'success') {
            DB::transaction(function () use ($payment) {
                // Update payment
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);

                // Update booking
                $booking = $payment->booking;
                $booking->update([
                    'status' => 'paid',
                ]);

                // Update seats to booked
                $booking->bookingSeats()->update([
                    'status' => 'booked',
                ]);

                // Increment voucher usage if applicable
                if ($booking->voucher_id) {
                    $voucher = Voucher::find($booking->voucher_id);
                    if ($voucher) {
                        $voucher->increment('used_count');
                        VoucherUsage::create([
                            'voucher_id' => $voucher->id,
                            'user_id' => $booking->user_id,
                            'booking_id' => $booking->id,
                            'discount_applied' => $booking->discount_amount,
                            'used_at' => now(),
                        ]);
                    }
                }

                // Generate unique tickets with signed QR codes
                $this->ticketService->generateTicketsForBooking($booking);
            });

            return redirect()->route('tickets.show', $payment->booking->booking_code)
                ->with('success', 'Pembayaran berhasil disimulasikan! E-Ticket Anda telah diterbitkan.');
        }

        if ($action === 'failed') {
            DB::transaction(function () use ($payment) {
                $payment->update(['status' => 'failed']);
                $payment->booking->update(['status' => 'cancelled']);
                $payment->booking->bookingSeats()->update(['status' => 'released']);
            });

            return redirect()->route('booking.seats', $payment->booking->showtime_id)
                ->with('error', 'Pembayaran gagal. Kursi Anda telah dibatalkan.');
        }

        // Expired
        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'expired']);
            $payment->booking->update(['status' => 'expired']);
            $payment->booking->bookingSeats()->update(['status' => 'released']);
        });

        return redirect()->route('booking.seats', $payment->booking->showtime_id)
            ->with('error', 'Pembayaran telah kadaluarsa.');
    }

    /**
     * Real Gateway Webhook endpoint with HMAC Signature Verification.
     */
    public function webhook(Request $request): JsonResponse
    {
        $paymentCode = $request->input('payment_code');
        $amount = (float) $request->input('amount');
        $status = $request->input('status');
        $signature = $request->header('X-CinePass-Signature', $request->input('signature'));

        if (! $paymentCode || ! $signature) {
            return response()->json(['message' => 'Invalid webhook payload'], 400);
        }

        if (! $this->paymentGatewayService->verifySignature($paymentCode, $amount, $status, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $payment = Payment::where('payment_code', $paymentCode)->first();
        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // Idempotency: if already paid, return ok immediately
        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment already processed']);
        }

        if ($status === 'paid') {
            DB::transaction(function () use ($payment) {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
                $booking = $payment->booking;
                $booking->update(['status' => 'paid']);
                $booking->bookingSeats()->update(['status' => 'booked']);

                if ($booking->voucher_id) {
                    $voucher = Voucher::find($booking->voucher_id);
                    if ($voucher) {
                        $voucher->increment('used_count');
                        VoucherUsage::create([
                            'voucher_id' => $voucher->id,
                            'user_id' => $booking->user_id,
                            'booking_id' => $booking->id,
                            'discount_applied' => $booking->discount_amount,
                            'used_at' => now(),
                        ]);
                    }
                }

                $this->ticketService->generateTicketsForBooking($booking);
            });
        }

        return response()->json(['message' => 'Webhook successfully processed']);
    }
}
