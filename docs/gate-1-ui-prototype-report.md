# Gate 1 — Laporan Prototype UI Nuvora

Status: **READY untuk review pemilik · PARTIALLY VERIFIED**
Tanggal: 30 Oktober 2026
Ruang lingkup: prototype UI lokal untuk Absensi Karyawan, Dashboard Admin, dan Kasir.

> Gate 1 berhenti di sini. Backend, database produksi, auth nyata, sinkronisasi nyata, payment gateway, dan payroll belum dikerjakan. Prototype ini memakai data demo dan bukan keputusan stack produksi.

## 1. Ringkasan

Tiga area prototype sudah dapat dijalankan dari satu launcher:

- Absensi Karyawan: mobile-first, tampilan di-port dari desain pemilik (sumber desain tidak lagi disimpan di repo); alur absensi masuk/pulang memakai selfie dan lokasi simulasi.
- Dashboard Admin: web, mencakup ringkasan, transaksi, produk, bahan/resep, stok/opname, karyawan, absensi, payroll, pengeluaran, laporan, audit, dan pengaturan/backup.
- Kasir: layar desktop, mencakup produk, keranjang, jenis pesanan, pembayaran tunai/QRIS manual, struk, halaman riwayat, halaman sesi kas, halaman stok barang, serta simulasi offline dan antrean sinkronisasi.

Semua angka, nama, alamat, transaksi, dan status adalah **data demo**. Tidak ada data asli, transaksi nyata, pengurangan stok, pembayaran, printer, atau sinkronisasi server yang dijalankan.

## 2. Cara menjalankan

```bash
cd /public/Nuvora/prototype
python3 -m http.server 4173
```

Buka `http://localhost:4173/`.

Halaman langsung:

- `http://localhost:4173/attendance.html` — Absensi Karyawan
- `http://localhost:4173/admin.html` — Dashboard Admin
- `http://localhost:4173/pos.html` — Kasir

Tidak ada proses build, package manager, atau dependency runtime. Prototype memakai HTML, CSS, dan JavaScript statis.

## 3. Layar dan interaksi

### A. Absensi Karyawan (`attendance.html`)

Tampilan di-port dari desain pemilik (sumber asli sudah dihapus dari repo; riwayatnya tersedia di Git). Struktur visual, teks, palet, splash, tiga tab, dan empat sheet dipertahankan dalam layout full-screen responsif tanpa frame atau tombol samping ponsel. Konten memakai lebar penuh di ponsel dan dibatasi 720px di layar besar; gutter, sheet, dan navigasi bawah menyesuaikan safe area. Skala tipografi diturunkan 20% melalui `--type-scale: 0.8`, dan seluruh ikon antarmuka memakai `--icon-scale: 0.8` agar proporsional di layar penuh. Logo memakai `prototype/assets/nuvora-logo.jpg` tanpa digambar ulang. Karena `dina-avatar.jpg` dari desain tidak tersedia di repo, avatar diganti placeholder SVG `prototype/assets/dina-avatar.svg`; ini satu-satunya penggantian aset visual.

Layar: splash singkat (1,15 detik) dengan animasi yang diperhalus, Beranda, Riwayat, Profil, sheet Notifikasi, Lokasi Outlet, Jadwal Hari Ini, dan Absensi. Status bar mock tidak ditampilkan.

Interaksi yang berfungsi:

- Navigasi tiga tab: Beranda, Riwayat, dan Profil.
- Tanggal demo tetap Jumat, 30 Okt 2026; status bar perangkat tidak ditampilkan.
- Sheet notifikasi, lokasi outlet, jadwal, dan absensi dapat dibuka/ditutup.
- Alur absen masuk/pulang: buka sheet, ambil selfie demo, lalu konfirmasi. Tombol menampilkan status “Menyimpan…” sekitar 0,7 detik sebelum data diperbarui. Kamera disimulasikan dengan foto profil dan label “Kamera tidak tersedia — memakai foto profil”.
- Status kehadiran, riwayat hari ini, statistik Hadir/Terlambat/Total Hari, dan badge Berlangsung ikut diperbarui.
- Tab Riwayat memiliki filter bulan dan status (Semua/Hadir/Terlambat). Default bulan berjalan; statistik, blok “Hari Ini”, dan daftar “Sebelumnya” mengikuti filter agar data tidak menumpuk.
- Setiap baris riwayat menampilkan foto karyawan (placeholder Dina) dengan titik status Hadir/Terlambat/Berlangsung.
- Data seed mencakup Agustus–Oktober 2026 agar filter bulan dapat dicoba.
- Data absensi disimpan di `sessionStorage` dengan key `nuvora-demo-attendance-v3`; tidak ada request API.
- Menu profil menampilkan toast demo. Tombol “Keluar Akun” menampilkan pesan mode demo dan tidak menghapus sesi, mengikuti perilaku desain.
- Toleransi terlambat mengikuti desain: absen masuk setelah 08.00 dihitung Terlambat.

