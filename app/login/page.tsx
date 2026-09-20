import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthShell, DemoCredentials, LoginForm } from "@/components/auth/auth-forms";
import { getSessionUser } from "@/lib/auth/session";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      title="Selamat datang kembali"
      subtitle="Masuk ke dashboard AVELORA Anda"
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-gold-600 hover:underline">Daftar gratis</Link>
        </>
      }
    >
      {params.reset && (
        <p className="mb-4 rounded-xl bg-sage-100 px-4 py-2.5 text-sm font-medium text-sage-700">
          Sandi berhasil diatur ulang. Silakan masuk.
        </p>
      )}
      <LoginForm next={params.next} />
      <div className="mt-6">
        <DemoCredentials />
      </div>
    </AuthShell>
  );
}