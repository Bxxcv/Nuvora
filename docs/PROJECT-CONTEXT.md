# Nuvora — Konteks Proyek untuk AI/Developer

- Terakhir diperbarui: 5 November 2026
- Status: **UI Gate 1 disetujui; ADR produksi disetujui; implementasi produksi belum dimulai**
- Dokumen acuan utama: [`ADR-0001`](adr/ADR-0001-stack-produksi.md), [`README`](../README.md), [`rencana ekspansi`](nuvora-pos-expansion-plan.md), [`laporan Gate 1`](gate-1-ui-prototype-report.md)
- Bahasa produk: Indonesia. Kode dan nama teknis boleh Inggris.

> Dokumen ini adalah ringkasan konteks untuk AI atau developer berikutnya. Baca dokumen ini sebelum mengubah kode. Jika ada konflik, urutan prioritasnya: instruksi pemilik > ADR-0001 > dokumen ini > detail prototype.

## 1. Ringkasan proyek

Nuvora adalah sistem operasional untuk satu outlet yang terdiri dari tiga permukaan:

1. **Absensi Karyawan** — absen masuk/pulang, riwayat, jadwal, profil.
2. **Admin Panel** — operasional toko, produk, stok, karyawan, penjualan, laporan, pengaturan, audit.
3. **POS/Kasir** — katalog, keranjang, pembayaran, hold order, struk, riwayat, sesi kas.

Sistem dirancang untuk dipakai bertahun-tahun, bukan demo jangka pendek. Fokus utama: data yang tahan lama, biaya penyimpanan terkendali, absensi yang kuat saat banyak karyawan check-in bersamaan, dan POS yang tetap bisa bekerja saat offline.

Saat ini yang ada di repo adalah **prototype UI statis** yang sudah disetujui pemilik. Belum ada backend, database produksi, auth nyata, atau pembayaran nyata.

## 2. Status saat ini

- **Gate 0:** audit repo/dokumen selesai.
- **Gate 1:** UI Absensi, Admin, dan POS sudah disetujui pemilik pada 5 November 2026.
- **Ekspansi Gate 1:** sebagian besar fitur demo sudah berjalan di static prototype.
- **ADR-0001:** disetujui pemilik pada 5 November 2026.
- **Gate 2/produksi:** belum ada implementasi. Langkah berikutnya adalah rencana implementasi dan setup environment, bukan langsung menulis backend.
- **Data prototype:** masih memakai seed/demo di localStorage. Ini **hanya untuk prototype dan test**, tidak boleh dibawa ke production.

## 3. Prinsip yang tidak boleh dilanggar

1. **Satu outlet.** Skema data tetap memakai `outlet_id` agar tidak perlu migrasi besar jika suatu saat berkembang.
2. **Nama outlet dapat diubah dari Admin Panel.** “Outlet Melati” hanya data demo. Jangan menanam nama outlet di kode production.
3. **Tidak ada data bisnis hardcoded atau data palsu di production.** Tidak ada seed otomatis, transaksi sintetis, karyawan fiktif, produk fiktif, poin fiktif, atau kredensial default di production.
4. **Foto absensi disimpan di object storage, bukan database.** Foto dihapus setelah 90 hari; metadata absensi tetap dipertahankan dan UI memakai fallback ikon pengguna.
5. **Postgres adalah sumber kebenaran.** IndexedDB hanya untuk draft, cache, dan antrean offline.
6. **Foto bukan identitas absensi.** Kehadiran tetap tercatat walau unggah foto gagal.
7. **Akun produksi milik pemilik:** email proyek khusus, Supabase/Vercel milik pemilik, GitHub pribadi pemilik.
8. **Absensi tidak boleh didesain ulang.** Tampilan dan alur Absensi dipertahankan; production hanya menyambungkan data karyawan dan penyimpanan.
9. **Jangan commit, merge, deploy, atau mengubah data produksi tanpa instruksi eksplisit pemilik.**

## 4. Stack produksi yang sudah diputuskan

| Area | Keputusan |
|---|---|
| UI | React + Vite + TypeScript |
| Database | Supabase Postgres |
| Auth | Supabase Auth untuk owner/admin |
| File | Supabase Storage untuk foto absensi dan produk |
| Offline | PWA + IndexedDB + outbox |
| Server logic | SQL, RLS, Edge Functions bila perlu |
| Hosting | Vercel |
| Source | GitHub pribadi pemilik |
| Monitoring | Error tracking, log sync, audit server |

