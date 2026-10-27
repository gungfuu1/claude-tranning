"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string };

// Desktop menu; marks the link for the current page with aria-current (spec 002, AS-08).
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-pea-primary/5 hover:text-pea-primary aria-[current=page]:text-pea-primary aria-[current=page]:bg-pea-primary/5 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white dark:aria-[current=page]:text-white dark:aria-[current=page]:bg-white/5"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
