"use client";

import { catchError, type ErrorInfo } from "next/error";

// Error boundary for a data-driven section: a failed query shows this instead of breaking the whole page.
// `nested`: the boundary already sits inside a page-width container, so skip our own.
function SectionErrorFallback(
  { title, nested = false }: { title: string; nested?: boolean },
  { retry }: ErrorInfo,
) {
  return (
    <div className={nested ? "mt-8" : "mx-auto my-8 max-w-6xl px-4"}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          ไม่สามารถโหลดข้อมูล{title}ได้ในขณะนี้
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-pea-primary px-4 py-2 text-sm font-semibold text-white hover:bg-pea-primary-dark"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}

export const SectionError = catchError(SectionErrorFallback);
