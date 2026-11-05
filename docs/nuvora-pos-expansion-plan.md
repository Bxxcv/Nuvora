# Rencana Pengembangan POS, Admin, dan Absensi

Status: **arah dan keputusan awal disetujui**. Implementasi demo berjalan bertahap; lihat status per fase di bawah. Arsitektur produksi mengikuti [`ADR-0001`](adr/ADR-0001-stack-produksi.md).

Ruang lingkup: fitur pilihan **3, 5, 8, 11, 13, 14, 15, 16, dan 17**.

## 1. Keputusan yang sudah dikunci

- Hanya **satu outlet**. Nama outlet dapat diubah di Admin Panel; “Outlet Melati” adalah data demo. Tidak ada multi-outlet.
- Akun Admin Panel adalah **akun toko/owner**, bukan akun per karyawan.
- POS tidak memakai login karyawan. Owner membuka POS, lalu **memilih nama karyawan aktif yang role-nya Kasir**.
- Satu perangkat untuk Gate 1. Kasir dapat berganti nama pada perangkat yang sama.
- Data baru disimpan di penyimpanan browser yang sama agar Admin dan POS membaca data yang sama pada perangkat itu. Absensi memakai daftar karyawan yang sama untuk nama dan role, tetapi tidak terhubung ke sesi kas.
- Menu, bahan, resep, dan foto diinput di Admin melalui **form, import CSV, dan upload foto**. File Excel disimpan sebagai CSV; import .xlsx asli ditunda.
- Tidak ada jadwal menu per jam/hari. Ketersediaan memakai **sold-out manual + status otomatis dari stok**.
- Produk ber resep memotong **bahan baku sesuai resep**; produk tanpa resep memotong **stok produk jadi**.
- Stok kurang **tetap boleh dijual** dengan warning; stok dapat menjadi minus dan dicatat.
- Order hold maksimal **5 order**, nomor otomatis, aktif sampai dihapus atau sesi ditutup.
- Split payment hanya **Tunai + QRIS**, dengan pembulatan bagian tunai ke **Rp100**.
- Struk memakai **browser print + simpan PDF**, bukan printer thermal langsung.
- Scanner memakai mode **keyboard wedge** (scanner USB/Bluetooth yang mengetik ke kolom pencarian).
- Antrean offline **tersimpan setelah refresh**, punya retry, status gagal, dan review konflik di Admin.
- Konflik sync memakai aturan **data lokal menang**, lalu Admin meninjau dan menandai selesai.
- Loyalty memakai **poin + redeem**, dengan contoh awal **1 poin per Rp1.000 dan 100 poin = Rp10.000**. Aturan dapat diubah di Admin.
- Halaman baru: **Pelanggan & Loyalitas**. Tidak ada halaman jadwal menu.
- Ringkasan harian dan ekspor tersedia di **POS dan Admin**, format **CSV dan PDF**.
- Target perangkat: tablet 10 inci, desktop, scanner keyboard, dan printer lewat dialog browser.
- Absensi memakai daftar karyawan Admin untuk nama dan role, tetapi **tidak terhubung ke sesi kas**. Tampilan dan alur Absensi tidak diubah.

## 2. Peta seluruh halaman

### 2.1 Admin Panel

| Halaman | Fungsi sekarang | Perubahan dalam plan |
|---|---|---|
| Ringkasan | Ringkasan operasional demo | Tidak diubah struktur utamanya. Bila muat, tambah indikator kecil untuk antrean sync/konflik dan stok kritis. |
| Penjualan | Daftar transaksi, detail, pembatalan | Menampilkan split payment, member, poin, status sync/konflik, dan aksi cetak ulang/PDF. |
| Produk & Menu | Daftar produk, tambah produk, foto, aktif/nonaktif | Tambah edit/hapus, import CSV (Excel disimpan sebagai CSV), SKU/barcode, sold-out manual, dan status stok otomatis. |
| Bahan & Resep | Daftar bahan, resep demo, opname | Tambah CRUD bahan, import, penyusun resep per produk, validasi satuan, dan preview dampak stok. |
| Stok & Opname | Stok bahan, pergerakan stok, opname | Menerima pergerakan dari penjualan, pembatalan, dan koreksi. Menampilkan stok minus dan status kritis. |
| Karyawan | Daftar karyawan, tambah, aktif/nonaktif | Role menjadi penting. Hanya karyawan aktif dengan role Kasir yang muncul di POS. |
| Jadwal & Absensi | Jadwal dan rekap absensi demo | Nama dan role mengikuti karyawan Admin; tampilan dan alur tidak diubah. |
| Payroll | Halaman payroll terkunci | Tidak diubah. |
| Pengeluaran | Pencatatan pengeluaran demo | Tidak diubah. |
| Laporan | Laporan penjualan demo | Tambah ringkasan harian, filter tanggal, dan ekspor CSV/PDF. |
| Audit Log | Riwayat aktivitas read-only | Menerima catatan baru: import, ubah harga/resep, sold-out, cetak ulang, poin, konflik sync. |
| Pengaturan & Backup | Pengaturan outlet dan backup demo | Tambah data toko untuk struk dan pilihan lebar struk 58/80 mm. |
| Akses Ditolak | Halaman simulasi role | Tidak diubah. |
| Pelanggan & Loyalitas | **Halaman baru** | Daftar member, pencarian, tambah/edit, saldo poin, riwayat poin, pengaturan earn/redeem, dan penyesuaian poin manual. |

