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
  PORT: z.coerce.number().int().positive().default(6560),

  // Supabase — DATABASE_URL Supavisor pooler adresidir (port 6543, transaction mode)
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  /** HS256 projelerde JWT doğrulaması için; yoksa JWKS (asimetrik) kullanılır */
  SUPABASE_JWT_SECRET: z.string().min(10).optional(),

  // AI sağlayıcıları — Faz 3'te zorunlu olacak, iskelette opsiyonel
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  /** Inworld portal'ından kopyalanan Base64 kimlik — OLDUĞU GİBİ, tekrar kodlanmaz */
  INWORLD_API_KEY: z.string().optional(),
  /** Inworld ses kimliği (ad biçiminde: "Ashley", "Dennis" …) — panel boş bırakırsa bu */
  INWORLD_VOICE_ID: z.string().optional(),
  /** Azure Speech kaynağı anahtarı + bölgesi (`westeurope` gibi) — ikisi birlikte yoksa sağlayıcı kapalı */
  AZURE_SPEECH_KEY: z.string().optional(),
  AZURE_SPEECH_REGION: z.string().optional(),
  /** Çok dilli ses adı; boşsa `en-US-AvaMultilingualNeural` */
  AZURE_SPEECH_VOICE: z.string().optional(),
  /** Konuşma hızı (SSML prosody rate: "-10%", "0.9"); boşsa biraz yavaş varsayılan, "0" = doğal hız (etiket yok) */
  AZURE_SPEECH_RATE: z.string().optional(),
  /** Google Gemini API anahtarı (TTS: gemini-*-tts modelleri) — yoksa sağlayıcı kapalı */
  GEMINI_API_KEY: z.string().optional(),
  /** Gemini hazır ses adı ("Kore", "Puck" …); boşsa "Kore" — panel boş bırakırsa bu */
  GEMINI_TTS_VOICE: z.string().optional(),
  /**
   * Google Cloud Translation (v2) anahtarı — dokun-çevir. Yoksa çeviri bugünkü LLM
   * yoluyla yapılır. Sonuç her (metin, dil) için bir kez DB'ye yazılır.
   */
  GOOGLE_TRANSLATE_API_KEY: z.string().optional(),

  // Abonelik (RevenueCat). Anahtar yoksa mağaza doğrulaması KAPALI: Pro yalnız
  // admin tanımasından ya da webhook'tan gelir, kota yine zorlanır.
  /** RevenueCat → Project settings → API keys → Secret key (sk_…) */
  REVENUECAT_SECRET_KEY: z.string().optional(),
  REVENUECAT_ENTITLEMENT_ID: z.string().default("pro"),
  /** Webhook'un Authorization başlığına yazılan değer (RevenueCat panelinde aynısı) */
  REVENUECAT_WEBHOOK_SECRET: z.string().optional(),

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
