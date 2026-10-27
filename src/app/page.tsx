import { Suspense } from "react";
import { CourseCategories } from "@/components/course-categories";
import { HeroCarousel } from "@/components/hero-carousel";
import { LatestCourses } from "@/components/latest-courses";
import { SectionError } from "@/components/section-error";
import { StatsSection } from "@/components/stats-section";
import { heroSlides } from "@/lib/hero-slides";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroCarousel slides={heroSlides} />

      {/* Each data section (Supabase) gets its own boundary so one failed query can't take down the page. */}
      <SectionError title="สถิติ">
        <Suspense fallback={<div className="relative z-10 mx-auto -mt-12 h-[118px] max-w-6xl px-4" />}>
          <StatsSection />
        </Suspense>
      </SectionError>

      <SectionError title="หลักสูตรล่าสุด">
        <Suspense fallback={<div className="mx-auto h-96 max-w-6xl px-4 py-16" />}>
          <LatestCourses />
        </Suspense>
      </SectionError>

      <section id="categories" className="scroll-mt-20 bg-zinc-50 py-16 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">หมวดหมู่หลักสูตร</h2>
          <SectionError title="หมวดหมู่หลักสูตร" nested>
            <Suspense fallback={<div className="mt-8 h-24" />}>
              <CourseCategories />
            </Suspense>
          </SectionError>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-r from-pea-primary to-pea-primary-dark p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-bold">พร้อมเริ่มเรียนแล้วหรือยัง?</h2>
            <p className="mt-2 text-white/80">
              สมัครสมาชิกฟรี ติดตามความก้าวหน้า และรับใบประกาศนียบัตรเมื่อจบหลักสูตร
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 rounded-lg bg-pea-accent px-6 py-3 text-sm font-semibold text-pea-primary-dark hover:brightness-110"
          >
            สมัครเรียนเลย
          </a>
        </div>
      </section>
    </main>
  );
}
