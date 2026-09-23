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
import { buildEnglishLexicon, refineRunsForInlineEnglish, splitInlineEnglish } from "../src/modules/tts/inlineEnglish.js";
import type { LessonCore } from "@glotmate/contracts";
import { getChrome } from "../src/i18n/index.js";

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

// (8) Azure — SSML: kök dil = en çok karakter, HER grup açık <lang>, ardışık birleşik, kaçışlı, girintisiz
const runs = [
  { languageCode: "tr-TR", text: "Bugün şu cümleyi öğreneceğiz:" },
  { languageCode: "en-US", text: "What have you been doing lately?" },
  { languageCode: "tr-TR", text: "Bu cümle <son zamanlarda> & neler yapıyorsun demek." },
  { languageCode: "tr-TR", text: "Örneğin:" },
  { languageCode: "en-US", text: "I have been studying English lately." },
];
const stripProsody = (x: string) => x.replace(/<\/?prosody[^>]*>/g, "");
const ssmlRaw = buildSsml(runs, "en-US-AvaMultilingualNeural", undefined, "-10%"); // .env AZURE_SPEECH_RATE'ten bağımsız
check("her grupta prosody rate (-10%), lang'in İÇİNDE", (ssmlRaw.match(/<prosody rate="-10%">/g) ?? []).length === 4 && (ssmlRaw.match(/<lang [^>]*><prosody/g) ?? []).length === 4);
check("rate boş → varsayılan -10%", buildSsml(runs, "v", undefined, "").includes('rate="-10%"'));
check("rate 0 / 0% / 1 / default → prosody YOK (doğal hız)", ["0", "0%", "+0%", "1", "1.0", "default"].every((r) => !buildSsml(runs, "v", undefined, r).includes("<prosody")));
check("rate -15% → aynen", buildSsml(runs, "v", undefined, "-15%").includes('rate="-15%"'));
const ssml = stripProsody(ssmlRaw);
check("kök dil ana dil (tr-TR)", dominantLocale(runs) === "tr-TR" && ssml.includes('xml:lang="tr-TR"><voice'));
check("her grup açıkça sarılı: 2 en-US + 2 tr-TR, kök tr-TR", (ssml.match(/<lang xml:lang="en-US">/g) ?? []).length === 2 && (ssml.match(/<lang xml:lang="tr-TR">/g) ?? []).length === 2);
check("tek L1 parçası da etiketli (Tam isabet!)", stripProsody(buildSsml([{ languageCode: "tr-TR", text: "Tam isabet!" }], "v")).includes('xml:lang="tr-TR"><voice name="v"><lang xml:lang="tr-TR">Tam isabet!</lang>'));

check("ardışık tr parçaları tek blokta (<lang> arası tek metin)", ssml.includes("demek. Örneğin:"));
check("XML kaçışı", ssml.includes("&lt;son zamanlarda&gt; &amp; neler") && !ssml.includes("<son"));
check("girinti/yeni satır yok (fatura)", !/\n|  /.test(ssml));
check("tek dil (İngilizce) → kök en-US, tek <lang en-US>", (buildSsml([{ languageCode: "en-US", text: "Hi" }], "v").match(/<lang xml:lang="en-US">/g) ?? []).length === 1);
const ex = stripProsody(buildSsml([{ languageCode: "tr-TR", text: "Boşluğu doldur:" }, { languageCode: "en-US", text: "My brother ___ a doctor." }], "v"));
check("yönerge+alıştırma: kök tr-TR, iki grup da sarılı, arada boşluk", ex.includes('xml:lang="tr-TR"><voice') && ex.includes('<lang xml:lang="tr-TR">Boşluğu doldur:</lang> <lang xml:lang="en-US">My brother'));
check("___ → <break>, alt çizgi yok", ex.includes('My brother <break strength="medium"/> a doctor.') && !ex.includes("_"));

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

