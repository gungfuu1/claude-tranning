import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

// Acceptance scenarios from docs/003-member-registration-login.spec.md.
// "Form only" tests need no database. "With accounts" tests create real users and need the
// profiles migration applied and SUPABASE_SECRET_KEY in .env.local; each worker deletes the users it created.

const PASSWORD = "abcd1234";
// Emails this worker generated. Cleanup deletes only these: workers run in parallel, so deleting
// every "e2e-auth-" account would remove users that another worker's test is still using.
const generatedEmails = new Set<string>();
const uniqueEmail = (domain = "example.com") => {
  const email = `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@${domain}`;
  generatedEmails.add(email.toLowerCase());
  return email;
};
const uniqueEmployeeId = () => String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");

async function fillPublic(page: Page, fields: { fullName?: string; email?: string; confirm?: string; consent?: boolean } = {}) {
  await page.getByLabel("บุคคลภายนอก").check();
  await page.getByLabel("ชื่อ-นามสกุล").fill(fields.fullName ?? "สมชาย ใจดี");
  await page.getByLabel("อีเมล").fill(fields.email ?? uniqueEmail());
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(PASSWORD);
  await page.getByLabel("ยืนยันรหัสผ่าน").fill(fields.confirm ?? PASSWORD);
  if (fields.consent ?? true) await page.getByRole("checkbox").check();
}

const submitRegister = (page: Page) => page.getByRole("button", { name: "สมัครสมาชิก" }).click();

