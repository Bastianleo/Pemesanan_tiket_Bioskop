# 🎬 CinePass Cinema - Modern Commercial Cinema Ticket Booking Platform

**CinePass Cinema** adalah aplikasi web pemesanan tiket bioskop modern, profesional, dan berfitur lengkap yang dibangun dengan standar arsitektur tingkat komersial. Aplikasi ini dirancang menggunakan konsep **Premium Dark Cinema Theme** dengan dominasi warna dark navy/hitam pekat dan aksen crimson/emas khas bioskop kelas dunia.

---

## 🚀 Teknologi Utama

- **Backend**: Laravel 13 (PHP 8.4)
- **Frontend**: React 19, TypeScript
- **Integrasi Full-Stack**: Inertia.js v3 (Standalone requests, layout props, modern SPA architecture)
- **CSS & UI Components**: Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/)
- **Icons & Visuals**: Lucide React, Canvas Confetti
- **Charts**: Recharts (Grafik pendapatan, tren transaksi, okupansi studio)
- **Form & Validation**: React Hook Form, Zod, Laravel Form Requests
- **Database**: MySQL dengan Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)
- **QR Code**: `bacon/bacon-qr-code` v3 (SVG & Data URI generator)
- **PDF Engine**: `barryvdh/laravel-dompdf` v3 (Pencetakan tiket resmi & laporan keuangan)
- **Kamera & Scanner**: `html5-qrcode` (Pemindaian QR tiket via webcam/kamera smartphone petugas)
- **Testing Suite**: Pest PHP v5 (71 Feature Tests passed)

---

## 🌟 Fitur Unggulan

### A. Fitur Pelanggan (Customer / User)

1. **Landing Page Interaktif**:
    - Hero Carousel film unggulan dengan backdrop sinematik dan trailer pop-up.
    - Film Sedang Tayang (_Now Showing_), Film Akan Datang (_Upcoming_), dan Promo/Voucher Diskon dengan tombol salin kode instan.
    - Multi-City Cinema Switcher (Jakarta Pusat, Jakarta Selatan, Bandung, Surabaya).
2. **Katalog & Filter Film Lengkap**:
    - Pencarian judul film berbasis teks secara instan.
    - Filter berdasarkan genre (Action, Sci-Fi, Horror, Drama, Animation, dll.), rating usia (SU, 13+, 17+, 21+), dan urutan abjad/rilis.
3. **Detail Film & Jadwal Tayang Interaktif**:
    - Banner backdrop, info sutradara, deretan pemeran, durasi, dan video trailer resmi.
    - Tab penanggalan dinamis (7 hari ke depan) dengan pemilih kota dan bioskop.
    - Jam tayang dilengkapi indikator sisa kursi tersedia secara real-time.
4. **Visual Seat Selection (Anti-Double Booking)**:
    - Denah layout kursi visual sesuai tipe studio (Regular, IMAX, VIP).
    - Status kursi berwarna: **Hijau** (Tersedia), **Merah** (Dipilih), **Emas** (VIP), **Abu-abu Gelap** (Terpesan/Terkunci).
    - Transaksi database dengan **Pessimistic Locking (`lockForUpdate()`)** yang mencegah _race condition_ jika dua pelanggan memilih kursi yang sama secara serentak.
    - Fitur reservasi sementara (_held seats_) dengan masa berlaku 10 menit (otomatis dilepas jika waktu habis).
    - Polling ketersediaan kursi secara berkala.
    - Pembatasan maksimal 8 kursi per transaksi.
5. **Checkout & Simulator Pembayaran Sandbox**:
    - Rincian biaya: Subtotal tiket, biaya layanan, dan potongan voucher diskon dinamis.
    - Dukungan metode pembayaran komersial:
        - **QRIS**: Tampilan QR code dinamis berstandar nasional.
        - **Virtual Account Bank**: Nomor VA otomatis untuk BCA, Mandiri, BNI, dan BRI dengan tombol salin instan.
        - **E-Wallet**: GoPay & OVO simulator.
        - **Kartu Kredit/Debit Online**.
    - Halaman Sandbox Gateway Simulator untuk pengujian transaksi berhasil, gagal, maupun kadaluarsa.
    - Webhook API dengan verifikasi tanda tangan digital kriptografis HMAC-SHA256.
