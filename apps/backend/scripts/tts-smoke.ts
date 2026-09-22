/**
 * TTS gateway uçtan uca duman testi — GERÇEK DB + GERÇEK sağlayıcı çağrısı
 * (birkaç karakter maliyet). Aktif ayarı okur, sağlayıcıyı çözer, kısa klip
 * üretir, alignment sözleşmesini ve önbelleği doğrular.
 *   set -a; source .env; set +a; npx tsx scripts/tts-smoke.ts
 */
import { adminTtsSettingsResponseSchema } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { buildTtsSettingsResponse, PROVIDERS, resolveActiveTts, synthesizeClip } from "../src/modules/tts/index.js";

// 1) app_settings → contracts şeması (satır yoksa env varsayılanı)
const resp = adminTtsSettingsResponseSchema.parse(await buildTtsSettingsResponse());
console.log("settings:", JSON.stringify({ provider: resp.settings.provider, configured: resp.configured, updatedAt: resp.updatedAt }));

// 2) Aktif sağlayıcı çözümlenir
const active = await resolveActiveTts();
console.log("active:", active.provider.name, active.modelId, "voice:", `${active.voiceId.slice(0, 6)}…`);

// 3) Gerçek çağrı — istemci sözleşmesi: mp3 + üç eşit uzunlukta karakter dizisi
const t0 = Date.now();
const clip = await synthesizeClip(active, "Hi there.", active.provider.languageCode("en")!);
const a = clip.alignment;
console.log("clip:", {
  ms: Date.now() - t0,
  audioBytes: Buffer.from(clip.audioBase64, "base64").length,
  alignment: a
    ? { n: a.characters.length, starts: a.character_start_times_seconds.length, ends: a.character_end_times_seconds.length, lastEnd: a.character_end_times_seconds.at(-1) }
    : null,
});
if (!clip.audioBase64) throw new Error("ses yok");
if (a && (a.characters.length !== a.character_start_times_seconds.length || a.characters.length !== a.character_end_times_seconds.length)) {
  throw new Error("alignment dizileri eşit uzunlukta değil");
}

// 4) Önbellek: aynı girdi ağa gitmez
const t1 = Date.now();
await synthesizeClip(active, "Hi there.", active.provider.languageCode("en")!);
console.log("cache hit ms:", Date.now() - t1);

console.log("configured:", { elevenlabs: PROVIDERS.elevenlabs.configured(), inworld: PROVIDERS.inworld.configured() });
await sql.end();
