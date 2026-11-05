# Nuvora

Prototype UI Gate 1 untuk Nuvora POS. Repo ini belum berisi backend, database produksi, auth nyata, atau integrasi pembayaran.

## Status

- **Gate 0:** audit repo/dokumen selesai.
- **Gate 1:** UI Absensi hasil port desain pemilik, Dashboard Admin, dan Kasir sudah disetujui pemilik pada 5 November 2026.
- **Ekspansi Gate 1:** fondasi data bersama, split payment Tunai + QRIS, hold order, potong/kembalikan stok, struk cetak/PDF, pelanggan & loyalitas (poin + redeem), dan antrean offline persisten sudah tersedia sebagai demo lokal.
- **Gate 2:** persiapan arsitektur produksi. ADR-0001 disetujui pemilik pada 5 November 2026; implementasi backend belum dimulai.
- Data di prototype adalah data demo dan tidak boleh dianggap data operasional nyata.

Laporan lengkap: [`docs/gate-1-ui-prototype-report.md`](docs/gate-1-ui-prototype-report.md)

Arsitektur produksi: [`docs/adr/ADR-0001-stack-produksi.md`](docs/adr/ADR-0001-stack-produksi.md)

Konteks proyek: [`docs/PROJECT-CONTEXT.md`](docs/PROJECT-CONTEXT.md)

## Menjalankan prototype

```bash
cd prototype
python3 -m http.server 4173
```

Buka `http://localhost:4173/`.

Halaman langsung:

- `http://localhost:4173/attendance.html` — Absensi Karyawan (full-screen responsif)
- `http://localhost:4173/admin.html` — Dashboard Admin
- `http://localhost:4173/pos.html` — Kasir

Tidak ada build step atau dependency yang perlu dipasang.

Absensi di-port dari desain pemilik (sumber desain sudah dihapus dari repo; riwayatnya tetap tersimpan di Git) dengan layout full-screen tanpa frame ponsel, responsif dari layar kecil sampai desktop. Tab Riwayat punya filter bulan/status dan avatar karyawan per baris. Logo memakai `prototype/assets/nuvora-logo.jpg` as-is. Karena `dina-avatar.jpg` dari desain tidak tersedia, avatar demo memakai placeholder `prototype/assets/dina-avatar.svg`.

Kasir memakai halaman penuh untuk Riwayat, Sesi kas, dan Stok barang. Modal sinkronisasi menampilkan persentase, spinner, dan pesan progres; kartu produk siap memakai foto asli jika data foto tersedia dan memakai ikon kategori sebagai fallback.

## Batasan demo

- Semua transaksi, absensi, stok, gaji, dan laporan adalah contoh.
- Tidak ada kamera/GPS asli, pembayaran nyata, printer thermal langsung, atau sinkronisasi server. Cetak struk memakai dialog browser (termasuk Simpan sebagai PDF).
- Stok demo berkurang saat transaksi dan kembali saat transaksi dibatalkan; transaksi tetap boleh melewati stok dengan warning.
- Data Admin, POS, member, dan transaksi disimpan di `localStorage` browser yang sama. Data absensi tetap terpisah di `sessionStorage`.
- Belum ada aset foto produk nyata atau upload permanen; dukungan foto pada POS menunggu data/backend.
- Payroll, diskon umum, refund uang nyata, QRIS otomatis, rekonsiliasi/tutup sesi, multi-outlet, sinkron antardevice, dan role/permission final masih **BLOCKED/BELUM DIPUTUSKAN**. Pembatalan transaksi adalah simulasi demo tanpa refund uang nyata, tetapi stok dan poin demo dikembalikan.
- Font Plus Jakarta Sans dimuat dari Google Fonts; tanpa internet, browser memakai fallback sistem.
- Stack prototype statis ini bukan keputusan stack produksi. Keputusan produksi: React + Vite + TypeScript + Supabase + PWA/IndexedDB, dengan fallback Tauri bila kebutuhan offline/printer tidak terpenuhi.
- **Aturan production:** tidak ada data bisnis hardcoded atau data palsu. Seed demo hanya untuk prototype/test dan tidak boleh dibawa ke database production; production dimulai dari onboarding nyata.

## Sumber perencanaan

- `docs/Nuvora-Rebuild-Planning-Pack-v0.2.pdf`
- `docs/ui-reference/` — mockup referensi visual.

Jangan memulai backend, merge, deploy, atau mengubah data produksi tanpa persetujuan eksplisit pemilik.
