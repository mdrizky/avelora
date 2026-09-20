/**
 * AVELORA — Repository facade.
 *
 * Memilih backend penyimpanan:
 *   - `DATABASE_STORE=supabase` (+ SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY)
 *     -> Supabase/Postgres (lib/db/stores/supabase.ts)
 *   - selain itu            -> file lokal `.data/db.json` (lib/db/stores/local.ts)
 *
 * API yang diekspor identik agar seluruh repository/route tidak berubah.
 */
import "server-only";
import type { DBData } from "./types";
import * as local from "./stores/local";
import * as supabase from "./stores/supabase";

function resolveBackend() {
  const wantSupabase = process.env.DATABASE_STORE === "supabase";
  const keysPresent = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (wantSupabase && keysPresent) {
    return { store: supabase, name: "supabase" };
  }
  if (wantSupabase && !keysPresent) {
    console.warn(
      "[avelora:db] DATABASE_STORE=supabase tapi SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi. " +
        "Memakai penyimpanan lokal sebagai pengganti.",
    );
  }
  return { store: local, name: "local" };
}

const backend = resolveBackend();

export const DATABASE_STORE: string = backend.name;

export const getData: () => DBData = backend.store.getData;
export const mutate: (fn: (data: DBData) => void) => void = backend.store.mutate;
export const saveNow: () => void | Promise<void> = backend.store.saveNow as never;
export const resetToSeed: () => void = backend.store.resetToSeed;
export const uid: () => string = backend.store.uid;
export const sid: () => string = backend.store.sid;