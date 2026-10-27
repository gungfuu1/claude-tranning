import { createClient } from "@supabase/supabase-js";

// Cookie-less client for public, RLS-readable data. It uses no request APIs, so it is safe
// inside 'use cache' functions; use ./server.ts for anything that depends on the signed-in user.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