// (11) Satır içi İngilizce — ekran görüntüsündeki metin, çekirdek sözlüğüyle
const core = {
  lecture: {
    beats: [
      {
        kind: "teach", id: "t1", introIntent: "x",
        points: [
          { id: "p1", formEn: "am / is / are", claimsEn: ["Put am, is or are before the subject to ask."], examples: [
            { id: "e1", textEn: "Are you a student?" }, { id: "e2", textEn: "Is she your sister?" }, { id: "e3", textEn: "Yes, I am." }, { id: "e4", textEn: "No, I'm not." }, { id: "e5", textEn: "He is a teacher. We are friends. They are at home." }] },
        ],
      },
      { kind: "exercise", id: "x1", format: "mcq", item: "___ they at home?", options: ["Are", "Do", "Does"], exampleAnswer: "Are", answerSpec: { type: "mcq", correctIndex: 0 } },
    ],
  },
  practice: { mustUse: ["do", "does"], minTargetUses: 2, successCriteria: "x", maxTurns: 8 },
} as unknown as LessonCore;
const lex = buildEnglishLexicon(core);
const l1 = "Birine soru sormak için am, is veya are'ı kişi zamirinin önüne getiriyoruz. Be fiiliyle yapılan sorularda asla do veya does eklemiyoruz. Olumlu kısa cevaplarda kısaltma kullanmıyoruz; yani 'Yes, I am' diyoruz, 'Yes, I'm' demiyoruz. Bu on dakika sürer.";
const parts = splitInlineEnglish(l1, lex);
const en = parts.filter((p) => p.lang === "en").map((p) => p.text);
check("birleşim orijinale birebir eşit", parts.map((p) => p.text).join("") === l1);
// "am, is" artık tek span (liste birleştirme); sözcük bazında denetle
check("am · is · are · do · does İngilizce", ["am", "is", "are", "do", "does"].every((w) => en.some((t) => new RegExp(`(^|\\W)${w}($|\\W)`).test(t))), en);
check("are'ı → are + 'ı (ek L1'de)", en.includes("are") && parts.some((p) => p.lang === "l1" && p.text.startsWith("'ı")));
check("tırnaklı 'Yes, I am' ve 'Yes, I'm' İngilizce (tırnaklar L1'de)", en.includes("Yes, I am") && en.includes("Yes, I'm"));
check("L1 sözcükler dokunulmadı (veya, kişi, Birine)", !en.some((t) => /veya|kişi|Birine|diyoruz/.test(t)));
check("sözlükte olmayan 'on' bölünmedi", !en.includes("on"));
check("boş parça yok", parts.every((p) => p.text.length > 0));
check("tırnak içi Latin ama sözlük dışı ('Haus') L1 kalır", splitInlineEnglish("Almanca 'Haus' sözcüğü", lex).every((p) => p.lang === "l1"));
check("Kiril metinde en çıkmaz", splitInlineEnglish("Мы говорим да или нет.", lex).every((p) => p.lang === "l1"));
check("'is' 'isim' içinde eşleşmez (kelime sınırı)", splitInlineEnglish("isim ve island", lex).every((p) => p.lang === "l1"));
check("core yok → runs aynı", refineRunsForInlineEnglish([{ lang: "l1", text: l1 }], null).length === 1);
const refined = refineRunsForInlineEnglish([{ lang: "l1", text: "Mesela:" }, { lang: "en", text: "Are you a student?" }, { lang: "l1", text: l1 }], core);
check("refine: en parçalar aynen, l1 bölündü", refined[1]!.text === "Are you a student?" && refined.length > 3);
const ssml2 = stripProsody(buildSsml(
  refined.map((r) => ({ languageCode: r.lang === "en" ? "en-US" : "tr-TR", text: r.text })),
  "en-US-AvaMultilingualNeural",
));
// SDK'nın <break> sonrası sahte olayı: yalnız ilk sözcük alınır, kuyruk tekrarı olmaz
const al3 = wordBoundariesToAlignment([
  { text: "My", audioOffsetTicks: 15_900_000, durationTicks: 1_400_000, kind: "word", textOffset: 193 },
  { text: "brother  a doctor.", audioOffsetTicks: 17_400_000, durationTicks: 4_000_000, kind: "word", textOffset: -1 },
  { text: "a", audioOffsetTicks: 29_400_000, durationTicks: 700_000, kind: "word", textOffset: 231 },
  { text: "doctor", audioOffsetTicks: 30_200_000, durationTicks: 5_600_000, kind: "word", textOffset: 233 },
  { text: ".", audioOffsetTicks: 36_000_000, durationTicks: 900_000, kind: "punctuation", textOffset: 239 },
]);
check("sahte çok kelimeli olay → yalnız 'brother'", al3?.characters.join("") === "My brother a doctor.", al3?.characters.join(""));
check("SSML: are</lang><lang tr-TR>'ı bitişik (boşluksuz)", ssml2.includes('are</lang><lang xml:lang="tr-TR">&apos;ı'));
check("SSML: harfle başlayan grup önünde boşluk, apostrof önünde yok", ssml2.includes("Mesela:</lang> <lang") && /için\s*<\/lang>\s*<lang/.test(ssml2) && ssml2.includes("are</lang><lang"));
check("SSML: boş <lang> yok", !/<lang[^>]*><\/lang>/.test(ssml2));

