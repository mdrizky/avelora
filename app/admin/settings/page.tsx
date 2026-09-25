import { Settings2 } from "lucide-react";
import { SettingForm } from "@/components/admin/platform-forms";
import { requireAdmin } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = getData().system_settings;
  const value = (key: string, fallback: string) => settings.find((setting) => setting.key === key)?.value ?? fallback;
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Platform configuration</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><Settings2 size={28} className="text-gold-500" /> Pengaturan Sistem</h1><p className="mt-2 text-sm text-ink-500">Konfigurasi identitas dan kontak utama AVELORA.</p></div><section className="space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><div><label className="label">Nama brand</label><SettingForm settingKey="brand_name" initialValue={value("brand_name", "AVELORA")} /></div><div><label className="label">Email support</label><SettingForm settingKey="support_email" initialValue={value("support_email", "hello@avelora.id")} /></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">Payment gateway tersimpan di server dan belum boleh memakai secret key di client. Tambahkan credential Midtrans/Xendit melalui environment variable hosting sebelum mode live diaktifkan.</div></section></div>;
}