Batasan:

- Tidak mengakses kamera atau GPS asli; selfie memakai foto profil demo dan lokasi memakai koordinat statis.
- Tidak ada alur offline, koreksi absensi, izin/cuti, hari libur, atau kebijakan privasi di app karyawan karena layar tersebut tidak ada di desain yang diberikan. Menu “Pengajuan Izin / Cuti” hanya menampilkan toast demo.
- Koreksi absensi tetap tersedia sebagai alur demo di Dashboard Admin.
- Jadwal, radius 100 m, dan koordinat adalah data demo.
- Data bertahan selama tab browser hidup; tidak ada tombol reset karena desain tidak menyediakannya.
- Aplikasi Next.js sumber desain tidak dijalankan; folder desain sudah dihapus dari repo.
- Font Plus Jakarta Sans dimuat dari Google Fonts; tanpa koneksi internet, browser memakai fallback font sistem.

### B. Dashboard Admin (`admin.html`)

Layar: Ringkasan, Penjualan, Produk & Menu, Bahan & Resep, Stok & Opname, Karyawan, Jadwal & Absensi, Payroll, Pengeluaran, Laporan, Audit Log, Pengaturan & Backup, serta halaman akses ditolak. Halaman Role & Permission tidak lagi ditampilkan; simulasi role preview tetap tersedia.

Interaksi yang berfungsi:

- Navigasi sidebar dan page link dari ringkasan; sidebar mobile mengunci scroll halaman di belakangnya.
- Pencarian global, notifikasi, dan dialog hasil pencarian demo.
- Filter/pencarian tabel transaksi, produk, bahan, stok, karyawan, absensi, pengeluaran, dan audit.
- Penjualan memiliki filter bulan, pagination 5 baris per halaman, dan data demo lintas bulan untuk menunjukkan pembatasan riwayat.
- Detail transaksi dengan snapshot harga demo dan pembatalan transaksi lunas (status Dibatalkan + antrean sync demo).
- Tambah produk dengan pratinjau foto lokal (JPG/PNG/WebP maksimal 2 MB; file tidak diunggah), serta tambah karyawan dan pengeluaran (hanya di memori demo).
- Avatar karyawan pada tabel/schedule disejajarkan dengan lingkaran avatar menggunakan selector yang tidak menimpa elemen inisial.
- Alur opname dan koreksi absensi dengan hasil “menunggu review”.
- Simulasi backup lokal; tidak membuat file nyata.
- Role preview Admin/Kasir dan halaman akses ditolak; matriks izin final masih **USULAN**.
- Payroll dan diskon ditandai **BLOCKED** atau belum aktif; pembatalan transaksi tersedia sebagai simulasi UI, sedangkan refund uang nyata dan approval final tetap **BLOCKED**.

Batasan:

- Semua data hanya di memori browser dan kembali ke data awal setelah refresh.
- Perubahan produk/karyawan/pengeluaran tidak permanen.
- Backup bukan backup nyata.
- Payroll tidak dihitung karena formula dan komponennya belum disetujui.
- Pemilih role adalah simulasi tampilan, bukan kontrol keamanan.

### C. Kasir (`pos.html`)

Layar: Kasir, halaman Riwayat, halaman Sesi kas, halaman Stok barang, modal sinkronisasi, dialog pembayaran, struk, kontrol demo, dan konfirmasi kosongkan draft.

Interaksi yang berfungsi:

