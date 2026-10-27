"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import type { NavItem } from "./nav-links";

// `children` is the auth area (UserMenu), rendered under the links.
export function MobileMenu({ items, children }: { items: NavItem[]; children: ReactNode }) {
  const pathname = usePathname();
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
            aria-current={pathname === item.href ? "page" : undefined}
            className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 aria-[current=page]:font-semibold aria-[current=page]:text-pea-primary dark:text-zinc-200 dark:hover:bg-zinc-800 dark:aria-[current=page]:text-white"
          >
            {item.label}
          </Link>
        ))}
        {/* Close the menu after a link or the logout button inside the auth area is used. */}
        <div onClick={close}>{children}</div>
      </nav>
    </details>
  );
}
