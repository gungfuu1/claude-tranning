import { z } from "zod";
import { affiliations } from "@/content/affiliations";

// Sign-up and login input rules (spec 003). Pure, so the same rules run in unit tests and in the
// Server Actions; the form's HTML attributes only mirror them for convenience (REG-05).

export const MIN_PASSWORD_LENGTH = 8;
export const EMPLOYEE_EMAIL_DOMAIN = "pea.co.th";

export type MemberType = "EMPLOYEE" | "PUBLIC";

// BR-02: compare emails case-insensitively after trimming.
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const registerFields = [
  "memberType",
  "fullName",
  "email",
  "employeeId",
  "affiliation",
  "password",
  "confirmPassword",
  "consent",
] as const;
export type RegisterField = (typeof registerFields)[number];

const registerSchema = z
  .object({
    memberType: z.enum(["EMPLOYEE", "PUBLIC"], { error: "กรุณาเลือกประเภทผู้สมัคร" }),
    fullName: z
      .string()
      .trim()
      .min(2, "ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร")
      .max(100, "ชื่อ-นามสกุลต้องยาว 2–100 ตัวอักษร"),
    email: z.string().transform(normalizeEmail).pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง")),
    employeeId: z.string().trim().optional(),
    affiliation: z.string().optional(),
    password: z.string().min(MIN_PASSWORD_LENGTH, `รหัสผ่านต้องยาวอย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`),
    confirmPassword: z.string(),
    consent: z.literal("on", { error: "กรุณายอมรับนโยบายความเป็นส่วนตัว" }),
  })
  .superRefine((input, ctx) => {
    if (input.password !== input.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "รหัสผ่านไม่ตรงกัน" });
    }
    if (input.memberType !== "EMPLOYEE") return;
    // BR-04
    if (!input.employeeId) {
      ctx.addIssue({ code: "custom", path: ["employeeId"], message: "กรุณากรอกรหัสพนักงาน" });
    } else if (!/^\d{6}$/.test(input.employeeId)) {
      ctx.addIssue({ code: "custom", path: ["employeeId"], message: "รหัสพนักงานต้องเป็นตัวเลข 6 หลัก" });
    }
    if (!input.affiliation || !(affiliations as readonly string[]).includes(input.affiliation)) {
      ctx.addIssue({ code: "custom", path: ["affiliation"], message: "กรุณาเลือกสังกัด" });
    }
    // BR-05: the domain must be exactly pea.co.th (not a subdomain or a look-alike).
    if (input.email.split("@")[1] !== EMPLOYEE_EMAIL_DOMAIN) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "พนักงานต้องใช้อีเมล @pea.co.th" });
    }
  })
  .transform(({ memberType, fullName, email, employeeId, affiliation, password }) =>
    // BR-04: drop employee fields for PUBLIC even if a client sent them.
    memberType === "EMPLOYEE"
      ? { memberType, fullName, email, password, employeeId: employeeId!, affiliation: affiliation! }
      : { memberType, fullName, email, password, employeeId: null, affiliation: null },
  );

export type RegisterInput = z.output<typeof registerSchema>;
export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export function parseRegister(raw: Partial<Record<RegisterField, unknown>>) {
  const result = registerSchema.safeParse(raw);
  if (result.success) return { ok: true as const, data: result.data };
  const errors: FieldErrors<RegisterField> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as RegisterField;
    errors[field] ??= issue.message;
  }
  return { ok: false as const, errors };
}

const loginSchema = z.object({
  email: z.string().transform(normalizeEmail).pipe(z.string().min(1, "กรุณากรอกอีเมล")),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type LoginField = keyof z.input<typeof loginSchema>;

export function parseLogin(raw: Partial<Record<LoginField, unknown>>) {
  const result = loginSchema.safeParse(raw);
  if (result.success) return { ok: true as const, data: result.data };
  const errors: FieldErrors<LoginField> = {};
  for (const issue of result.error.issues) {
    errors[issue.path[0] as LoginField] ??= issue.message;
  }
  return { ok: false as const, errors };
}
