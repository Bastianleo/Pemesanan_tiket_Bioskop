<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScannerController extends Controller
{
    public function index(): Response
    {
        $recentScans = TicketScan::with(['ticket.booking.user', 'ticket.seat.studio.cinema', 'ticket.booking.showtime.movie', 'staff'])
            ->latest('scanned_at')
            ->take(10)
            ->get();

        return Inertia::render('admin/scanner/index', [
            'recentScans' => $recentScans,
        ]);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $token = trim($request->input('token'));

        // Find ticket by QR code token or ticket code
        $ticket = Ticket::with([
            'booking.user',
            'booking.showtime.movie',
            'booking.showtime.studio.cinema',
            'seat',
        ])
            ->where('qr_code_token', $token)
            ->orWhere('ticket_code', $token)
            ->first();

        if (! $ticket) {
            return response()->json([
                'status' => 'invalid',
                'message' => 'Tiket TIDAK DITEMUKAN atau barcode tidak valid.',
            ], 404);
        }

        if ($ticket->is_used) {
            TicketScan::create([
                'ticket_id' => $ticket->id,
                'scanned_by' => auth()->id(),
                'scanned_at' => now(),
                'status' => 'already_used',
                'notes' => 'Mencoba scan ulang tiket yang sudah terpakai.',
            ]);

            return response()->json([
                'status' => 'already_used',
                'message' => "PERINGATAN: Tiket sudah pernah digunakan pada {$ticket->used_at?->translatedFormat('d M Y H:i')} WIB.",
                'ticket' => [
                    'ticket_code' => $ticket->ticket_code,
                    'movie' => $ticket->booking->showtime->movie->title,
                    'cinema' => $ticket->booking->showtime->studio->cinema->name,
                    'studio' => $ticket->booking->showtime->studio->name,
                    'seat' => $ticket->seat->getSeatCode(),
                    'user' => $ticket->booking->user->name,
                ],
            ], 422);
        }

        // Valid ticket: Mark as used
        $ticket->update([
            'is_used' => true,
            'used_at' => now(),
            'verified_by_user_id' => auth()->id(),
        ]);

        TicketScan::create([
            'ticket_id' => $ticket->id,
            'scanned_by' => auth()->id(),
            'scanned_at' => now(),
            'status' => 'valid',
            'notes' => 'Check-in berhasil di pintu studio.',
        ]);

        return response()->json([
            'status' => 'valid',
            'message' => 'TIKET VALID! Silakan masuk ke dalam studio.',
            'ticket' => [
                'ticket_code' => $ticket->ticket_code,
                'movie' => $ticket->booking->showtime->movie->title,
                'cinema' => $ticket->booking->showtime->studio->cinema->name,
                'studio' => $ticket->booking->showtime->studio->name,
                'show_date' => $ticket->booking->showtime->show_date->translatedFormat('d M Y'),
                'time' => substr($ticket->booking->showtime->start_time, 0, 5).' - '.substr($ticket->booking->showtime->end_time, 0, 5),
                'seat' => $ticket->seat->getSeatCode(),
                'seat_type' => strtoupper($ticket->seat->seat_type),
                'user' => $ticket->booking->user->name,
            ],
        ]);
    }
}
