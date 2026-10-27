import { afterFailure, afterSuccess, isLocked, type Throttle } from "./throttle";
import {
  parseLogin,
  parseRegister,
  type FieldErrors,
  type LoginField,
  type RegisterField,
  type RegisterInput,
} from "./validation";

// Sign-up and login use cases (spec 003). Storage and Supabase Auth sit behind AuthGateway, so these
// rules are unit-tested with a fake gateway; src/lib/auth/supabase-gateway.ts is the real one.

export type CreateAccountResult = "OK" | "EMAIL_TAKEN" | "EMPLOYEE_ID_TAKEN";
export type SignInResult = "OK" | "INVALID_CREDENTIALS" | "UNAVAILABLE";

export type AuthGateway = {
  isEmployeeIdTaken(employeeId: string): Promise<boolean>;
  // Creates the auth account, profile and throttle row together, or nothing.
  createAccount(input: RegisterInput, consentedAt: Date): Promise<CreateAccountResult>;
  findUserIdByEmail(email: string): Promise<string | null>;
  getThrottle(userId: string): Promise<Throttle>;
  // Compare-and-set: writes `next` only if the row still equals `prev`; false means someone else won.
  saveThrottle(userId: string, prev: Throttle, next: Throttle): Promise<boolean>;
  // Signs in and sets the session for this request.
  signIn(email: string, password: string): Promise<SignInResult>;
};

export const messages = {
  EMAIL_TAKEN: "อีเมลนี้ถูกใช้แล้ว",
  EMPLOYEE_ID_TAKEN: "รหัสพนักงานนี้ถูกใช้แล้ว",
  INVALID_CREDENTIALS: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  ACCOUNT_LOCKED: "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่อีกครั้งใน 15 นาที",
  UNAVAILABLE: "ระบบไม่สามารถดำเนินการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
} as const;

export type RegisterResult =
  | { ok: true }
  | { ok: false; code: "VALIDATION_FAILED" | "EMAIL_TAKEN" | "EMPLOYEE_ID_TAKEN"; errors: FieldErrors<RegisterField> };

export async function register(
  raw: Partial<Record<RegisterField, unknown>>,
  gateway: AuthGateway,
  now: Date,
): Promise<RegisterResult> {
  const parsed = parseRegister(raw);
  if (!parsed.ok) return { ok: false, code: "VALIDATION_FAILED", errors: parsed.errors };
  const input = parsed.data;

  // Checked up front for a clear message; createAccount still reports it if two sign-ups race.
  if (input.employeeId && (await gateway.isEmployeeIdTaken(input.employeeId))) {
    return { ok: false, code: "EMPLOYEE_ID_TAKEN", errors: { employeeId: messages.EMPLOYEE_ID_TAKEN } };
  }

  const created = await gateway.createAccount(input, now);
  if (created === "EMAIL_TAKEN") {
    return { ok: false, code: created, errors: { email: messages.EMAIL_TAKEN } };
  }
  if (created === "EMPLOYEE_ID_TAKEN") {
    return { ok: false, code: created, errors: { employeeId: messages.EMPLOYEE_ID_TAKEN } };
  }

  // Spec 003 §6: sign the new member in straight away.
  await gateway.signIn(input.email, input.password);
  return { ok: true };
}

export type LoginResult =
  | { ok: true }
  | {
      ok: false;
      code: "VALIDATION_FAILED" | "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" | "UNAVAILABLE";
      errors: FieldErrors<LoginField>;
      message?: string;
    };

const CAS_ATTEMPTS = 3;

export async function login(
  raw: Partial<Record<LoginField, unknown>>,
  gateway: AuthGateway,
  now: Date,
): Promise<LoginResult> {
  const parsed = parseLogin(raw);
  if (!parsed.ok) return { ok: false, code: "VALIDATION_FAILED", errors: parsed.errors };
  const { email, password } = parsed.data;

  // Unknown emails have no counter and are answered like a wrong password (REG-02).
  const userId = await gateway.findUserIdByEmail(email);
  if (userId && isLocked(await gateway.getThrottle(userId), now)) {
    return { ok: false, code: "ACCOUNT_LOCKED", errors: {}, message: messages.ACCOUNT_LOCKED };
  }

  const signedIn = await gateway.signIn(email, password);
  if (signedIn === "UNAVAILABLE") {
    return { ok: false, code: "UNAVAILABLE", errors: {}, message: messages.UNAVAILABLE };
  }

  if (signedIn === "OK") {
    if (userId) await updateThrottle(gateway, userId, () => afterSuccess());
    return { ok: true };
  }

  if (userId) {
    const next = await updateThrottle(gateway, userId, (t) => afterFailure(t, now));
    if (next && isLocked(next, now)) {
      return { ok: false, code: "ACCOUNT_LOCKED", errors: {}, message: messages.ACCOUNT_LOCKED };
    }
  }
  return { ok: false, code: "INVALID_CREDENTIALS", errors: {}, message: messages.INVALID_CREDENTIALS };
}

// Read-modify-write with compare-and-set, so parallel failed logins can't skip past the limit.
async function updateThrottle(gateway: AuthGateway, userId: string, change: (t: Throttle) => Throttle) {
  for (let attempt = 0; attempt < CAS_ATTEMPTS; attempt++) {
    const prev = await gateway.getThrottle(userId);
    const next = change(prev);
    if (sameThrottle(prev, next) || (await gateway.saveThrottle(userId, prev, next))) return next;
  }
  return null;
}

const sameThrottle = (a: Throttle, b: Throttle) =>
  a.failedCount === b.failedCount && a.lockedUntil?.getTime() === b.lockedUntil?.getTime();
