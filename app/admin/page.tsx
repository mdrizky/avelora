import { getData, listAllMessages, rsvpStats, listPlans } from "@/lib/db";
import { ToggleRow } from "@/components/admin/toggle-row";
import { MusicRow } from "@/components/admin/music-row";
import { GuestbookModeration } from "@/components/dashboard/guestbook-moderation";

export default async function AdminPage() {
  const d = getData();
  const pendingMessages = listAllMessages("pending");
  const templateCount = d.templates.filter((t) => t.is_active).length;
  const totalGuests = d.guests.length;
  const totalInvs = d.invitations.length;
  const users = d.profiles.length;
  const plans = listPlans();

  const invStats = d.invitations.reduce(
    (acc, inv) => {
      const s = rsvpStats(inv.id);
      acc.attending += s.counts.attending;
      acc.total += s.total;
      return acc;
    },
    { attending: 0, total: 0 },
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-4">
        <Card label="Pengguna" value={users} />
        <Card label="Undangan" value={totalInvs} />
        <Card label="Template Aktif" value={templateCount} />
        <Card label="Total Tamu" value={totalGuests} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card label="Tamu Sudah Konfirm" value={invStats.total} />
        <Card label="Konfirmasi Hadir" value={invStats.attending} />
        <Card label="Pesan Menunggu Moderasi" value={pendingMessages.length} />
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-ink-900">Konten Beranda</h2>
        <p className="text-xs text-ink-400">Testimoni &amp; FAQ dikelola dari kode seed; toggle aktif/nonaktif di sini.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {d.testimonials.map((t) => (
            <ToggleRow
              key={t.id}
              collection="testimonials"
              id={t.id}
              label={t.name}
              sub={`${t.role} — ${t.content.slice(0, 60)}${t.content.length > 60 ? "…" : ""}`}
              initialActive={t.is_active}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-ink-900">Template</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {d.templates.map((t) => (
            <ToggleRow
              key={t.id}
              collection="templates"
              id={t.id}
              label={t.name}
              sub={`${t.is_premium ? "Premium • " : ""}${t.theme_config.palette.name ?? t.theme_config.palette.background}`}
              initialActive={t.is_active}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-ink-900">Paket</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {plans.map((p) => (
            <ToggleRow
              key={p.id}
              collection="plans"
              id={p.id}
              label={p.display_name}
              sub={`Rp ${p.price.toLocaleString("id-ID")}/bulan`}
              initialActive={p.is_active}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-ink-900">Musik Lisensi (AVELORA Studio)</h2>
        <p className="text-xs text-ink-400">
          Lengkapi URL audio berlisensi. Undangan yang memakai track ini memutar audio dari URL tersebut.
        </p>
        <div className="space-y-2">
          {d.music_tracks.map((m) => (
            <MusicRow key={m.id} id={m.id} title={m.title} artist={m.artist} audioUrl={m.audio_url ?? ""} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-ink-900">Moderasi Buku Tamu (Semua Undangan)</h2>
        <GuestbookModeration
          initialMessages={pendingMessages.map((m) => ({
            id: m.id,
            guest_name: m.guest_name,
            message: m.message,
            status: m.status,
            is_featured: m.is_featured,
            created_at: m.created_at,
          }))}
        />
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink-900">{value}</p>
    </div>
  );
}