- Filter kategori, pencarian produk, tambah/kurangi/hapus item, dan ringkasan total.
- Pilihan Dine-in, Takeaway, atau Delivery.
- Catatan pesanan.
- Pembayaran tunai dengan validasi uang diterima dan kembalian.
- QRIS manual dengan konfirmasi bahwa kasir sudah memeriksa bukti; tidak ada klaim verifikasi otomatis.
- Struk demo, halaman Riwayat penuh dengan filter status, dan detail struk.
- Pembatalan transaksi lunas dari struk/riwayat dengan alasan dan catatan; status berubah menjadi Dibatalkan, transaksi masuk antrean sync demo, dan nominal tidak dihitung ke sesi kas.
- Simulasi online/offline, antrean sync, modal progres sinkron di tengah layar (persentase, spinner, dan pesan status), serta penandaan transaksi tersinkron.
- Halaman Sesi kas penuh menampilkan kas awal, penjualan tunai, QRIS, pengeluaran, kas seharusnya, dan transaksi terbaru.
- Halaman Stok barang dengan ringkasan stok, pencarian, filter Menipis/Habis, dan status per produk.
- Kartu produk mendukung foto asli dari data produk; jika foto belum tersedia, tampilan memakai ikon kategori sebagai fallback.
- Reset demo dan pemuatan contoh pesanan.

Batasan:

- Stok tidak dikurangi dan tidak ada ledger stok nyata.
- Foto produk pada prototype hanya didukung bila field foto tersedia; belum ada aset foto nyata atau penyimpanan upload permanen.
- Diskon belum aktif karena aturan belum terdokumentasi.
- Pembatalan transaksi tersedia sebagai simulasi UI. Refund uang nyata, approval, dan pembalikan stok belum aktif karena aturannya belum final.
- Tutup sesi dan rekonsiliasi kas belum aktif.
- Tidak ada printer, pembayaran nyata, atau sinkronisasi server.
- Transaksi baru hanya ada di memori browser dan hilang setelah refresh.
- Idempotensi dan pencegahan duplikasi (PAY-005) belum diimplementasikan karena memerlukan backend.

## 4. File yang dibuat atau diubah

Dibuat:

- `prototype/index.html`
- `prototype/assets/launcher.css`
- `prototype/assets/base.css`
- `prototype/assets/common.js`
- `prototype/assets/icons.svg`
- `prototype/assets/nuvora-logo.jpg`
- `prototype/attendance.html`
- `prototype/assets/attendance.css`
- `prototype/assets/attendance.js`
- `prototype/assets/dina-avatar.svg` (placeholder avatar demo)
- `prototype/admin.html`
- `prototype/assets/admin.css`
- `prototype/assets/admin.js`
- `prototype/pos.html`
- `prototype/assets/pos.css`
- `prototype/assets/pos.js`
- `docs/gate-1-ui-prototype-report.md` (laporan ini)

Diubah:

- `README.md` — instruksi menjalankan prototype dan status Gate.
- `prototype/admin.html` — menambahkan `#topbarAvatar`, `#topbarUserName` untuk role preview, dan filter status Dibatalkan.
- `prototype/assets/admin.js` — perbaikan filter antrean sync, status hasil review, dan aksi pembatalan transaksi lunas.
- `prototype/attendance.html` — di-port dari desain pemilik.
- `prototype/assets/attendance.css` — ditulis ulang mengikuti visual desain pemilik.
- `prototype/assets/attendance.js` — ditulis ulang untuk alur demo statis dan `sessionStorage`.
- `prototype/assets/icons.svg` — menambahkan ikon `i-home-solid` dan `i-navigation`.
- `prototype/pos.html` — halaman Riwayat, Sesi kas, Stok barang, navigasi mobile, modal sinkronisasi, dan dialog pembatalan.
- `prototype/assets/pos.js` — navigasi view, filter stok, dukungan foto produk, progres sinkronisasi, dan alur pembatalan transaksi lunas.
- `prototype/assets/pos.css` — layout halaman penuh, tabel stok, navigasi mobile, modal sinkronisasi, dan ringkasan pembatalan; kategori tetap tampil saat pindah halaman.

Tidak diubah:

- `docs/Nuvora-Rebuild-Planning-Pack-v0.2.pdf`
- `docs/ui-reference/`
- File atau konfigurasi produksi.

## 5. Traceability requirement

