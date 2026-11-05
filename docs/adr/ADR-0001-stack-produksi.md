# ADR-0001: Stack Produksi, Arsitektur Data, dan Kebijakan Tanpa Data Demo

- Status: **Accepted — disetujui pemilik pada 5 November 2026**
- Tanggal: 5 November 2026
- Pemilik keputusan: Pemilik Nuvora
- Konteks: Prototype UI Gate 1 sudah disetujui; belum ada backend, database produksi, auth nyata, atau pembayaran nyata.

## 1. Konteks

Nuvora adalah sistem operasional satu outlet yang mencakup Absensi Karyawan, Admin Panel, dan POS. Nama outlet dapat diubah dari Admin Panel; “Outlet Melati” hanyalah data demo. Sistem ini diproyeksikan berjalan bertahun-tahun, sehingga keputusan stack tidak boleh hanya mengoptimalkan kecepatan demo.

Batasan yang sudah disepakati:

- Hanya satu outlet pada fase awal, tetapi skema data harus siap menampung `outlet_id` tanpa migrasi besar.
- Admin memakai akun toko/owner; POS tidak memakai login per karyawan; Absensi memakai daftar karyawan yang sama.
- Satu perangkat kasir pada fase awal, tetapi data harus aman saat antrean offline, refresh, dan sinkronisasi.
- Foto absensi berjumlah besar; foto tidak boleh membebani database dan harus dihapus setelah 90 hari.
- Data absensi, transaksi, stok, dan poin harus tetap dapat diaudit setelah foto dihapus.
- Akun produksi harus dimiliki pemilik: email khusus proyek, akun Supabase/Vercel milik pemilik, dan GitHub pribadi pemilik.
- **Tidak boleh ada data bisnis hardcoded atau data palsu di production.**

## 2. Keputusan

### 2.1 Stack utama

| Area | Keputusan |
|---|---|
| UI | React + Vite + TypeScript |
| Database | Supabase Postgres |
| Auth | Supabase Auth untuk akun owner/admin |
| File | Supabase Storage untuk foto absensi dan foto produk |
| Offline | PWA + IndexedDB + outbox transaksi/absensi |
| Server logic | Supabase SQL, RLS, dan Edge Functions bila diperlukan |
| Hosting web | Vercel |
| Source code | GitHub pribadi pemilik |
| Monitoring | Error tracking + log sync + audit server |

### 2.2 Fallback bila kebutuhan offline/printer gagal

Jika pengujian PWA di perangkat kasir nyata tidak memenuhi kebutuhan offline, printer, atau waktu buka, UI React yang sama dapat dibungkus **Tauri + SQLite** sebagai aplikasi desktop kasir. Keputusan fallback hanya diambil setelah spike perangkat nyata, bukan berdasarkan asumsi.

### 2.3 Yang tidak dipilih

- **Static HTML/CSS/JS sebagai production:** hanya untuk prototype UI; tidak punya auth, database, sinkronisasi, dan audit yang memadai.
- **Next.js full-stack sebagai default:** menambah kompleksitas server/rendering untuk aplikasi operasional yang sebagian besar berupa layar internal dan offline-first.
- **Penyimpanan foto sebagai BLOB/base64 di Postgres:** membengkakkan database, backup, dan biaya.
- **Multi-outlet aktif sejak awal:** satu outlet dulu; skema tetap memakai `outlet_id`.

## 3. Arsitektur

```text
Admin/POS/Absensi (React + PWA)
        |
        | IndexedDB: draft, antrean offline, cache read-only
        |
        +---- Supabase Auth
        +---- Supabase Postgres (data operasional)
        +---- Supabase Storage (foto, signed upload/URL)
        +---- Edge Functions / SQL (validasi, purge, ringkasan)
        |
        +---- Vercel: hosting aplikasi web

Backup harian + PITR + ekspor berkala ke penyimpanan milik pemilik
```

Prinsip:

1. **Postgres adalah sumber kebenaran** untuk transaksi, absensi, stok, member, dan poin.
2. **IndexedDB bukan sumber kebenaran permanen.** Data lokal dipakai untuk draft, antrean offline, dan cache; setelah tersinkron, server menjadi acuan.
3. **Foto adalah lampiran, bukan identitas absensi.** Kehadiran tetap tercatat walau unggah foto gagal; foto masuk status `pending` dan dicoba ulang.
4. **Semua akses data memakai RLS dan least privilege.** Service role key tidak boleh ada di browser.
5. **Semua ID dan waktu dibuat server/database**, bukan dari data hardcoded di client.

## 4. Kebijakan tanpa data hardcoded dan tanpa data palsu

Aturan ini wajib untuk semua pekerjaan production.

### 4.1 Dilarang

- Menanam data bisnis di source code: nama outlet, nama karyawan, produk, harga, stok, member, poin, transaksi, QRIS, nomor telepon, atau kredensial.
- Menjalankan seed demo otomatis pada database production.
- Mencampur transaksi sintetis dengan ledger production.
- Memakai ID, nomor order, atau timestamp karangan sebagai data operasional.
- Menyimpan password, token, service role key, atau secret di repo.
- Membuat akun default dengan password yang diketahui umum.
- Menampilkan data contoh seolah-olah data nyata tanpa label demo.

