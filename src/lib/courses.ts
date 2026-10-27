import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type CourseMode = "ออนไลน์" | "ในห้องเรียน" | "ผสมผสาน";
export type CourseLevel = "พื้นฐาน" | "กลาง" | "ขั้นสูง";

export type Course = {
  id: string; // the course code (courses.code), e.g. "c-101"
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

export type LatestCourse = Course & { isNew: boolean };

// Row shape of public.courses (see supabase/migrations).
type CourseRow = {
  code: string;
  title: string;
  category: string;
  instructor: string;
  duration_hours: number;
  level: CourseLevel;
  mode: CourseMode;
  start_date: string;
  published_at: string;
  enrolled: number;
  capacity: number;
  rating: number;
};

const COURSE_COLUMNS =
  "code, title, category, instructor, duration_hours, level, mode, start_date, published_at, enrolled, capacity, rating";

// Every cached read below carries this tag, so a future admin action can call revalidateTag(COURSES_TAG).
export const COURSES_TAG = "courses";

const NEW_WITHIN_DAYS = 14;

// Today's date (YYYY-MM-DD) in Thailand time.
const todayInBangkok = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());

const daysBetween = (from: string, to: string) =>
  (Date.parse(to) - Date.parse(from)) / 86_400_000;

const toCourse = (row: CourseRow): Course => ({
  id: row.code,
  title: row.title,
  category: row.category,
  instructor: row.instructor,
  durationHours: row.duration_hours,
  level: row.level,
  mode: row.mode,
  startDate: row.start_date,
  publishedAt: row.published_at,
  enrolled: row.enrolled,
  capacity: row.capacity,
  rating: Number(row.rating),
});

// Upcoming courses (not yet started), soonest first.
export async function getLatestCourses(limit = 6): Promise<LatestCourse[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COURSES_TAG);
  const today = todayInBangkok();
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_COLUMNS)
    .gte("start_date", today)
    .order("start_date")
    .limit(limit)
    .overrideTypes<CourseRow[], { merge: false }>();
  if (error) throw new Error(`Failed to load courses: ${error.message}`);
  return data.map((row) => {
    const course = toCourse(row);
    return { ...course, isNew: daysBetween(course.publishedAt, today) <= NEW_WITHIN_DAYS };
  });
}

export async function getStats(): Promise<Stats> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COURSES_TAG);
  const { data, error } = await createPublicClient()
    .from("course_stats")
    .select("total_learners, total_courses, graduates, instructors")
    .single<{ total_learners: number; total_courses: number; graduates: number; instructors: number }>();
  if (error) throw new Error(`Failed to load course stats: ${error.message}`);
  return {
    totalLearners: data.total_learners,
    totalCourses: data.total_courses,
    graduates: data.graduates,
    instructors: data.instructors,
  };
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(COURSES_TAG);
  const { data, error } = await createPublicClient()
    .from("course_categories")
    .select("name, count")
    .order("count", { ascending: false })
    .order("name")
    .overrideTypes<{ name: string; count: number }[], { merge: false }>();
  if (error) throw new Error(`Failed to load course categories: ${error.message}`);
  return data;
}
