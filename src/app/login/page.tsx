import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPage, FormSkeleton } from "@/components/auth/auth-page";
import { LoginForm } from "@/components/auth/login-form";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ศูนย์อบรมออนไลน์ กฟภ.",
};

// Signed-in visitors never reach this page: src/proxy.ts sends them on to `?next=` (AS-14).
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthPage title="เข้าสู่ระบบ" subtitle="เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ใช้สมัครสมาชิก">
      <Suspense fallback={<FormSkeleton rows={3} />}>
        <LoginFormWithNext searchParams={searchParams} />
      </Suspense>
    </AuthPage>
  );
}

async function LoginFormWithNext({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={safeNext(next)} />;
}
