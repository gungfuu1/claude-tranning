import { describe, expect, it } from "vitest";
import { affiliations } from "@/content/affiliations";
import { safeNext } from "./safe-next";
import { login, register, type AuthGateway, type CreateAccountResult } from "./service";
import { afterFailure, isLocked, UNLOCKED, type Throttle } from "./throttle";
import { parseRegister, type RegisterInput } from "./validation";

// Spec 003 acceptance scenarios that don't need a browser or database.

const publicForm = {
  memberType: "PUBLIC",
  fullName: "สมชาย ใจดี",
  email: "somchai@example.com",
  password: "abcd1234",
  confirmPassword: "abcd1234",
  consent: "on",
};

const employeeForm = {
  ...publicForm,
  memberType: "EMPLOYEE",
  email: "somchai.j@pea.co.th",
  employeeId: "501234",
  affiliation: affiliations[0],
};

const errorsOf = (form: Record<string, unknown>) => {
  const result = parseRegister(form);
  return result.ok ? {} : result.errors;
};

describe("register validation", () => {
  it("AS-01/AS-02 accepts valid public and employee forms", () => {
    expect(parseRegister(publicForm).ok).toBe(true);
    expect(parseRegister(employeeForm).ok).toBe(true);
  });

  // AS-03
  it.each([
    ["1-char name", { fullName: "ก" }, "fullName", false],
    ["2 chars after trim", { fullName: "  กข  " }, "fullName", true],
    ["100-char name", { fullName: "ก".repeat(100) }, "fullName", true],
    ["101-char name", { fullName: "ก".repeat(101) }, "fullName", false],
    ["blank name", { fullName: "    " }, "fullName", false],
    ["email without domain", { email: "somchai@" }, "email", false],
    ["7-char password", { password: "abcd123", confirmPassword: "abcd123" }, "password", false],
    ["8-char password", { password: "abcd1234", confirmPassword: "abcd1234" }, "password", true],
    ["mismatched confirmation", { confirmPassword: "abcd1235" }, "confirmPassword", false],
  ])("%s", (_, change, field, valid) => {
    expect(errorsOf({ ...publicForm, ...change })[field as keyof RegisterInput]).toEqual(
      valid ? undefined : expect.any(String),
    );
  });

  it("names the mismatched password", () => {
    expect(errorsOf({ ...publicForm, confirmPassword: "abcd1235" }).confirmPassword).toBe("รหัสผ่านไม่ตรงกัน");
  });

  it("normalizes email and trims the name", () => {
    const result = parseRegister({ ...publicForm, email: "  Somchai@Example.COM ", fullName: "  สมชาย ใจดี " });
    expect(result.ok && result.data).toMatchObject({ email: "somchai@example.com", fullName: "สมชาย ใจดี" });
  });

  // AS-05
  it.each([
    ["missing employee id", { employeeId: "" }, "employeeId", false],
    ["missing affiliation", { affiliation: "" }, "affiliation", false],
    ["unknown affiliation", { affiliation: "ฝ่ายที่ไม่มีอยู่" }, "affiliation", false],
    ["5-digit id", { employeeId: "12345" }, "employeeId", false],
    ["7-digit id", { employeeId: "1234567" }, "employeeId", false],
    ["id with a letter", { employeeId: "12A456" }, "employeeId", false],
    ["id with a leading zero", { employeeId: "012345" }, "employeeId", true],
    ["gmail address", { email: "somchai@gmail.com" }, "email", false],
    ["upper-case PEA domain", { email: "somchai@PEA.CO.TH" }, "email", true],
    ["PEA subdomain", { email: "somchai@sub.pea.co.th" }, "email", false],
    ["look-alike domain", { email: "somchai@pea.co.th.evil.com" }, "email", false],
  ])("employee: %s", (_, change, field, valid) => {
    expect(errorsOf({ ...employeeForm, ...change })[field as keyof RegisterInput]).toEqual(
      valid ? undefined : expect.any(String),
    );
  });

  it("keeps the leading zero of an employee id", () => {
    const result = parseRegister({ ...employeeForm, employeeId: "012345" });
    expect(result.ok && result.data.employeeId).toBe("012345");
  });

  it("explains the employee email rule", () => {
    expect(errorsOf({ ...employeeForm, email: "somchai@gmail.com" }).email).toBe("พนักงานต้องใช้อีเมล @pea.co.th");
  });

  // AS-06
  it("drops employee fields sent with a public sign-up", () => {
    const result = parseRegister({ ...publicForm, employeeId: "501234", affiliation: affiliations[0] });
    expect(result.ok && result.data).toMatchObject({ employeeId: null, affiliation: null });
  });

  // AS-07
  it("requires PDPA consent", () => {
    expect(errorsOf({ ...publicForm, consent: undefined }).consent).toBe("กรุณายอมรับนโยบายความเป็นส่วนตัว");
  });
});