### 2.2 Kasir/POS

| Halaman atau dialog | Fungsi sekarang | Perubahan dalam plan |
|---|---|---|
| Kasir | Katalog, keranjang, jenis order, catatan, bayar | Pilih kasir, hold order, split payment, member, produk sold-out, scan barcode/SKU, dan touch target tablet. |
| Riwayat | Daftar transaksi dan detail struk | Menampilkan split payment, member, status sync/konflik, serta cetak ulang/PDF. |
| Sesi kas | Ringkasan sesi, transaksi terbaru, antrean sync | Tambah ringkasan harian dan ekspor CSV/PDF. Tutup sesi/rekonsiliasi kas tetap di luar scope. |
| Stok barang | Daftar stok produk | Menampilkan stok setelah penjualan, stok minus, dan status kritis. |
| Dialog pembayaran | Tunai atau QRIS | Tunai + QRIS dalam satu transaksi, pembulatan Rp100, redeem poin, dan validasi total. |
| Dialog struk | Struk demo, tombol cetak simulasi | Browser print, simpan PDF, cetak ulang, rincian split payment, dan poin member. |
| Dialog pembatalan | Batalkan transaksi lunas | Tetap ada. Pembatalan harus mengembalikan stok dan poin bila transaksi sudah dibayar. |
| Dialog sinkronisasi | Progres sync demo | Antrean persisten, retry, status gagal, konflik, dan review Admin. |
| Dialog hold order | **Baru** | Daftar maksimal 5 order, lanjutkan, hapus, dan nomor otomatis. |
| Dialog pilih kasir | **Baru** | Pilih karyawan aktif dengan role Kasir. |
| Dialog member | **Baru** | Cari member lewat nama/no. HP, lihat poin, gunakan redeem. |
| Dialog kosongkan draft | Konfirmasi hapus keranjang | Tidak diubah. |
| Dialog kontrol demo | Offline, sync, reset | Tambah simulasi gagal sync/konflik dan reset seluruh data baru. |

### 2.3 Absensi

| Halaman atau sheet | Fungsi sekarang | Perubahan dalam plan |
|---|---|---|
| Beranda | Absen masuk/pulang, jadwal, riwayat singkat | Tidak diubah tampilannya. Nama karyawan mengikuti keputusan sumber data. |
| Riwayat | Riwayat absensi pribadi | Tidak diubah. Tidak terhubung ke transaksi atau sesi kas. |
| Profil | Profil karyawan | Tidak diubah. Role/outlet hanya disesuaikan bila memakai daftar karyawan Admin. |
| Sheet notifikasi | Notifikasi demo | Tidak diubah. |
| Sheet lokasi outlet | Informasi lokasi | Tidak diubah. |
| Sheet jadwal | Jadwal hari ini | Tidak diubah. |
| Sheet absen | Selfie/lokasi simulasi | Tidak diubah. |

## 3. Aturan koordinasi antarhalaman