6. **E-Ticket Digital Resmi & Unduh PDF**:
    - Tiket digital bergaya _Cinema Pass_ dengan kode booking dan kode tiket unik (`TCK-YYYYMMDD-XXXXXX`).
    - QR Code berkeamanan kriptografis siap discan oleh petugas bioskop di pintu masuk studio.
    - Tombol cetak langsung (`window.print()`) dan tombol unduh file resmi **PDF E-Ticket** beresolusi tinggi.
7. **Hub Akun & Riwayat Pemesanan (User Hub)**:
    - Dashboard pengguna dengan ringkasan statistik tiket aktif dan riwayat transaksi.
    - Halaman **Tiket Saya**: Tab _Tiket Aktif_ (siap masuk) dan _Riwayat Lampau_ (sudah digunakan).
    - Halaman **Film Favorit (Wishlist)**: Koleksi film yang disukai pengguna dengan tombol pemesanan instan.
    - Fitur pembatalan transaksi berstatus pending secara sukarela.

---

### B. Fitur Administrator (Admin Dashboard)

1. **Executive Dashboard**:
    - Metrik pendapatan total, transaksi berhasil, total tiket terjual, dan total pengguna aktif.
    - Grafik tren pendapatan bulanan dan volume pemesanan tiket menggunakan **Recharts**.
    - Okupansi kursi studio dan daftar transaksi terbaru.
2. **Manajemen Master Data Film**:
    - Tambah, ubah, dan nonaktifkan film.
    - Upload poster, banner backdrop, URL trailer video, durasi, rating usia, dan multi-genre.
3. **Manajemen Bioskop & Studio**:
    - Pengaturan bioskop, alamat, dan kota operasional.
    - Pengaturan studio (Regular, Deluxe, IMAX, VIP Premiere) beserta pengali tarif (_price multiplier_).
    - Editor denah kursi interaktif: Nonaktifkan kursi rusak dan konfigurasi kursi VIP.
4. **Penjadwalan Bebas Bentrok (_Conflict-Free Scheduler_)**:
    - Jadwal penayangan dengan validasi backend otomatis yang mencegah tumpang tindih waktu penayangan di studio yang sama (termasuk jeda waktu pembersihan studio).
5. **Verifikasi Tiket (Live QR Scanner)**:
    - Fitur pemindai kamera terintegrasi menggunakan library `html5-qrcode`.
    - Verifikasi validitas keaslian tiket secara real-time.
    - Mencegah tiket palsu atau tiket yang sudah pernah digunakan (_used_), serta mencatat log audit pemindaian di tabel `ticket_scans`.
6. **Laporan & Ekspor PDF**:
    - Laporan pendapatan finansial, penjualan tiket, dan okupansi studio dengan filter rentang tanggal.
    - Fitur cetak/ekspor dokumen resmi laporan keuangan dalam format PDF.
7. **Pengaturan Sistem**:
    - Konfigurasi nama aplikasi, email operasional, tarif biaya layanan, durasi hold kursi, dan kebijakan pembatalan.

---

## 🗄️ Struktur Database (MySQL)

Aplikasi memiliki skema database relasional yang terstruktur dengan indeks optimal:

- `users`: Akun pengguna dan administrator (`role`, `phone`, `avatar_url`, `is_active`).
- `movies`: Informasi katalog film (`title`, `slug`, `synopsis`, `rating_age`, `duration_minutes`, `status`, dll.).
- `genres` & `movie_genres`: Relasi many-to-many film dan genre.
- `cinemas`: Data lokasi cabang bioskop di berbagai kota.
- `studios`: Studio bioskop dengan tipe kelas dan pengali harga.
- `seats`: Denah kursi fisik bioskop (`row_label`, `seat_number`, `seat_type`, `is_active`).
- `showtimes`: Jadwal penayangan film di studio tertentu pada tanggal dan jam tertentu.
- `bookings`: Transaksi pemesanan tiket (`booking_code`, `subtotal`, `service_fee`, `discount_amount`, `total_amount`, `status`, `held_until`).
- `booking_seats`: Kursi yang dipesan pada jadwal tertentu dengan status `held`, `booked`, atau `released`.
- `payments`: Data pembayaran sandbox gateway (`payment_code`, `payment_method`, `amount`, `status`, `payload_response`, `paid_at`).
- `tickets`: Tiket digital per kursi (`ticket_code`, `qr_code_token`, `is_used`, `used_at`, `verified_by_user_id`).
- `ticket_scans`: Log riwayat audit pemindaian tiket oleh petugas/admin.
- `vouchers` & `voucher_usages`: Promo diskon dan kuota pemakaian voucher.
- `favorites`: Wishlist film yang difavoritkan pengguna.
- `settings`: Konfigurasi sistem global berbasis key-value.

