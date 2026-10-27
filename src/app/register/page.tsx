import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage, FormSkeleton } from "@/components/auth/auth-page";
import { RegisterForm } from "@/components/auth/register-form";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | ศูนย์อบรมออนไลน์ กฟภ.",
};

// Signed-in visitors never reach this page: src/proxy.ts sends them on to `?next=` (AS-14).
export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthPage title="สมัครสมาชิก" subtitle="สมัครเพื่อลงทะเบียนหลักสูตรอบรมออนไลน์ของ กฟภ.">
      <Suspense fallback={<FormSkeleton rows={6} />}>
        <RegisterFormWithNext searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function RegisterFormWithNext({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const { next } = await searchParams;
  return <RegisterForm next={safeNext(next)} />;
}
