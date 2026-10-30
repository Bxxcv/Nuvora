"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  LogOut,
  MapPin,
  Navigation,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

/* ---------------------------------- types --------------------------------- */

type AttendanceRow = {
  id: number;
  date: string;
  dayLabel: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  selfieCaptured: boolean;
};

type Tab = "beranda" | "riwayat" | "profil";
type Sheet = "absen" | "lokasi" | "jadwal" | "notif" | null;

const FALLBACK_HISTORY: AttendanceRow[] = [
  {
    id: 1,
    date: "2026-10-29",
    dayLabel: "Kamis, 29 Okt 2026",
    checkIn: "07:58",
    checkOut: "16:05",
    status: "Hadir",
    latitude: -7.7956,
    longitude: 110.3695,
    address: "Jl. Melati No. 12, Yogyakarta",
    selfieCaptured: true,
  },
  {
    id: 2,
    date: "2026-10-28",
    dayLabel: "Rabu, 28 Okt 2026",
    checkIn: "08:12",
    checkOut: "16:03",
    status: "Terlambat",
    latitude: -7.7956,
    longitude: 110.3695,
    address: "Jl. Melati No. 12, Yogyakarta",
    selfieCaptured: true,
  },
];

/* ------------------------------- solid icons ------------------------------ */

function CameraSolid({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM9 2 7.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3.17L15 2H9Zm3 15.2a5.2 5.2 0 1 1 0-10.4 5.2 5.2 0 0 1 0 10.4Z" />
    </svg>
  );
}

function PinSolid({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a7.4 7.4 0 0 0-7.4 7.4c0 5.5 7.4 12.6 7.4 12.6s7.4-7.1 7.4-12.6A7.4 7.4 0 0 0 12 2Zm0 10a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" />
    </svg>
  );
}

