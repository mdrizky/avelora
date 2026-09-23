import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-ivory-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/" className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
            ← Situs
          </Link>
          <h1 className="text-xl font-extrabold text-ink-900">Panel Admin</h1>
        </div>
        {children}
      </div>
    </main>
  );
}