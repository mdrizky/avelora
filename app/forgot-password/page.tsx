import Link from "next/link";
import { AuthShell, ForgotForm } from "@/components/auth/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Lupa kata sandi?"
      subtitle="Kami akan kirim tautan reset ke email Anda."
      footer={
        <Link href="/login" className="font-bold text-gold-600 hover:underline">← Kembali ke masuk</Link>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}