### 4.2 Diwajibkan

- Production dimulai dari database kosong, lalu **onboarding nyata** membuat outlet, owner, karyawan, produk, bahan, resep, pengaturan pembayaran, dan data toko.
- Data uji hanya berada di environment `test`/`demo`, memakai database terpisah, dan tidak pernah diimpor ke production.
- Seed/fixture test diberi penanda environment dan tidak ikut bundle production.
- Aturan bisnis yang dapat berubah (poin, pajak, pembulatan, lebar struk, jam operasional) disimpan di tabel pengaturan, bukan di konstanta tersebar.
- Semua data operasional memakai `created_at`, `updated_at`, `created_by`, dan `outlet_id` yang diisi server.
- Demo mode, bila tetap dipertahankan untuk presentasi, harus memakai database/localStorage terpisah dan diberi label jelas.
- Migrasi dari prototype ke production tidak memindahkan data demo. Bila pemilik ingin memakai data nyata, data dimasukkan lewat onboarding/import resmi yang tercatat di audit.

### 4.3 Pengecualian yang sah

Referensi statis non-bisnis boleh berada di kode, misalnya label role, daftar satuan yang didukung, nama bulan, atau pemetaan kode status. Referensi tersebut tidak boleh berisi catatan operasional atau data pelanggan.

## 5. Model data awal

Skema final dibuat lewat migrasi SQL. Arah awal:

| Domain | Tabel inti |
|---|---|
| Organisasi | `outlets`, `app_users`, `user_roles`, `settings` |
| Karyawan | `employees`, `employee_roles` |
| Absensi | `attendance_events`, `attendance_photos`, `attendance_corrections` |
| Produk | `products`, `product_photos`, `ingredients`, `recipes`, `recipe_items` |
| Transaksi | `transactions`, `transaction_items`, `payments`, `idempotency_keys` |
| Stok | `stock_movements`, `stock_opnames` |
| Loyalitas | `members`, `point_ledger` |
| Audit | `audit_events`, `sync_events` |
| Ringkasan | `daily_sales_summary`, `monthly_attendance_summary` |

Aturan skema:

- `outlet_id` ada di semua tabel operasional.
- `transactions` menyimpan snapshot nama/harga item; perubahan master produk tidak mengubah riwayat.
- `point_ledger` bersifat append-only; saldo member adalah hasil agregasi/ledger, bukan angka yang ditimpa tanpa jejak.
- `stock_movements` bersifat append-only.
- `attendance_events` memakai `request_id` unik untuk idempotensi.
- `attendance_photos` menyimpan object key, bukan isi file.
- Tabel volume tinggi dipartisi per bulan setelah volume terukur; jangan mempartisi sebelum ada bukti kebutuhan.

## 6. Siklus hidup foto absensi

1. Client mengecilkan foto sebelum upload, target ±1280px dan 150–250KB.
2. Client meminta signed upload URL; file diunggah langsung ke Supabase Storage.
3. Database menyimpan metadata: `outlet_id`, `employee_id`, `attendance_event_id`, object key, ukuran, mime, waktu, status.
4. Absensi tetap valid bila upload gagal; foto berstatus `pending` dan dicoba ulang dari outbox.
5. Job terjadwal menghapus object foto yang lebih tua dari 90 hari.
6. Metadata foto dipertahankan dengan status `purged`; UI menampilkan fallback ikon pengguna.
7. Penghapusan dicatat di audit; backup yang masih memuat foto lama diatur agar tidak mengembalikan foto yang sudah dihapus saat restore.

Foto produk tidak memakai aturan 90 hari; retensinya mengikuti kebutuhan katalog dan disimpan terpisah dari foto absensi.

## 7. Konkurensi dan integritas

- Absensi: unique constraint `(employee_id, business_date, kind)` + `request_id` idempotensi. Dua percobaan check-in bersamaan tidak boleh menghasilkan dua baris.
- POS: transaksi memiliki `idempotency_key`; pengiriman ulang dari outbox tidak menggandakan transaksi.
- Stok dan poin: perubahan wajib lewat transaksi database dan ledger append-only; hindari update saldo tanpa catatan.
- Sinkronisasi: antrean lokal dipertahankan sampai server mengonfirmasi; konflik dicatat, tidak dibuang diam-diam.
- Koneksi: gunakan connection pooler Supabase; jangan membuka koneksi Postgres langsung dari browser.
- Target awal: 100–200 absensi bersamaan dan 10.000–50.000 transaksi/bulan; p95 API < 300 ms pada beban uji wajar.
- Load test wajib sebelum pilot, bukan setelah produksi.

## 8. Keamanan dan kepemilikan akun

