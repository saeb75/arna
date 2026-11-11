import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { textTranslations } from "../../db/schema.js";

/**
 * DOKUN-ÇEVİR — İngilizce metni öğrencinin ana diline çevirir.
 *
 * Sağlayıcı: Google Cloud Translation v2 (anahtar varsa), yoksa çağıranın verdiği
 * LLM yedeği (bugünkü balon çevirisi). Bu bir "otomatik geçiş" DEĞİLDİR: hangi
 * yolun çalışacağı yapılandırmayla belli; Google hata verirse hata döner.
 *
 * ÖNBELLEK KALICIDIR (`text_translations`): her (metin, dil, sağlayıcı) bir kez
 * çevrilir. Oyun bloğundaki cümleler paylaşımlı içerik olduğu için aynı cümleyi
 * binlerce öğrenci çevirir — her dokunuşta API'ye gitmek hem maliyet hem gecikme
 * olurdu, üstelik iki öğrenci aynı cümle için farklı çeviri görürdü.
 */

export type TranslateProvider = "google" | "llm";

export class TranslateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslateError";
  }
}

const GOOGLE_URL = "https://translation.googleapis.com/language/translate/v2";

export function activeTranslateProvider(): TranslateProvider {
  return env.GOOGLE_TRANSLATE_API_KEY ? "google" : "llm";
}

function hashOf(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Google'ın beklediği hedef kod: çoğu dilde temel alt etiket, Çince/Portekizce bölgesel */
function googleTarget(bcp47: string): string {
  const lower = bcp47.toLowerCase();
  if (lower.startsWith("zh")) return /tw|hk|hant/.test(lower) ? "zh-TW" : "zh-CN";
  if (lower === "pt-pt") return "pt-PT";
  return lower.split("-")[0]!;
}

async function translateWithGoogle(text: string, target: string): Promise<string> {
  const res = await fetch(`${GOOGLE_URL}?key=${encodeURIComponent(env.GOOGLE_TRANSLATE_API_KEY!)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target: googleTarget(target), format: "text" }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new TranslateError(`google ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data?: { translations?: Array<{ translatedText?: string }> } };
  const out = json.data?.translations?.[0]?.translatedText?.trim();
  if (!out) throw new TranslateError("google: boş çeviri");
  return out;
}

/**
 * Önbellekli çeviri. `llmFallback` yalnız Google anahtarı YOKKEN çağrılır.
 * Kaynak metin olduğu gibi anahtarlanır (kırpma dışında normalize edilmez —
 * "Hi." ile "hi" farklı çeviri alabilir).
 */
export async function translateCached(
  text: string,
  target: string,
  llmFallback: () => Promise<string>,
): Promise<{ text: string; provider: TranslateProvider; cached: boolean }> {
  const source = text.trim();
  const provider = activeTranslateProvider();
  const sourceHash = hashOf(source);

  const [hit] = await db
    .select({ text: textTranslations.text })
    .from(textTranslations)
    .where(
      and(
        eq(textTranslations.sourceHash, sourceHash),
        eq(textTranslations.targetLang, target),
        eq(textTranslations.provider, provider),
      ),
    )
    .limit(1);
  if (hit) return { text: hit.text, provider, cached: true };

  const out = provider === "google" ? await translateWithGoogle(source, target) : (await llmFallback()).trim();
  if (!out) throw new TranslateError("boş çeviri");

  await db
    .insert(textTranslations)
    .values({ sourceHash, sourceText: source, targetLang: target, provider, text: out })
    .onConflictDoNothing();
  return { text: out, provider, cached: false };
}