| Area | Requirement / layar | Implementasi prototype | Status |
|---|---|---|---|
| Absensi | ATT-001, ATT-002, ATT-003, ATT-004, ATT-006, ATT-007; ATT-S01–ATT-S05 | Beranda, Riwayat, Profil, jadwal statis, alur absensi HP dengan selfie/lokasi simulasi, dan riwayat pribadi; visual mengikuti desain pemilik | Prototype UI; kebijakan radius, retensi, dan offline **BLOCKED** |
| Absensi/Admin | ATT-005; BR-ATT-004 | Koreksi absensi demo tetap ada di Dashboard Admin; app karyawan tidak menampilkannya karena tidak ada di desain | Alur UI; approval dan audit final **BLOCKED** |
| Admin | ADM-S01–ADM-S10 | Seluruh layar admin tersedia sebagai UI demo, termasuk status kosong/disabled | Prototype UI |
| Admin | POS-005, INV-001–INV-004, CASH-001–CASH-003, REP-001–REP-003 | Tabel transaksi, bahan/resep, pergerakan stok/opname, pengeluaran, laporan | UI data demo; perhitungan/ledger nyata **BLOCKED** |
| Admin | SEC-001–SEC-004 | Role preview, halaman akses ditolak, notice audit | Simulasi UI; enforcement server **BLOCKED** |
| Admin | PAYR-001–PAYR-005 | Halaman payroll dengan status **BLOCKED** dan penjelasan | Tidak menghitung payroll |
| Kasir | POS-001, POS-002, POS-004, POS-005 | Pilih produk, jenis pesanan, snapshot transaksi, riwayat | Prototype UI |
| Kasir | POS-003 | Tidak ada layar dapur; UI tidak mengklaim KDS | Sesuai batas rencana |
| Kasir | POS-006; VOID-001–VOID-004 | Pembatalan transaksi lunas dengan alasan, status Dibatalkan, dan antrean sync demo | UI demo; refund/approval nyata **BLOCKED** |
| Kasir | POS-007, POS-008 | Peringatan stok demo tanpa pemotongan stok | Aturan final **BELUM DIPUTUSKAN** |
| Kasir | PAY-001, PAY-002, PAY-003, PAY-004 | Tunai dengan kembalian, QRIS manual, status sync, dialog pembayaran | UI simulasi; integrasi nyata **BLOCKED** |
| Kasir | PAY-005 | Belum diimplementasikan | **BLOCKED** tanpa backend/idempotensi |
| Kasir | CASH-001, CASH-002, CASH-003 | Ringkasan sesi kas dan pengeluaran demo | Rekonsiliasi/penutupan **BLOCKED** |

## 6. Elemen demo dan keputusan yang belum diambil

- Semua data adalah contoh. Dashboard dan Kasir memakai label/kontrol demo; app Absensi hasil port desain memakai label “Kamera tidak tersedia — memakai foto profil” dan pesan mode demo pada menu profil, tanpa banner demo global.
- Tidak ada transaksi, absensi, pembayaran, stok, atau backup nyata.
- Data absensi memakai `sessionStorage`; data admin dan kasir hanya di memori. “Keluar Akun” tidak mereset sesi absensi; hapus `nuvora-demo-attendance-v3` dari session storage untuk mengulang demo.
- Diskon, refund uang nyata, QRIS otomatis, pemotongan stok, rekonsiliasi kas, payroll, approval koreksi, role/permission final, dan sinkronisasi nyata tidak diputuskan di prototype. Pembatalan transaksi hanya simulasi status demo.
- Stack prototype statis dipilih agar mudah diganti dan tidak dianggap sebagai keputusan stack produksi.
- Palet dan tipografi Dashboard/Kasir adalah **USULAN** visual. Absensi mengikuti desain pemilik; logo asli dipertahankan tanpa digambar ulang, dan avatar memakai placeholder karena aset asli tidak tersedia.

## 7. Tes yang benar-benar dijalankan

Semua perintah dijalankan dari `/public/Nuvora`.

### Pemeriksaan sintaks JavaScript

```bash
node --check prototype/assets/common.js
node --check prototype/assets/attendance.js
node --check prototype/assets/admin.js
node --check prototype/assets/pos.js
```

Hasil: keempat file lolos tanpa error.

### Pemeriksaan HTTP lokal

```bash
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/index.html
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/attendance.html
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/admin.html
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/pos.html
```

Hasil: `200` untuk keempat halaman. Semua aset CSS, JavaScript, ikon, logo, dan avatar demo juga mengembalikan `200`.

### Pemeriksaan referensi file dan ID

- Pemindaian HTML menemukan `missing refs=none` untuk `index.html`, `attendance.html`, `admin.html`, dan `pos.html`.
- Tidak ada ID duplikat pada keempat halaman.
- Referensi ID di `attendance.js` memiliki pasangan statis di `attendance.html`; tidak ada selector ID yang hilang. Tidak ada referensi `/images/` yang tertinggal.
- Pemeriksaan 60 referensi ikon (statis + dinamis): tidak ada ikon yang hilang dari `assets/icons.svg`.
- Kelas HTML dan kelas literal JavaScript memiliki definisi CSS; kurung kurawal CSS seimbang.

