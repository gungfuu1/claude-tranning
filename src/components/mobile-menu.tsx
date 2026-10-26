"use client";

import Link from "next/link";
import { useRef } from "react";

export function MobileMenu({ items }: { items: { label: string; href: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");

  return (
    <details ref={ref} className="group relative md:hidden">
      <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">
        <span className="sr-only">เปิดเมนู</span>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" className="group-open:hidden" />
          <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
        </svg>
      </summary>
      <nav className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={close}
            className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="#"
          onClick={close}
          className="mt-2 block rounded-lg bg-pea-primary px-3 py-2 text-center text-sm font-semibold text-white"
        >
          สมัครเรียน
        </Link>
      </nav>
    </details>
  );
}