---

## ⚙️ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem

- PHP 8.4 atau lebih baru dengan ekstensi: `pdo_mysql`, `gd`, `intl`, `mbstring`, `zip`.
- Composer v2.
- Node.js v20+ dan NPM.
- Server MySQL (tersedia secara instan via Laragon, XAMPP, atau Docker).

### 2. Kloning & Pengaturan File Lingkungan (.env)

Buka terminal di direktori proyek:

```bash
# Salin konfigurasi environment
cp .env.example .env

# Generate application encryption key
php artisan key:generate
```

Pastikan konfigurasi database di file `.env` mengarah ke database MySQL Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pemesanantiket
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Instalasi Dependensi PHP & JavaScript

```bash
# Instal dependensi backend
composer install --no-interaction

# Instal dependensi frontend
npm install
```

### 4. Eksekusi Migrasi & Database Seeding

Jalankan migrasi database dan pengisian data master bioskop (Film, Bioskop, Studio, 560 Kursi, 180 Jadwal Tayang, Voucher Promo, & Akun):

```bash
php artisan migrate:fresh --seed
```

### 5. Kompilasi Frontend & Menjalankan Server

```bash
# Kompilasi aset Vite (Production Build)
npm run build

# Atau jalankan Vite Development Server untuk hot reloading:
# npm run dev

# Jalankan server aplikasi Laravel
php artisan serve
```

Aplikasi kini dapat diakses melalui browser di: **`http://127.0.0.1:8000`**

---

## 🔑 Akun Bawaan (Default Credentials)

Database seeder telah menyediakan dua akun siap pakai:

| Role                    | Email                | Password   | Hak Akses                                                                                                                |
| :---------------------- | :------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------- |
| **ADMINISTRATOR**       | `admin@cinepass.com` | `password` | Akses penuh dashboard `/admin`, manajemen film, bioskop, studio, kursi, jadwal, scanner QR tiket, dan laporan finansial. |
| **PENGGUNA (CUSTOMER)** | `user@cinepass.com`  | `password` | Pemesanan tiket, pemilihan kursi, checkout pembayaran sandbox, e-ticket digital, wishlist, dan profil.                   |

---

## 🧪 Pengujian Otomatis (Testing Suite)

Seluruh logika bisnis penting telah diuji secara menyeluruh menggunakan **Pest PHP**:

- Autentikasi & Middleware Hak Akses Role Admin vs Pelanggan
- Katalog & Pencarian Film Multi-Genre
- Jadwal Tayang & Filter Bioskop
- Pemilihan Kursi Visual & **Pencegahan Double Booking (Pessimistic Locking)**
- Validasi dan Perhitungan Diskon Voucher
- Sandbox Gateway Payment Flow & Verifikasi Tanda Tangan Webhook HMAC
- Penerbitan E-Ticket Digital & Unduh PDF
- Pemindaian dan Validasi QR Code Petugas Studio
- Hub Akun Pengguna & Wishlist Film

Untuk menjalankan seluruh rangkaian pengujian:

```bash
php artisan test --compact
```

**Hasil Status Pengujian:**

```text
   PASS  Tests\Feature\RoleAccessTest
   PASS  Tests\Feature\MovieCatalogTest
   PASS  Tests\Feature\MovieDetailTest
   PASS  Tests\Feature\SeatSelectionTest
   PASS  Tests\Feature\CheckoutAndPaymentTest
   PASS  Tests\Feature\UserDashboardTest
   ...

  Tests:    71 passed (219 assertions)
  Duration: 4.36s
```

---

## 🛡️ Standar Kode & Format

Kode proyek ini mengikuti standar PSR-12 dan konvensi resmi Laravel menggunakan **Laravel Pint**:

```bash
vendor/bin/pint app tests routes --format agent
```

---

_Dikembangkan dengan dedikasi untuk menghadirkan pengalaman pemesanan tiket bioskop modern, aman, dan tanpa hambatan._