// (12) Kısaltmalar + liste birleştirme (ikinci ekran görüntüsü)
const l1b = "Konuşurken bu iki kelimeyi birleştiririz: I'm, you're, he's, she's, it's, we're, they're. Kısa halleri aynı anlama gelir.";
const pb = splitInlineEnglish(l1b, lex);
const enb = pb.filter((p) => p.lang === "en").map((p) => p.text);
check("kısaltma listesi TEK en span", enb.length === 1 && enb[0] === "I'm, you're, he's, she's, it's, we're, they're", enb);
check("birleşim orijinale eşit (kısaltma)", pb.map((p) => p.text).join("") === l1b);
const pc = splitInlineEnglish("am, is veya are'ı öne alırız.", lex).map((p) => `${p.lang}:${p.text}`);
check("am, is birleşik · veya L1 · are ayrı · 'ı L1", pc.join("|") === "en:am, is|l1: veya |en:are|l1:'ı öne alırız.", pc);
check("Türkçe apostrof eki kısaltma sayılmaz", splitInlineEnglish("İstanbul'da ve Ankara'nın", lex).every((p) => p.lang === "l1"));
check("Fransızca elizyon L1", splitInlineEnglish("c'est la vie, l'homme", lex).every((p) => p.lang === "l1"));
check("don't / we'll / that's İngilizce", splitInlineEnglish("Kısaca don't, we'll ve that's deriz.", lex).filter((p) => p.lang === "en").map((p) => p.text).join("|") === "don't, we'll|that's");
check("İtalik apostrof ’ da yakalanır", splitInlineEnglish("Mesela you’re deriz.", lex).some((p) => p.lang === "en" && p.text === "you’re"));

// (13) Kapalı sınıf anmalar + komşuluk (wrapup LLM cevabı), Türkçe chrome ile
const trChrome = getChrome("tr");
const lexTr = buildEnglishLexicon(core, trChrome);
const l1c = "Tabii ki, am, is ve are fiilleri hakkında bilgi verebilirim. Am, I ile kullanılır; is, he, she ve it ile; are ise you, we ve they ile kullanılır.";
const pcc = splitInlineEnglish(l1c, lexTr);
const encc = pcc.filter((p) => p.lang === "en").map((p) => p.text);
check("zamirler İngilizce (I, he, she, it, you, we, they)", ["I", "he", "she", "it", "you", "we", "they"].every((w) => encc.some((t) => new RegExp(`(^|\\W)${w}($|\\W)`).test(t))), encc);
check("komşuluk: 'Am, I' ve 'is, he, she' tek span", encc.includes("Am, I") && encc.includes("is, he, she"));
check("L1 sözcükler dokunulmadı (ile, ise, ve, fiilleri)", !encc.some((t) => /ile|ise|\bve\b|fiilleri|kullanılır/.test(t)));
check("birleşim orijinale eşit (kapalı sınıf)", pcc.map((p) => p.text).join("") === l1c);
check("chrome sözcüğü işaretlenmez: Türkçe chrome'da 'bir' var → words'te olsa da", !splitInlineEnglish("bir a bir", { ...lexTr, words: new Set([...lexTr.words, "bir"]) }).some((p) => p.lang === "en" && /bir/.test(p.text)));
// Almanca/Hollandaca benzeri sahte chrome: "am" ve "we" ana dil sözcüğü → işaretlenmez
const lexFake = buildEnglishLexicon(core, { script: { greeting: "Wir treffen uns am Anfang, we zijn er" } });
check("sahte chrome 'am'/'we' içerince tek başına işaretlenmez", !splitInlineEnglish("Das Verb am und we hier.", lexFake).some((p) => p.lang === "en" && /^(am|we)$/.test(p.text.trim())));
check("sözlükte olmayan kapalı sınıf sözcük ('must') işaretlenmez", splitInlineEnglish("must burada geçmez", lexTr).every((p) => p.lang === "l1"));
check("Kiril değişmez (kapalı sınıf)", splitInlineEnglish("Мы говорим да.", lexTr).every((p) => p.lang === "l1"));

console.log(failed === 0 ? "\nHepsi geçti." : `\n${failed} vaka düştü.`);
if (failed) process.exit(1);
