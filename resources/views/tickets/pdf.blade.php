<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>E-Ticket - {{ $booking->booking_code }}</title>
    <style>
        @page {
            margin: 20px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #ffffff;
            color: #111827;
            margin: 0;
            padding: 20px;
            font-size: 13px;
        }
        .header {
            border-bottom: 2px solid #E50914;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .brand {
            font-size: 24px;
            font-weight: bold;
            color: #E50914;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .sub-brand {
            font-size: 11px;
            color: #6b7280;
            margin-top: 3px;
        }
        .ticket-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 25px;
            page-break-inside: avoid;
            background-color: #fafafa;
        }
        .ticket-header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 12px 20px;
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
        }
        .ticket-body {
            padding: 20px;
        }
        .table-info {
            width: 100%;
            border-collapse: collapse;
        }
        .table-info td {
            vertical-align: top;
            padding: 6px 4px;
        }
        .label {
            color: #6b7280;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .value {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
        }
        .qr-cell {
            text-align: center;
            width: 190px;
            border-left: 2px dashed #d1d5db;
            padding-left: 20px !important;
        }
        .seat-badge {
            background-color: #E50914;
            color: #ffffff;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: bold;
            display: inline-block;
        }
        .vip-badge {
            background-color: #d97706;
            color: #ffffff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            text-transform: uppercase;
            margin-left: 5px;
        }
        .footer-terms {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            font-size: 10px;
            color: #6b7280;
            line-height: 1.5;
        }
    </style>
</head>
<body>

    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="brand">{{ $appName }}</div>
                    <div class="sub-brand">E-Ticket Masuk Bioskop Resmi • Kode Booking: {{ $booking->booking_code }}</div>
                </td>
                <td style="text-align: right; color: #6b7280; font-size: 11px;">
                    Tanggal Cetak: {{ $printedAt }}<br>
                    Pemesan: <strong>{{ $booking->user->name }}</strong>
                </td>
            </tr>
        </table>
    </div>

    @foreach($tickets as $idx => $ticket)
    <div class="ticket-card">
        <div class="ticket-header">
            <table style="width: 100%;">
                <tr>
                    <td style="font-weight: bold; font-size: 14px;">
                        TIKET #{{ $idx + 1 }} • {{ $ticket['ticket_code'] }}
                    </td>
                    <td style="text-align: right; color: #10b981; font-weight: bold;">
                        STATUS: {{ strtoupper($ticket['status']) }}
                    </td>
                </tr>
            </table>
        </div>
        <div class="ticket-body">
            <table class="table-info">
                <tr>
                    <td style="width: 65%;">
                        <div class="label">Film</div>
                        <div class="value" style="font-size: 18px; color: #E50914; margin-bottom: 8px;">
                            {{ $booking->showtime->movie->title }}
                        </div>

                        <table style="width: 100%; margin-top: 10px;">
                            <tr>
                                <td style="width: 50%;">
                                    <div class="label">Bioskop</div>
                                    <div class="value">{{ $booking->showtime->cinema->name }}</div>
                                    <div style="font-size: 11px; color: #4b5563;">{{ $booking->showtime->cinema->city }}</div>
                                </td>
                                <td style="width: 50%;">
                                    <div class="label">Studio</div>
                                    <div class="value">{{ $booking->showtime->studio->name }} ({{ strtoupper($booking->showtime->studio->studio_type) }})</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 12px;">
                                    <div class="label">Tanggal Tayang</div>
                                    <div class="value">{{ \Carbon\Carbon::parse($booking->showtime->show_date)->format('d F Y') }}</div>
                                </td>
                                <td style="padding-top: 12px;">
                                    <div class="label">Waktu Tayang</div>
                                    <div class="value">{{ substr($booking->showtime->start_time, 0, 5) }} - {{ substr($booking->showtime->end_time, 0, 5) }} WIB</div>
                                </td>
                            </tr>
                        </table>

                        <div style="margin-top: 16px;">
                            <span class="label" style="display: block; margin-bottom: 4px;">Kursi Terpilih</span>
                            <span class="seat-badge">{{ $ticket['seat_code'] }}</span>
                            @if($ticket['seat_type'] === 'vip')
                                <span class="vip-badge">VIP SEAT</span>
                            @endif
                        </div>
                    </td>
                    <td class="qr-cell">
                        <img src="{{ $ticket['qr_data_uri'] }}" alt="QR Code" style="width: 140px; height: 140px; margin-bottom: 5px;">
                        <div style="font-size: 10px; font-weight: bold; color: #374151;">SCAN DI PINTU MASUK</div>
                        <div style="font-size: 9px; color: #9ca3af; margin-top: 2px;">Tunjukkan QR kepada petugas</div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    @endforeach

    <div class="footer-terms">
        <strong>Ketentuan Penggunaan E-Ticket:</strong>
        <ol style="margin-top: 4px; padding-left: 18px;">
            <li>Harap hadir di lokasi bioskop minimal 15 menit sebelum waktu pemutaran film dimulai.</li>
            <li>Tunjukkan QR code tiket pada halaman e-ticket ponsel Anda atau lembar cetak ini kepada petugas pemeriksa tiket di pintu studio.</li>
            <li>Tiket yang telah discan dan berstatus "USED" tidak dapat digunakan kembali.</li>
            <li>Dilarang merekam audio maupun visual selama penayangan film berlangsung di dalam studio.</li>
        </ol>
    </div>

</body>
</html>