- Email proyek khusus untuk Supabase, Vercel, dan layanan operasional.
- Akun Supabase/Vercel dibuat dan dimiliki pemilik; developer hanya diberi akses operasional yang diperlukan.
- GitHub tetap milik pemilik; developer bekerja lewat akses repo yang dapat dicabut.
- Aktifkan MFA pada akun pemilik dan akun admin produksi.
- RLS aktif untuk semua tabel; akses browser memakai anon key + sesi, bukan service role.
- Audit log mencatat aksi tulis penting: login admin, perubahan harga/resep, stok, poin, pembatalan, impor, dan ekspor.
- Absensi dan POS memakai sesi/perangkat yang dibatasi; keputusan detail auth perangkat/PIN dicatat sebagai open decision, bukan diasumsikan.

## 9. Backup, restore, dan umur panjang sistem

- Supabase Pro menyediakan backup harian 7 hari; PITR ditambahkan bila risiko kehilangan data menuntut.
- Ekspor logis berkala (dump SQL/CSV/Parquet) ke storage milik pemilik, di luar region aplikasi bila memungkinkan.
- Uji restore minimal setiap kuartal; hasilnya dicatat.
- Migrasi database memakai versi, review, dan rollback plan.
- Data keluar memakai format standar: Postgres, CSV, dan object storage S3-compatible.
- Tidak boleh ada ketergantungan pada satu vendor untuk membaca data historis.
- Retensi data operasional dan backup ditinjau tahunan; foto mengikuti 90 hari, metadata absensi dan ledger keuangan dipertahankan sesuai kebutuhan audit.

## 10. Biaya dan kapasitas

Snapshot harga saat ADR dibuat:

- Supabase Pro: mulai **US$25/bulan**, **8GB database**, **100GB file storage**, **250GB egress**, backup harian 7 hari.
- PITR dan kapasitas tambahan dihitung terpisah.

Implikasi:

- Foto 90 hari menjaga storage tetap terkendali; database menyimpan metadata saja.
- Ringkasan harian/bulanan dan arsip mencegah query laporan memindai seluruh ledger.
- Monitor ukuran database, storage, egress, dan biaya bulanan; alarm sebelum kuota habis.
- Harga dan kuota wajib dicek ulang sebelum kontrak/implementasi.

## 11. Konsekuensi

Positif:

- Satu stack TypeScript untuk UI dan validasi.
- Auth, database, storage, dan RLS terintegrasi.
- Offline-first tetap mungkin tanpa membangun server sendiri.
- Data dimiliki pemilik dan dapat diekspor.

Negatif:

- Perlu disiplin migrasi, RLS, dan pengujian offline.
- PWA tidak sekuat aplikasi desktop native untuk printer tertentu; fallback Tauri disiapkan.
- Biaya bulanan dan operasional backup harus disiplin.
- Tim tidak boleh memakai data demo sebagai jalan pintas production.

## 12. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Foto memenuhi storage | Kompresi client, purge 90 hari, metadata saja, monitor kuota |
| Database membengkak | Partisi setelah terukur, ringkasan, arsip, index yang tepat |
| Check-in bersamaan gagal | Unique constraint, idempotency, load test, retry |
| Offline queue hilang | IndexedDB persisten, outbox, status gagal, review Admin |
| Data palsu masuk production | Onboarding nyata, seed hanya test, review migrasi, audit |
| Kehilangan data | Backup, PITR, ekspor off-site, uji restore |
| Vendor lock-in | Postgres standar, ekspor, object storage terbuka |
| Akun owner tercampur akun pribadi | Email proyek, MFA, akses berbasis peran |

## 13. Keputusan terbuka

- Auth perangkat kasir: sesi owner di perangkat tepercaya, PIN kasir, atau kombinasi.
- Apakah Absensi production memakai aplikasi terpisah atau route dalam PWA yang sama.
- Kebijakan retensi metadata absensi dan audit untuk kebutuhan hukum/pajak.
- Region Supabase dan penyimpanan backup.
- PITR sejak pilot atau setelah volume tertentu.
- Apakah data produk/Stok awal diimpor dari CSV milik pemilik atau diinput manual.

## 14. Kriteria penerimaan ADR

ADR dianggap selesai bila pemilik menyetujui:

1. Stack utama dan fallback.
2. Aturan tanpa data hardcoded/demo di production.
3. Siklus hidup foto 90 hari dan metadata yang dipertahankan.
4. Strategi konkurensi, backup, ekspor, dan kepemilikan akun.
5. Daftar keputusan terbuka sebelum implementasi.

## 15. Langkah berikutnya

1. ADR telah disetujui pemilik pada 5 November 2026.
2. Tulis rencana implementasi bertahap: schema/migrasi, auth/onboarding, absensi, POS offline, Admin, laporan, load test, pilot.
3. Siapkan environment test terpisah; jangan pernah menjalankan seed demo di production.
4. Spike perangkat kasir nyata untuk offline dan print sebelum memutuskan apakah fallback Tauri diperlukan.
5. Pilot dengan data nyata milik pemilik dan persetujuan tertulis; tidak mencampur data sintetis.
