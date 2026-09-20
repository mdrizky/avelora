"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clipboard,
  Eye,
  ExternalLink,
  Loader2,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import type { InvitationContent, ThemeConfig, EventSchedule, GiftAccount } from "@/lib/db/types";
import {
  GenericListEditor,
  ImageInput,
  Input,
  Select,
  StoryEditor,
  Textarea,
  Toggle,
} from "./fields";

type MusicTrackLite = { id: string; title: string; artist: string };

interface EditorProps {
  invitation: {
    id: string;
    slug: string;
    title: string;
    status: "draft" | "published" | "memory";
    event_date?: string;
    timezone: string;
    city?: string;
    music_track_id?: string;
    content_data: InvitationContent;
    theme_config: ThemeConfig;
  };
  themeConfig: ThemeConfig;
  musicTracks: MusicTrackLite[];
  gifts: GiftAccount[];
  schedules: (EventSchedule & { map_embed_url?: string })[];
  gallery: { id: string; url: string; order: number }[];
  entitlement: {
    planLabel: string;
    premiumAllowed: boolean;
    canMusic: boolean;
    canCustomUrl: boolean;
    canRemoveBranding: boolean;
  };
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface ScheduleDraft {
  id: string;
  label: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address: string;
  maps_url: string;
}
interface GiftDraft {
  id: string;
  type: "bank" | "qris" | "ewallet";
  bank_name?: string;
  account_number?: string;
  account_name: string;
  provider?: string;
  phone?: string;
}

const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Pontianak",
  "Asia/Jayapura",
];

