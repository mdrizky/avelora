import { headers } from "next/headers";

/**
 * Origin publik dari request aktif (x-forwarded-host -> host, proxy https).
 * Dipakai untuk membangun tautan undangan & QR yang benar saat SSR.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
