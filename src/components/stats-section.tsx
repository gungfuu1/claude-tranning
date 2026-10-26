import { getStats } from "@/lib/courses";

const nf = new Intl.NumberFormat("th-TH");

export async function StatsSection() {
  const stats = await getStats();
  const items = [
    { label: "ผู้เรียนทั้งหมด", value: stats.totalLearners, suffix: "คน" },
    { label: "หลักสูตรที่เปิดสอน", value: stats.totalCourses, suffix: "หลักสูตร" },
    { label: "ผู้สำเร็จการอบรม", value: stats.graduates, suffix: "คน" },
    { label: "วิทยากรผู้เชี่ยวชาญ", value: stats.instructors, suffix: "ท่าน" },
  ];

  return (
    <section aria-label="สถิติการอบรม" className="relative z-10 mx-auto -mt-12 max-w-6xl px-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-xl shadow-pea-primary/5 lg:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
        {items.map((item) => (
          <div key={item.label} className="bg-white p-6 dark:bg-zinc-900">
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tabular-nums text-pea-primary dark:text-white">
                {nf.format(item.value)}
              </span>
              <span className="text-sm text-zinc-500">{item.suffix}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
