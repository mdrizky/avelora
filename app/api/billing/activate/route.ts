import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { activatePlan, getPlan, listPlans, pushNotification } from "@/lib/db";

const bodySchema = z.object({ plan_id: z.string().min(1) });

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = bodySchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const plan = getPlan(input.data.plan_id);
  if (!plan) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  const sub = activatePlan(user.id, plan.id);
  pushNotification({
    user_id: user.id,
    type: "order",
    title: "Paket Diaktifkan",
    body: `Paket ${plan.display_name} aktif untuk undangan Anda.`,
    link: "/dashboard/billing",
  });
  return NextResponse.json({ ok: true, subscription: sub });
}

export async function GET() {
  return NextResponse.json({ plans: listPlans() });
}