| Data | Dibuat/diubah di | Dibaca/dipakai di |
|---|---|---|
| Karyawan dan role | Admin > Karyawan | POS > pilih kasir; Absensi > nama dan role |
| Produk, harga, foto, SKU | Admin > Produk & Menu | POS > katalog dan scan; Stok; Laporan |
| Bahan dan resep | Admin > Bahan & Resep | POS > potong stok; Stok & Opname; Laporan |
| Transaksi | POS | Admin > Penjualan; Laporan; Audit; Sesi kas |
| Split payment | POS > pembayaran | Struk; Riwayat; Sesi kas; Admin > Penjualan; Laporan |
| Hold order | POS > Kasir | POS > daftar hold; tidak masuk Admin sampai dibayar |
| Member dan poin | Admin > Pelanggan & Loyalitas | POS > pencarian member; Struk; Laporan |
| Antrean sync | POS | POS > Sesi/Riwayat; Admin > Penjualan |
| Stok | POS > pembayaran; Admin > opname | POS > Stok; Admin > Stok & Opname; Produk |
| Struk | POS | POS > Riwayat; Admin > Penjualan |
| Absensi | Absensi | Admin > Jadwal & Absensi; tidak dipakai untuk membuka sesi kas |

Aturan penting:

- Satu perangkat, satu browser. Data tidak otomatis berpindah ke tablet lain.
- Jika Admin dan POS dibuka di dua tab pada browser yang sama, perubahan harus terbaca setelah tab difokuskan atau lewat listener penyimpanan.
- Semua aksi penting masuk Audit Log.
- Pembatalan transaksi setelah pembayaran harus mengembalikan stok dan poin.
- Reset demo harus menghapus data baru dan mengembalikan contoh awal.

## 4. Rincian fitur

### 4.1 Split payment dan pembulatan

Tujuan: satu transaksi bisa dibayar dengan tunai dan QRIS.

Perilaku:

- Kasir memilih metode pembayaran. Bisa satu metode penuh atau dua metode.
- Jika dua metode, isi nominal tunai dan QRIS. Jumlah keduanya harus sama dengan total.
- Pembulatan hanya menyentuh bagian tunai, ke Rp100 terdekat.
- Selisih pembulatan dicatat dan ditampilkan di struk.
- Tunai menampilkan uang diterima dan kembalian.
- QRIS tetap memakai verifikasi manual seperti sekarang.
- Tidak ada kartu debit/kredit pada fase ini.

Dampak halaman:

- Dialog pembayaran, struk, Riwayat, Sesi kas, Admin Penjualan, Laporan.

Kriteria selesai:

- Total Rp60.000 dapat dibayar Rp20.000 tunai + Rp40.000 QRIS.
- Total dan status lunas benar.
- Ringkasan tunai dan QRIS terpisah di sesi dan laporan.
- Struk menampilkan kedua metode.

### 4.2 Hold/park order

Tujuan: kasir dapat menyimpan order sementara tanpa kehilangan keranjang.

Perilaku:

- Maksimal 5 order aktif.
- Nomor otomatis, misalnya `HOLD-001`.
- Menyimpan item, jumlah, jenis order, catatan, dan waktu.
- Stok belum dipotong sampai pembayaran.
- Order dapat dilanjutkan atau dihapus.
- Order tetap ada setelah refresh.
- Order hilang saat dihapus, reset demo, atau sesi ditutup.
- Jika batas tercapai, kasir mendapat pesan dan tidak bisa menambah hold baru.

Dampak halaman:

- POS Kasir, dialog hold order, Riwayat tidak berubah sampai order dibayar.

Kriteria selesai:

- 5 order dapat disimpan.
- Order ke-6 ditolak dengan pesan.
- Refresh tidak menghilangkan hold.
- Resume mengembalikan isi keranjang dengan benar.

### 4.3 Potong stok dan resep

Tujuan: stok berkurang otomatis saat pembayaran sukses.

Perilaku:

- Produk ber resep memotong bahan sesuai resep dikali jumlah item.
- Produk tanpa resep memotong stok produk jadi.
- Jika resep tidak lengkap, produk memakai stok produk jadi dan menampilkan warning.
- Jika stok tidak cukup, transaksi tetap boleh dengan warning; stok menjadi minus.
- Pergerakan stok dicatat: penjualan, pembatalan, opname, pembelian, dan penyesuaian.
- Pembatalan transaksi mengembalikan stok yang sudah dipotong.
- Produk dengan sold-out manual tidak bisa dijual.
- Status otomatis dari stok bersifat warning, bukan blokir, karena stok minus diizinkan.
- Tidak ada jadwal menu per jam/hari.

Dampak halaman:

- Admin Produk, Bahan & Resep, Stok & Opname; POS Kasir, Stok, pembayaran, pembatalan.

Kriteria selesai:

- Produk ber resep mengurangi bahan yang benar.
- Produk tanpa resep mengurangi stok produk.
- Stok kurang menampilkan warning dan mencatat minus.
- Pembatalan mengembalikan stok.
- Admin melihat pergerakan stok yang sama.

### 4.4 Struk, cetak ulang, dan PDF

Tujuan: struk bisa dicetak dan disimpan tanpa printer khusus.

Perilaku:

- Tombol cetak membuka dialog print browser.
- PDF dibuat lewat “Save as PDF” di dialog print.
- Cetak ulang tersedia dari POS Riwayat dan Admin Penjualan.
- Struk memuat data toko, nomor order, waktu, kasir, jenis order, item, split payment, pembulatan, member/poin, dan catatan.
- Lebar struk 58 mm atau 80 mm dapat dipilih di Pengaturan.
- Tidak ada pengiriman WhatsApp/email pada fase ini.
- Cetak ulang dicatat di Audit Log.

Dampak halaman:

- POS struk dan Riwayat; Admin Penjualan dan Pengaturan.

Kriteria selesai:

- Struk tampil rapi di print preview.
- PDF dapat disimpan.
- Cetak ulang menghasilkan struk yang sama.
- Data toko dan lebar struk mengikuti Pengaturan.

### 4.5 Antrean offline dan error sync

Tujuan: kasir tahu transaksi mana yang belum terkirim dan bisa mencoba lagi.

Perilaku:

- Antrean disimpan setelah refresh.
- Status transaksi: menunggu, sedang sync, tersinkron, gagal, konflik.
- Retry dapat dilakukan per transaksi atau semua.
- Setiap kegagalan menyimpan alasan dan waktu percobaan.
- Konflik memakai aturan data lokal menang, lalu masuk daftar review Admin.
- Admin dapat menandai konflik selesai.
- Karena belum ada server, gagal dan konflik disimulasikan lewat kontrol demo.
- Tidak ada sinkronisasi antardevice.

Dampak halaman:

- POS Sesi kas, Riwayat, dialog sync; Admin Penjualan; Audit Log.

Kriteria selesai:

- Transaksi offline tetap ada setelah refresh.
- Retry mengubah status dengan benar.
- Transaksi gagal menampilkan alasan.
- Konflik muncul di Admin dan bisa ditandai selesai.

### 4.6 Ketersediaan produk

Tujuan: kasir tidak menjual produk yang sedang habis.

Perilaku:

- Admin dapat menandai produk sold-out manual.
- Produk sold-out manual tidak bisa ditambahkan ke keranjang.
- Status otomatis dari stok muncul saat bahan/stok produk kritis.
- Karena stok minus diizinkan, status otomatis berupa warning yang bisa dilanjutkan.
- Satu outlet, tanpa jadwal menu.
- Produk nonaktif tetap tidak muncul di POS.

Dampak halaman:

- Admin Produk & Menu; POS katalog, Stok, pembayaran.

Kriteria selesai:

- Sold-out manual memblokir produk di POS.
- Status kritis muncul dari stok.
- Kasir bisa melanjutkan transaksi stok kritis dengan warning.
- Admin dapat mengembalikan produk menjadi tersedia.

### 4.7 Ringkasan harian dan ekspor

Tujuan: owner bisa melihat dan mengunduh ringkasan operasional.

Perilaku:

- POS Sesi kas menampilkan ringkasan hari ini.
- Admin Laporan menampilkan ringkasan dengan filter tanggal.
- Metrik: penjualan, jumlah transaksi, rata-rata transaksi, tunai, QRIS, split, pembulatan, pembatalan/refund, poin member, produk terlaris, stok kritis, dan antrean sync.
- Ekspor CSV dibuat langsung di browser.
- PDF dibuat lewat print browser.
- Tutup sesi dan rekonsiliasi kas tetap di luar scope.

Dampak halaman:

- POS Sesi kas; Admin Laporan.

Kriteria selesai:

- Angka POS dan Admin sama untuk hari yang sama.
- CSV dapat diunduh.
- PDF dapat disimpan.
- Pembatalan dan split payment terhitung benar.

### 4.8 Aksesibilitas, tablet, printer, dan scanner

Tujuan: POS nyaman dipakai di tablet dan perangkat operasional.

Perilaku:

- Target sentuh minimal 44 px; tombol utama 48 px.
- Kontras teks memadai, focus terlihat, dan navigasi keyboard bekerja.
- Layout diuji di tablet landscape/portrait dan desktop.
- Scanner USB/Bluetooth bekerja sebagai keyboard.
- Diperlukan kolom SKU/barcode dan kolom scan di POS. Ini adalah kebutuhan pendukung scanner, bukan fitur pencarian penuh.
- Cetak memakai dialog browser; tidak ada driver printer langsung.
- Tidak ada integrasi native atau Web Bluetooth pada fase ini.

Dampak halaman:

- Seluruh halaman Admin, POS, dan Absensi; terutama POS Kasir dan struk.

Kriteria selesai:

- Semua tombol utama nyaman disentuh.
- Scan barcode/SKU menemukan produk yang benar.
- Print preview dan PDF berfungsi.
- Tidak ada elemen yang terpotong di tablet.

### 4.9 Member dan loyalty

Tujuan: member mendapat poin dan bisa menukar poin.

Perilaku:

- Halaman Admin baru: Pelanggan & Loyalitas.
- Data member: nama, no. HP, kode member, poin, tanggal daftar, status aktif.
- Pengaturan loyalty: aktif/nonaktif, nilai belanja per poin, nilai tukar poin, dan minimum redeem.
- Contoh awal aktif: 1 poin per Rp1.000; 100 poin = Rp10.000.
- POS dapat mencari member lewat nama atau no. HP.
- Poin didapat setelah pembayaran sukses.
- Redeem poin menjadi potongan transaksi dan ditampilkan di struk.
- Pembatalan transaksi membatalkan poin yang didapat dan mengembalikan poin yang dipakai.
- Admin dapat menyesuaikan poin manual dengan alasan; masuk Audit Log.
- Dasar perolehan poin: total transaksi setelah pembulatan. Pajak belum aktif.

Dampak halaman:

- Admin Pelanggan & Loyalitas, Penjualan, Audit; POS pembayaran, struk, Riwayat, Sesi kas, Laporan.

Kriteria selesai:

- Member dapat dicari dan dipakai di POS.
- Poin bertambah sesuai aturan Admin.
- Redeem mengurangi total dan tidak melebihi total.
- Pembatalan mengembalikan poin dengan benar.
- Perubahan aturan di Admin langsung dipakai POS.

## 5. Fondasi data bersama

Data disimpan di browser yang sama, bukan di server.

Rencana kelompok data:

- Data toko dan pengaturan struk.
- Karyawan dan role.
- Produk, bahan, resep, dan foto.
- Transaksi, pembayaran, pembatalan, dan hold order.
- Antrean sync dan konflik.
- Member, poin, dan aturan loyalty.
- Audit Log.

Aturan:

- Data awal dibuat sekali jika belum ada.
- Perubahan dari satu halaman harus terbaca di halaman lain pada browser yang sama.
- Reset demo membersihkan data baru dan membuat ulang contoh awal.
- Tidak ada klaim sinkron antardevice.
- Absensi memakai daftar karyawan Admin untuk nama dan role; data absensi tetap terpisah dari transaksi kas.

## 6. Urutan pengerjaan

Status implementasi per 5 Nov 2026:

> Catatan production: seluruh data di plan ini adalah demo prototype. Production tidak boleh memakai seed, data palsu, atau data bisnis hardcoded; lihat ADR-0001 bagian 4.

- **Fase 0 — selesai:** store lokal bersama, karyawan/kasir, pengaturan toko, reset, dan audit dasar.
- **Fase 1 — sebagian:** sold-out manual dan stok otomatis sudah berjalan; CRUD/edit penuh, import CSV, SKU/barcode, dan editor resep masih pending.
- **Fase 2 — selesai:** split Tunai + QRIS dengan pembulatan Rp100, hold maksimal 5, struk cetak/PDF.
- **Fase 3 — selesai:** potong bahan/produk, pergerakan stok, warning minus, dan pengembalian saat void.
- **Fase 4 — sebagian:** antrean offline persisten dan retry demo sudah ada; Admin Penjualan sudah membaca transaksi POS dari store bersama, termasuk split/member/poin dan pengembalian stok/poin saat void. Status gagal/konflik dan review Admin masih pending.
- **Fase 5 — sebagian:** halaman Pelanggan & Loyalitas dan poin/redeem POS sudah berjalan; ringkasan harian CSV/PDF dan penyatuan laporan Admin/POS masih pending.
- **Fase 6 — belum dimulai:** audit touch target, keyboard/focus, scanner, dan uji perangkat.

