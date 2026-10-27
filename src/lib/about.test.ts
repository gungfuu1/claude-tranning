import { describe, expect, it } from "vitest";
import { aboutContent } from "@/content/about";
import {
  aboutContentSchema,
  formatNumber,
  formatPhone,
  formatThaiDate,
  yearsInOperation,
  type AboutContent,
} from "./about";

describe("about content", () => {
  it("passes the content rules", () => {
    expect(() => aboutContentSchema.parse(aboutContent)).not.toThrow();
  });

  // AS-11 (AB-05): each malformed edit must fail.
  const malformed: [string, (c: AboutContent) => unknown][] = [
    ["email without domain", (c) => ({ ...c, contact: { ...c.contact, email: "training@" } })],
    ["phone with dashes", (c) => ({ ...c, contact: { ...c.contact, phone: "02-589-9000" } })],
    ["negative learners", (c) => ({ ...c, stats: { ...c.stats, learners: -1 } })],
    ["Gregorian founding year", (c) => ({ ...c, foundedYearBE: 2017 })],
    ["only 2 benefit cards", (c) => ({ ...c, benefits: c.benefits.slice(0, 2) })],
    ["Thai-style date", (c) => ({ ...c, stats: { ...c.stats, asOf: "30/09/2569" } })],
  ];

  it.each(malformed)("rejects %s", (_, mutate) => {
    expect(aboutContentSchema.safeParse(mutate(aboutContent)).success).toBe(false);
  });
});

describe("formatting", () => {
  // AS-04
  it("formats numbers with thousands separators", () => {
    expect(formatNumber(12500)).toBe("12,500");
    expect(formatNumber(48)).toBe("48");
  });

  it("formats the as-of date in Thai with a Buddhist-era year", () => {
    expect(formatThaiDate("2026-09-30")).toBe("30 กันยายน 2569");
  });

  // AS-06
  it("formats phone numbers for display", () => {
    expect(formatPhone("021234567")).toBe("02-123-4567");
    expect(formatPhone("0812345678")).toBe("081-234-5678");
  });
});

describe("yearsInOperation", () => {
  // AS-05
  it.each([
    [2560, "2026-10-27T10:00:00+07:00", 9],
    [2560, "2026-12-31T23:59:59.999+07:00", 9],
    [2560, "2026-12-31T17:00:00Z", 10],
    [2569, "2026-10-27T10:00:00+07:00", 0],
  ])("founded %i, at %s -> %i years", (founded, now, expected) => {
    expect(yearsInOperation(founded, new Date(now))).toBe(expected);
  });
});
