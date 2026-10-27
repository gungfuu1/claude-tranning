import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "./auth/user-menu";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, type NavItem } from "./nav-links";

// Homepage sections are linked as "/#…" so they also work from other pages.
const navItems: NavItem[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "หลักสูตร", href: "/#courses" },
  { label: "หมวดหมู่", href: "/#categories" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อ", href: "/#contact" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-pea-primary text-pea-accent">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold text-pea-primary dark:text-white">
          PEA HUB
        </span>
        <span className="block text-xs text-zinc-500 dark:text-zinc-400">
          ศูนย์ฝึกอบรม การไฟฟ้าส่วนภูมิภาค
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <NavLinks items={navItems} />

        {/* The auth area reads the session cookie, so it streams in; the rest of the header stays static. */}
        <div className="hidden md:block">
          <Suspense fallback={<div className="h-10 w-48" />}>
            <UserMenu variant="desktop" />
          </Suspense>
        </div>

        <MobileMenu items={navItems}>
          <Suspense fallback={null}>
            <UserMenu variant="mobile" />
          </Suspense>
        </MobileMenu>
      </div>
    </header>
  );
}
