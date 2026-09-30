"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Logo } from "@/components/logo";

function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return { loading, error, setLoading, setError };
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="btn btn-primary w-full !py-3.5 text-base relative overflow-hidden group">
      {loading && <LoaderCircle size={18} className="animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
      <span className={loading ? "invisible" : ""}>{label}</span>
      <span className={loading ? "visible" : "invisible"} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <LoaderCircle size={18} className="animate-spin" />
      </span>
    </button>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-shake">
      <AlertCircle size={16} className="shrink-0" />
      {error}
    </div>
  );
}

function InputWithIcon({ 
  label, 
  type = "text", 
  name, 
  required, 
  autoComplete, 
  icon: Icon, 
  showPasswordToggle = false,
  placeholder,
  ...props 
}: { 
  label: string; 
  type?: string; 
  name: string; 
  required?: boolean; 
  autoComplete?: string; 
  icon: React.ComponentType<{ size?: number; className?: string }>;
  showPasswordToggle?: boolean;
  placeholder?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = showPasswordToggle && showPassword ? "text" : type;
  
  return (
    <div className="relative">
      <label className="label flex items-center gap-1.5">
        <Icon size={13} className="text-ink-400" aria-hidden="true" />
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          type={actualType}
          name={name}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`field ${showPasswordToggle ? "pr-12" : ""}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

function Shell({ children, title, subtitle, footer }: { children: React.ReactNode; title: string; subtitle: string; footer: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-ivory-50 px-4 py-10 overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-gold-500/5 to-transparent blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 flex justify-center animate-fade-up">
          <Logo />
        </div>
        <div className="card-subtle rounded-3xl border border-ink-100 bg-white/80 backdrop-blur-sm p-8 sm:p-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">{title}</h1>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
          </div>
          <div className="space-y-6">{children}</div>
        </div>
        <div className="mt-6 text-center text-sm text-ink-500 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {footer}
        </div>
      </div>
    </main>
  );
}

export const AuthShell = Shell;

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
      router.push(next || (data.user?.role === "admin" ? "/admin" : "/dashboard"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <ErrorBox error={error} />
      <InputWithIcon
        label="Alamat email"
        type="email"
        name="email"
        required
        autoComplete="email"
        icon={Mail}
        placeholder="nama@email.com"
      />
      <InputWithIcon
        label="Kata sandi"
        type="password"
        name="password"
        required
        autoComplete="current-password"
        icon={Lock}
        showPasswordToggle
        placeholder="••••••••"
      />
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-gold-600 focus:ring-gold-500" />
          <span className="text-sm text-ink-600">Ingat saya</span>
        </label>
        <Link href="/forgot-password" className="text-sm font-semibold text-gold-600 hover:underline">Lupa sandi?</Link>
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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <ErrorBox error={error} />
      <div className="grid grid-cols-2 gap-3">
        <InputWithIcon
          label="Nama depan"
          name="first_name"
          required
          icon={User}
          placeholder="Nama depan"
        />
        <InputWithIcon
          label="Nama belakang"
          name="last_name"
          required
          icon={User}
          placeholder="Nama belakang"
        />
      </div>
      <InputWithIcon
        label="Alamat email"
        type="email"
        name="email"
        required
        autoComplete="email"
        icon={Mail}
        placeholder="nama@email.com"
      />
      <InputWithIcon
        label="Kata sandi (min. 8 karakter)"
        type="password"
        name="password"
        minLength={8}
        required
        autoComplete="new-password"
        icon={Lock}
        showPasswordToggle
        placeholder="••••••••"
      />
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
      <div className="space-y-4 text-center animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <CheckCircle size={32} className="text-sage-600" />
        </div>
        <p className="font-bold text-sage-700 text-lg">Cek Email Anda</p>
        <p className="text-sm text-ink-600">
          Jika email terdaftar, tautan reset sudah dikirim ke kotak masuk Anda.
        </p>
        <p className="text-xs text-ink-400">
          (Mode demo: token reset tersimpan di database lokal, cek konsol server)
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <ErrorBox error={error} />
      <InputWithIcon
        label="Alamat email terdaftar"
        type="email"
        name="email"
        required
        icon={Mail}
        placeholder="nama@email.com"
      />
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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <ErrorBox error={error} />
      <InputWithIcon
        label="Alamat email"
        type="email"
        name="email"
        defaultValue={email}
        required
        icon={Mail}
        placeholder="nama@email.com"
      />
      <InputWithIcon
        label="Token reset"
        name="token"
        defaultValue={token}
        required
        icon={Lock}
        placeholder="token dari email"
        className="font-mono text-xs"
      />
      <InputWithIcon
        label="Kata sandi baru (min. 8 karakter)"
        type="password"
        name="password"
        minLength={8}
        required
        icon={Lock}
        showPasswordToggle
        placeholder="••••••••"
      />
      <SubmitButton loading={loading} label="Atur Ulang Sandi" />
    </form>
  );
}
