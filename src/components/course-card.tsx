import type { Course } from "@/lib/courses";

const nf = new Intl.NumberFormat("th-TH");
const df = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

const levelColor: Record<Course["level"], string> = {
  พื้นฐาน: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  กลาง: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  ขั้นสูง: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

export function CourseCard({ course, isNew }: { course: Course; isNew?: boolean }) {
  const fill =
    course.capacity > 0 ? Math.min(100, Math.round((course.enrolled / course.capacity) * 100)) : 100;
  const full = course.enrolled >= course.capacity;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative h-28 bg-gradient-to-br from-pea-primary to-pea-primary-dark p-4">
        <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
          {course.category}
        </span>
        {isNew && (
          <span className="absolute right-4 top-4 rounded-full bg-pea-accent px-2.5 py-1 text-xs font-bold text-pea-primary-dark">
            ใหม่
          </span>
        )}
        <svg viewBox="0 0 24 24" className="absolute -bottom-3 right-3 h-20 w-20 text-white/10" fill="currentColor" aria-hidden>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-900 group-hover:text-pea-primary dark:text-white">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{course.instructor}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className={`rounded-md px-2 py-1 font-medium ${levelColor[course.level]}`}>
            {course.level}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {course.mode}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {course.durationHours} ชม.
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            ★ {course.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              ผู้เรียน{" "}
              <strong className="font-semibold text-zinc-900 dark:text-white">
                {nf.format(course.enrolled)}
              </strong>
              /{nf.format(course.capacity)} คน
            </span>
            <span>เริ่ม {df.format(new Date(course.startDate))}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full ${full ? "bg-rose-500" : "bg-pea-primary dark:bg-pea-accent"}`}
              style={{ width: `${fill}%` }}
            />
          </div>
          {full ? (
            <span className="mt-4 block cursor-not-allowed rounded-lg bg-zinc-100 py-2 text-center text-sm font-semibold text-zinc-400 dark:bg-zinc-800">
              เต็มแล้ว
            </span>
          ) : (
            <a
              href="#"
              className="mt-4 block rounded-lg bg-pea-primary/5 py-2 text-center text-sm font-semibold text-pea-primary hover:bg-pea-primary hover:text-white dark:bg-white/5 dark:text-white"
            >
              ดูรายละเอียด
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
