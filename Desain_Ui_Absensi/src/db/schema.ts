import {
  boolean,
  doublePrecision,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull().unique(),
  dayLabel: varchar("day_label", { length: 64 }).notNull(),
  checkIn: varchar("check_in", { length: 5 }),
  checkOut: varchar("check_out", { length: 5 }),
  status: varchar("status", { length: 24 }).notNull().default("Belum Absen"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: varchar("address", { length: 255 })
    .notNull()
    .default("Jl. Melati No. 12, Yogyakarta"),
  selfieCaptured: boolean("selfie_captured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Attendance = typeof attendances.$inferSelect;