### Fase 0 — Fondasi bersama

- Penyimpanan data bersama.
- Satu daftar karyawan untuk Admin dan POS.
- Pilihan kasir aktif dengan role Kasir.
- Pengaturan toko untuk struk.
- Reset demo.
- Audit dasar.

Selesai bila: karyawan yang ditambahkan di Admin muncul di pilihan kasir POS; produk yang ditambahkan di Admin muncul di POS.

### Fase 1 — Data menu, bahan, resep, dan ketersediaan

- CRUD produk, bahan, resep.
- Import CSV (file Excel disimpan sebagai CSV) dan upload foto.
- SKU/barcode.
- Sold-out manual dan status stok otomatis.
- Validasi dan laporan error import.

Selesai bila: data contoh dapat diimport, produk muncul di POS, resep terhubung, dan sold-out bekerja.

### Fase 2 — Split payment, hold order, dan struk

- Split tunai + QRIS.
- Pembulatan Rp100.
- Hold maksimal 5 order.
- Browser print, PDF, dan cetak ulang.

Selesai bila: transaksi split, hold/resume, dan cetak ulang berjalan tanpa error.

### Fase 3 — Stok otomatis

- Potong bahan/produk saat pembayaran.
- Warning stok minus.
- Pergerakan stok.
- Pengembalian stok saat pembatalan.

Selesai bila: stok di POS dan Admin selalu mencerminkan transaksi yang sama.

### Fase 4 — Antrean offline dan konflik

- Antrean persisten.
- Retry dan status gagal.
- Simulasi konflik.
- Review konflik di Admin.

Selesai bila: transaksi offline bertahan setelah refresh dan bisa diselesaikan atau ditandai selesai.

### Fase 5 — Loyalty dan ringkasan harian

- Halaman Pelanggan & Loyalitas.
- Pencarian member dan redeem di POS.
- Poin masuk/keluar dan pembatalan.
- Ringkasan harian POS dan Admin.
- Ekspor CSV/PDF.

Selesai bila: aturan loyalty dapat diubah di Admin, poin berjalan di POS, dan laporan sama di kedua halaman.

### Fase 6 — Aksesibilitas dan perangkat

- Touch target tablet.
- Keyboard/focus.
- Scanner keyboard.
- Print preview 58/80 mm.
- Uji tablet dan desktop.

Selesai bila: POS nyaman dipakai di tablet, scanner menemukan produk, dan struk dapat dicetak/PDF.

## 7. Pengujian dan kriteria penerimaan

- Pemeriksaan sintaks JavaScript.
- Pemindaian ID dan referensi asset.
- Smoke test DOM untuk POS, Admin, dan Absensi.
- Skenario split payment, hold, resep, stok minus, hold refresh, sync gagal, konflik, loyalty, dan ekspor.
- Uji cetak/PDF lewat browser.
- Uji scanner keyboard dengan input barcode.
- Uji tablet landscape/portrait.
- Uji visual akhir tetap dilakukan owner di browser.

## 8. Di luar scope

- Multi-outlet.
- Sinkronisasi dua perangkat atau lebih.
- Backend, database produksi, dan payment gateway nyata.
- Login/role penuh per karyawan.
- Jadwal menu per jam/hari.
- Kitchen Display System.
- Pajak, service charge, dan diskon umum.
- Refund uang nyata.
- Printer thermal langsung dan Web Bluetooth.
- Pengiriman struk WhatsApp/email.
- Tutup sesi dan rekonsiliasi kas.
- Payroll.

## 9. Keputusan yang diselesaikan

1. Absensi memakai daftar karyawan Admin untuk nama dan role; desain dan alur Absensi tidak diubah. Sesi kas tetap terpisah dari Absensi.
2. Import awal memakai CSV. File Excel disimpan sebagai CSV; import .xlsx asli ditunda sampai ada persetujuan menambah library.
3. Poin dihitung dari total transaksi setelah pembulatan. Bila pajak/diskon ditambahkan nanti, dasar poin ditinjau ulang.
4. Lebar struk default 58 mm; 80 mm dapat dipilih di Pengaturan.
5. Status stok kritis otomatis hanya warning tanpa konfirmasi tambahan. Yang memblokir penjualan hanya sold-out manual.
6. Hold order dihapus manual atau lewat reset demo. Saat fitur tutup sesi ditambahkan, hold order ikut dibersihkan.