describe("safeNext", () => {
  // AS-13
  it.each([
    ["/courses/SAF-101", "/courses/SAF-101"],
    ["/my-courses?tab=active", "/my-courses?tab=active"],
    [undefined, "/"],
    ["", "/"],
    ["https://evil.com", "/"],
    ["//evil.com", "/"],
    ["/\\evil.com", "/"],
    ["javascript:alert(1)", "/"],
    ["courses", "/"],
  ])("%s -> %s", (next, expected) => {
    expect(safeNext(next)).toBe(expected);
  });
});

describe("lockout", () => {
  const at = (hhmm: string) => new Date(`2026-10-27T${hhmm}:00+07:00`);

  // AS-11
  it("locks after 5 consecutive failures for 15 minutes", () => {
    let t: Throttle = UNLOCKED;
    for (const time of ["10:00", "10:01", "10:02", "10:03"]) t = afterFailure(t, at(time));
    expect(isLocked(t, at("10:04"))).toBe(false);

    t = afterFailure(t, at("10:05"));
    expect(isLocked(t, at("10:05"))).toBe(true);
    expect(isLocked(t, at("10:10"))).toBe(true);
    expect(isLocked(t, at("10:20"))).toBe(false);
  });

  it("does not extend the lock on failures while locked", () => {
    const locked: Throttle = { failedCount: 0, lockedUntil: at("10:20") };
    expect(afterFailure(locked, at("10:10"))).toEqual(locked);
  });
});

// In-memory AuthGateway with one account per email.
function fakeGateway() {
  type Account = { id: string; input: RegisterInput; throttle: Throttle };
  const accounts = new Map<string, Account>();
  const signIns: string[] = [];

  const gateway: AuthGateway = {
    async isEmployeeIdTaken(employeeId) {
      return [...accounts.values()].some((a) => a.input.employeeId === employeeId);
    },
    async createAccount(input): Promise<CreateAccountResult> {
      if (accounts.has(input.email)) return "EMAIL_TAKEN";
      accounts.set(input.email, { id: `user-${accounts.size + 1}`, input, throttle: UNLOCKED });
      return "OK";
    },
    async findUserIdByEmail(email) {
      return accounts.get(email)?.id ?? null;
    },
    async getThrottle(userId) {
      return [...accounts.values()].find((a) => a.id === userId)!.throttle;
    },
    async saveThrottle(userId, prev, next) {
      const account = [...accounts.values()].find((a) => a.id === userId)!;
      if (account.throttle !== prev) return false;
      account.throttle = next;
      return true;
    },
    async signIn(email, password) {
      signIns.push(email);
      return accounts.get(email)?.input.password === password ? "OK" : "INVALID_CREDENTIALS";
    },
  };
  return { gateway, accounts, signIns };
}

