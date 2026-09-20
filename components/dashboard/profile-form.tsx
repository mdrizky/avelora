"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

export function ProfileForm({
  initial,
}: {
  initial: { first_name: string; last_name: string; phone: string };
}) {
  const [first, setFirst] = useState(initial.first_name);
  const [last, setLast] = useState(initial.last_name);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: first, last_name: last, phone }),
    });
    setSaving(false);
    setSaved(r.ok);
    setTimeout(() => setSaved(false), 2000);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    setPwMsg(null);
    const r = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: cur, new_password: next }),
    });
    const data = await r.json().catch(() => ({}));
    setPwBusy(false);
    if (r.ok) {
      setCur("");
      setNext("");
      setPwMsg("Kata sandi berhasil diganti.");
    } else {
      setPwMsg(data.error ?? "Gagal mengganti kata sandi.");
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-800">Informasi Akun</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nama Depan</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} className="field" required />
          </div>
          <div>
            <label className="label">Nama Belakang</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} className="field" required />
          </div>
        </div>
        <div>
          <label className="label">Telepon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="08xxxx" />
        </div>
        <button type="submit" className="btn btn-primary">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? "Tersimpan" : "Simpan Profil"}
        </button>
      </form>

      <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-800">Ganti Kata Sandi</h2>
        <div>
          <label className="label">Kata Sandi Saat Ini</label>
          <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className="field" required />
        </div>
        <div>
          <label className="label">Kata Sandi Baru (min. 8 karakter)</label>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className="field" required minLength={8} />
        </div>
        <button type="submit" disabled={pwBusy} className="btn btn-outline">
          {pwBusy && <Loader2 size={14} className="animate-spin" />} Ganti Kata Sandi
        </button>
        {pwMsg && (
          <p className={`text-xs ${pwMsg.startsWith("Kata sandi berhasil") ? "text-green-600" : "text-red-500"}`}>{pwMsg}</p>
        )}
      </form>
    </div>
  );
}