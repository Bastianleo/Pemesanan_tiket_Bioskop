<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan Tiket CinePass</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #E50914;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #E50914;
            margin: 0 0 5px;
            font-size: 24px;
        }
        .summary-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 12px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #212529;
            color: #fff;
        }
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CINEPASS CINEMA</h1>
        <p>Laporan Resmi Transaksi & Pendapatan Tiket Bioskop</p>
        <small>Periode: {{ $startDate }} s/d {{ $endDate }}</small>
    </div>

    <div class="summary-box">
        <strong>Total Transaksi:</strong> {{ $bookings->count() }} pesanan |
        <strong>Total Pendapatan:</strong> Rp {{ number_format($totalRevenue, 0, ',', '.') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Kode Booking</th>
                <th>Tanggal</th>
                <th>Pemesan</th>
                <th>Film & Bioskop</th>
                <th>Studio</th>
                <th class="text-right">Total Bayar</th>
            </tr>
        </thead>
        <tbody>
            @forelse($bookings as $index => $b)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $b->booking_code }}</strong></td>
                    <td>{{ $b->created_at->format('d/m/Y H:i') }}</td>
                    <td>{{ $b->user->name }}</td>
                    <td>{{ $b->showtime->movie->title }} - {{ $b->showtime->studio->cinema->name }}</td>
                    <td>{{ $b->showtime->studio->name }}</td>
                    <td class="text-right">Rp {{ number_format($b->total_amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; color: #888;">Tidak ada data transaksi pada rentang tanggal ini.</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr>
                <th colspan="6" class="text-right">TOTAL PENDAPATAN:</th>
                <th class="text-right">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</th>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Dicetak otomatis oleh Sistem CinePass pada {{ $generatedAt }}
    </div>
</body>
</html>

