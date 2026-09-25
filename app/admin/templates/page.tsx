import { Palette } from "lucide-react";
import { AdminTemplateGrid } from "@/components/admin/admin-data-table";
import { AdminTemplateForm } from "@/components/admin/admin-controls";
import { requireAdmin } from "@/lib/auth/session";
import { getData, listCategories } from "@/lib/db";

export default async function AdminTemplatesPage() {
  await requireAdmin();
  const data = getData();
  const categories = listCategories();
  const rows = data.templates.map((template) => ({
    id: template.id,
    name: template.name,
    category: categories.find((category) => category.id === template.category_id)?.name ?? "Lainnya",
    premium: template.is_premium,
    price: template.price,
    active: template.is_active,
    thumbnail: template.thumbnail_url,
  }));
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Design system</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><Palette size={28} className="text-gold-500" /> Template Management</h1><p className="mt-2 text-sm text-ink-500">Kelola katalog template visual yang tersedia untuk user.</p></div><div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-extrabold text-ink-900">Tambah template baru</h2><AdminTemplateForm categories={categories} /></div><div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"><AdminTemplateGrid rows={rows} /></div></div>;
}