describe("register", () => {
  const now = new Date("2026-10-27T10:00:00+07:00");

  it("AS-01 creates the account and signs the member in", async () => {
    const { gateway, accounts, signIns } = fakeGateway();
    expect(await register(publicForm, gateway, now)).toEqual({ ok: true });
    expect(accounts.get("somchai@example.com")?.input.memberType).toBe("PUBLIC");
    expect(signIns).toEqual(["somchai@example.com"]);
  });

  // AS-04
  it.each(["Somchai@Example.com", "  somchai@example.com  "])("rejects duplicate email %j", async (email) => {
    const { gateway } = fakeGateway();
    await register(publicForm, gateway, now);
    expect(await register({ ...publicForm, email }, gateway, now)).toMatchObject({
      ok: false,
      code: "EMAIL_TAKEN",
      errors: { email: "อีเมลนี้ถูกใช้แล้ว" },
    });
  });

  it("AS-05 rejects an employee id already in use", async () => {
    const { gateway } = fakeGateway();
    await register(employeeForm, gateway, now);
    expect(await register({ ...employeeForm, email: "other@pea.co.th" }, gateway, now)).toMatchObject({
      ok: false,
      code: "EMPLOYEE_ID_TAKEN",
      errors: { employeeId: "รหัสพนักงานนี้ถูกใช้แล้ว" },
    });
  });
});

describe("login", () => {
  const at = (hhmm: string) => new Date(`2026-10-27T${hhmm}:00+07:00`);
  const wrong = { email: "somchai@example.com", password: "wrong-password" };
  const right = { email: "somchai@example.com", password: "abcd1234" };

  async function withAccount() {
    const fake = fakeGateway();
    await register(publicForm, fake.gateway, at("09:00"));
    return fake;
  }

  it("AS-09 accepts a differently cased, padded email", async () => {
    const { gateway } = await withAccount();
    expect(await login({ email: "  SOMCHAI@example.com ", password: "abcd1234" }, gateway, at("10:00"))).toEqual({
      ok: true,
    });
  });

  // AS-10
  it("gives the same message for a wrong password and an unknown email", async () => {
    const { gateway } = await withAccount();
    const wrongPassword = await login(wrong, gateway, at("10:00"));
    const unknownEmail = await login({ email: "nobody@example.com", password: "abcd1234" }, gateway, at("10:00"));
    expect(wrongPassword).toMatchObject({ code: "INVALID_CREDENTIALS", message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    expect(unknownEmail).toEqual(wrongPassword);
  });

  it("AS-11 follows the lockout timeline", async () => {
    const { gateway } = await withAccount();
    for (const time of ["10:00", "10:01", "10:02", "10:03"]) {
      expect((await login(wrong, gateway, at(time))) as { code: string }).toMatchObject({
        code: "INVALID_CREDENTIALS",
      });
    }
    expect(await login(wrong, gateway, at("10:05"))).toMatchObject({
      code: "ACCOUNT_LOCKED",
      message: "บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่อีกครั้งใน 15 นาที",
    });
    expect(await login(right, gateway, at("10:10"))).toMatchObject({ code: "ACCOUNT_LOCKED" });
    expect(await login(right, gateway, at("10:20"))).toEqual({ ok: true });
  });

  it("does not sign in at all while locked", async () => {
    const { gateway, signIns } = await withAccount();
    for (let i = 0; i < 5; i++) await login(wrong, gateway, at("10:00"));
    const before = signIns.length;
    await login(right, gateway, at("10:10"));
    expect(signIns.length).toBe(before);
  });

  it("AS-12 resets the counter after a successful login", async () => {
    const { gateway } = await withAccount();
    for (let i = 0; i < 4; i++) await login(wrong, gateway, at("10:00"));
    await login(right, gateway, at("10:01"));
    for (let i = 0; i < 4; i++) await login(wrong, gateway, at("10:02"));
    expect(await login(right, gateway, at("10:03"))).toEqual({ ok: true });
  });

  it("requires both fields", async () => {
    const { gateway } = await withAccount();
    expect(await login({ email: " ", password: "" }, gateway, at("10:00"))).toMatchObject({
      code: "VALIDATION_FAILED",
      errors: { email: "กรุณากรอกอีเมล", password: "กรุณากรอกรหัสผ่าน" },
    });
  });
});
