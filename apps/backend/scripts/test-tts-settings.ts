/**
 * TTS gateway saf kuralları — LLM yok, DB yok, ağ yok. Anlık koşar.
 *   set -a; source .env; set +a; npx tsx scripts/test-tts-settings.ts
 *
 * Sınananlar: (1) env varsayılanı contracts şemasından geçer, (2) bozuk satır
 * reddedilir, (3) önbellek anahtarı sağlayıcı/ses/model değişiminde farklılaşır,
 * (4) Inworld karakter dizileri → istemci sözleşmesi dönüşümü (eşit uzunluk
 * şartı), (5) Inworld BCP-47 açılımı, (6) ElevenLabs kapsam tablosu korunur.
 */
import { ttsSettingsSchema } from "@glotmate/contracts";
import { elevenlabsProvider } from "../src/modules/tts/elevenlabs.js";
import { inworldLanguage, inworldProvider, toCharAlignment } from "../src/modules/tts/inworld.js";
import { audioCacheKey, type ActiveTts } from "../src/modules/tts/index.js";
import { defaultTtsSettings } from "../src/modules/tts/settings.js";

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "✓" : "✗"} ${name}${ok || detail === undefined ? "" : ` → ${JSON.stringify(detail)}`}`);
  if (!ok) failed++;
}

// (1) varsayılan
const def = ttsSettingsSchema.safeParse(defaultTtsSettings());
check("env varsayılanı şemadan geçer", def.success);
check("varsayılan sağlayıcı elevenlabs (bugünkü davranış korunur)", def.success && def.data.provider === "elevenlabs");
check("varsayılan modeller sağlayıcı listesinin ilki", def.success
  && def.data.elevenlabs.modelId === elevenlabsProvider.models[0]
  && def.data.inworld.modelId === inworldProvider.models[0]);

// (2) bozuk satırlar
check("bilinmeyen sağlayıcı reddedilir", !ttsSettingsSchema.safeParse({ ...defaultTtsSettings(), provider: "azure" }).success);
check("boş model reddedilir", !ttsSettingsSchema.safeParse({ ...defaultTtsSettings(), inworld: { voiceId: null, modelId: "" } }).success);
check("eksik sağlayıcı bloğu reddedilir", !ttsSettingsSchema.safeParse({ provider: "inworld", inworld: { voiceId: "Ashley", modelId: "inworld-tts-2" } }).success);
check("api anahtarı alanı şemada YOK (sızıntı koruması)", !("apiKey" in ttsSettingsSchema.shape.inworld.shape));

// (3) önbellek anahtarı
const a: ActiveTts = { provider: elevenlabsProvider, voiceId: "v1", modelId: "eleven_flash_v2_5" };
const b: ActiveTts = { provider: inworldProvider, voiceId: "v1", modelId: "eleven_flash_v2_5" };
const c: ActiveTts = { ...a, voiceId: "v2" };
const d: ActiveTts = { ...a, modelId: "eleven_turbo_v2_5" };
const k = (x: ActiveTts) => audioCacheKey(x, "en", "Hello");
check("sağlayıcı değişince anahtar değişir", k(a) !== k(b));
check("ses değişince anahtar değişir", k(a) !== k(c));
check("model değişince anahtar değişir", k(a) !== k(d));
check("dil değişince anahtar değişir", audioCacheKey(a, "en", "Hello") !== audioCacheKey(a, "tr", "Hello"));
check("aynı girdi aynı anahtar", k(a) === k({ ...a }));

// (4) Inworld → istemci sözleşmesi
const al = toCharAlignment({
  characters: ["H", "i", " ", "!"],
  characterStartTimeSeconds: [0, 0.1, 0.2, 0.25],
  characterEndTimeSeconds: [0.1, 0.2, 0.25, 0.3],
});
check("dönüşüm üç paralel dizi üretir", al !== null
  && al.characters.length === 4
  && al.character_start_times_seconds.length === 4
  && al.character_end_times_seconds.length === 4, al);
check("zamanlar saniye, dokunulmaz", al?.character_start_times_seconds[1] === 0.1 && al?.character_end_times_seconds[3] === 0.3);
check("uzunluk uyuşmazlığı → null (yanlış çene yerine düz çene)", toCharAlignment({
  characters: ["a", "b"], characterStartTimeSeconds: [0], characterEndTimeSeconds: [0.1, 0.2],
}) === null);
check("alignment yok → null", toCharAlignment(undefined) === null && toCharAlignment({}) === null);

// (5) Inworld dil açılımı
check("zh-hans → zh-CN", inworldLanguage("zh-hans") === "zh-CN");
check("zh-hant → zh-TW", inworldLanguage("zh-hant") === "zh-TW");
check("pt-br → pt-BR", inworldLanguage("pt-br") === "pt-BR");
check("sr-latn → sr-Latn", inworldLanguage("sr-latn") === "sr-Latn");
check("tr → tr (olduğu gibi)", inworldLanguage("tr") === "tr");
check("sw → sw (kapsam tablosu yok, 200+ dil)", inworldLanguage("sw") === "sw");
check("en → en", inworldProvider.languageCode("en") === "en");
check("bozuk kod → null", inworldLanguage("") === null && inworldLanguage("12") === null);

// (6) ElevenLabs kapsamı aynen
check("elevenlabs tr → tr", elevenlabsProvider.languageCode("tr") === "tr");
check("elevenlabs zh-hans → zh", elevenlabsProvider.languageCode("zh-hans") === "zh");
check("elevenlabs kapsam dışı (sw) → null", elevenlabsProvider.languageCode("sw") === null);

console.log(failed === 0 ? "\nHepsi geçti." : `\n${failed} vaka düştü.`);
if (failed) process.exit(1);
