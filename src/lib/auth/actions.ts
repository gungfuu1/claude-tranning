"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "./safe-next";
import { login, messages, register } from "./service";
import { createSupabaseGateway } from "./supabase-gateway";
import type { FieldErrors, LoginField, RegisterField } from "./validation";

// Server Actions for /register, /login and the header's logout button (spec 003).
// All rules are re-checked here on the server (REG-05); passwords are never echoed back (REG-03, REG-04).

export type RegisterFormState = {
  errors: FieldErrors<RegisterField>;
  message?: string;
  values: { memberType: string; fullName: string; email: string; employeeId: string; affiliation: string; consent: boolean };
};

export type LoginFormState = {
  errors: FieldErrors<LoginField>;
  message?: string;
  values: { email: string };
};

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function registerAction(_: RegisterFormState | null, formData: FormData): Promise<RegisterFormState> {
  const values = {
    memberType: text(formData, "memberType"),
    fullName: text(formData, "fullName"),
    email: text(formData, "email"),
    employeeId: text(formData, "employeeId"),
    affiliation: text(formData, "affiliation"),
    consent: formData.get("consent") === "on",
  };

  let result;
  try {
    result = await register(
      {
        ...values,
        consent: formData.get("consent") ?? undefined,
        password: text(formData, "password"),
        confirmPassword: text(formData, "confirmPassword"),
      },
      createSupabaseGateway(),
      new Date(),
    );
  } catch (error) {
    console.error("Registration failed", error);
    return { errors: {}, message: messages.UNAVAILABLE, values };
  }

  if (!result.ok) return { errors: result.errors, values };
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(_: LoginFormState | null, formData: FormData): Promise<LoginFormState> {
  const values = { email: text(formData, "email") };

  let result;
  try {
    result = await login({ email: values.email, password: text(formData, "password") }, createSupabaseGateway(), new Date());
  } catch (error) {
    console.error("Login failed", error);
    return { errors: {}, message: messages.UNAVAILABLE, values };
  }

  if (!result.ok) return { errors: result.errors, message: result.message, values };
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