**Fallback:** UI React yang sama dapat dibungkus **Tauri + SQLite** jika pengujian perangkat nyata menunjukkan PWA tidak memenuhi kebutuhan offline, printer, atau waktu buka. Keputusan fallback hanya setelah spike perangkat nyata.

**Tidak dipilih sebagai production:** static HTML/CSS/JS, Next.js full-stack sebagai default, foto sebagai BLOB/base64 di Postgres, multi-outlet aktif sejak awal.

## 5. Cakupan produk

### 5.1 Admin Panel

- Ringkasan operasional.
- Penjualan & transaksi: daftar, detail, split/member/poin, pembatalan, status sync.
- Produk & Menu: produk, foto, aktif/nonaktif, sold-out, SKU/barcode, import CSV.
- Bahan & Resep: bahan, resep, opname, validasi satuan.
- Stok & Opname: stok bahan/produk, pergerakan stok, stok minus.
- Karyawan: data karyawan dan role; hanya Kasir aktif yang muncul di POS.
- Jadwal & Absensi: rekap; tampilan Absensi tidak diubah.
- Payroll: masih terkunci/tidak diubah.
- Pengeluaran: pencatatan demo.
- Laporan: penjualan, ringkasan harian, filter, ekspor CSV/PDF.
- Audit Log: read-only, menerima aksi penting.
- Pengaturan & Backup: profil outlet, data toko, lebar struk, loyalitas.
- Pelanggan & Loyalitas: member, poin, riwayat, pengaturan earn/redeem.

### 5.2 POS/Kasir

- Katalog, pencarian, keranjang, jenis order, catatan.
- Pilih kasir aktif; tidak ada login karyawan di POS.
- Hold order maksimal 5.
- Split payment Tunai + QRIS; pembulatan bagian tunai ke Rp100.
- Member dan redeem poin.
- Potong stok bahan/resep atau stok produk jadi.
- Sold-out manual memblokir; stok minus hanya warning.
- Struk lewat browser print/PDF; cetak ulang.
- Riwayat, sesi kas, antrean offline.
- Pembatalan transaksi mengembalikan stok dan poin.

### 5.3 Absensi

- Absen masuk/pulang, riwayat, jadwal, profil, notifikasi, lokasi, selfie simulasi.
- Production memakai master karyawan yang sama untuk nama/role, tetapi **tidak terhubung ke sesi kas**.
- Prototype saat ini masih memakai penyimpanan Absensi sendiri (`sessionStorage`), belum membaca store Admin.

## 6. Keputusan produk yang sudah dikunci

- Hanya satu outlet; nama outlet dapat diganti di Admin.
- Admin adalah akun toko/owner, bukan akun per karyawan.
- POS tidak memakai login per karyawan; owner memilih Kasir aktif.
- Satu perangkat pada fase awal.
- Data Admin, POS, member, dan transaksi memakai store browser yang sama di prototype.
- Menu/bahan/resep/foto diinput lewat form, CSV, dan upload; import `.xlsx` asli ditunda.
- Ketersediaan memakai sold-out manual + status otomatis dari stok.
- Stok kurang tetap boleh dijual; stok boleh minus dan dicatat.
- Hold maksimal 5 order, nomor otomatis, hilang saat dihapus/reset.
- Split hanya Tunai + QRIS, pembulatan tunai Rp100.
- Struk memakai browser print + Save as PDF, bukan thermal langsung.
- Scanner memakai keyboard wedge.
- Antrean offline persisten, retry, status gagal, dan review konflik di Admin.
- Konflik sync: data lokal menang, lalu Admin meninjau.
- Loyalty: 1 poin per Rp1.000, 100 poin = Rp10.000; aturan dapat diubah di Admin.
- Ringkasan harian dan ekspor CSV/PDF ada di POS dan Admin.
- Target perangkat: tablet 10 inci, desktop, scanner keyboard, printer lewat dialog browser.

## 7. Progres prototype

### Selesai

- Fondasi store bersama, seed demo, reset, audit dasar.
- Sinkronisasi data Admin/POS untuk produk, stok, karyawan, transaksi, member.
- Split payment Tunai + QRIS, pembulatan, struk, cetak/PDF.
- Hold order maksimal 5, resume, hapus.
- Potong stok bahan/resep dan stok produk, pergerakan stok, warning minus, pengembalian saat void.
- Antrean offline persisten dan retry demo.
- Halaman Pelanggan & Loyalitas Admin: daftar, cari, tambah, aktif/nonaktif, penyesuaian poin dengan alasan, riwayat, pengaturan loyalty.
- Integrasi loyalty POS: pilih member, redeem, earn, riwayat, struk, pembayaran penuh dengan poin, pembatalan poin saat void.
- Admin Penjualan membaca transaksi dari store bersama:
  - migrasi seed transaksi lama ke store,
  - filter bulan termasuk Nov dan default semua bulan,
  - detail split/member/poin,
  - void mengembalikan stok dan poin.
