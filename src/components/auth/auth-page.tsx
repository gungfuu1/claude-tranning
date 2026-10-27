import type { ReactNode } from "react";

// Shared frame for /login and /register: a centered card with the page heading.
export function AuthPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex-1 bg-zinc-50 px-4 py-12 sm:py-16 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

// Placeholder while `?next=` is read (request-time data, so it streams in behind <Suspense>).
export function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div aria-hidden className="space-y-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
