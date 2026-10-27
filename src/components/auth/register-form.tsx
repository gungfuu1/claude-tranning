"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { affiliations } from "@/content/affiliations";
import { registerAction } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/safe-next";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/validation";
import { FieldError, FormMessage, inputClass, invalidProps, SubmitButton, TextField } from "./field";

const memberTypes = [
  { value: "EMPLOYEE", label: "พนักงาน กฟภ." },
  { value: "PUBLIC", label: "บุคคลภายนอก" },
];

// Sign-up form (spec 003 §3.1). The server re-checks everything; browser validation is off so
// every error uses the same Thai message from the server.
export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(registerAction, null);
  // Shows or hides the employee fields. The radios stay uncontrolled (defaultChecked from the
  // returned values), because React's form reset after a submit unchecks even controlled radios.
  const [memberType, setMemberType] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};
  const values = state?.values;

  // Move focus to the first invalid field so keyboard and screen reader users land on it.
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state?.message} />

      <fieldset {...invalidProps("memberType", errors.memberType)}>
        <legend className="text-sm font-medium text-zinc-800 dark:text-zinc-200">ประเภทผู้สมัคร</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {memberTypes.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm has-[:checked]:border-pea-primary has-[:checked]:bg-pea-primary/5 dark:border-zinc-700"
            >
              <input
                type="radio"
                name="memberType"
                value={type.value}
                defaultChecked={values?.memberType === type.value}
                onChange={() => setMemberType(type.value)}
                className="accent-pea-primary"
              />
              {type.label}
            </label>
          ))}
        </div>
        <FieldError name="memberType" error={errors.memberType} />
      </fieldset>

      <TextField
        name="fullName"
        label="ชื่อ-นามสกุล"
        autoComplete="name"
        defaultValue={values?.fullName}
        error={errors.fullName}
      />
      <TextField
        name="email"
        label="อีเมล"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        error={errors.email}
        hint={memberType === "EMPLOYEE" ? "พนักงานต้องใช้อีเมล @pea.co.th" : undefined}
      />

      {memberType === "EMPLOYEE" ? (
        <>
          <TextField
            name="employeeId"
            label="รหัสพนักงาน"
            inputMode="numeric"
            maxLength={6}
            autoComplete="off"
            defaultValue={values?.employeeId}
            error={errors.employeeId}
            hint="ตัวเลข 6 หลัก"
          />
          <div>
            <label htmlFor="affiliation" className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
              สังกัด (การไฟฟ้าเขต/สำนักงาน)
            </label>
            <select
              id="affiliation"
              name="affiliation"
              defaultValue={values?.affiliation ?? ""}
              className={inputClass}
              {...invalidProps("affiliation", errors.affiliation)}
            >
              <option value="" disabled>
                เลือกสังกัด
              </option>
              {affiliations.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <FieldError name="affiliation" error={errors.affiliation} />
          </div>
        </>
      ) : null}

      <TextField
        name="password"
        label="รหัสผ่าน"
        type="password"
        autoComplete="new-password"
        error={errors.password}
        hint={`อย่างน้อย ${MIN_PASSWORD_LENGTH} ตัวอักษร`}
      />
      <TextField
        name="confirmPassword"
        label="ยืนยันรหัสผ่าน"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <div>
        <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            name="consent"
            defaultChecked={values?.consent}
            className="mt-1 accent-pea-primary"
            {...invalidProps("consent", errors.consent)}
          />
          <span>
            ยินยอมให้ศูนย์อบรมเก็บและใช้ข้อมูลส่วนบุคคลเพื่อการอบรม ตาม{" "}
            <Link href="/privacy" target="_blank" className="text-pea-primary underline dark:text-pea-accent">
              นโยบายความเป็นส่วนตัว
            </Link>
          </span>
        </label>
        <FieldError name="consent" error={errors.consent} />
      </div>

      <SubmitButton pending={pending}>สมัครสมาชิก</SubmitButton>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        มีบัญชีแล้ว?{" "}
        <Link href={withNext("/login", next)} className="font-medium text-pea-primary underline dark:text-pea-accent">
          เข้าสู่ระบบ
        </Link>
      </p>
    </form>
  );
}
