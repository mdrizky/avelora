#!/usr/bin/env node
/**
 * AVELORA — Reset database lokal ke seed murni.
 * Menghapus .data/db.json; saat server di-start ulang, aplikasi menumbuhkan
 * seed bawaan (akun demo, undangan contoh, dsb).
 */
import { rmSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, ".data", "db.json");

if (!existsSync(file)) {
  console.log("db.json tidak ada (sudah bersih).");
  process.exit(0);
}

rmSync(file, { force: true });
console.log("db.json dihapus.");
console.log("Restart server (npm run dev / npm start) untuk menumbuhkan seed murni.");