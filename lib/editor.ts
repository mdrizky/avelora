import type { InvitationContent } from "./db/types";

/** Konten awal saat membuat undangan (per jenis acara). */
export function defaultContentFor(categoryId: string, title: string): InvitationContent {
  const cover: InvitationContent["cover"] = {
    title: title || "Halo, kami mengundang Anda",
    subtitle: "Undangan Digital",
    show_verses: categoryId === "cat-wedding" || categoryId === "cat-aqiqah" || categoryId === "cat-khitan",
  };
  const guestbook: InvitationContent["guestbook"] = {
    header: "Kata Sambutan",
    message: "Tuliskan doa dan harapan terbaik Anda di bawah ini.",
    auto_approve: false,
  };
  const gift: InvitationContent["gift"] = {
    header: "Tanda Perhatian",
    message: "Kehadiran dan doa Anda adalah hadiah terbaik. Jika ingin berbagi, silakan melalui:",
  };
  const music: InvitationContent["music"] = { autoplay: false };

  switch (categoryId) {
    case "cat-wedding":
      return {
        cover: { ...cover, cover_image: "" },
        hero: { caption: "Together with their families" },
        couple: {
          groomName: "Nama Mempelai Pria",
          groomFullName: "",
          groomParents: "Putra dari Bpk. & Ibu",
          brideName: "Nama Mempelai Wanita",
          brideFullName: "",
          brideParents: "Putri dari Bpk. & Ibu",
          greeting: "Bismillahirrahmanirrahim",
        },
        rsvp: {
          header: "Konfirmasi Kehadiran",
          require_phone: true,
          questions: [
            { id: "q-1", label: "Pilihan menu", type: "meal", choices: ["Nasi Kotak", "Prasmanan"], required: false },
            { id: "q-2", label: "Membawa pendamping", type: "yes_no", required: false },
          ],
        },
        gift, guestbook, music,
      };
    case "cat-aqiqah":
    case "cat-khitan":
      return {
        cover: { ...cover, cover_image: "" },
        hero: { caption: "Alhamdulillah, kami mengundang Anda" },
        child: {
          childName: "Nama Ananda",
          childParents: "Putra/Putri dari Orang Tua",
          age: "",
          photo: "",
        },
        story: { title: "Kelahiran", items: [] },
        rsvp: { header: "Konfirmasi Kehadiran", require_phone: false, questions: [] },
        gift, guestbook, music,
      };
    case "cat-birthday":
      return {
        cover: { ...cover, cover_image: "" },
        hero: { caption: "A joyful day" },
        birthday: { birthdayName: "Nama yang Berulang Tahun", age: "", photo: "" },
        story: { title: "Merayakan", items: [] },
        rsvp: { header: "RSVP", require_phone: false, questions: [] },
        gift, guestbook, music,
      };
    case "cat-graduation":
      return {
        cover: { ...cover, cover_image: "" },
        hero: { caption: "Raih impian, rayakan kelulusan" },
        graduate: { graduateName: "Nama Wisudawan", degree: "", school: "", photo: "" },
        story: { title: "Perjalanan", items: [] },
        rsvp: { header: "Konfirmasi Kehadiran", require_phone: false, questions: [] },
        gift, guestbook, music,
      };
    case "cat-corporate":
      return {
        cover: { ...cover, cover_image: "" },
        event: { name: "Nama Acara", description: "Deskripsi singkat acara", speakers: [] },
        story: { title: "Agenda", items: [] },
        rsvp: { header: "Pendaftaran", require_phone: true, questions: [] },
        gift, guestbook, music,
      };
    default:
      return {
        cover: { ...cover, cover_image: "" },
        hero: { caption: "Kami mengundang Anda" },
        story: { title: "Cerita Kami", items: [] },
        rsvp: { header: "Konfirmasi Kehadiran", require_phone: false, questions: [] },
        gift, guestbook, music,
      };
  }
}

export function guessTitle(categoryId: string, fallback = "Undangan Saya"): string {
  const map: Record<string, string> = {
    "cat-wedding": "Pernikahan Kami",
    "cat-aqiqah": "Aqiqah Ananda",
    "cat-khitan": "Khitanan Ananda",
    "cat-birthday": "Ulang Tahun",
    "cat-graduation": "Wisuda",
    "cat-corporate": "Acara Kami",
    "cat-engagement": "Tunangan Kami",
  };
  return map[categoryId] ?? fallback;
}