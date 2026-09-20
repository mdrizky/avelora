import "server-only";
import type { Plan } from "../db/types";
import { getData } from "../db/store";

export interface Entitlements {
  planId: string;
  planName: string;
  planLabel: string;
  features: Record<string, boolean | number | string>;
  invitationLimit: number | "unlimited";
  guestLimit: number | "unlimited";
}

function parseLimit(v: string | number | boolean): number | "unlimited" {
  if (typeof v === "string" && v === "unlimited") return "unlimited";
  if (typeof v === "number") return v;
  return 0;
}

export function getActivePlan(userId: string): Plan {
  const data = getData();
  const sub = data.subscriptions.find((s) => s.owner_id === userId && s.status === "active");
  const plan = sub ? data.plans.find((p) => p.id === sub.plan_id) : undefined;
  return plan ?? data.plans.find((p) => p.name === "free")!;
}

export function getEntitlements(userId: string): Entitlements {
  const plan = getActivePlan(userId);
  return {
    planId: plan.id,
    planName: plan.name,
    planLabel: plan.display_name,
    features: plan.features,
    invitationLimit: parseLimit(plan.features.invitations ?? 3),
    guestLimit: parseLimit(plan.features.guests ?? 100),
  };
}

export function canUsePremiumTemplate(userId: string): boolean {
  const e = getEntitlements(userId);
  const t = e.features.templates;
  return t === "all" || t === "premium";
}

export function getGuestLimit(userId: string): number | "unlimited" {
  return getEntitlements(userId).guestLimit;
}

export function getInvitationCap(userId: string): number | "unlimited" {
  return getEntitlements(userId).invitationLimit;
}

export function countBy<A extends Record<string, unknown>>(
  rows: A[],
  pick: (a: A) => string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = pick(r);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}