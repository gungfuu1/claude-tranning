import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

// Header auth area (spec 003 §3.3). Reads the session cookie, so it must render inside <Suspense>.
export async function UserMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  // Display only, so user_metadata is acceptable here; never use it for authorization.
  const name = claims ? String(claims.user_metadata?.full_name ?? claims.email ?? "") : null;
  const mobile = variant === "mobile";

  if (name === null) {
    return (
      <div className={mobile ? "mt-2 grid gap-2" : "flex items-center gap-2"}>
        <Link
          href="/login"
          className={
            mobile
              ? "block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              : "rounded-lg px-4 py-2 text-sm font-medium text-pea-primary hover:bg-pea-primary/5 dark:text-white"
          }
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          href="/register"
          className={
            mobile
              ? "block rounded-lg bg-pea-primary px-3 py-2 text-center text-sm font-semibold text-white"
              : "rounded-lg bg-pea-primary px-4 py-2 text-sm font-semibold text-white hover:bg-pea-primary-dark"
          }
        >
          สมัครเรียน
        </Link>
      </div>
    );
  }

  return (
    <div className={mobile ? "mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800" : "flex items-center gap-3"}>
      <span
        data-testid="user-name"
        className={`max-w-48 truncate text-sm font-medium text-zinc-800 dark:text-zinc-100 ${mobile ? "block px-3 py-2" : ""}`}
      >
        {name}
      </span>
      <form action={logoutAction}>
        <button
          type="submit"
          className={
            mobile
              ? "block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              : "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          }
        >
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
