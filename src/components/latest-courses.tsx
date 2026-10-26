import { getLatestCourses } from "@/lib/courses";
import { CourseCard } from "./course-card";

export async function LatestCourses() {
  const courses = await getLatestCourses(6);

  return (
    <section id="courses" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-pea-primary dark:text-pea-accent">หลักสูตรล่าสุด</p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">
            เปิดรับสมัครเร็ว ๆ นี้
          </h2>
        </div>
        <a href="#" className="text-sm font-semibold text-pea-primary hover:underline dark:text-pea-accent">
          ดูหลักสูตรทั้งหมด →
        </a>
      </div>

      {courses.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isNew={course.isNew} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
          ยังไม่มีหลักสูตรที่กำลังจะเปิดในขณะนี้
        </p>
      )}
    </section>
  );
}
