"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Logo } from "@/components/logo";

function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { loading, error, setLoading, setError };
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3">
      {loading && <LoaderCircle size={16} className="animate-spin" />}
      {label}
    </button>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>;
}

function Shell({ children, title, subtitle, footer }: { children: React.ReactNode; title: string; subtitle: string; footer: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ivory-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="card-subtle rounded-3xl border border-ink-100 bg-white p-8">
          <h1 className="text-center text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-1.5 text-center text-sm text-ink-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>
      </div>
    </main>
  );
}

export const AuthShell = Shell;

function Labeled({ label }: { label: string }) {
  return <label className="label">{label}</label>;
}

export function LoginForm({ next }: { next?: string }) {
  const { loading, error, setLoading, setError } = useSubmit();
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal masuk");
      router.push(next || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div>
        <Labeled label="Alamat email" />
        <input type="email" name="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Labeled label="Kata sandi" />
          <Link href="/forgot-password" className="-mt-1 mb-2 text-xs font-semibold text-gold-600 hover:underline">Lupa sandi?</Link>
        </div>
        <input type="password" name="password" required autoComplete="current-password" className="field" />
      </div>
      <SubmitButton loading={loading} label="Masuk" />
    </form>
  );
}

export function RegisterForm() {
  const { loading, error, setLoading, setError } = useSubmit();
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
          first_name: fd.get("first_name"),
          last_name: fd.get("last_name"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mendaftar");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Labeled label="Nama depan" />
          <input name="first_name" required className="field" />
        </div>
        <div>
          <Labeled label="Nama belakang" />
          <input name="last_name" required className="field" />
        </div>
      </div>
      <div>
        <Labeled label="Alamat email" />
        <input type="email" name="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <Labeled label="Kata sandi (min. 8 karakter)" />
        <input type="password" name="password" minLength={8} required autoComplete="new-password" className="field" />
      </div>
      <SubmitButton loading={loading} label="Buat Akun Gratis" />
    </form>
  );
}

export function ForgotForm() {
  const { loading, error, setLoading, setError } = useSubmit();
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memproses");
      setSent(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-sage-100 p-6 text-center">
        <p className="font-bold text-sage-700">Check email Anda</p>
        <p className="mt-2 text-sm text-ink-600">
          Jika email terdaftar, tautan reset sudah dikirim. (Demo: token reset tersimpan di database lokal.)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div>
        <Labeled label="Alamat email terdaftar" />
        <input type="email" name="email" required className="field" />
      </div>
      <SubmitButton loading={loading} label="Kirim Tautan Reset" />
    </form>
  );
}

export function ResetForm() {
  const { loading, error, setLoading, setError } = useSubmit();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          token: fd.get("token"),
          password: fd.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengatur ulang");
      router.push("/login?reset=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorBox error={error} />
      <div>
        <Labeled label="Alamat email" />
        <input type="email" name="email" defaultValue={email} required className="field" />
      </div>
      <div>
        <Labeled label="Token reset" />
        <input name="token" defaultValue={token} required className="field font-mono text-xs" placeholder="token dari email" />
      </div>
      <div>
        <Labeled label="Kata sandi baru (min. 8 karakter)" />
        <input type="password" name="password" minLength={8} required className="field" />
      </div>
      <SubmitButton loading={loading} label="Atur Ulang Sandi" />
    </form>
  );
}

export function DemoCredentials() {
  return (
    <div className="rounded-xl border border-dashed border-gold-300 bg-gold-100/40 p-4 text-xs text-ink-600">
      <p className="font-bold text-ink-900">Akun demo</p>
      <p className="mt-1">
        <span className="font-mono">demo@avelora.id</span> / <span className="font-mono">demo123</span> (host)<br />
        <span className="font-mono">admin@avelora.id</span> / <span className="font-mono">admin123</span> (admin)
      </p>
    </div>
  );
}