- Cache asset sudah dibump: `admin.js?v=7`, `pos.js?v=8`, `store.js?v=2`, `admin.css?v=3`, `pos.css?v=6`.

### Belum selesai di prototype

- **Fase 1:** CRUD/edit penuh produk/bahan, import CSV, SKU/barcode, editor resep.
- **Fase 4:** status sync gagal/konflik dan review konflik di Admin.
- **Fase 5:** ringkasan harian CSV/PDF dan penyatuan laporan Admin/POS.
- **Fase 6:** audit touch target, keyboard/focus, scanner, print preview 58/80 mm, uji tablet/desktop.
- Uji visual/print nyata oleh pemilik.
- Integrasi Absensi ke master karyawan Admin.

## 8. Rencana production

Urutan yang disarankan setelah ADR disetujui:

1. **P0 — Rencana implementasi & repo:** struktur React/Vite/TS, environment, coding standard, test strategy, CI.
2. **P1 — Schema & migrasi:** tabel inti, `outlet_id`, RLS, index, idempotency, ledger append-only.
3. **P2 — Auth & onboarding:** akun owner, email proyek, MFA, onboarding outlet/karyawan/produk. **Tanpa seed production.**
4. **P3 — Absensi:** event absensi, foto storage, signed upload, purge 90 hari, koreksi, fallback foto.
5. **P4 — POS offline:** IndexedDB, outbox, idempotent sync, transaksi, split, stok, poin.
6. **P5 — Admin & laporan:** transaksi, stok, member, audit, ringkasan, ekspor.
7. **P6 — Hardening:** load test, RLS review, backup/PITR, restore drill, error tracking.
8. **P7 — Spike perangkat:** tablet, scanner, print 58/80 mm, offline nyata; putuskan PWA vs Tauri.
9. **P8 — Pilot:** data nyata milik pemilik, persetujuan tertulis, tanpa data sintetis.

## 9. Aturan data dan arsitektur

### Tabel inti

`outlets`, `app_users`, `user_roles`, `settings`, `employees`, `employee_roles`, `attendance_events`, `attendance_photos`, `attendance_corrections`, `products`, `product_photos`, `ingredients`, `recipes`, `recipe_items`, `transactions`, `transaction_items`, `payments`, `idempotency_keys`, `stock_movements`, `stock_opnames`, `members`, `point_ledger`, `audit_events`, `sync_events`, `daily_sales_summary`, `monthly_attendance_summary`.

### Aturan penting

- Semua tabel operasional memakai `outlet_id`.
- Transaksi menyimpan snapshot nama/harga item.
- `point_ledger` dan `stock_movements` append-only.
- `attendance_events` memakai `request_id` unik untuk idempotensi.
- `attendance_photos` menyimpan object key, bukan isi file.
- Partisi tabel volume tinggi hanya setelah volume terukur.
- Semua ID/waktu data operasional dibuat server/database, bukan hardcode client.

### Siklus foto absensi

1. Client kompres foto ±1280px, 150–250KB.
2. Signed upload ke Supabase Storage.
3. Database simpan metadata.
4. Jika upload gagal, absensi tetap valid; foto `pending` dan retry.
5. Job hapus object >90 hari.
6. Metadata tetap, status `purged`; UI fallback ikon pengguna.
7. Penghapusan masuk audit.

### Konkurensi

- Absensi: unique constraint `(employee_id, business_date, kind)` + idempotency.
- POS: `idempotency_key` agar retry tidak menggandakan transaksi.
- Stok/poin lewat transaksi database dan ledger.
- Target awal: 100–200 absensi bersamaan, 10.000–50.000 transaksi/bulan, p95 <300 ms.
- Load test sebelum pilot.

### Backup dan biaya

- Supabase Pro: backup harian 7 hari; PITR bila perlu.
- Ekspor logis berkala ke storage milik pemilik; uji restore kuartalan.
- Snapshot harga: mulai US$25/bulan, 8GB DB, 100GB storage, 250GB egress.
- Foto 90 hari + metadata saja + ringkasan/arsip untuk menekan biaya.

