<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Support\Str;

class TicketService
{
    public function __construct(
        protected QrCodeService $qrCodeService
    ) {}

    /**
     * Generate tickets for all booked seats in a confirmed booking.
     *
     * @return array<Ticket>
     */
    public function generateTicketsForBooking(Booking $booking): array
    {
        $booking->loadMissing(['bookingSeats.seat', 'showtime.movie', 'showtime.studio.cinema', 'user']);

        $tickets = [];

        foreach ($booking->bookingSeats as $bs) {
            // Check if ticket already exists
            $existing = Ticket::where('booking_id', $booking->id)
                ->where('seat_id', $bs->seat_id)
                ->first();

            if ($existing) {
                $tickets[] = $existing;

                continue;
            }

            $ticketCode = 'TCK-'.date('Ymd').'-'.strtoupper(Str::random(6));

            // Generate verification token (signed string used in QR code)
            $verificationPayload = json_encode([
                'tck' => $ticketCode,
                'bk' => $booking->booking_code,
                'st' => $booking->showtime_id,
                'seat' => $bs->seat?->getSeatCode(),
                'hash' => substr(hash_hmac('sha256', $ticketCode, config('app.key')), 0, 16),
            ]);

            $ticket = Ticket::create([
                'ticket_code' => $ticketCode,
                'booking_id' => $booking->id,
                'seat_id' => $bs->seat_id,
                'qr_code_token' => $verificationPayload,
                'is_used' => false,
            ]);

            $tickets[] = $ticket;
        }

        return $tickets;
    }

    /**
     * Generate a base64 Data URI SVG for a ticket's QR code.
     */
    public function getTicketQrCodeDataUri(Ticket $ticket): string
    {
        return $this->qrCodeService->generateDataUri($ticket->qr_code_token, 240);
    }
}
