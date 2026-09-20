import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/dashboard" className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-extrabold text-ink-900">Panel Admin</h1>
      </div>
      {children}
    </main>
  );
}