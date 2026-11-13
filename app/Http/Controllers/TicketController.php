<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Setting;
use App\Services\QrCodeService;
use App\Services\TicketService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function __construct(
        protected QrCodeService $qrCodeService
    ) {}

    /**
     * Display digital e-tickets for a paid booking.
     */
    public function show(string $bookingCode, Request $request): Response|RedirectResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->with([
                'tickets.seat',
                'showtime.movie',
                'showtime.studio.cinema',
                'payment',
            ])
            ->firstOrFail();

        if ($booking->status !== 'paid') {
            return redirect()->route('booking.checkout', $booking->booking_code)
                ->with('error', 'Pemesanan belum selesai dibayar.');
        }

        // Auto-generate tickets if missing for any reason
        if ($booking->tickets->isEmpty()) {
            app(TicketService::class)->generateTicketsForBooking($booking);
            $booking->load(['tickets.seat']);
        }

        // Attach SVG Data URI and mapped status to each ticket
        $ticketsWithQr = $booking->tickets->map(function ($ticket) {
            $ticketArray = $ticket->toArray();
            $ticketArray['status'] = $ticket->is_used ? 'used' : 'valid';
            $ticketArray['booking_seat'] = [
                'seat' => $ticket->seat,
            ];
            $ticketArray['qr_data_uri'] = $this->qrCodeService->generateDataUri($ticket->qr_code_token, 220);

            return $ticketArray;
        });

        $bookingArray = $booking->toArray();
        $bookingArray['tickets'] = $ticketsWithQr;

        return Inertia::render('tickets/show', [
            'booking' => $bookingArray,
            'cinemaApp' => [
                'name' => Setting::get('app_name', 'CinePass Cinema'),
                'contact' => Setting::get('contact_email', 'support@cinepass.com'),
            ],
        ]);
    }

    /**
     * Download E-Ticket as official PDF document.
     */
    public function downloadPdf(string $bookingCode, Request $request): HttpResponse|RedirectResponse
    {
        $booking = Booking::where('booking_code', $bookingCode)
            ->where('user_id', $request->user()->id)
            ->with([
                'tickets.seat',
                'showtime.movie',
                'showtime.studio.cinema',
                'payment',
                'user',
            ])
            ->firstOrFail();

        if ($booking->status !== 'paid') {
            return redirect()->route('booking.checkout', $booking->booking_code)
                ->with('error', 'Tiket belum dapat diunduh karena belum dibayar.');
        }

        // Generate base64 QR for PDF embedding
        $ticketsData = $booking->tickets->map(function ($ticket) {
            return [
                'ticket_code' => $ticket->ticket_code,
                'status' => $ticket->is_used ? 'used' : 'valid',
                'seat_code' => $ticket->seat?->getSeatCode() ?? '-',
                'seat_type' => $ticket->seat?->seat_type ?? 'regular',
                'qr_data_uri' => $this->qrCodeService->generateDataUri($ticket->qr_code_token, 180),
            ];
        });

        $pdf = Pdf::loadView('tickets.pdf', [
            'booking' => $booking,
            'tickets' => $ticketsData,
            'appName' => Setting::get('app_name', 'CinePass Cinema'),
            'printedAt' => now()->format('d M Y H:i:s'),
        ])->setPaper('a4', 'portrait');

        return $pdf->download("CinePass-{$booking->booking_code}.pdf");
    }
}
