import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Refreshes the Supabase session cookie and applies the auth redirects in updateSession.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, image optimization and metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
