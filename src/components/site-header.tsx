import Link from "next/link";
import { MobileMenu } from "./mobile-menu";

const navItems = [
  { label: "หน้าแรก", href: "/" },
  { label: "หลักสูตร", href: "#courses" },
  { label: "หมวดหมู่", href: "#categories" },
  { label: "เกี่ยวกับเรา", href: "#about" },
  { label: "ติดต่อ", href: "#contact" },
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
          PEA Academy
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

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-pea-primary/5 hover:text-pea-primary dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="#"
            className="rounded-lg px-4 py-2 text-sm font-medium text-pea-primary hover:bg-pea-primary/5 dark:text-white"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="#"
            className="rounded-lg bg-pea-primary px-4 py-2 text-sm font-semibold text-white hover:bg-pea-primary-dark"
          >
            สมัครเรียน
          </Link>
        </div>

        <MobileMenu items={navItems} />
      </div>
    </header>
  );
}
