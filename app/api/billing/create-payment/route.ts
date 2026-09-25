import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { createOrder, getPlan } from "@/lib/db";
import { createGatewayPayment } from "@/lib/services/payment-gateway";

const schema = z.object({ plan_id: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const plan = getPlan(input.data.plan_id);
  if (!plan || plan.price <= 0) return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 });
  const order = createOrder({ owner_id: user.id, plan_id: plan.id, amount: plan.price, payment_method: process.env.PAYMENT_GATEWAY ?? "demo" });
  try { const payment = await createGatewayPayment({ orderId: order.id, amount: order.amount, customerEmail: user.email, itemName: plan.display_name }); return NextResponse.json({ ok: true, order, payment }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Pembayaran gagal" }, { status: 502 }); }
}