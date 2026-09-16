import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// apps/backend/.env geliştirmede TEK doğruluk kaynağıdır (override: true).
//
// Varsayılan dotenv, süreç ortamında ZATEN duran değişkeni ezmez — canlıda bunu
// pahalı öğrendik: shell bir kez eski ELEVENLABS_VOICE_ID'yi export etmişti,
// .env kaç kez düzenlenirse düzenlensin süreç eski (silinmiş) sesi kullanmaya
// devam etti ve TTS sessizce 502 verdi. Prod'da dosya yok → çağrı no-op, gerçek
// ortam değişkenleri geçerli kalır.
loadDotenv({ override: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(6566),

  // Supabase — DATABASE_URL Supavisor pooler adresidir (port 6543, transaction mode)
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  /** HS256 projelerde JWT doğrulaması için; yoksa JWKS (asimetrik) kullanılır */
  SUPABASE_JWT_SECRET: z.string().min(10).optional(),

  // AI sağlayıcıları — Faz 3'te zorunlu olacak, iskelette opsiyonel
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),

  /** Virgülle ayrılmış izinli origin listesi */
  CORS_ORIGINS: z.string().default("http://localhost:6567"),
});

// .env'de "DEGISKEN=" (boş) bırakılan değerler tanımsız sayılır
const cleaned = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);

const parsed = envSchema.safeParse(cleaned);
if (!parsed.success) {
  console.error("❌ Eksik/geçersiz ortam değişkenleri:");
  for (const issue of parsed.error.issues) {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
