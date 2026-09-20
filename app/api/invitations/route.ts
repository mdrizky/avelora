import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import {
  canUsePremiumTemplate,
  getEntitlements,
  getInvitationCap,
} from "@/lib/services/entitlement";
import { createInvitation, getTemplate, listInvitationsByOwner } from "@/lib/db";
import { defaultContentFor } from "@/lib/editor";

const createSchema = z.object({
  template_id: z.string().min(1),
  title: z.string().min(3).max(100),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let input;
  try {
    input = createSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const tpl = getTemplate(input.template_id);
  if (!tpl) return NextResponse.json({ error: "Template tidak ditemukan" }, { status: 404 });

  if (tpl.is_premium && !canUsePremiumTemplate(user.id)) {
    return NextResponse.json(
      { error: "Template premium memerlukan paket berbayar", code: "upgrade-required" },
      { status: 403 },
    );
  }

  const cap = getInvitationCap(user.id);
  if (cap !== "unlimited" && listInvitationsByOwner(user.id).length >= cap) {
    return NextResponse.json(
      { error: "Batas jumlah undangan tercapai", code: "limit-reached" },
      { status: 403 },
    );
  }

  const e = getEntitlements(user.id);
  const invitation = createInvitation({
    owner_id: user.id,
    template_id: tpl.id,
    category_id: tpl.category_id,
    title: input.title,
    content_data: defaultContentFor(tpl.category_id, input.title),
    theme_config: { ...tpl.theme_config },
    watermark_enabled: !(e.features.remove_branding === true),
  });

  return NextResponse.json({ id: invitation.id, slug: invitation.slug }, { status: 201 });
}