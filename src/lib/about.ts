import { z } from "zod";

// Content rules for /about (spec 002, AB-01..AB-05). Kept free of Next.js imports so Vitest can load it.

const count = z.number().int().nonnegative();

const benefit = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
});

export const aboutContentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).max(120),
  vision: z.string().min(1),
  missions: z.array(z.string().min(1)).min(1).max(5),
  benefits: z.tuple([benefit, benefit, benefit]),
  // Buddhist-era year; the range rejects a Gregorian year such as 2017.
  foundedYearBE: z.number().int().min(2400).max(2700),
  stats: z.object({
    courses: count,
    learners: count,
    certificates: count,
    asOf: z.iso.date(), // YYYY-MM-DD, Gregorian
  }),
  contact: z.object({
    address: z.string().min(1),
    // Digits only; formatPhone adds the dashes for display.
    phone: z.string().regex(/^0\d{8,9}$/, "เบอร์โทรเป็นตัวเลขล้วน 9–10 หลัก"),
    email: z.email(),
    hours: z.string().min(1),
  }),
});

export type AboutContent = z.infer<typeof aboutContentSchema>;

const TIME_ZONE = "Asia/Bangkok";

const nf = new Intl.NumberFormat("th-TH");
const thaiDate = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const thaiYear = new Intl.DateTimeFormat("en-US-u-ca-buddhist", { year: "numeric", timeZone: TIME_ZONE });

// AB-01: 12500 -> "12,500"
export const formatNumber = (n: number) => nf.format(n);

// AB-02: "2026-09-30" -> "30 กันยายน 2569"
export const formatThaiDate = (isoDate: string) => thaiDate.format(new Date(`${isoDate}T00:00:00+07:00`));

// AB-03: current Buddhist-era year in Thailand minus the founding year, never below 0.
export function yearsInOperation(foundedYearBE: number, now: Date): number {
  const currentYearBE = Number.parseInt(thaiYear.format(now), 10);
  return Math.max(0, currentYearBE - foundedYearBE);
}

// "021234567" -> "02-123-4567"; "0812345678" -> "081-234-5678"
export function formatPhone(digits: string): string {
  return digits.length === 9
    ? `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
