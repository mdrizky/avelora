import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthShell, RegisterForm } from "@/components/auth/auth-forms";
import { getSessionUser } from "@/lib/auth/session";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      title="Buat undangan pertamamu"
      subtitle="Gratis, tanpa kartu kredit. Siap dalam 20 menit."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-gold-600 hover:underline">Masuk</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}