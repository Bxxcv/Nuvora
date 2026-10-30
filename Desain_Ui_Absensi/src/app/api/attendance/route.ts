import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { attendances } from "@/db/schema";

export const dynamic = "force-dynamic";

const TODAY = "2026-10-30";
const TODAY_LABEL = "Jumat, 30 Okt 2026";
const OUTLET_ADDRESS = "Jl. Melati No. 12, Yogyakarta";

async function ensureSeed() {
  await db
    .insert(attendances)
    .values([
      {
        date: "2026-10-29",
        dayLabel: "Kamis, 29 Okt 2026",
        checkIn: "07:58",
        checkOut: "16:05",
        status: "Hadir",
        address: OUTLET_ADDRESS,
        selfieCaptured: true,
      },
      {
        date: "2026-10-28",
        dayLabel: "Rabu, 28 Okt 2026",
        checkIn: "08:12",
        checkOut: "16:03",
        status: "Terlambat",
        address: OUTLET_ADDRESS,
        selfieCaptured: true,
      },
      {
        date: "2026-10-27",
        dayLabel: "Selasa, 27 Okt 2026",
        checkIn: "07:55",
        checkOut: "16:02",
        status: "Hadir",
        address: OUTLET_ADDRESS,
        selfieCaptured: true,
      },
      {
        date: "2026-10-26",
        dayLabel: "Senin, 26 Okt 2026",
        checkIn: "07:57",
        checkOut: "16:04",
        status: "Hadir",
        address: OUTLET_ADDRESS,
        selfieCaptured: true,
      },
    ])
    .onConflictDoNothing();
}

async function payload() {
  const rows = await db
    .select()
    .from(attendances)
    .orderBy(desc(attendances.date));
  const today = rows.find((r) => r.date === TODAY) ?? null;
  const history = rows.filter((r) => r.date !== TODAY);
  return { today, history, all: rows };
}

export async function GET() {
  try {
    await ensureSeed();
    return NextResponse.json(await payload());
  } catch (error) {
    console.error("GET /api/attendance", error);
    return NextResponse.json(
      { error: "Gagal memuat data absensi" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: "in" | "out";
      time?: string;
      latitude?: number | null;
      longitude?: number | null;
      selfieCaptured?: boolean;
    };

    if (body.action !== "in" && body.action !== "out") {
      return NextResponse.json(
        { error: "Aksi absensi tidak valid" },
        { status: 400 },
      );
    }

    const time =
      body.time ??
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).replace(".", ":");

    await ensureSeed();

    const existing = await db
      .select()
      .from(attendances)
      .where(eq(attendances.date, TODAY))
      .limit(1);

    if (body.action === "in") {
      const [hh, mm] = time.split(":").map(Number);
      const status = hh * 60 + mm <= 8 * 60 ? "Hadir" : "Terlambat";
      if (existing.length === 0) {
        await db.insert(attendances).values({
          date: TODAY,
          dayLabel: TODAY_LABEL,
          checkIn: time,
          status,
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
          address: OUTLET_ADDRESS,
          selfieCaptured: body.selfieCaptured ?? false,
        });
      } else {
        await db
          .update(attendances)
          .set({
            checkIn: time,
            status,
            latitude: body.latitude ?? existing[0].latitude,
            longitude: body.longitude ?? existing[0].longitude,
            selfieCaptured: body.selfieCaptured ?? existing[0].selfieCaptured,
            updatedAt: new Date(),
          })
          .where(eq(attendances.date, TODAY));
      }
    } else {
      if (existing.length === 0 || !existing[0].checkIn) {
        return NextResponse.json(
          { error: "Anda belum absen masuk" },
          { status: 400 },
        );
      }
      await db
        .update(attendances)
        .set({ checkOut: time, updatedAt: new Date() })
        .where(eq(attendances.date, TODAY));
    }

    return NextResponse.json(await payload());
  } catch (error) {
    console.error("POST /api/attendance", error);
    return NextResponse.json(
      { error: "Gagal menyimpan absensi" },
      { status: 500 },
    );
  }
}
