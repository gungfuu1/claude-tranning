import { getCategories } from "@/lib/courses";

export async function CourseCategories() {
  const categories = await getCategories();

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat) => (
        <a
          key={cat.name}
          href="#"
          className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-pea-primary hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pea-accent"
        >
          <p className="font-semibold text-zinc-900 dark:text-white">{cat.name}</p>
          <p className="mt-1 text-sm text-zinc-500">{cat.count} หลักสูตร</p>
        </a>
      ))}
    </div>
  );
}
