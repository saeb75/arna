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
import { azureLocale, azureProvider, buildSsml, dominantLocale, wordBoundariesToAlignment } from "../src/modules/tts/azure.js";
import { elevenlabsProvider } from "../src/modules/tts/elevenlabs.js";
import { inworldLanguage, inworldProvider, toCharAlignment } from "../src/modules/tts/inworld.js";
import { audioCacheKey, capabilitiesOf, runsCacheKey, type ActiveTts } from "../src/modules/tts/index.js";
import { defaultTtsSettings, mergeStoredSettings } from "../src/modules/tts/settings.js";

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
check("bilinmeyen sağlayıcı reddedilir", !ttsSettingsSchema.safeParse({ ...defaultTtsSettings(), provider: "google" }).success);
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

// (7) Azure — locale türetme (dil tablosu YOK)
check("azure tr → tr-TR", azureLocale("tr") === "tr-TR");
check("azure en → en-US", azureLocale("en") === "en-US");
check("azure zh-hans → zh-CN", azureLocale("zh-hans") === "zh-CN");
check("azure zh-hant → zh-TW", azureLocale("zh-hant") === "zh-TW");
check("azure pt-br → pt-BR", azureLocale("pt-br") === "pt-BR");
check("azure ar → ar-EG (bölge türetildi)", azureLocale("ar") === "ar-EG");
check("azure bozuk → null", azureLocale("") === null && azureLocale("12") === null);
check("azure modeli tek (panel alanı gizler)", azureProvider.models.length === 1);
check("azure çok dilli tek klip yeteneği", capabilitiesOf(azureProvider).multiLanguageClip === true);
check("elevenlabs çok dilli tek klip yok", capabilitiesOf(elevenlabsProvider).multiLanguageClip === false);

// (8) Azure — SSML: kök dil = en çok karakter, yalnız diğerleri <lang>, ardışık birleşik, kaçışlı, girintisiz
const runs = [
  { languageCode: "tr-TR", text: "Bugün şu cümleyi öğreneceğiz:" },
  { languageCode: "en-US", text: "What have you been doing lately?" },
  { languageCode: "tr-TR", text: "Bu cümle <son zamanlarda> & neler yapıyorsun demek." },
  { languageCode: "tr-TR", text: "Örneğin:" },
  { languageCode: "en-US", text: "I have been studying English lately." },
];
const ssml = buildSsml(runs, "en-US-AvaMultilingualNeural");
check("kök dil en çok karakterli (tr-TR)", dominantLocale(runs) === "tr-TR" && ssml.includes('xml:lang="tr-TR"><voice'));
check("yalnız İngilizce parçalar <lang> ile sarılı", (ssml.match(/<lang /g) ?? []).length === 2 && !ssml.includes('<lang xml:lang="tr-TR"'));
check("ardışık tr parçaları tek blokta (<lang> arası tek metin)", ssml.includes("demek. Örneğin:"));
check("XML kaçışı", ssml.includes("&lt;son zamanlarda&gt; &amp; neler") && !ssml.includes("<son"));
check("girinti/yeni satır yok (fatura)", !/\n|  /.test(ssml));
check("tek dil → hiç <lang> yok", !buildSsml([{ languageCode: "en-US", text: "Hi" }], "v").includes("<lang"));

// (9) Azure — kelime sınırı → karakter alignment
const al2 = wordBoundariesToAlignment([
  { text: "Hello", audioOffsetTicks: 500_000, durationTicks: 3_000_000, kind: "word" },       // 0.05–0.35 s
  { text: ",", audioOffsetTicks: 3_500_000, durationTicks: 500_000, kind: "punctuation" },    // 0.35–0.40
  { text: "world", audioOffsetTicks: 5_000_000, durationTicks: 4_000_000, kind: "word" },     // 0.50–0.90
  { text: "Hello, world", audioOffsetTicks: 0, durationTicks: 9_000_000, kind: "sentence" },  // atlanır
]);
check("alignment üç dizi eşit", al2 !== null && al2.characters.length === al2.character_start_times_seconds.length && al2.characters.length === al2.character_end_times_seconds.length);
check("metin 'Hello, world' (noktalama boşluksuz, kelimeler arası boşluk)", al2?.characters.join("") === "Hello, world");
check("tick → saniye", al2 !== null && Math.abs(al2.character_start_times_seconds[0]! - 0.05) < 1e-9 && Math.abs(al2.character_end_times_seconds.at(-1)! - 0.9) < 1e-9);
check("zamanlar monoton", al2 !== null && al2.character_start_times_seconds.every((t, i, a) => i === 0 || t >= a[i - 1]!));
check("olay yok → null", wordBoundariesToAlignment([]) === null);

// (10) eski satır (azure anahtarsız) varsayılanla birleşir
const legacy = mergeStoredSettings({ provider: "inworld", elevenlabs: { voiceId: "x", modelId: "eleven_flash_v2_5" }, inworld: { voiceId: "Ashley", modelId: "inworld-tts-2" } });
check("eski tts satırı azure anahtarı olmadan geçer", legacy !== null && legacy.provider === "inworld" && legacy.azure.modelId === "neural");
check("bozuk satır null", mergeStoredSettings({ provider: "nope" }) === null);
const az: ActiveTts = { provider: azureProvider, voiceId: "v", modelId: "neural" };
check("çok parçalı önbellek anahtarı parça sırasına duyarlı", runsCacheKey(az, runs) !== runsCacheKey(az, [...runs].reverse()));

console.log(failed === 0 ? "\nHepsi geçti." : `\n${failed} vaka düştü.`);
if (failed) process.exit(1);
