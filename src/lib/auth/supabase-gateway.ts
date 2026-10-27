import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { AuthGateway, CreateAccountResult } from "./service";
import { UNLOCKED, type Throttle } from "./throttle";

// AuthGateway backed by Supabase Auth plus the profiles/login_throttle tables
// (supabase/migrations/20261027120000_create_member_profiles.sql).

const UNIQUE_VIOLATION = "23505";

type ThrottleRow = { failed_count: number; locked_until: string | null };

const toThrottle = (row: ThrottleRow): Throttle => ({
  failedCount: row.failed_count,
  lockedUntil: row.locked_until ? new Date(row.locked_until) : null,
});

const toRow = (t: Throttle): ThrottleRow => ({
  failed_count: t.failedCount,
  locked_until: t.lockedUntil?.toISOString() ?? null,
});

export function createSupabaseGateway(): AuthGateway {
  // Created on first use, so input that fails validation never needs the secret key.
  let adminClient: ReturnType<typeof createAdminClient> | undefined;
  const admin = () => (adminClient ??= createAdminClient());

  return {
    async isEmployeeIdTaken(employeeId) {
      const { count, error } = await admin()
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("employee_id", employeeId);
      if (error) throw new Error(`Failed to check employee id: ${error.message}`);
      return (count ?? 0) > 0;
    },

    async createAccount(input, consentedAt): Promise<CreateAccountResult> {
      const { data, error } = await admin().auth.admin.createUser({
        email: input.email,
        password: input.password,
        // No email verification in this release (spec 003 §6).
        email_confirm: true,
        // Display only; authorization must never read user_metadata.
        user_metadata: { full_name: input.fullName },
      });
      if (error?.code === "email_exists" || error?.code === "user_already_exists") return "EMAIL_TAKEN";
      if (error) throw new Error(`Failed to create account: ${error.message}`);
      const userId = data.user.id;

      const { error: profileError } = await admin().from("profiles").insert({
        id: userId,
        email: input.email,
        full_name: input.fullName,
        member_type: input.memberType,
        employee_id: input.employeeId,
        affiliation: input.affiliation,
        pdpa_consented_at: consentedAt.toISOString(),
      });
      const { error: throttleError } = profileError
        ? { error: null }
        : await admin().from("login_throttle").insert({ user_id: userId, ...toRow(UNLOCKED) });

      if (profileError || throttleError) {
        // Undo the auth user so a failed sign-up leaves nothing behind.
        await admin().auth.admin.deleteUser(userId);
        const failure = (profileError ?? throttleError)!;
        if (failure.code === UNIQUE_VIOLATION && failure.message.includes("employee_id")) return "EMPLOYEE_ID_TAKEN";
        if (failure.code === UNIQUE_VIOLATION && failure.message.includes("email")) return "EMAIL_TAKEN";
        throw new Error(`Failed to save profile: ${failure.message}`);
      }
      return "OK";
    },

    async findUserIdByEmail(email) {
      const { data, error } = await admin().from("profiles").select("id").eq("email", email).maybeSingle();
      if (error) throw new Error(`Failed to look up account: ${error.message}`);
      return data?.id ?? null;
    },

    async getThrottle(userId) {
      const { data, error } = await admin()
        .from("login_throttle")
        .select("failed_count, locked_until")
        .eq("user_id", userId)
        .maybeSingle<ThrottleRow>();
      if (error) throw new Error(`Failed to read login throttle: ${error.message}`);
      if (data) return toThrottle(data);
      // Accounts created outside this app have no row yet.
      await admin().from("login_throttle").upsert({ user_id: userId, ...toRow(UNLOCKED) }, { ignoreDuplicates: true });
      return UNLOCKED;
    },

    async saveThrottle(userId, prev, next) {
      let query = admin()
        .from("login_throttle")
        .update(toRow(next))
        .eq("user_id", userId)
        .eq("failed_count", prev.failedCount);
      query = prev.lockedUntil
        ? query.eq("locked_until", prev.lockedUntil.toISOString())
        : query.is("locked_until", null);
      const { data, error } = await query.select("user_id");
      if (error) throw new Error(`Failed to update login throttle: ${error.message}`);
      return data.length === 1;
    },

    async signIn(email, password) {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return "OK";
      if (error.code === "invalid_credentials") return "INVALID_CREDENTIALS";
      console.error("Sign-in failed", { code: error.code, status: error.status });
      return "UNAVAILABLE";
    },
  };
}
