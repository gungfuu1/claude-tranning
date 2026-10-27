import "server-only";
import { createClient } from "@supabase/supabase-js";

// Privileged client (secret key: bypasses RLS, can manage auth users). Server-only: never import it
// from a Client Component, and never prefix SUPABASE_SECRET_KEY with NEXT_PUBLIC_.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY is not set (see .env.local)");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
