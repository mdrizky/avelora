import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "../db/types";
import { getUserById } from "../db";

const SESSION_COOKIE = "avelora_session";
const SESSION_DAYS = 7;

function secret(): string {
  return (
    process.env.AUTH_SECRET ??
    "avelora-dev-secret-do-not-use-in-prod-change-via-AUTH_SECRET"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function makeToken(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function parseToken(token: string): { user_id: string; exp: number; session_version?: number; actor_id?: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !a.equals(b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as {
      user_id: string;
      exp: number;
      session_version?: number;
      actor_id?: string;
    };
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, sessionVersion = 0) {
  const store = await cookies();
  const token = makeToken({ user_id: userId, session_version: sessionVersion, exp: Date.now() + SESSION_DAYS * 86400000 });
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function createImpersonatedSession(adminId: string, userId: string, sessionVersion = 0) {
  const store = await cookies();
  const token = makeToken({ user_id: userId, actor_id: adminId, session_version: sessionVersion, exp: Date.now() + 60 * 60 * 1000 });
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 3600 });
}

export async function destroySession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSessionUser(): Promise<Profile | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload) return null;
  const user = getUserById(payload.user_id);
  if (!user || user.is_suspended || user.is_banned || (payload.session_version ?? 0) !== (user.session_version ?? 0)) return null;
  return user;
}

export async function getImpersonator(): Promise<Profile | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload?.actor_id) return null;
  const actor = getUserById(payload.actor_id);
  return actor?.role === "admin" ? actor : null;
}

export async function requireUser(): Promise<Profile> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}