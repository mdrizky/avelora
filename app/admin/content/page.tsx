import Link from "next/link";
import { ArrowRight, FileText, MessageSquareHeart } from "lucide-react";
import { BlogForm, FaqForm, TestimonialForm } from "@/components/admin/platform-forms";
import { requireAdmin } from "@/lib/auth/session";
import { countPendingTestimonials, getData } from "@/lib/db";

export default async function AdminContentPage() {
  await requireAdmin();
  const data = getData();
  const pending = countPendingTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Editorial control
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900">
          <FileText size={28} className="text-gold-500" /> Konten Landing Page
        </h1>
        <p className="mt-2 text-sm text-ink-500">Kelola blog, FAQ, dan testimoni dari satu tempat.</p>
      </div>

      {pending > 0 && (
        <Link
          href="/admin/pesan"
          className="group flex items-center gap-4 rounded-2xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-5 transition-shadow hover:shadow-lg"
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white">
            <MessageSquareHeart size={20} />
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-wine-700 px-1 text-[10px] font-bold text-white">
              {pending}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink-900">
              {pending} pesan menunggu verifikasi
            </p>
            <p className="mt-0.5 text-xs text-ink-500">
              Pesan dari pengguna perlu disetujui sebelum tayang di halaman depan.
            </p>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-gold-600 transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">Artikel Blog Baru</h2>
          <BlogForm />
        </section>
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold">FAQ Baru</h2>
          <FaqForm />
        </section>
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-extrabold">Testimoni Baru</h2>
        <p className="mb-4 text-xs text-ink-400">
          Testimoni yang dibuat di sini langsung tayang. Pesan dari pengguna perlu moderasi di{" "}
          <Link href="/admin/pesan" className="font-semibold text-gold-600 hover:underline">
            halaman Pesan &amp; Kesan
          </Link>
          .
        </p>
        <TestimonialForm />
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold">Konten tersimpan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.faqs.map((faq) => (
            <details key={faq.id} className="rounded-xl border border-ink-100 p-3">
              <summary className="cursor-pointer text-sm font-bold">{faq.question}</summary>
              <p className="mt-2 text-sm leading-6 text-ink-500">{faq.answer}</p>
            </details>
          ))}
          {data.blog_posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-ink-100 p-4">
              <p className="font-bold">{post.title}</p>
              <p className="mt-1 text-xs text-ink-400">
                {post.status} · /{post.slug}
              </p>
            </div>
          ))}
          {data.testimonials.slice(0, 6).map((testimonial) => (
            <div key={testimonial.id} className="rounded-xl border border-ink-100 p-4">
              <p className="text-sm leading-6 text-ink-600">“{testimonial.content}”</p>
              <p className="mt-2 text-xs font-bold text-gold-700">
                {testimonial.name} · {testimonial.rating}/5
              </p>
              {testimonial.status === "pending" && (
                <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                  Menunggu verifikasi
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