### Smoke test runtime POS dan Admin

- `node /tmp/pos-dom-test.js` dengan stub DOM menjalankan inisialisasi `pos.js`, perpindahan view Kasir/Riwayat/Stok, klik kategori yang kembali ke Kasir, filter stok, sinkronisasi 0–100%, dan pembatalan transaksi lunas.
- Hasil: kategori mengembalikan tampilan ke Kasir; modal sinkron terbuka, progres mencapai `100%`, antrean menjadi 0, dan Riwayat/Sesi kas diperbarui. Pembatalan mengubah status menjadi Dibatalkan, mengecualikan nominal dari sesi kas, dan menambah antrean sync — tanpa error runtime.
- `node /tmp/admin-dom-test.js` dengan stub DOM menjalankan inisialisasi `admin.js`, pencarian transaksi lunas, pembukaan detail, dan aksi pembatalan. Hasil: tabel menampilkan status Dibatalkan, dialog tertutup, dan toast pembatalan muncul tanpa error runtime.

### Yang belum dapat dijalankan

- Uji interaktif browser dan screenshot otomatis belum dijalankan.
- Chromium headless yang tersedia tidak dapat dieksekusi pada environment Alpine/musl ini. Tidak dilakukan instalasi browser atau dependency berat karena arahan pemilik.
- Karena itu, screenshot Absensi HP, Dashboard Admin, dan Kasir **belum tersedia**. Pemilik akan memeriksa langsung di browser.

## 8. Konflik dokumen yang perlu dicatat

- Dokumen yang dirujuk paket tetapi tidak ada di repo: `docs/03-DECISION-REGISTER.md`, `docs/10-CODING-AGENT-RULES.md`, `docs/13-IMPLEMENTATION-ROADMAP-TASKS.md`, `assets-reference/`, dan `design-concepts/`.
- UX brief menyatakan aset resmi belum tersedia, sedangkan addendum 30 Oktober 2026 menyebut logo dan tiga mockup sudah dikirim. Logo asli sudah dipakai; status palette/font final tetap belum diputuskan.
- ID keputusan `D-004`–`D-011` memiliki makna berbeda antara Discovery, Decision Register, dan Traceability Matrix. Perlu rekonsiliasi sebelum implementasi produksi.
- Payroll memiliki catatan formula/komponen yang bertentangan; karena itu payroll tetap **BLOCKED**.
- Offline/QRIS, role/permission, scope MVP, hosting/serah terima, dan stack produksi masih **BELUM DIPUTUSKAN**.
- README repo sebelumnya hanya berisi judul; sudah diperbarui dengan cara menjalankan prototype dan status Gate.

## 9. Risiko dan batasan

- Prototype ini tidak membuktikan keamanan, perhitungan uang, ledger stok, sinkronisasi, atau payroll.
- Data demo dapat disalahartikan sebagai data nyata jika label tidak diperhatikan.
- Perubahan data Admin/Kasir hilang setelah refresh; data Absensi bertahan selama tab hidup. Ini disengaja untuk Gate 1.
- Uji visual pada perangkat target belum dilakukan oleh agent.
- Desain Absensi memakai aset avatar placeholder karena `dina-avatar.jpg` tidak tersedia; logo memakai JPEG asli.
- Screenshot Gate 1 belum tersedia; hasil review pemilik diperlukan sebelum Gate 2.

## 10. Umpan balik yang diminta

1. Apakah hasil port Absensi sudah setia pada desain pemilik, termasuk penempatan logo dan placeholder avatar?
2. Apakah arah visual, hierarki, dan kepadatan Dashboard Admin serta Kasir sudah sesuai untuk review berikutnya?
3. Apakah alur Kasir (pilih produk → jenis pesanan → pembayaran tunai/QRIS manual → struk → riwayat) sudah cukup jelas?
4. Apakah label **BLOCKED/USULAN/DEMO** pada payroll, diskon, refund nyata, pembatalan transaksi, dan offline sudah cukup jelas agar tidak dianggap fitur final?

Setelah umpan balik dan persetujuan UI, pekerjaan dapat dilanjutkan ke Gate 2. Jangan memulai backend atau implementasi data nyata sebelum ada persetujuan eksplisit.
