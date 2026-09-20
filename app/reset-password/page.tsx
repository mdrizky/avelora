import { Suspense } from "react";
import Link from "next/link";
import { AuthShell, ResetForm } from "@/components/auth/auth-forms";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Atur ulang sandi"
      subtitle="Masukkan email, token, dan sandi baru Anda."
      footer={
        <Link href="/login" className="font-bold text-gold-600 hover:underline">← Kembali ke masuk</Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-ink-500">Memuat…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}