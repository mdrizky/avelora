import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { listTestimonialsByUser, listTestimonialsForModeration, submitTestimonial } from "@/lib/db";
import { rateLimit } from "@/lib/services/rate-limit";

const submitSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(60),
  role: z.string().trim().max(60).optional(),
  content: z.string().trim().min(10, "Ceritakan sedikit lebih banyak (min. 10 karakter)").max(600),
  rating: z.number().int().min(1).max(5),
  event_title: z.string().trim().max(80).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = user.role === "admin" ? listTestimonialsForModeration() : listTestimonialsByUser(user.id);
  return NextResponse.json({ testimonials: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`testimonial:${user.id}:${ip}`, 3, 60 * 60000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak kiriman. Coba lagi dalam beberapa menit." },
      { status: 429 },
    );
  }

  let input;
  try {
    input = submitSchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError ? (err.issues[0]?.message ?? "Data tidak valid") : "Data tidak valid";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Cegah dobel-kirim while pending.
  const alreadyPending = listTestimonialsByUser(user.id).some(
    (t) => (t.status ?? "approved") === "pending",
  );
  if (alreadyPending) {
    return NextResponse.json(
      { error: "Pesan Anda sedang menunggu verifikasi admin. Sabar ya, sebentar lagi." },
      { status: 409 },
    );
  }

  const testimonial = submitTestimonial({
    user_id: user.id,
    name: input.name,
    role: input.role,
    content: input.content,
    rating: input.rating,
    event_title: input.event_title,
  });

  return NextResponse.json({
    ok: true,
    message: "Terkirim! Admin akan memverifikasi sebelum ditampilkan di halaman utama.",
    testimonial,
  });
}
