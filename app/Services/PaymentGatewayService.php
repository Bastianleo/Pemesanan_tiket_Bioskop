<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Str;

class PaymentGatewayService
{
    /**
     * Map frontend method key to database payment_method enum.
     */
    public function normalizeMethod(string $method): string
    {
        return match ($method) {
            'va_bca', 'bca_va' => 'bca_va',
            'va_mandiri', 'mandiri_va' => 'mandiri_va',
            'va_bni', 'bni_va' => 'bni_va',
            'ewallet_gopay', 'gopay' => 'gopay',
            'ewallet_ovo', 'ovo' => 'ovo',
            'credit_card' => 'credit_card',
            default => 'qris',
        };
    }

    /**
     * Create a sandbox payment session for the given booking.
     */
    public function createPayment(Booking $booking, string $paymentMethod): Payment
    {
        $normalizedMethod = $this->normalizeMethod($paymentMethod);
        $paymentCode = 'PAY-'.date('Ymd').'-'.strtoupper(Str::random(8));

        // Generate sandbox mock data based on method
        $vaNumber = null;
        $qrPayload = null;
        $ewalletProvider = null;

        if (str_ends_with($normalizedMethod, '_va')) {
            $bankCode = match ($normalizedMethod) {
                'bca_va' => '80123',
                'mandiri_va' => '88901',
                'bni_va' => '82711',
                default => '99881',
            };
            $vaNumber = $bankCode.rand(10000000, 99999999);
        } elseif ($normalizedMethod === 'qris') {
            $qrPayload = '00020101021226580016ID.CO.CINEPASS.WWW011893600998'.rand(10000000, 99999999).'52045812530336054'.str_pad((string) $booking->total_amount, 8, '0', STR_PAD_LEFT).'5802ID5916CINEPASS CINEMA6007JAKARTA62070703A016304'.strtoupper(substr(md5($paymentCode), 0, 4));
        } elseif (in_array($normalizedMethod, ['gopay', 'ovo'])) {
            $ewalletProvider = strtoupper($normalizedMethod);
        }

        $signature = $this->generateSignature($paymentCode, (float) $booking->total_amount, 'pending');

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_code' => $paymentCode,
            'payment_method' => $normalizedMethod,
            'amount' => $booking->total_amount,
            'status' => 'pending',
            'payment_gateway_ref' => 'SBX-'.strtoupper(Str::random(10)),
            'payload_response' => [
                'va_number' => $vaNumber,
                'qr_payload' => $qrPayload,
                'ewallet_provider' => $ewalletProvider,
                'signature' => $signature,
                'expired_at' => $booking->held_until?->toIso8601String() ?? now()->addMinutes(10)->toIso8601String(),
                'sandbox_mode' => true,
            ],
        ]);

        return $payment;
    }

    /**
     * Generate an HMAC signature to simulate secure webhook payloads.
     */
    public function generateSignature(string $paymentCode, float $amount, string $status): string
    {
        $secret = config('app.key', 'CinePassSecretKey2026');

        return hash_hmac('sha256', "{$paymentCode}:{$amount}:{$status}", $secret);
    }

    /**
     * Verify sandbox webhook signature.
     */
    public function verifySignature(string $paymentCode, float $amount, string $status, string $signature): bool
    {
        $expected = $this->generateSignature($paymentCode, $amount, $status);

        return hash_equals($expected, $signature);
    }
}