test.describe("form only", () => {
  test("AS-03 shows each field's error under the field", async ({ page }) => {
    await page.goto("/register");
    await fillPublic(page, { fullName: "ก", email: "somchai@", confirm: "abcd1235" });
    await submitRegister(page);

    await expect(page.getByLabel("ชื่อ-นามสกุล")).toHaveAccessibleDescription("ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร");
    await expect(page.getByLabel("อีเมล")).toHaveAccessibleDescription("รูปแบบอีเมลไม่ถูกต้อง");
    await expect(page.getByLabel("ยืนยันรหัสผ่าน")).toHaveAccessibleDescription("รหัสผ่านไม่ตรงกัน");
  });

  test("AS-05 employee fields are required and need a @pea.co.th email", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("พนักงาน กฟภ.").check();
    await page.getByLabel("ชื่อ-นามสกุล").fill("สมชาย ใจดี");
    await page.getByLabel("อีเมล").fill("somchai@gmail.com");
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(PASSWORD);
    await page.getByLabel("ยืนยันรหัสผ่าน").fill(PASSWORD);
    await page.getByRole("checkbox").check();
    await submitRegister(page);

    await expect(page.getByLabel("อีเมล")).toHaveAccessibleDescription(/พนักงานต้องใช้อีเมล @pea.co.th/);
    await expect(page.getByLabel("รหัสพนักงาน")).toHaveAccessibleDescription(/กรุณากรอกรหัสพนักงาน/);
    await expect(page.getByLabel("สังกัด (การไฟฟ้าเขต/สำนักงาน)")).toHaveAccessibleDescription("กรุณาเลือกสังกัด");
  });

  test("AS-06 public applicants don't see employee fields", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("พนักงาน กฟภ.").check();
    await expect(page.getByLabel("รหัสพนักงาน")).toBeVisible();
    await page.getByLabel("บุคคลภายนอก").check();
    await expect(page.getByLabel("รหัสพนักงาน")).toHaveCount(0);
    await expect(page.getByLabel("สังกัด (การไฟฟ้าเขต/สำนักงาน)")).toHaveCount(0);
  });

  test("AS-07 consent is required", async ({ page }) => {
    await page.goto("/register");
    await fillPublic(page, { consent: false });
    await submitRegister(page);
    await expect(page.getByText("กรุณายอมรับนโยบายความเป็นส่วนตัว")).toBeVisible();
  });

  test("AS-08 keeps entered values except passwords", async ({ page }) => {
    await page.goto("/register");
    await fillPublic(page, { email: "somchai@", consent: true });
    await submitRegister(page);

    await expect(page.getByLabel("อีเมล")).toHaveAccessibleDescription("รูปแบบอีเมลไม่ถูกต้อง");
    await expect(page.getByLabel("บุคคลภายนอก")).toBeChecked();
    await expect(page.getByLabel("ชื่อ-นามสกุล")).toHaveValue("สมชาย ใจดี");
    await expect(page.getByLabel("อีเมล")).toHaveValue("somchai@");
    await expect(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByLabel("รหัสผ่าน", { exact: true })).toHaveValue("");
    await expect(page.getByLabel("ยืนยันรหัสผ่าน")).toHaveValue("");
  });

  test("login and register links carry ?next=", async ({ page }) => {
    await page.goto("/login?next=/about");
    await expect(page.getByRole("link", { name: "สมัครสมาชิก" })).toHaveAttribute("href", "/register?next=%2Fabout");
  });

  test("AS-15 signed-out visitors are sent to login from member pages", async ({ page }) => {
    await page.goto("/my-courses");
    await expect(page).toHaveURL("/login?next=%2Fmy-courses");
  });

  test("main menu shows login and sign-up when signed out", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "เข้าสู่ระบบ" })).toHaveAttribute("href", "/login");
    await expect(header.getByRole("link", { name: "สมัครเรียน" })).toHaveAttribute("href", "/register");
  });

  // AS-17
  for (const path of ["/register", "/login"]) {
    test(`AS-17 ${path} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("button", { name: /สมัครสมาชิก|เข้าสู่ระบบ/ }).first()).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).analyze();
      const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(blocking, JSON.stringify(blocking.map((v) => [v.id, v.nodes.map((n) => n.target)]), null, 2)).toEqual([]);
    });

    test(`AS-17 ${path} fits a 375 px screen`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe("with accounts", () => {
  test.skip(!process.env.SUPABASE_SECRET_KEY, "needs SUPABASE_SECRET_KEY and the profiles migration");

  test.afterAll(async () => {
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await admin.from("profiles").select("id").in("email", [...generatedEmails]);
    for (const { id } of data ?? []) await admin.auth.admin.deleteUser(id);
  });

  async function registerPublic(page: Page, next?: string) {
    const email = uniqueEmail();
    await page.goto(next ? `/register?next=${encodeURIComponent(next)}` : "/register");
    await fillPublic(page, { email });
    await submitRegister(page);
    return email;
  }

  async function logout(page: Page) {
    await page.locator("header").getByRole("button", { name: "ออกจากระบบ" }).click();
    await expect(page.locator("header").getByRole("link", { name: "เข้าสู่ระบบ" })).toBeVisible();
  }

  async function loginWith(page: Page, email: string, password: string, next?: string) {
    await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
    await page.getByLabel("อีเมล").fill(email);
    await page.getByLabel("รหัสผ่าน").fill(password);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
  }

  test("AS-01 public sign-up signs the member in and follows ?next=", async ({ page }) => {
    await registerPublic(page, "/about");
    await expect(page).toHaveURL("/about");
    await expect(page.getByTestId("user-name").first()).toHaveText("สมชาย ใจดี");
  });

  test("AS-02 employee sign-up", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("พนักงาน กฟภ.").check();
    await page.getByLabel("ชื่อ-นามสกุล").fill("สมชาย พนักงาน");
    await page.getByLabel("อีเมล").fill(uniqueEmail("PEA.CO.TH"));
    await page.getByLabel("รหัสพนักงาน").fill(uniqueEmployeeId());
    await page.getByLabel("สังกัด (การไฟฟ้าเขต/สำนักงาน)").selectOption({ index: 1 });
    await page.getByLabel("รหัสผ่าน", { exact: true }).fill(PASSWORD);
    await page.getByLabel("ยืนยันรหัสผ่าน").fill(PASSWORD);
    await page.getByRole("checkbox").check();
    await submitRegister(page);
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("user-name").first()).toHaveText("สมชาย พนักงาน");
  });

  test("AS-04 a used email is rejected regardless of case and spaces", async ({ page }) => {
    const email = await registerPublic(page);
    await expect(page).toHaveURL("/");
    await logout(page);

    await page.goto("/register");
    await fillPublic(page, { email: `  ${email.toUpperCase()}  ` });
    await submitRegister(page);
    await expect(page.getByLabel("อีเมล")).toHaveAccessibleDescription("อีเมลนี้ถูกใช้แล้ว");
  });

  test("AS-09/AS-14/AS-15 login, bounce off /login, then logout", async ({ page }) => {
    const email = await registerPublic(page);
    await expect(page).toHaveURL("/");
    await logout(page);

    await loginWith(page, `  ${email.toUpperCase()} `, PASSWORD, "/about");
    await expect(page).toHaveURL("/about");
    await expect(page.getByTestId("user-name").first()).toBeVisible();

    await page.goto("/login?next=/about");
    await expect(page).toHaveURL("/about");
    await page.goto("/register");
    await expect(page).toHaveURL("/");

    await logout(page);
    await expect(page).toHaveURL("/");
    await page.goto("/my-courses");
    await expect(page).toHaveURL("/login?next=%2Fmy-courses");
  });

  test("AS-10 the same message for a wrong password and an unknown email", async ({ page }) => {
    const email = await registerPublic(page);
    await expect(page).toHaveURL("/");
    await logout(page);

    await loginWith(page, email, "wrong-password");
    await expect(page.locator("main").getByRole("alert")).toHaveText("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    await loginWith(page, uniqueEmail(), PASSWORD);
    await expect(page.locator("main").getByRole("alert")).toHaveText("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
  });

  test("AS-11 five failures lock the account, even for the right password", async ({ page }) => {
    const email = await registerPublic(page);
    await expect(page).toHaveURL("/");
    await logout(page);

    for (let i = 1; i <= 4; i++) {
      await loginWith(page, email, "wrong-password");
      await expect(page.locator("main").getByRole("alert")).toHaveText("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
    await loginWith(page, email, "wrong-password");
    await expect(page.locator("main").getByRole("alert")).toHaveText("บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่อีกครั้งใน 15 นาที");

    await loginWith(page, email, PASSWORD);
    await expect(page.locator("main").getByRole("alert")).toHaveText("บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่อีกครั้งใน 15 นาที");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AS-13 an outside ?next= falls back to the home page", async ({ page }) => {
    const email = await registerPublic(page);
    await expect(page).toHaveURL("/");
    await logout(page);

    await loginWith(page, email, PASSWORD, "//evil.com");
    await expect(page).toHaveURL("/");
  });
});
