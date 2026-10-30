import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuvora Absensi — Absensi Karyawan",
  description:
    "Aplikasi absensi karyawan Nuvora: absen masuk & pulang dengan selfie dan lokasi outlet, jadwal shift, dan riwayat kehadiran.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#edeae5] text-slate-900 antialiased">{children}</body>
    </html>
  );
}
