import { cacheLife } from "next/cache";

export type CourseMode = "ออนไลน์" | "ในห้องเรียน" | "ผสมผสาน";
export type CourseLevel = "พื้นฐาน" | "กลาง" | "ขั้นสูง";

export type Course = {
  id: string;
  title: string;
  category: string;
  instructor: string;
  durationHours: number;
  level: CourseLevel;
  mode: CourseMode;
  startDate: string; // ISO date
  publishedAt: string; // ISO date
  enrolled: number;
  capacity: number;
  rating: number;
};

export type Stats = {
  totalLearners: number;
  totalCourses: number;
  graduates: number;
  instructors: number;
};

// Fake data — replace the bodies of the functions below with real DB/API calls.
const courses: Course[] = [
  {
    id: "c-101",
    title: "ความปลอดภัยในการปฏิบัติงานระบบไฟฟ้าแรงสูง",
    category: "ความปลอดภัย",
    instructor: "วศ. สมชาย ใจดี",
    durationHours: 24,
    level: "กลาง",
    mode: "ในห้องเรียน",
    startDate: "2026-11-16",
    publishedAt: "2026-10-20",
    enrolled: 42,
    capacity: 50,
    rating: 4.8,
  },
  {
    id: "c-102",
    title: "ระบบโครงข่ายไฟฟ้าอัจฉริยะ (Smart Grid) เบื้องต้น",
    category: "เทคโนโลยีระบบไฟฟ้า",
    instructor: "ดร. วิภาวดี ศรีสุข",
    durationHours: 12,
    level: "พื้นฐาน",
    mode: "ออนไลน์",
    startDate: "2026-11-09",
    publishedAt: "2026-10-01",
    enrolled: 318,
    capacity: 400,
    rating: 4.7,
  },
  {
    id: "c-103",
    title: "การบำรุงรักษาหม้อแปลงไฟฟ้าระบบจำหน่าย",
    category: "งานบำรุงรักษา",
    instructor: "นาย ประเสริฐ มั่นคง",
    durationHours: 18,
    level: "กลาง",
    mode: "ผสมผสาน",
    startDate: "2026-11-02",
    publishedAt: "2026-09-15",
    enrolled: 64,
    capacity: 80,
    rating: 4.6,
  },
  {
    id: "c-104",
    title: "การติดตั้งและตรวจสอบระบบ Solar Rooftop",
    category: "พลังงานทดแทน",
    instructor: "วศ. ธนพล รุ่งเรือง",
    durationHours: 16,
    level: "กลาง",
    mode: "ผสมผสาน",
    startDate: "2026-11-23",
    publishedAt: "2026-10-22",
    enrolled: 55,
    capacity: 60,
    rating: 4.9,
  },
  {
    id: "c-105",
    title: "Digital Transformation สำหรับบุคลากร กฟภ.",
    category: "ดิจิทัล",
    instructor: "ดร. กมลชนก วงศ์ไทย",
    durationHours: 8,
    level: "พื้นฐาน",
    mode: "ออนไลน์",
    startDate: "2026-10-26",
    publishedAt: "2026-09-01",
    enrolled: 1240,
    capacity: 1500,
    rating: 4.5,
  },
  {
    id: "c-106",
    title: "การบริการลูกค้าอย่างมืออาชีพ (Service Excellence)",
    category: "การบริการ",
    instructor: "คุณ อรอุมา แสงทอง",
    durationHours: 6,
    level: "พื้นฐาน",
    mode: "ออนไลน์",
    startDate: "2026-10-19",
    publishedAt: "2026-08-20",
    enrolled: 876,
    capacity: 1000,
    rating: 4.6,
  },
  {
    id: "c-107",
    title: "การวิเคราะห์ข้อมูลมิเตอร์อัจฉริยะ (AMI Data Analytics)",
    category: "ดิจิทัล",
    instructor: "นาย ณัฐวุฒิ ปัญญาดี",
    durationHours: 20,
    level: "ขั้นสูง",
    mode: "ออนไลน์",
    startDate: "2026-12-01",
    publishedAt: "2026-10-24",
    enrolled: 97,
    capacity: 150,
    rating: 4.8,
  },
  {
    id: "c-108",
    title: "ระบบป้องกันและรีเลย์ในสถานีไฟฟ้า",
    category: "เทคโนโลยีระบบไฟฟ้า",
    instructor: "วศ. ชัยวัฒน์ พลังดี",
    durationHours: 30,
    level: "ขั้นสูง",
    mode: "ในห้องเรียน",
    startDate: "2026-10-12",
    publishedAt: "2026-08-01",
    enrolled: 28,
    capacity: 30,
    rating: 4.9,
  },
  {
    id: "c-109",
    title: "ภาวะผู้นำสำหรับหัวหน้างานยุคใหม่",
    category: "การบริหาร",
    instructor: "ผศ. ดร. สุนิสา ตั้งใจ",
    durationHours: 12,
    level: "กลาง",
    mode: "ผสมผสาน",
    startDate: "2026-10-05",
    publishedAt: "2026-07-15",
    enrolled: 120,
    capacity: 120,
    rating: 4.7,
  },
];

export type LatestCourse = Course & { isNew: boolean };

const NEW_WITHIN_DAYS = 14;

// Today's date (YYYY-MM-DD) in Thailand time.
const todayInBangkok = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());

const daysBetween = (from: string, to: string) =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000;

// Upcoming courses (not yet started), soonest first.
export async function getLatestCourses(limit = 6): Promise<LatestCourse[]> {
  "use cache";
  cacheLife("hours");
  const today = todayInBangkok();
  return courses
    .filter((c) => c.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, limit)
    .map((c) => ({ ...c, isNew: daysBetween(c.publishedAt, today) <= NEW_WITHIN_DAYS }));
}

export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("hours");
  return {
    totalLearners: 12480 + courses.reduce((sum, c) => sum + c.enrolled, 0),
    totalCourses: 156,
    graduates: 9873,
    instructors: 84,
  };
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  "use cache";
  cacheLife("hours");
  const counts = new Map<string, number>();
  for (const c of courses) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}