export function Editor({
  invitation,
  themeConfig,
  musicTracks,
  gifts: propGifts,
  schedules: propSchedules,
  gallery: propGallery,
  entitlement,
}: EditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(invitation.title);
  const [eventDate, setEventDate] = useState(invitation.event_date ?? "");
  const [timezone, setTimezone] = useState(invitation.timezone);
  const [city, setCity] = useState(invitation.city ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    invitation.status === "published" ? "published" : "draft",
  );
  const [content, setContent] = useState<InvitationContent>(() =>
    structuredClone(invitation.content_data),
  );
  const [font, setFont] = useState<ThemeConfig["font"]>(themeConfig.font);
  const [layout, setLayout] = useState<ThemeConfig["layout"]>(themeConfig.layout);
  const [animation, setAnimation] = useState<ThemeConfig["animation"]>(themeConfig.animation);
  const [musicTrackId, setMusicTrackId] = useState(invitation.music_track_id ?? "");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>(
    propSchedules.map(({ id, label, event_date, start_time, end_time, location_name, address, maps_url }) => ({
      id,
      label,
      event_date,
      start_time,
      end_time,
      location_name,
      address,
      maps_url,
    })),
  );
  const [giftAccounts, setGiftAccounts] = useState<GiftDraft[]>(
    propGifts.map((g) => ({
      id: g.id,
      type: g.type,
      bank_name: g.bank_name ?? "",
      account_number: g.account_number ?? "",
      account_name: g.account_name ?? "",
      provider: g.provider ?? "",
      phone: g.phone ?? "",
    })),
  );
  const [galleryImages, setGalleryImages] = useState(propGallery);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState(false);
  const first = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pal = themeConfig.palette;
  const fontCss =
    font === "script" ? "'Great Vibes', cursive" : font === "serif" ? "Georgia, serif" : "sans-serif";

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(runSave, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, eventDate, timezone, city, status, content, font, layout, animation, musicTrackId, schedules, giftAccounts, galleryImages]);

  async function runSave(nextStatus?: "draft" | "published") {
    const finalStatus = nextStatus ?? status;
    try {
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          event_date: eventDate,
          timezone,
          city,
          status: finalStatus,
          music_track_id: entitlement.canMusic ? musicTrackId || null : null,
          content_data: content,
          theme_config: { ...themeConfig, font, layout, animation },
          schedules: schedules.map((s) => ({ label: s.label, event_date: s.event_date, start_time: s.start_time, end_time: s.end_time, location_name: s.location_name, address: s.address, maps_url: s.maps_url })),
          gallery: galleryImages.map((g) => g.url),
          gifts: giftAccounts.map((g) => ({ type: g.type, bank_name: g.bank_name, account_number: g.account_number, account_name: g.account_name, provider: g.provider, phone: g.phone })),
        }),
      });
      if (!res.ok) throw new Error("save failed");
      if (nextStatus) setStatus(nextStatus);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function publish() {
    void runSave("published");
  }

  async function remove() {
    if (!confirm("Hapus undangan ini? Semua data undangan akan hilang.")) return;
    await fetch(`/api/invitations/${invitation.id}`, { method: "DELETE" });
    router.push("/dashboard/invitations");
    router.refresh();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/${invitation.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  const setSection = <K extends keyof InvitationContent>(key: K, value: InvitationContent[K]) =>
    setContent((c) => ({ ...c, [key]: value }));

  const rsvp = content.rsvp ?? { header: "Konfirmasi Kehadiran", require_phone: false, questions: [] };
  const giftCfg = content.gift ?? { header: "Tanda Perhatian", message: "" };
  const guestbookCfg = content.guestbook ?? { header: "Kata Sambutan", message: "", auto_approve: false };
  const musicCfg = content.music ?? { autoplay: false };
  const story = content.story ?? { title: "Cerita", items: [] };

  const saveIcon = {
    idle: null,
    saving: <Loader2 size={14} className="animate-spin" />,
    saved: <Check size={14} />,
    error: <TriangleAlert size={14} />,
  }[saveState];

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <Link href="/dashboard/invitations" className="btn btn-ghost !px-2.5" aria-label="Kembali">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink-900">{title || "Untitled"}</p>
            <p className="flex items-center gap-1 text-[11px] text-ink-400">
              {saveState === "saving" ? "Menyimpan…" : saveState === "error" ? "Gagal menyimpan" : saveState === "saved" ? "Tersimpan" : "editing"}
              <span className="inline-flex">{saveIcon}</span>
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {status === "published" && (
              <button onClick={copyLink} className="btn btn-ghost !text-xs">
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? "Tersalin" : "Tautan"}
              </button>
            )}
            <button
              onClick={() => setMobileTab("preview")}
              className="btn btn-outline lg:hidden"
              aria-label="Pratinjau"
            >
              <Eye size={16} />
            </button>
            <Link
              href={`/${invitation.slug}`}
              target="_blank"
              className="btn btn-outline hidden lg:inline-flex"
            >
              <ExternalLink size={14} /> Lihat
            </Link>
            <button onClick={publish} className="btn btn-primary">
              {status === "published" ? "Perbarui" : "Publikasikan"}
            </button>
            <button onClick={remove} className="btn btn-ghost !text-red-500 lg:hidden" aria-label="Hapus">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tab switch */}
      <div className="flex gap-1 border-b border-ink-200 bg-white p-2 lg:hidden">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mobileTab === "edit" ? "bg-ink-900 text-white" : "text-ink-500"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold ${mobileTab === "preview" ? "bg-ink-900 text-white" : "text-ink-500"}`}
        >
          Pratinjau
        </button>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Form */}
        <div className={`${mobileTab === "preview" ? "hidden" : "block"} w-full flex-1 lg:block lg:max-w-2xl`}>
          <div className="space-y-6 p-4 lg:p-6">
            {status === "draft" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                Undangan ini belum dipublikasikan. Tekan <b>Publikasikan</b> untuk membagikan tautannya.
              </div>
            )}
            {!entitlement.canRemoveBranding && (
              <div className="rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-500">
                Paket <b>{entitlement.planLabel}</b>: tautan publik akan menampilkan watermark Avlora.
                <Link href="/dashboard/billing" className="ml-1 font-semibold text-gold-600">Upgrade</Link>
              </div>
            )}

            <Section title="Pengaturan Umum">
              <Input label="Judul" value={title} onChange={setTitle} placeholder="Undangan Saya" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Tanggal Acara" value={eventDate} onChange={setEventDate} placeholder="2026-12-12" hint="Format: YYYY-MM-DD" />
                <Input label="Kota" value={city} onChange={setCity} placeholder="Pekanbaru" />
              </div>
              <Select
                label="Zona Waktu"
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES.map((t) => ({ value: t, label: t }))}
              />
              <Select
                label="Status"
                value={status}
                onChange={(v) => setStatus(v as "draft" | "published")}
                options={[
                  { value: "draft", label: "Draf" },
                  { value: "published", label: "Publikasi" },
                ]}
              />
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <TriangleAlert size={14} />
                Tautan publik: <code className="rounded bg-ink-100 px-1 py-0.5">/{invitation.slug}</code>
                {!entitlement.canCustomUrl && (
                  <span className="font-semibold text-gold-600">(kustom URL tersedia di Premium)</span>
                )}
              </div>
            </Section>

            <Section title="Tema">
              <Select
                label="Font"
                value={font}
                onChange={(v) => setFont(v as ThemeConfig["font"])}
                options={[
                  { value: "serif", label: "Serif (klasik)" },
                  { value: "sans", label: "Sans (modern)" },
                  { value: "script", label: "Script (mewah)" },
                ]}
              />
              <Select
                label="Tata Letak"
                value={layout}
                onChange={(v) => setLayout(v as ThemeConfig["layout"])}
                options={[
                  { value: "classic", label: "Classic" },
                  { value: "editorial", label: "Editorial" },
                  { value: "luxe", label: "Luxe" },
                ]}
              />
              <Select
                label="Animasi"
                value={animation}
                onChange={(v) => setAnimation(v as ThemeConfig["animation"])}
                options={[
                  { value: "subtle", label: "Halus" },
                  { value: "none", label: "Tanpa animasi" },
                ]}
              />
            </Section>

            <Section title="Sampul">
              <Input
                label="Judul Sampul"
                value={content.cover.title}
                onChange={(v) => setSection("cover", { ...content.cover, title: v })}
              />
              <Input
                label="Subjudul"
                value={content.cover.subtitle}
                onChange={(v) => setSection("cover", { ...content.cover, subtitle: v })}
              />
              <Textarea
                label="Teks Pembuka"
                value={content.cover.opening_text ?? ""}
                onChange={(v) => setSection("cover", { ...content.cover, opening_text: v })}
                rows={2}
              />
              <ImageInput
                label="Gambar Sampul"
                value={content.cover.cover_image ?? ""}
                onChange={(v) => setSection("cover", { ...content.cover, cover_image: v })}
              />
              <Toggle
                label="Tampilkan ayat pembuka"
                checked={content.cover.show_verses}
                onChange={(v) => setSection("cover", { ...content.cover, show_verses: v })}
              />
            </Section>

            {content.hero && (
              <Section title="Pembuka">
                <ImageInput
                  label="Foto Hero"
                  value={content.hero.photo ?? ""}
                  onChange={(v) => setSection("hero", { ...content.hero!, photo: v })}
                />
                <Textarea
                  label="Caption"
                  value={content.hero.caption ?? ""}
                  onChange={(v) => setSection("hero", { ...content.hero!, caption: v })}
                  rows={2}
                />
              </Section>
            )}

            {content.couple && (
              <Section title="Mempelai">
                <div className="mt-2 rounded-xl border border-gold-200 bg-gold-50 px-3 py-2.5 text-lg font-display text-center">
                  {content.couple.groomName} & {content.couple.brideName}
                </div>
                <Input label="Nama Pria" value={content.couple.groomName} onChange={(v) => setSection("couple", { ...content.couple!, groomName: v })} />
                <Input label="Nama Lengkap Pria" value={content.couple.groomFullName ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, groomFullName: v })} />
                <Input label="Orang Tua Pria" value={content.couple.groomParents ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, groomParents: v })} />
                <ImageInput label="Foto Pria" value={content.couple.groomPhoto ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, groomPhoto: v })} />
                <Input label="Nama Wanita" value={content.couple.brideName} onChange={(v) => setSection("couple", { ...content.couple!, brideName: v })} />
                <Input label="Nama Lengkap Wanita" value={content.couple.brideFullName ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, brideFullName: v })} />
                <Input label="Orang Tua Wanita" value={content.couple.brideParents ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, brideParents: v })} />
                <ImageInput label="Foto Wanita" value={content.couple.bridePhoto ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, bridePhoto: v })} />
                <Textarea label="Kalimat Pengantar" value={content.couple.greeting ?? ""} onChange={(v) => setSection("couple", { ...content.couple!, greeting: v })} rows={2} />
              </Section>
            )}

            {content.child && (
              <Section title="Ananda">
                <Input label="Nama Ananda" value={content.child.childName} onChange={(v) => setSection("child", { ...content.child!, childName: v })} />
                <Input label="Orang Tua" value={content.child.childParents} onChange={(v) => setSection("child", { ...content.child!, childParents: v })} />
                <Input label="Usia" value={content.child.age ?? ""} onChange={(v) => setSection("child", { ...content.child!, age: v })} />
                <ImageInput label="Foto" value={content.child.photo ?? ""} onChange={(v) => setSection("child", { ...content.child!, photo: v })} />
              </Section>
            )}

            {content.birthday && (
              <Section title="Ulang Tahun">
                <Input label="Nama Yang Berulang Tahun" value={content.birthday.birthdayName} onChange={(v) => setSection("birthday", { ...content.birthday!, birthdayName: v })} />
                <Input label="Usia" value={content.birthday.age ?? ""} onChange={(v) => setSection("birthday", { ...content.birthday!, age: v })} />
                <ImageInput label="Foto" value={content.birthday.photo ?? ""} onChange={(v) => setSection("birthday", { ...content.birthday!, photo: v })} />
              </Section>
            )}

            {content.graduate && (
              <Section title="Wisuda">
                <Input label="Nama Wisudawan" value={content.graduate.graduateName} onChange={(v) => setSection("graduate", { ...content.graduate!, graduateName: v })} />
                <Input label="Gelar" value={content.graduate.degree ?? ""} onChange={(v) => setSection("graduate", { ...content.graduate!, degree: v })} />
                <Input label="Institusi" value={content.graduate.school ?? ""} onChange={(v) => setSection("graduate", { ...content.graduate!, school: v })} />
                <ImageInput label="Foto" value={content.graduate.photo ?? ""} onChange={(v) => setSection("graduate", { ...content.graduate!, photo: v })} />
              </Section>
            )}

            {content.event && (
              <Section title="Acara">
                <Input label="Nama Acara" value={content.event.name} onChange={(v) => setSection("event", { ...content.event!, name: v })} />
                <Textarea label="Deskripsi" value={content.event.description ?? ""} onChange={(v) => setSection("event", { ...content.event!, description: v })} rows={3} />
              </Section>
            )}

            <Section title="Cerita / Timeline">
              <Input label="Judul Bagian" value={story.title} onChange={(v) => setSection("story", { ...story, title: v })} />
              <StoryEditor
                items={story.items}
                onChange={(items) => setSection("story", { ...story, items })}
              />
            </Section>

            <Section title="Jadwal Acara">
              <GenericListEditor
                label="Jadwal"
                items={schedules}
                onChange={setSchedules}
                makeNew={() => ({
                  id: `sch-${Date.now()}`,
                  label: "",
                  event_date: eventDate,
                  start_time: "",
                  end_time: "",
                  location_name: "",
                  address: "",
                  maps_url: "",
                })}
                render={(item, update, _, idx) => (
                  <>
                    <Input label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder={`Sesi ${idx + 1}`} />
                    <Input label="Tanggal" value={item.event_date} onChange={(v) => update({ event_date: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Mulai" value={item.start_time} onChange={(v) => update({ start_time: v })} placeholder="09:00" />
                      <Input label="Selesai" value={item.end_time ?? ""} onChange={(v) => update({ end_time: v })} placeholder="12:00" />
                    </div>
                    <Input label="Lokasi" value={item.location_name} onChange={(v) => update({ location_name: v })} />
                    <Textarea label="Alamat" value={item.address} onChange={(v) => update({ address: v })} rows={2} />
                    <Input label="Tautan Maps" value={item.maps_url} onChange={(v) => update({ maps_url: v })} />
                  </>
                )}
              />
            </Section>

            <Section title="Galeri Foto">
              <GenericListEditor
                label="Foto"
                items={galleryImages}
                onChange={setGalleryImages}
                makeNew={() => ({ id: `gal-${Date.now()}`, url: "", order: galleryImages.length + 1 })}
                render={(item, update) => (
                  <ImageInput label="URL Foto" value={item.url} onChange={(v) => update({ url: v })} />
                )}
              />
              <p className="text-xs text-ink-400">Unggah foto dari panel «Kelola Tamu &amp; Media» (Premium) — untuk sekarang gunakan URL atau foto contoh.</p>
            </Section>

            <Section title="RSVP">
              <Input label="Judul Formulir" value={rsvp.header} onChange={(v) => setSection("rsvp", { ...rsvp, header: v })} />
              <Toggle
                label="Minta nomor telepon"
                checked={rsvp.require_phone}
                onChange={(v) => setSection("rsvp", { ...rsvp, require_phone: v })}
              />
            </Section>

            <Section title="Amplop Digital">
              <Input label="Judul" value={giftCfg.header} onChange={(v) => setSection("gift", { ...giftCfg, header: v })} />
              <Textarea label="Pesan" value={giftCfg.message} onChange={(v) => setSection("gift", { ...giftCfg, message: v })} rows={2} />
              <GenericListEditor
                label="Rekening"
                items={giftAccounts}
                onChange={setGiftAccounts}
                makeNew={() => ({ id: `gft-${Date.now()}`, type: "bank" as const, bank_name: "", account_number: "", account_name: "" })}
                render={(item, update) => (
                  <>
                    <Select
                      label="Jenis"
                      value={item.type}
                      onChange={(v) => update({ type: v as GiftDraft["type"] })}
                      options={[
                        { value: "bank", label: "Transfer Bank" },
                        { value: "qris", label: "QRIS" },
                        { value: "ewallet", label: "E-Wallet" },
                      ]}
                    />
                    {item.type === "bank" && (
                      <>
                        <Input label="Nama Bank" value={item.bank_name ?? ""} onChange={(v) => update({ bank_name: v })} />
                        <Input label="Nomor Rekening" value={item.account_number ?? ""} onChange={(v) => update({ account_number: v })} />
                        <Input label="Atas Nama" value={item.account_name} onChange={(v) => update({ account_name: v })} />
                      </>
                    )}
                    {item.type === "qris" && (
                      <>
                        <ImageInput label="Gambar QRIS (gunakan URL)" value={item.phone ?? ""} onChange={(v) => update({ phone: v })} />
                        <Input label="Atas Nama" value={item.account_name} onChange={(v) => update({ account_name: v })} />
                      </>
                    )}
                    {item.type === "ewallet" && (
                      <>
                        <Select
                          label="Provider"
                          value={item.provider ?? "oVO"}
                          onChange={(v) => update({ provider: v })}
                          options={["OVO", "GoPay", "DANA", "ShopeePay"].map((p) => ({ value: p, label: p }))}
                        />
                        <Input label="Nomor" value={item.phone ?? ""} onChange={(v) => update({ phone: v })} />
                        <Input label="Atas Nama" value={item.account_name} onChange={(v) => update({ account_name: v })} />
                      </>
                    )}
                  </>
                )}
              />
            </Section>

            <Section title="Buku Tamu">
              <Input label="Judul" value={guestbookCfg.header} onChange={(v) => setSection("guestbook", { ...guestbookCfg, header: v })} />
              <Textarea label="Pesan Ajakan" value={guestbookCfg.message} onChange={(v) => setSection("guestbook", { ...guestbookCfg, message: v })} rows={2} />
              <Toggle
                label="Tampilkan otomatis tanpa moderasi"
                checked={guestbookCfg.auto_approve}
                onChange={(v) => setSection("guestbook", { ...guestbookCfg, auto_approve: v })}
              />
            </Section>

            <Section title="Musik Latar">
              {entitlement.canMusic ? (
                <>
                  <Select
                    label="Lagu"
                    value={musicTrackId}
                    onChange={setMusicTrackId}
                    options={[
                      { value: "", label: "Tanpa musik" },
                      ...musicTracks.map((t) => ({ value: t.id, label: `${t.title} — ${t.artist}` })),
                    ]}
                  />
                  <Toggle
                    label="Putar otomatis saat dibuka"
                    checked={musicCfg.autoplay}
                    onChange={(v) => setSection("music", { ...musicCfg, autoplay: v })}
                  />
                </>
              ) : (
                <p className="rounded-xl border border-ink-200 bg-white p-3 text-xs text-ink-500">
                  Musik latar tersedia di paket <b>Premium</b>.
                  <Link href="/dashboard/billing" className="ml-1 font-semibold text-gold-600">Upgrade</Link>
                </p>
              )}
            </Section>
          </div>
        </div>

        {/* Preview */}
        <div className={`${mobileTab === "edit" ? "hidden" : "flex"} w-full flex-1 items-start justify-center bg-ink-100/60 px-4 py-6 lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col lg:items-center`}>
          <p className="mb-3 hidden text-xs font-semibold uppercase tracking-widest text-ink-400 lg:block">
            Pratinjau Langsung
          </p>
          <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[2rem] border-8 border-ink-900 bg-white shadow-2xl">
            <div className="relative h-[600px] overflow-y-auto" style={{ background: pal.background }}>
              <div style={{ fontFamily: fontCss }} className="min-h-full pb-16">
                <div className="relative py-20 px-6 text-center" style={{ background: pal.background }}>
                  <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(circle at 30% 20%, ${pal.primary}, transparent 60%), radial-gradient(circle at 70% 80%, ${pal.accent}, transparent 60%)` }} />
                  {content.cover.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={content.cover.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
                  )}
                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: pal.muted }}>
                      {content.cover.show_verses ? "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" : content.cover.subtitle}
                    </p>
                    <h1 className="mt-4 text-4xl leading-tight" style={{ color: pal.foreground, fontFamily: font === "script" ? fontCss : undefined }}>
                      {content.cover.title}
                    </h1>
                    <p className="mt-3 text-sm" style={{ color: pal.muted }}>{content.cover.subtitle}</p>
                    <div className="mx-auto mt-8 inline-flex rounded-full border px-5 py-2 text-xs" style={{ borderColor: pal.primary, color: pal.foreground }}>
                      Buka Undangan
                    </div>
                  </div>
                </div>

                {content.couple && (
                  <div className="px-5 pt-2 text-center">
                    <p className="font-display text-5xl" style={{ color: pal.primary, fontFamily: "'Great Vibes', cursive" }}>
                      {content.couple.groomName}
                    </p>
                    <p className="my-1 text-2xl" style={{ color: pal.foreground }}>&amp;</p>
                    <p className="font-display text-5xl" style={{ color: pal.primary, fontFamily: "'Great Vibes', cursive" }}>
                      {content.couple.brideName}
                    </p>
                  </div>
                )}
                {(content.child || content.birthday) && (
                  <div className="px-5 pt-2 text-center">
                    <p className="font-display text-4xl" style={{ color: pal.primary, fontFamily: "'Great Vibes', cursive" }}>
                      {content.child?.childName ?? content.birthday?.birthdayName}
                    </p>
                  </div>
                )}
                {content.graduate && (
                  <div className="px-5 pt-2 text-center">
                    <p className="font-display text-4xl" style={{ color: pal.primary, fontFamily: "'Great Vibes', cursive" }}>
                      {content.graduate.graduateName}
                    </p>
                  </div>
                )}

                {eventDate && (
                  <div className="mt-6 px-6">
                    <div className="rounded-2xl px-4 py-5 text-center" style={{ background: pal.soft }}>
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: pal.muted }}>
                        {timezone.replace("Asia/", "")}
                      </p>
                      <p className="mt-2 text-lg font-semibold capitalize" style={{ color: pal.foreground }}>
                        {new Date(`${eventDate}T12:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {city && <p className="mt-1 text-sm" style={{ color: pal.primary }}>{city}</p>}
                    </div>
                  </div>
                )}

                {story.items.length > 0 && (
                  <div className="mt-6 px-6">
                    <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: pal.muted }}>{story.title}</p>
                    <div className="mt-3 space-y-3">
                      {story.items.slice(0, 3).map((it) => (
                        <div key={it.id} className="rounded-xl px-3 py-2" style={{ background: pal.soft }}>
                          <p className="text-xs font-semibold" style={{ color: pal.foreground }}>{it.title}</p>
                          <p className="text-[10px]" style={{ color: pal.muted }}>{it.date}</p>
                        </div>
                      ))}
                      {story.items.length > 3 && <p className="text-center text-[10px] text-ink-400">+{story.items.length - 3} lagi</p>}
                    </div>
                  </div>
                )}

                {schedules.length > 0 && (
                  <div className="mt-6 px-6">
                    <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: pal.muted }}>Jadwal Acara</p>
                    <div className="mt-3 space-y-2">
                      {schedules.map((s) => (
                        <div key={s.id} className="rounded-xl px-3 py-2.5" style={{ background: pal.soft }}>
                          <p className="text-xs font-semibold" style={{ color: pal.foreground }}>{s.label || "Jadwal"}</p>
                          <p className="text-[10px]" style={{ color: pal.muted }}>{s.event_date} • {s.start_time} • {s.location_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {galleryImages.filter((g) => g.url).length > 0 && (
                  <div className="mt-6 px-6">
                    <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: pal.muted }}>Galeri</p>
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {galleryImages.filter((g) => g.url).slice(0, 6).map((g) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={g.id} src={g.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 px-6 text-center">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: pal.muted }}>
                    {entitlement.canRemoveBranding ? "—" : "Powered by Avlora"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-2xl border border-ink-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <p className="text-sm font-bold text-ink-800">{title}</p>
        <span className={`text-ink-400 transition-transform ${open ? "" : "-rotate-90"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && <div className="space-y-4 px-4 pb-5">
        <Separator />
        {children}
      </div>}
    </section>
  );
}

function Separator() {
  return <div className="h-px w-full bg-ink-100" />;
}