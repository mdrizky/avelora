"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Ban, KeyRound, Loader2, LogIn, LogOut, ShieldAlert, UserRoundCheck } from "lucide-react";

export function UserActions({ userId, banned, suspended }: { userId: string; banned: boolean; suspended: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<"warn_user" | "suspend_user" | "ban_user" | "force_logout" | "reset_password" | "impersonate" | null>(null);
  async function run(type: "warn_user" | "suspend_user" | "ban_user" | "force_logout" | "reset_password" | "impersonate", reason: string, password?: string) {
    setBusy(true);
    const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id: userId, is_active: type === "suspend_user" ? suspended : type === "ban_user" ? banned : undefined, reason, password }) });
    setBusy(false);
    if (!response.ok) window.alert("Aksi gagal dilakukan.");
    else if (type === "impersonate") router.push("/dashboard");
    else router.refresh();
    setPending(null);
  }
  const actions = [
    ["warn_user", "Warning", ShieldAlert],
    ["suspend_user", suspended ? "Aktifkan" : "Suspend", UserRoundCheck],
    ["ban_user", banned ? "Buka Ban" : "Ban", Ban],
    ["force_logout", "Force Logout", LogOut],
    ["reset_password", "Reset Password", KeyRound],
    ["impersonate", "Login sebagai", LogIn],
  ] as const;
  const current = pending;
  return <div className="flex flex-wrap gap-2">{actions.map(([type, label, Icon]) => <button key={type} disabled={busy} onClick={() => setPending(type)} className="btn btn-outline !px-3 !py-2 !text-xs"><Icon size={14} /> {busy ? <Loader2 size={14} className="animate-spin" /> : label}</button>)}<ConfirmDialog open={Boolean(current)} title={current ? labelsFor(current) : "Konfirmasi"} description="Tindakan ini akan dicatat di audit log." reasonRequired={current !== "impersonate"} passwordRequired={current === "reset_password"} busy={busy} onCancel={() => setPending(null)} onConfirm={(reason, password) => { if (current) void run(current, reason, password); }} /></div>;
}

function labelsFor(type: "warn_user" | "suspend_user" | "ban_user" | "force_logout" | "reset_password" | "impersonate") { return { warn_user: "Kirim warning", suspend_user: "Ubah status suspend", ban_user: "Ubah status ban", force_logout: "Force logout", reset_password: "Reset password", impersonate: "Login sebagai user" }[type]; }
