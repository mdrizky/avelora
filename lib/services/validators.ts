import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  first_name: z.string().min(1, "Nama depan wajib diisi").max(40),
  last_name: z.string().min(1, "Nama belakang wajib diisi").max(40),
});

export const loginSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const forgotSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
});

export const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const rsvpSchema = z.object({
  status: z.enum(["attending", "not_attending", "maybe"]),
  attending_count: z.number().int().min(1).max(10).optional(),
  meal_preference: z.string().max(60).optional(),
  answers: z.record(z.string(), z.string()).optional(),
  special_request: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  guest_name: z.string().min(1, "Nama wajib diisi").max(60),
  message: z.string().min(2, "Pesan terlalu pendek").max(500, "Pesan maksimal 500 karakter"),
});

export const guestRowSchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().max(30).optional(),
  category: z.string().max(40).optional(),
  table_number: z.string().max(20).optional(),
  invited_count: z.number().int().min(1).max(10).optional(),
});

export const bulkGuestsSchema = z.object({
  invitation_id: z.string(),
  rows: z.array(guestRowSchema).min(1).max(500),
});

export const invitationBasics = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(100),
  slug: z.string().max(60).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type MessageInput = z.infer<typeof messageSchema>;