function IosStatusIcons() {
  return (
    <div className="flex items-center gap-[6px] text-[#0d2138]">
      {/* sinyal */}
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
        <rect x="0" y="7" width="3" height="5" rx="1" />
        <rect x="4.5" y="5" width="3" height="7" rx="1" />
        <rect x="9" y="2.5" width="3" height="9.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="12" rx="1" />
      </svg>
      {/* wifi */}
      <svg width="17" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M1.6 4.2a10.5 10.5 0 0 1 12.8 0" />
        <path d="M4.1 6.9a6.2 6.2 0 0 1 7.8 0" />
        <circle cx="8" cy="9.9" r="1.05" fill="currentColor" stroke="none" />
      </svg>
      {/* baterai */}
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
        <rect x="0.7" y="0.7" width="21" height="11.6" rx="3.4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.1" />
        <rect x="2.2" y="2.2" width="16.5" height="8.6" rx="2" fill="currentColor" />
        <path d="M24.4 4.3v4.4a2.3 2.3 0 0 0 0-4.4Z" fill="currentColor" fillOpacity="0.55" />
      </svg>
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Hadir")
    return (
      <span className="min-w-[92px] shrink-0 rounded-full bg-[#ddf3e4] px-3 py-[7px] text-center text-[13.5px] font-semibold text-[#1d9d4e]">
        Hadir
      </span>
    );
  if (status === "Terlambat")
    return (
      <span className="min-w-[92px] shrink-0 rounded-full bg-[#e2ecf3] px-3 py-[7px] text-center text-[13.5px] font-semibold text-[#4f728e]">
        Terlambat
      </span>
    );
  return (
    <span className="min-w-[92px] shrink-0 rounded-full bg-[#fdf0dc] px-3 py-[7px] text-center text-[13.5px] font-semibold text-[#b97b16]">
      Berlangsung
    </span>
  );
}

function HistoryRow({ row }: { row: AttendanceRow }) {
  const hadir = row.status === "Hadir";
  return (
    <div className="flex items-center gap-[14px] py-4">
      <div
        className={`grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full ${
          hadir ? "bg-[#2dbd67]" : "bg-[#8ea3b2]"
        }`}
      >
        {hadir ? (
          <Check className="h-[22px] w-[22px] text-white" strokeWidth={3} />
        ) : (
          <Clock3 className="h-[22px] w-[22px] text-white" strokeWidth={2.2} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#102e4e]">{row.dayLabel}</p>
        <p className="mt-[3px] text-[13px] font-medium text-[#70879b]">
          Masuk {row.checkIn ?? "--:--"}
          <span className="mx-[7px] text-[#b8c7d2]">•</span>
          Pulang {row.checkOut ?? "--:--"}
        </p>
      </div>
      <StatusBadge status={row.checkOut ? row.status : "Berlangsung"} />
    </div>
  );
}

/* ---------------------------------- app ----------------------------------- */

export default function AbsensiApp() {
  const [tab, setTab] = useState<Tab>("beranda");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [today, setToday] = useState<AttendanceRow | null>(null);
  const [history, setHistory] = useState<AttendanceRow[]>(FALLBACK_HISTORY);
  const [all, setAll] = useState<AttendanceRow[]>(FALLBACK_HISTORY);
  const [clock, setClock] = useState(nowTime);
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootVisible, setBootVisible] = useState(true);

  // kamera & lokasi
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setToday(data.today ?? null);
      setHistory(data.history ?? FALLBACK_HISTORY);
      setAll(data.all ?? FALLBACK_HISTORY);
    } catch {
      /* tetap pakai data contoh agar tampilan persis referensi */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // splash tampil minimal 2,6 detik sambil memuat data awal
    const boot = async () => {
      const started = Date.now();
      try {
        await load();
      } catch {
        /* tetap lanjut dengan data contoh */
      }
      const wait = Math.max(0, 2600 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      if (cancelled) return;
      setBootVisible(false);
      setTimeout(() => {
        if (!cancelled) setBooting(false);
      }, 550);
    };
    boot();
    const t = setInterval(() => setClock(nowTime()), 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [load]);

  // pasang ulang stream saat elemen video (re)mount di sheet absen
  useEffect(() => {
    if (sheet === "absen" && !captured && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [sheet, captured]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const detectLocation = useCallback(() => {
    setLocating(true);
    if (!("geolocation" in navigator)) {
      setCoords({ lat: -7.7956, lng: 110.3695 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        // fallback koordinat outlet Yogyakarta
        setCoords({ lat: -7.7956, lng: 110.3695 });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, []);

  const openAbsen = useCallback(async () => {
    if (today?.checkOut) {
      showToast("Absensi hari ini sudah selesai");
      return;
    }
    setCaptured(null);
    setCameraError(false);
    setSheet("absen");
    detectLocation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCameraError(true);
    }
  }, [today, detectLocation, showToast]);

  const closeSheet = useCallback(() => {
    stopCamera();
    setSheet(null);
  }, [stopCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (video && video.videoWidth > 0 && !cameraError) {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const scale = Math.max(720 / video.videoWidth, 960 / video.videoHeight);
        const w = video.videoWidth * scale;
        const h = video.videoHeight * scale;
        ctx.translate(720, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, (720 - w) / 2, (960 - h) / 2, w, h);
        setCaptured(canvas.toDataURL("image/jpeg", 0.85));
        return;
      }
    }
    setCaptured("/images/dina-avatar.jpg");
  }, [cameraError]);

  const confirmAbsen = useCallback(async () => {
    const action = today?.checkIn ? "out" : "in";
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          time: nowTime(),
          latitude: coords?.lat ?? -7.7956,
          longitude: coords?.lng ?? 110.3695,
          selfieCaptured: true,
        }),
      });
      if (!res.ok) throw new Error("gagal");
      const data = await res.json();
      setToday(data.today ?? null);
      setHistory(data.history ?? []);
      setAll(data.all ?? []);
      closeSheet();
      showToast(
        action === "in"
          ? `Absen masuk berhasil pukul ${nowTime()}`
          : `Absen pulang berhasil pukul ${nowTime()} — sampai jumpa besok!`,
      );
    } catch {
      showToast("Gagal menyimpan absensi, coba lagi");
    } finally {
      setSubmitting(false);
    }
  }, [today, coords, closeSheet, showToast]);

  const sudahMasuk = Boolean(today?.checkIn);
  const sudahPulang = Boolean(today?.checkOut);

  const statusText = sudahPulang
    ? "Sudah Pulang"
    : sudahMasuk
      ? "Sudah Absen Masuk"
      : "Belum Absen";

  return (
    <div className="stage grid min-h-dvh place-items-center bg-[#edeae5] py-4">
      {/* ------------------------------ phone frame ----------------------------- */}
      <div
        className="phone-outer relative w-[402px] rounded-[56px] bg-[#111214] p-[11px] shadow-[0_50px_100px_-18px_rgba(30,35,40,0.5),0_18px_36px_rgba(30,35,40,0.28),inset_0_0_0_2px_#2c2e30]"
        style={{ height: "min(856px, calc(100dvh - 24px))" }}
      >
        {/* tombol samping */}
        <div className="phone-btn absolute -left-[2.5px] top-[168px] h-[30px] w-[3px] rounded-l-md bg-[#26282a]" />
        <div className="phone-btn absolute -left-[2.5px] top-[212px] h-[56px] w-[3px] rounded-l-md bg-[#26282a]" />
        <div className="phone-btn absolute -left-[2.5px] top-[276px] h-[56px] w-[3px] rounded-l-md bg-[#26282a]" />
        <div className="phone-btn absolute -right-[2.5px] top-[224px] h-[84px] w-[3px] rounded-r-md bg-[#26282a]" />

        <div className="phone-screen relative flex h-full flex-col overflow-hidden rounded-[46px] bg-white">
          {/* status bar */}
          <div className="relative z-20 flex h-[50px] shrink-0 items-end justify-between px-[30px] pb-[6px]">
            <span className="text-[15.5px] font-bold tracking-[0.01em] text-[#0d2138]">{clock}</span>
            <div className="dynamic-island absolute left-1/2 top-[11px] h-[29px] w-[110px] -translate-x-1/2 rounded-full bg-black">
              <div className="absolute right-[14px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-[#1d2a3a]" />
            </div>
            <IosStatusIcons />
          </div>

          {/* toast */}
          {toast && (
            <div className="anim-toast absolute inset-x-[22px] top-[62px] z-[70] flex items-center gap-3 rounded-2xl bg-[#102e4e] px-4 py-[13px] shadow-[0_16px_32px_rgba(16,46,78,0.35)]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2dbd67]">
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
              <p className="text-[13.5px] font-semibold leading-snug text-white">{toast}</p>
            </div>
          )}

          {/* ------------------------------- konten ------------------------------ */}
          <div
            key={bootVisible ? "boot" : "ready"}
            className="no-scrollbar relative flex-1 overflow-y-auto"
          >
            {/* header brand — selalu tampil di Beranda */}
            {tab === "beranda" && (
              <div className="anim-fade">
                <div className="px-[26px]">
                  <div className="mt-[6px] flex items-start justify-between">
                    <div className="flex items-center gap-[13px]">
                      <Image
                        src="/images/nuvora-logo.png"
                        alt="Logo Nuvora"
                        width={112}
                        height={112}
                        priority
                        className="h-[56px] w-[56px] rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[27px] font-extrabold leading-[1.02] tracking-[-0.02em] text-[#0f2b4d]">
                          Nuvora
                        </p>
                        <p className="mt-[2px] text-[19px] font-semibold leading-none text-[#1588b8]">
                          Absensi
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSheet("notif")}
                      aria-label="Notifikasi"
                      className="relative mt-[10px] rounded-full p-1 text-[#102e4e] transition active:scale-90"
                    >
                      <Bell className="h-[26px] w-[26px]" strokeWidth={1.9} />
                      <span className="absolute right-[3px] top-[3px] h-[8px] w-[8px] rounded-full border-2 border-white bg-[#e8503a]" />
                    </button>
                  </div>
                </div>

                <div className="mt-[18px] border-t border-[#edf1f4]" />

                <div className="px-[26px] pb-7">
                  {/* profil singkat */}
                  <div className="mt-[18px] flex items-center gap-[15px]">
                    <Image
                      src="/images/dina-avatar.jpg"
                      alt="Foto Dina Pratama"
                      width={120}
                      height={120}
                      priority
                      className="h-[60px] w-[60px] shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[19px] font-bold leading-tight text-[#102e4e]">
                        Dina Pratama
                      </p>
                      <p className="mt-[3px] text-[15px] font-medium text-[#70879b]">Karyawan</p>
                    </div>
                    <p className="shrink-0 text-right text-[14.5px] font-medium leading-[1.4] text-[#173656]">
                      Jumat,
                      <br />
                      30 Okt 2026
                    </p>
                  </div>

                  {/* status kehadiran */}
                  <div className="mt-[24px] flex items-center gap-[16px] rounded-[16px] bg-[#e8f3fa] px-[20px] py-[18px]">
                    <div className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full bg-[#178cbd]">
                      <Clock3 className="h-[30px] w-[30px] text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#173656]">Status Kehadiran</p>
                      <p
                        className={`mt-[2px] font-extrabold leading-tight tracking-[-0.01em] text-[#0f2b4d] ${
                          statusText.length > 12 ? "text-[21px]" : "text-[25px]"
                        }`}
                      >
                        {statusText}
                      </p>
                      {sudahMasuk && (
                        <p className="mt-[2px] text-[12.5px] font-semibold text-[#1588b8]">
                          Masuk {today?.checkIn}
                          {sudahPulang ? ` • Pulang ${today?.checkOut}` : " • Shift Pagi s.d. 16.00"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* tombol absen */}
                  <button
                    onClick={openAbsen}
                    disabled={sudahPulang}
                    className={`mt-[20px] flex h-[62px] w-full items-center overflow-hidden rounded-[14px] text-white transition active:scale-[0.99] ${
                      sudahPulang
                        ? "bg-[#9db4c2]"
                        : "bg-gradient-to-b from-[#1b92c2] to-[#1483b3] shadow-[0_10px_20px_-8px_rgba(21,136,184,0.65)]"
                    }`}
                  >
                    <span className="flex flex-1 items-center justify-center gap-[13px] pl-[70px]">
                      {sudahPulang ? (
                        <Check className="h-[26px] w-[26px]" strokeWidth={2.6} />
                      ) : (
                        <CameraSolid className="h-[27px] w-[27px]" />
                      )}
                      <span className="text-[21px] font-semibold tracking-[0.005em]">
                        {sudahPulang ? "Absensi Selesai" : sudahMasuk ? "Absen Pulang" : "Absen Masuk"}
                      </span>
                    </span>
                    <span className="h-[34px] w-px bg-white/35" />
                    <span className="grid w-[72px] shrink-0 place-items-center">
                      <PinSolid className="h-[26px] w-[26px]" />
                    </span>
                  </button>

                  {/* persyaratan */}
                  <h2 className="mt-[28px] text-[18px] font-extrabold text-[#102e4e]">
                    Persyaratan Absen
                  </h2>
                  <div className="mt-[16px] flex items-stretch">
                    <div className="flex flex-1 items-start gap-[12px]">
                      <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-[#eaf4fa] text-[#1588b8]">
                        <CameraSolid className="h-[22px] w-[22px]" />
                      </span>
                      <span>
                        <span className="block text-[14.5px] font-bold leading-tight text-[#102e4e]">
                          Selfie diperlukan
                        </span>
                        <span className="mt-[4px] block text-[11.8px] font-medium leading-[1.35] text-[#70879b]">
                          Pastikan wajah terlihat jelas
                        </span>
                      </span>
                    </div>
                    <div className="mx-[14px] w-px bg-[#e6eef3]" />
                    <div className="flex flex-1 items-start gap-[12px]">
                      <span className="grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full bg-[#eaf4fa] text-[#1588b8]">
                        <PinSolid className="h-[22px] w-[22px]" />
                      </span>
                      <span>
                        <span className="block text-[14.5px] font-bold leading-tight text-[#102e4e]">
                          Lokasi diperlukan
                        </span>
                        <span className="mt-[4px] block text-[11.8px] font-medium leading-[1.35] text-[#70879b]">
                          Hanya di area outlet
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* lokasi terdeteksi */}
                  <button
                    onClick={() => setSheet("lokasi")}
                    className="mt-[20px] flex w-full items-center gap-[13px] rounded-[12px] bg-[#f1f5f8] px-[16px] py-[14px] text-left transition active:bg-[#e8eff4]"
                  >
                    <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#e6eef4] text-[#55748c]">
                      <PinSolid className="h-[19px] w-[19px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-[#102e4e]">
                        Lokasi outlet terdeteksi
                      </span>
                      <span className="mt-[2px] block truncate text-[12.5px] font-medium text-[#70879b]">
                        Jl. Melati No. 12, Yogyakarta
                      </span>
                    </span>
                    <ChevronRight className="h-[20px] w-[20px] shrink-0 text-[#8ba1b1]" strokeWidth={2.2} />
                  </button>

                  {/* jadwal */}
                  <h2 className="mt-[28px] text-[18px] font-extrabold text-[#102e4e]">Jadwal Hari Ini</h2>
                  <button
                    onClick={() => setSheet("jadwal")}
                    className="mt-[16px] flex w-full items-center gap-[13px] rounded-[12px] bg-[#f1f5f8] px-[16px] py-[14px] text-left transition active:bg-[#e8eff4]"
                  >
                    <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#e6eef4] text-[#173656]">
                      <CalendarDays className="h-[20px] w-[20px]" strokeWidth={1.9} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[14.5px] font-bold text-[#102e4e]">Shift Pagi</span>
                      <span className="mt-[2px] block text-[13px] font-medium text-[#70879b]">
                        08.00 – 16.00
                      </span>
                    </span>
                    <ChevronRight className="h-[20px] w-[20px] shrink-0 text-[#8ba1b1]" strokeWidth={2.2} />
                  </button>

                  {/* riwayat */}
                  <div className="mt-[28px] flex items-center justify-between">
                    <h2 className="text-[18px] font-extrabold text-[#102e4e]">Riwayat Absensi</h2>
                    <button
                      onClick={() => setTab("riwayat")}
                      className="text-[14px] font-semibold text-[#1588b8] transition active:opacity-60"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="divide-y divide-[#edf1f4]">
                    {history.slice(0, 2).map((row) => (
                      <HistoryRow key={row.id} row={row} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------ RIWAYAT ------------------------------ */}
            {tab === "riwayat" && (
              <div className="anim-fade px-[26px] pb-7">
                <div className="mt-[6px] flex items-center gap-3">
                  <button
                    onClick={() => setTab("beranda")}
                    aria-label="Kembali"
                    className="grid h-10 w-10 place-items-center rounded-full bg-[#f1f5f8] text-[#102e4e] transition active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
                  </button>
                  <div>
                    <h1 className="text-[21px] font-extrabold leading-tight text-[#102e4e]">Riwayat Absensi</h1>
                    <p className="text-[13px] font-medium text-[#70879b]">Oktober 2026 • Outlet Yogyakarta</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Hadir", value: all.filter((r) => r.status === "Hadir" && r.checkOut).length + (today?.status === "Hadir" && today?.checkOut ? 0 : 0), color: "text-[#1d9d4e]", bg: "bg-[#eefaf1]" },
                    { label: "Terlambat", value: all.filter((r) => r.status === "Terlambat").length, color: "text-[#4f728e]", bg: "bg-[#eef4f8]" },
                    { label: "Total Hari", value: all.length, color: "text-[#1588b8]", bg: "bg-[#e8f3fa]" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl ${s.bg} px-3 py-4 text-center`}>
                      <p className={`text-[22px] font-extrabold leading-none ${s.color}`}>{s.value}</p>
                      <p className="mt-[6px] text-[11.5px] font-semibold text-[#70879b]">{s.label}</p>
                    </div>
                  ))}
                </div>

                {today && (
                  <>
                    <p className="mb-1 mt-7 text-[13px] font-bold uppercase tracking-[0.06em] text-[#8ba1b1]">Hari Ini</p>
                    <div className="divide-y divide-[#edf1f4] border-b border-[#edf1f4]">
                      <HistoryRow row={today} />
                    </div>
                  </>
                )}

                <p className="mb-1 mt-6 text-[13px] font-bold uppercase tracking-[0.06em] text-[#8ba1b1]">Sebelumnya</p>
                <div className="divide-y divide-[#edf1f4]">
                  {history.map((row) => (
                    <HistoryRow key={row.id} row={row} />
                  ))}
                </div>
              </div>
            )}

            {/* ------------------------------- PROFIL ------------------------------ */}
            {tab === "profil" && (
              <div className="anim-fade px-[26px] pb-7">
                <h1 className="mt-[6px] text-[21px] font-extrabold text-[#102e4e]">Profil</h1>
                <div className="mt-6 flex flex-col items-center rounded-[20px] bg-[#e8f3fa] px-6 py-7 text-center">
                  <Image
                    src="/images/dina-avatar.jpg"
                    alt="Foto Dina Pratama"
                    width={160}
                    height={160}
                    className="h-[84px] w-[84px] rounded-full object-cover ring-4 ring-white"
                  />
                  <p className="mt-4 text-[19px] font-extrabold text-[#102e4e]">Dina Pratama</p>
                  <p className="mt-1 text-[13.5px] font-medium text-[#70879b]">Karyawan • ID NV-2026-014</p>
                  <span className="mt-3 rounded-full bg-white px-3 py-[5px] text-[12px] font-bold text-[#1588b8]">
                    Outlet Jl. Melati No. 12, Yogyakarta
                  </span>
                </div>

                <div className="mt-6 divide-y divide-[#edf1f4] rounded-[16px] bg-[#f7fafc] px-4">
                  {[
                    { icon: ShieldCheck, label: "Data Karyawan", sub: "NIK, jabatan & kontak" },
                    { icon: CalendarDays, label: "Jadwal Saya", sub: "Shift Pagi • 08.00 – 16.00" },
                    { icon: FileText, label: "Pengajuan Izin / Cuti", sub: "Ajukan izin baru" },
                    { icon: Settings, label: "Pengaturan", sub: "Notifikasi & keamanan akun" },
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => showToast(`${m.label} — fitur demo untuk Dina Pratama`)}
                      className="flex w-full items-center gap-[13px] py-[15px] text-left transition active:opacity-60"
                    >
                      <span className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full bg-[#e8f3fa] text-[#1588b8]">
                        <m.icon className="h-[20px] w-[20px]" strokeWidth={1.9} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14.5px] font-bold text-[#102e4e]">{m.label}</span>
                        <span className="mt-[1px] block text-[12.5px] font-medium text-[#70879b]">{m.sub}</span>
                      </span>
                      <ChevronRight className="h-[19px] w-[19px] text-[#8ba1b1]" strokeWidth={2.2} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => showToast("Anda tetap masuk sebagai Dina Pratama (mode demo)")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#f3d4cf] bg-[#fdf1ef] py-[14px] text-[14.5px] font-bold text-[#d14a38] transition active:scale-[0.99]"
                >
                  <LogOut className="h-[19px] w-[19px]" strokeWidth={2} />
                  Keluar Akun
                </button>
                <p className="mt-5 text-center text-[12px] font-medium text-[#a4b6c3]">Nuvora Absensi v1.0.0</p>
              </div>
            )}
          </div>

          {/* ----------------------------- bottom nav ---------------------------- */}
          {booting ? (
            <div className="h-[78px] shrink-0 border-t border-[#edf1f4] bg-white" />
          ) : (
          <nav className="anim-fade relative z-20 grid h-[78px] shrink-0 grid-cols-3 border-t border-[#edf1f4] bg-white px-[18px]">
            {(
              [
                { key: "beranda", label: "Beranda", Icon: Home },
                { key: "riwayat", label: "Riwayat", Icon: Clock3 },
                { key: "profil", label: "Profil", Icon: User },
              ] as const
            ).map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`relative flex flex-col items-center justify-center gap-[4px] pb-[10px] text-[13px] font-semibold transition active:scale-95 ${
                    active ? "text-[#1588b8]" : "text-[#71879a]"
                  }`}
                >
                  <Icon
                    className="h-[25px] w-[25px]"
                    strokeWidth={active ? 2.1 : 1.8}
                    fill={active && key === "beranda" ? "#1588b8" : "none"}
                  />
                  {label}
                  {active && (
                    <span className="absolute bottom-[7px] h-[3.5px] w-[38px] rounded-full bg-[#1588b8]" />
                  )}
                </button>
              );
            })}
          </nav>
          )}

          {/* --------------------------- splash loading --------------------------- */}
          {booting && (
            <div
              className="absolute inset-0 z-[15] flex flex-col items-center justify-center bg-white px-10 transition-opacity duration-500"
              style={{ opacity: bootVisible ? 1 : 0 }}
            >
              {/* pulsa ring di belakang logo */}
              <div className="relative grid place-items-center">
                <span className="anim-splash-ring absolute h-[132px] w-[132px] rounded-full border-[3px] border-[#1588b8]" />
                <span
                  className="anim-splash-ring absolute h-[132px] w-[132px] rounded-full border-[3px] border-[#1588b8]"
                  style={{ animationDelay: "0.55s" }}
                />
                <Image
                  src="/images/nuvora-logo.png"
                  alt="Logo Nuvora"
                  width={256}
                  height={256}
                  priority
                  className="anim-splash-pop relative h-[128px] w-[128px] object-contain"
                />
              </div>
              <p
                className="anim-splash-rise mt-6 text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#0f2b4d]"
                style={{ animationDelay: "0.25s" }}
              >
                Nuvora
              </p>
              <p
                className="anim-splash-rise mt-[6px] text-[19px] font-semibold leading-none text-[#1588b8]"
                style={{ animationDelay: "0.35s" }}
              >
                Absensi
              </p>
              <div
                className="anim-splash-rise mt-9 h-[5px] w-[184px] overflow-hidden rounded-full bg-[#e6eef3]"
                style={{ animationDelay: "0.45s" }}
              >
                <div className="anim-splash-bar h-full w-[58px] rounded-full bg-[#1588b8]" />
              </div>
              <p
                className="anim-splash-rise mt-4 text-[12.5px] font-semibold tracking-[0.02em] text-[#8ba1b1]"
                style={{ animationDelay: "0.55s" }}
              >
                Menyiapkan absensi…
              </p>
              <p className="absolute bottom-[34px] text-[11.5px] font-medium text-[#a4b6c3]">
                Nuvora Absensi v1.0.0
              </p>
            </div>
          )}

          {/* -------------------------------- sheets ------------------------------- */}
          {sheet && (
            <div className="absolute inset-0 z-50">
              <button
                aria-label="Tutup"
                onClick={closeSheet}
                className="anim-fade absolute inset-0 h-full w-full bg-[#0b2239]/45"
              />
              <div className="anim-sheet absolute inset-x-0 bottom-0 max-h-[92%] overflow-y-auto rounded-t-[26px] bg-white px-[26px] pb-[30px] pt-[14px] no-scrollbar">
                <div className="mx-auto mb-5 h-[5px] w-[44px] rounded-full bg-[#dfe8ee]" />

                {sheet === "notif" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[18px] font-extrabold text-[#102e4e]">Notifikasi</h3>
                      <button onClick={closeSheet} aria-label="Tutup notifikasi" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f5f8] text-[#102e4e]">
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        { title: "Pengingat absen masuk", body: "Shift Pagi dimulai pukul 08.00. Jangan lupa selfie di area outlet.", time: "07:30" },
                        { title: "Jadwal besok terbit", body: "Sabtu, 31 Okt 2026 — Shift Pagi 08.00 – 16.00 di Outlet Yogyakarta.", time: "Kemarin" },
                        { title: "Absensi kemarin tercatat", body: "Kamis, 29 Okt 2026 — Masuk 07:58, Pulang 16:05 (Hadir).", time: "Kemarin" },
                      ].map((n) => (
                        <div key={n.title} className="flex gap-3 rounded-2xl bg-[#f7fafc] p-4">
                          <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-[#e8f3fa] text-[#1588b8]">
                            <Bell className="h-[18px] w-[18px]" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-[#102e4e]">{n.title}</p>
                            <p className="mt-[2px] text-[12.5px] leading-relaxed text-[#70879b]">{n.body}</p>
                            <p className="mt-[4px] text-[11px] font-semibold text-[#a4b6c3]">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sheet === "lokasi" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[18px] font-extrabold text-[#102e4e]">Lokasi Outlet</h3>
                      <button onClick={closeSheet} aria-label="Tutup lokasi" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f5f8] text-[#102e4e]">
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    {/* peta skematis */}
                    <div className="relative mt-4 h-[190px] overflow-hidden rounded-2xl bg-[#e9f2e9]">
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 340 190" preserveAspectRatio="none" aria-hidden>
                        <rect width="340" height="190" fill="#e7f0e4" />
                        <path d="M-10 130 C70 110 130 150 210 128 S320 96 360 108 L360 190 L-10 190Z" fill="#dcead9" />
                        <path d="M-10 62 H360 M60 -10 V200 M170 -10 V200 M268 -10 V200" stroke="#ffffff" strokeWidth="13" />
                        <path d="M-10 62 H360 M60 -10 V200 M170 -10 V200 M268 -10 V200" stroke="#d4dee2" strokeWidth="1.4" strokeDasharray="8 7" />
                        <circle cx="176" cy="96" r="44" fill="#1588b8" fillOpacity="0.13" />
                      </svg>
                      <span className="absolute left-1/2 top-[86px] -translate-x-1/2 -translate-y-1/2 text-[#1588b8]">
                        <PinSolid className="h-[34px] w-[34px] drop-shadow" />
                      </span>
                      <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-[5px] text-[11px] font-bold text-[#102e4e] shadow-sm">
                        Radius absen 100 m
                      </span>
                    </div>
                    <div className="mt-4 space-y-[10px] text-[13.5px]">
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Outlet</span><span className="font-bold text-[#102e4e]">Yogyakarta — Melati</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Alamat</span><span className="font-bold text-[#102e4e]">Jl. Melati No. 12</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Koordinat</span><span className="font-bold text-[#102e4e]">-7.7956, 110.3695</span></p>
                      <p className="flex items-center justify-between"><span className="font-medium text-[#70879b]">Status GPS</span><span className="rounded-full bg-[#ddf3e4] px-2.5 py-[3px] text-[12px] font-bold text-[#1d9d4e]">Di dalam area outlet</span></p>
                    </div>
                    <button onClick={closeSheet} className="mt-6 h-[52px] w-full rounded-[13px] bg-gradient-to-b from-[#1b92c2] to-[#1483b3] text-[16px] font-semibold text-white transition active:scale-[0.99]">
                      Mengerti
                    </button>
                  </div>
                )}

                {sheet === "jadwal" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[18px] font-extrabold text-[#102e4e]">Jadwal Hari Ini</h3>
                      <button onClick={closeSheet} aria-label="Tutup jadwal" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f5f8] text-[#102e4e]">
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    <div className="mt-4 rounded-2xl bg-[#e8f3fa] p-5">
                      <p className="text-[13px] font-semibold text-[#1588b8]">Jumat, 30 Okt 2026</p>
                      <p className="mt-1 text-[20px] font-extrabold text-[#102e4e]">Shift Pagi</p>
                      <p className="mt-1 text-[14px] font-medium text-[#70879b]">08.00 – 16.00 • 8 jam kerja</p>
                    </div>
                    <div className="mt-4 space-y-[10px] text-[13.5px]">
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Toleransi keterlambatan</span><span className="font-bold text-[#102e4e]">15 menit</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Istirahat</span><span className="font-bold text-[#102e4e]">12.00 – 13.00</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#70879b]">Lokasi</span><span className="font-bold text-[#102e4e]">Outlet Yogyakarta</span></p>
                    </div>
                    <button onClick={closeSheet} className="mt-6 h-[52px] w-full rounded-[13px] bg-gradient-to-b from-[#1b92c2] to-[#1483b3] text-[16px] font-semibold text-white transition active:scale-[0.99]">
                      Mengerti
                    </button>
                  </div>
                )}

                {sheet === "absen" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-[18px] font-extrabold text-[#102e4e]">
                        {sudahMasuk ? "Absen Pulang" : "Absen Masuk"}
                      </h3>
                      <button onClick={closeSheet} aria-label="Tutup absen" className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f5f8] text-[#102e4e]">
                        <X className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                    <p className="mt-[2px] text-[13px] font-medium text-[#70879b]">
                      Ambil selfie dan pastikan lokasi Anda terdeteksi di area outlet.
                    </p>

                    <div className="relative mt-4 h-[300px] overflow-hidden rounded-[20px] bg-[#102e4e]">
                      {captured ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={captured} alt="Selfie absensi" className="h-full w-full object-cover" />
                      ) : cameraError ? (
                        <Image src="/images/dina-avatar.jpg" alt="Contoh selfie" width={600} height={800} className="h-full w-full object-cover opacity-90" />
                      ) : (
                        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
                      )}
                      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[218px] w-[168px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-white/85" />
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-[5px] text-[11px] font-semibold text-white">
                        {captured ? "Selfie berhasil diambil" : cameraError ? "Kamera tidak tersedia — memakai foto profil" : "Posisikan wajah di dalam bingkai"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-[#f1f5f8] px-4 py-[12px]">
                      <span className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full bg-[#e6eef4] text-[#1588b8]">
                        <Navigation className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold text-[#102e4e]">
                          {locating ? "Mendeteksi lokasi…" : "Lokasi outlet terdeteksi"}
                        </p>
                        <p className="truncate text-[12px] font-medium text-[#70879b]">
                          {coords
                            ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} • Jl. Melati No. 12, Yogyakarta`
                            : "Jl. Melati No. 12, Yogyakarta"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#ddf3e4] px-2.5 py-[3px] text-[11.5px] font-bold text-[#1d9d4e]">Valid</span>
                    </div>

                    {captured ? (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => setCaptured(null)}
                          className="h-[52px] flex-1 rounded-[13px] border border-[#d7e4ec] text-[15px] font-bold text-[#102e4e] transition active:scale-[0.99]"
                        >
                          Ambil Ulang
                        </button>
                        <button
                          onClick={confirmAbsen}
                          disabled={submitting}
                          className="h-[52px] flex-[1.4] rounded-[13px] bg-gradient-to-b from-[#1b92c2] to-[#1483b3] text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
                        >
                          {submitting ? "Menyimpan…" : sudahMasuk ? "Konfirmasi Pulang" : "Konfirmasi Absen"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={capture}
                        className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-b from-[#1b92c2] to-[#1483b3] text-[16px] font-semibold text-white transition active:scale-[0.99]"
                      >
                        <CameraSolid className="h-[22px] w-[22px]" />
                        Ambil Selfie
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