## 10. Struktur repo saat ini

```text
Nuvora/
├── README.md
├── docs/
│   ├── PROJECT-CONTEXT.md          ← dokumen ini
│   ├── adr/ADR-0001-stack-produksi.md
│   ├── nuvora-pos-expansion-plan.md
│   ├── gate-1-ui-prototype-report.md
│   ├── Nuvora-Rebuild-Planning-Pack-v0.2.pdf
│   └── UI Reference/
├── prototype/
│   ├── attendance.html
│   ├── admin.html
│   ├── pos.html
│   └── assets/
│       ├── store.js
│       ├── admin.js
│       ├── pos.js
│       ├── attendance.js
│       ├── common.js
│       ├── admin.css
│       ├── pos.css
│       ├── base.css
│       └── icons.svg
└── Desain_Ui_Absensi/              ← sumber desain, read-only
```

File test DOM berada di `/tmp` (bukan bagian repo): `store-test.js`, `pos-dom-test.js`, `admin-dom-test.js`, `loyalty-dom-test.js`.

## 11. Menjalankan dan memverifikasi prototype

```bash
cd /public/Nuvora/prototype
python3 -m http.server 4173 --bind 127.0.0.1
```

Buka:

- `http://127.0.0.1:4173/attendance.html`
- `http://127.0.0.1:4173/admin.html`
- `http://127.0.0.1:4173/pos.html`

Verifikasi yang sudah lulus pada 5 November 2026:

```bash
for f in prototype/assets/*.js; do node --check "$f"; done
node /tmp/store-test.js
node /tmp/pos-dom-test.js
node /tmp/admin-dom-test.js
node /tmp/loyalty-dom-test.js
```

Semua harness lulus; ketiga halaman mengembalikan HTTP 200.

## 12. Batasan dan risiko saat ini

- Prototype statis, tanpa backend/auth/payment nyata.
- Data demo memakai localStorage; Absensi memakai sessionStorage sendiri.
- Belum ada kamera/GPS asli, QRIS otomatis, thermal printer langsung, atau sinkronisasi server.
- Belum ada uji visual/print nyata di browser/tablet pemilik.
- Seed demo masih ada di prototype; ini technical debt yang **tidak boleh dibawa ke production**.
- Beberapa nilai demo masih hardcoded di prototype (misalnya data awal outlet/karyawan/produk). Jangan menambah hardcode baru; production harus memakai onboarding dan settings.
- Belum ada commit/merge/deploy produksi tanpa instruksi pemilik.

## 13. Keputusan yang masih terbuka

- Auth perangkat kasir: sesi owner di perangkat tepercaya, PIN kasir, atau kombinasi.
- Absensi production: aplikasi terpisah atau route dalam PWA yang sama.
- Retensi metadata absensi/audit untuk kebutuhan hukum/pajak.
- Region Supabase dan lokasi backup.
- PITR sejak pilot atau setelah volume tertentu.
- Import produk/stok awal: CSV milik pemilik atau input manual.
- Detail payment gateway/QRIS otomatis dan printer thermal langsung.

## 14. Instruksi untuk AI/developer berikutnya

1. Baca `docs/adr/ADR-0001-stack-produksi.md` dan dokumen ini sebelum mengubah apa pun.
2. Jangan menambahkan data bisnis hardcoded atau data palsu ke production. Untuk test, gunakan fixture terpisah dan jangan pernah dijalankan ke production.
3. Jangan membawa seed/demo dari `prototype/` ke database production.
4. Jangan mengubah desain atau alur Absensi; fokus pada data dan integrasi.
5. Jangan memulai backend, deploy, merge, atau mengubah data produksi tanpa persetujuan eksplisit pemilik.
6. Pertahankan pola yang sudah ada di prototype untuk pekerjaan demo: store bersama, audit, cache versioning, dan harness DOM.
7. Setelah mengubah asset, bump query cache di HTML dan jalankan semua verifikasi.
8. Jika ada keputusan produk baru, catat di ADR/dokumen ini; jangan mengandalkan ingatan percakapan.
9. Gunakan bahasa Indonesia untuk copy produk dan pesan ke pengguna.
10. Jika ragu, berhenti dan tanyakan ke pemilik.

## 15. Change log konteks

- **5 November 2026:** ADR-0001 disetujui; Admin Penjualan terhubung ke store; filter Nov/default semua bulan; cache dibump; semua harness lulus; dokumen konteks ini dibuat.
