"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { loginAction } from "@/lib/auth/actions";
import { withNext } from "@/lib/auth/safe-next";
import { FormMessage, SubmitButton, TextField } from "./field";

// Login form (spec 003 §3.2). Wrong email and wrong password share one message (REG-02).
export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    const form = formRef.current;
    if (!state || !form) return;
    (form.querySelector<HTMLElement>("[aria-invalid=true]") ?? form.querySelector<HTMLElement>("[name=password]"))?.focus();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormMessage message={state?.message} />

      <TextField
        name="email"
        label="อีเมล"
        type="email"
        autoComplete="email"
        defaultValue={state?.values.email}
        error={errors.email}
      />
      <TextField name="password" label="รหัสผ่าน" type="password" autoComplete="current-password" error={errors.password} />

      <SubmitButton pending={pending}>เข้าสู่ระบบ</SubmitButton>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        ยังไม่มีบัญชี?{" "}
        <Link href={withNext("/register", next)} className="font-medium text-pea-primary underline dark:text-pea-accent">
          สมัครสมาชิก
        </Link>
      </p>
    </form>
  );
}
