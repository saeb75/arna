/**
 * SES KULAK TESTİ (bake-off) — ana dil + İngilizce karışık hoca cümlelerini
 * sağlayıcı × kip başına okutur; KÖR harfli WAV'lar, ses başına "makara",
 * dinleme/puanlama sayfası ve ölçüm tablosu üretir.
 *
 *   cd apps/backend && set -a && source .env && set +a && npx tsx scripts/tts-bakeoff.ts
 *   seçenekler: --only=<varyant alt dizesi> --lang=tr|es --sentences=T05,T07 --out=<dizin>
 *               --gemini-env=../mobile/.env.local (GEMINI_API_KEY ortamda yoksa buradan okunur)
 *
 * NEDEN (3 Kas 2026 ders motoru denetimi): üretimdeki ElevenLabs yolu cümleyi dile
 * göre bölüp her parçayı `language_code` ile dili ZORLAYARAK ayrı klip okutuyor;
 * Azure ise tek "çok dilli" Amerikan sesiyle etiketlere bağımlı. Burada her aday
 * cümleyi TAM (bölmeden) okur; iki üretim yolu taban çizgisi olarak aynen yeniden
 * üretilir (Azure: inlineEnglish rafine + SSML <lang>; ElevenLabs: dil başına klip).
 *
 * ADİLLİK: tüm klipler 24 kHz mono 16-bit'e çevrilir ve RMS'e göre aynı ses
 * düzeyine getirilir (yüksek ses "daha iyi" algılanmasın). Harfler her koşumda
 * yeniden karılır; anahtar sayfada gizli düğmenin arkasında.
 *
 * SINIR: süre ölçümü akışsız uçlarda TOPLAM süredir (TTFB değil). Azure burada
 * kayıpsız PCM ister (üretim 48 kbps mp3); hız yalnız üretim tabanında -10%.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import { and, eq } from "drizzle-orm";
import type { LessonCore, LessonLocalePack, TextRun } from "@glotmate/contracts";
import { db, sql } from "../src/db/client.js";
import { lessonCores, lessonLocales } from "../src/db/schema.js";
import { getChrome } from "../src/i18n/index.js";
import { buildSsml, escapeXml } from "../src/modules/tts/azure.js";
import { refineRunsForInlineEnglish } from "../src/modules/tts/inlineEnglish.js";
import { joinForSpeech, speakableText } from "../src/modules/tts/speakable.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
) as Record<string, string>;

const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = resolve(args.out ?? join(tmpdir(), "glotmate-tts-bakeoff", STAMP));
const SAMPLE_RATE = 24_000;

type L1 = "tr" | "es";
type Run = { lang: "en" | "l1"; text: string };

// --- anahtarlar -------------------------------------------------------------------

function geminiKey(): string | null {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const file = resolve(args["gemini-env"] ?? "../mobile/.env.local");
  if (!existsSync(file)) return null;
  const line = readFileSync(file, "utf8").split("\n").find((l) => l.startsWith("GEMINI_API_KEY="));
  return line ? line.slice("GEMINI_API_KEY=".length).trim().replace(/^["']|["']$/g, "") : null;
}

const KEYS = {
  eleven: process.env.ELEVENLABS_API_KEY,
  elevenVoice: process.env.ELEVENLABS_VOICE_ID,
  inworld: process.env.INWORLD_API_KEY,
  inworldVoice: process.env.INWORLD_VOICE_ID,
  azure: process.env.AZURE_SPEECH_KEY,
  azureRegion: process.env.AZURE_SPEECH_REGION,
  gemini: geminiKey(),
};

// --- cümle seti --------------------------------------------------------------------

interface Sentence {
  id: string;
  lang: L1;
  /** nereden geldiği — dinleme sayfasında görünür */
  source: string;
  /** neyi sınadığı */
  note: string;
  /** dil etiketli parçalar: LLM/paket bunu üretiyor (üretim yolları buna bakar) */
  runs: Run[];
  /** satır içi İngilizce rafinesi için çekirdek (üretimdeki Azure yolu) */
  coreLessonId: string;
}

const coreCache = new Map<string, { id: string; core: LessonCore }>();

async function publishedCore(lessonId: string): Promise<{ id: string; core: LessonCore }> {
  const hit = coreCache.get(lessonId);
  if (hit) return hit;
  const [row] = await db
    .select()
    .from(lessonCores)
    .where(and(eq(lessonCores.catalogLessonId, lessonId), eq(lessonCores.status, "published")))
    .limit(1);
  if (!row?.core) throw new Error(`yayınlı çekirdek yok: ${lessonId}`);
  const value = { id: row.id, core: row.core as LessonCore };
  coreCache.set(lessonId, value);
  return value;
}

/** contracts `resolveLocaleRuns` ile aynı kural (kalıp+örnek bitişmesinde kalıba `:`). */
async function packSentence(id: string, lessonId: string, lang: L1, pointId: string, note: string): Promise<Sentence> {
  const { id: coreId, core } = await publishedCore(lessonId);
  const [loc] = await db
    .select()
    .from(lessonLocales)
    .where(and(eq(lessonLocales.coreId, coreId), eq(lessonLocales.language, lang), eq(lessonLocales.status, "ready")))
    .limit(1);
  if (!loc?.pack) throw new Error(`dil paketi yok: ${lessonId}/${lang}`);
  const pack = loc.pack as LessonLocalePack;
  const examples = new Map<string, string>();
  const forms = new Set<string>();
  for (const b of core.lecture.beats) {
    if (b.kind !== "teach") continue;
    for (const p of b.points) {
      examples.set(p.id, p.formEn);
      forms.add(p.id);
      for (const ex of p.examples) examples.set(ex.id, ex.textEn);
    }
  }
  const raw = pack.teachPoints[pointId]?.runs ?? [];
  const runs: Run[] = [];
  raw.forEach((r, i) => {
    if (r.kind === "l1") return void runs.push({ lang: "l1", text: r.text });
    const text = examples.get(r.refId);
    if (!text) return;
    const followedByRef = raw[i + 1]?.kind === "core_ref";
    runs.push({ lang: "en", text: forms.has(r.refId) && followedByRef ? `${text}:` : text });
  });
  if (!runs.length) throw new Error(`anlatım boş: ${lessonId}/${lang}/${pointId}`);
  return { id, lang, source: `dil paketi · ${lessonId} · ${pointId}`, note, runs, coreLessonId: lessonId };
}

const l1 = (text: string): Run => ({ lang: "l1", text });
const en = (text: string): Run => ({ lang: "en", text });

/**
 * Elle yazılmış tipik CANLI hoca cevapları — parçalar, modelin bugün ürettiği
 * biçimde: İngilizce cümle/ifade ayrı `en`, Türkçe düzyazının İÇİNDEKİ tek
 * kelimeler `l1`'in içinde (üretimde inlineEnglish onları ayırmaya çalışır).
 * T06/T07 ve T08/T09: aynı içerik, ikincisi "üslup kuralı"yla yazılmış.
 */
function replySentences(): Sentence[] {
  return [
    { id: "T05", lang: "tr", source: "canlı cevap (şablon övgü)", note: "kısa tek başına Türkçe — Azure'un bilinen hatası", runs: [l1("Tam isabet!")], coreLessonId: "a1-am-is-are" },
    { id: "T06", lang: "tr", source: "canlı cevap (düzeltme)", note: "Türkçe açıklama + tam İngilizce cümle", runs: [l1("Neredeyse! Burada fiil özneye uymalı. Doğrusu şöyle:"), en("She works at night.")], coreLessonId: "a1-am-is-are" },
    { id: "T07", lang: "tr", source: "canlı cevap", note: "EKLİ tek kelimeler (are'ı) — en zor vaka", runs: [l1("Am, is veya are'ı özneye göre seçeriz:"), en("I am, you are, he is.")], coreLessonId: "a1-am-is-are" },
    { id: "T08", lang: "tr", source: "canlı cevap · üslup kuralıyla", note: "T07'nin üslup kuralına göre yazılmışı (ek yok)", runs: [l1("Özneye göre şu üç kelimeden birini seçeriz:"), en("am, is, are."), l1("Mesela:"), en("I am, you are, he is.")], coreLessonId: "a1-am-is-are" },
    { id: "T09", lang: "tr", source: "canlı cevap", note: "EKLİ tek kelimeler (does'u, do'yu)", runs: [l1("Does'u he, she ve it ile kullanırız; do'yu ise I, you, we ve they ile.")], coreLessonId: "a1-do-you-live-here" },
    { id: "T10", lang: "tr", source: "canlı cevap · üslup kuralıyla", note: "T09'un üslup kuralına göre yazılmışı", runs: [l1("Şu üç kişiyle şu kelimeyi kullanırız:"), en("he, she, it: does."), l1("Diğerleriyle ise şunu:"), en("I, you, we, they: do.")], coreLessonId: "a1-do-you-live-here" },
    { id: "T11", lang: "tr", source: "üretim selamlama şablonu (birebir)", note: "uzun İngilizce konu adı + Türkçe ek", runs: [l1("Merhaba Ayşe! Bugün seninle"), en("saying hello and giving your name"), l1("konusunu öğreneceğiz. Başlamaya hazır mısın?")], coreLessonId: "a1-hello-im" },
    { id: "T12", lang: "tr", source: "canlı cevap (düzeltme)", note: "İngilizce ifadeler cümlenin ortasında", runs: [l1("Güzel bir deneme! Sadece küçük bir şey:"), en("I am agree"), l1("değil,"), en("I agree"), l1("demeliyiz. Şimdi bir kez de sen söyle.")], coreLessonId: "a1-am-is-are" },
    { id: "S02", lang: "es", source: "canlı cevap (düzeltme)", note: "İspanyolca açıklama + tam İngilizce cümle", runs: [l1("¡Casi! El verbo tiene que concordar con el sujeto. Lo correcto es:"), en("She works at night.")], coreLessonId: "a1-am-is-are" },
    { id: "S03", lang: "es", source: "canlı cevap (övgü)", note: "kısa tek başına İspanyolca", runs: [l1("¡Exacto!")], coreLessonId: "a1-am-is-are" },
    { id: "S04", lang: "es", source: "canlı cevap", note: "düzyazı içinde tek İngilizce kelimeler", runs: [l1("Usamos does con he, she e it; y do con I, you, we y they.")], coreLessonId: "a1-do-you-live-here" },
  ];
}

async function buildSentences(): Promise<Sentence[]> {
  const pack = [
    await packSentence("T01", "a1-am-is-are", "tr", "p1", "gerçek anlatım (am/is/are)"),
    await packSentence("T02", "a1-am-is-are", "tr", "p2", "gerçek anlatım (kısaltmalar)"),
    await packSentence("T03", "a1-hello-im", "tr", "p1", "gerçek anlatım (my name is)"),
    await packSentence("T04", "a2-have-you-ever-been", "tr", "p1", "gerçek anlatım (present perfect)"),
    await packSentence("S01", "a1-am-is-are", "es", "p1", "gerçek anlatım (am/is/are)"),
  ];
  // Türkçe (asıl dil çifti) önce, sonra İspanyolca kontrol seti
  const all = [...pack, ...replySentences()].sort((a, b) => (a.lang === b.lang ? a.id.localeCompare(b.id) : a.lang === "tr" ? -1 : 1));
  const only = args.sentences?.split(",");
  return all.filter((s) => (!args.lang || s.lang === args.lang) && (!only || only.includes(s.id)));
}

// Üretimle aynı: parçalar akıllı birleşir, "___"/"/" seslendirilebilir hâle gelir (tts/speakable.ts)
const plainOf = (runs: Run[]) => speakableText(joinForSpeech(runs.map((r) => r.text)));

// --- ses yardımcıları -----------------------------------------------------------------

type Audio = { pcm: Int16Array };
type Alignment = "char" | "word" | "none";
interface SynthResult {
  audio: Audio;
  alignment: Alignment;
  ms: number;
  /** hangi uç/yol çalıştı (yedek yollar için) */
  path?: string;
}

/** RIFF içinden 24 kHz mono 16-bit PCM; biçim farklıysa null (afconvert'e düşülür). */
function parseWav(buf: Buffer): Int16Array | null {
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") return null;
  let off = 12;
  let fmt: { channels: number; rate: number; bits: number; format: number } | null = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ") {
      fmt = { format: buf.readUInt16LE(body), channels: buf.readUInt16LE(body + 2), rate: buf.readUInt32LE(body + 4), bits: buf.readUInt16LE(body + 14) };
    } else if (id === "data" && fmt) {
      if (fmt.format !== 1 || fmt.channels !== 1 || fmt.rate !== SAMPLE_RATE || fmt.bits !== 16) return null;
      const end = Math.min(body + size, buf.length);
      const slice = buf.subarray(body, end - ((end - body) % 2));
      return new Int16Array(slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength));
    }
    off = body + size + (size % 2);
  }
  return null;
}

let tmpSeq = 0;
/** Herhangi bir biçimi (mp3/wav) macOS afconvert ile 24 kHz mono 16-bit'e indirir. */
function toPcm(buf: Buffer, ext: "mp3" | "wav"): Int16Array {
  if (ext === "wav") {
    const direct = parseWav(buf);
    if (direct) return direct;
  }
  const n = ++tmpSeq;
  const input = join(OUT, "raw", `in-${n}.${ext}`);
  const output = join(OUT, "raw", `out-${n}.wav`);
  writeFileSync(input, buf);
  execFileSync("afconvert", ["-f", "WAVE", "-d", `LEI16@${SAMPLE_RATE}`, "-c", "1", input, output]);
  const pcm = parseWav(readFileSync(output));
  if (!pcm) throw new Error("afconvert çıktısı okunamadı");
  return pcm;
}

const rawPcm = (buf: Buffer): Int16Array => {
  const even = buf.subarray(0, buf.length - (buf.length % 2));
  return new Int16Array(even.buffer.slice(even.byteOffset, even.byteOffset + even.byteLength));
};

function silence(ms: number): Int16Array {
  return new Int16Array(Math.round((SAMPLE_RATE * ms) / 1000));
}

function concat(parts: Int16Array[]): Int16Array {
  const out = new Int16Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** RMS'i -20 dBFS'e çek, tepeyi 0,95'te tut — sağlayıcılar arası ses düzeyi farkını siler. */
function normalize(pcm: Int16Array): Int16Array {
  let sum = 0;
  let peak = 0;
  for (const s of pcm) {
    const v = s / 32768;
    sum += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  if (!pcm.length || peak === 0) return pcm;
  const rms = Math.sqrt(sum / pcm.length);
  const gain = Math.min(0.1 / rms, 0.95 / peak);
  const out = new Int16Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) out[i] = Math.max(-32768, Math.min(32767, Math.round(pcm[i]! * gain)));
  return out;
}

function wavFile(pcm: Int16Array): Buffer {
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0, "ascii");
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8, "ascii");
  h.write("fmt ", 12, "ascii");
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SAMPLE_RATE, 24);
  h.writeUInt32LE(SAMPLE_RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36, "ascii");
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

async function http(url: string, init: RequestInit, label: string): Promise<Response> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, init);
    if (res.status !== 429 && res.status < 500) return res;
    if (attempt === 3) return res;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    console.warn(`  ↻ ${label}: ${res.status}, yeniden deneniyor`);
  }
  throw new Error("ulaşılamaz");
}

async function failText(res: Response): Promise<string> {
  return `${res.status} ${(await res.text()).slice(0, 220).replace(/\s+/g, " ")}`;
}

// --- Azure ---------------------------------------------------------------------------------

const L1_LOCALE: Record<L1, string> = { tr: "tr-TR", es: "es-ES" };

async function azureSsml(ssml: string): Promise<SynthResult> {
  const config = sdk.SpeechConfig.fromSubscription(KEYS.azure!, KEYS.azureRegion!);
  config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
  config.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestWordBoundary, "true");
  const synth = new sdk.SpeechSynthesizer(config, null as unknown as sdk.AudioConfig);
  let words = 0;
  synth.wordBoundary = () => {
    words++;
  };
  const t0 = performance.now();
  try {
    const result = await new Promise<sdk.SpeechSynthesisResult>((ok, fail) => synth.speakSsmlAsync(ssml, ok, (e) => fail(new Error(String(e)))));
    if (result.reason !== sdk.ResultReason.SynthesizingAudioCompleted) {
      throw new Error(`Azure: ${(result.errorDetails ?? String(result.reason)).slice(0, 220)}`);
    }
    const ms = performance.now() - t0;
    return { audio: { pcm: toPcm(Buffer.from(result.audioData), "wav") }, alignment: words > 0 ? "word" : "none", ms };
  } finally {
    synth.close();
  }
}

/** Etiketsiz tek SSML: kök dil ana dil, cümle bölünmeden. */
function plainSsml(text: string, voice: string, rootLocale: string): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${rootLocale}"><voice name="${escapeXml(voice)}">${escapeXml(text).replace(/_{2,}/g, '<break strength="medium"/>')}</voice></speak>`;
}

/** Üretim yolu: inlineEnglish rafinesi + her grup <lang> + kök L1 + üretim hızı. */
async function azureProduction(s: Sentence, voice: string): Promise<SynthResult> {
  const { core } = await publishedCore(s.coreLessonId);
  const refined = refineRunsForInlineEnglish(s.runs, core, getChrome(s.lang)) as TextRun[];
  const coded = refined.map((r) => ({ languageCode: r.lang === "en" ? "en-US" : L1_LOCALE[s.lang], text: speakableText(r.text) }));
  return azureSsml(buildSsml(coded, voice));
}

// --- ElevenLabs ------------------------------------------------------------------------------

async function elevenTts(text: string, model: string, languageCode?: string): Promise<SynthResult> {
  const body = JSON.stringify({ text, model_id: model, ...(languageCode ? { language_code: languageCode } : {}) });
  const headers = { "xi-api-key": KEYS.eleven!, "content-type": "application/json" };
  const base = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(KEYS.elevenVoice!)}`;
  const t0 = performance.now();
  const res = await http(`${base}/with-timestamps?output_format=pcm_24000`, { method: "POST", headers, body }, `eleven ${model}`);
  if (res.ok) {
    const data = (await res.json()) as { audio_base64: string; alignment?: { characters?: string[] } | null };
    const ms = performance.now() - t0;
    return { audio: { pcm: rawPcm(Buffer.from(data.audio_base64, "base64")) }, alignment: data.alignment?.characters?.length ? "char" : "none", ms, path: "tts/with-timestamps" };
  }
  const firstErr = await failText(res);
  // Zaman damgalı uç bu modeli reddederse düz TTS ucu (zaman damgası yok)
  const t1 = performance.now();
  const plain = await http(`${base}?output_format=pcm_24000`, { method: "POST", headers, body }, `eleven ${model} düz`);
  if (!plain.ok) throw new Error(`with-timestamps: ${firstErr} · düz: ${await failText(plain)}`);
  const buf = Buffer.from(await plain.arrayBuffer());
  return { audio: { pcm: rawPcm(buf) }, alignment: "none", ms: performance.now() - t1, path: `tts (with-timestamps reddetti: ${firstErr.slice(0, 60)})` };
}

/** Eleven v4 dokümana göre Text-to-Dialogue üzerinden; önce akışlı zaman damgalı uç. */
async function elevenDialogue(text: string, model: string): Promise<SynthResult> {
  const headers = { "xi-api-key": KEYS.eleven!, "content-type": "application/json" };
  const body = JSON.stringify({ inputs: [{ text, voice_id: KEYS.elevenVoice! }], model_id: model });
  const t0 = performance.now();
  const res = await http(`https://api.elevenlabs.io/v1/text-to-dialogue/stream/with-timestamps?output_format=pcm_24000`, { method: "POST", headers, body }, `eleven ${model} dialogue`);
  if (res.ok) {
    const raw = await res.text();
    const ms = performance.now() - t0;
    // Çerçeveleme dokümanda net değil: tek JSON, JSON dizisi ya da satır başına JSON
    let chunks: Array<{ audio_base64?: string; alignment?: { characters?: string[] } | null }> = [];
    try {
      const parsed = JSON.parse(raw);
      chunks = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      chunks = raw
        .split(/\r?\n/)
        .map((l) => l.replace(/^data:\s*/, "").trim())
        .filter((l) => l.startsWith("{"))
        .map((l) => JSON.parse(l));
    }
    const audio = Buffer.concat(chunks.filter((c) => c.audio_base64).map((c) => Buffer.from(c.audio_base64!, "base64")));
    if (!audio.length) throw new Error(`dialogue akışında ses yok (${raw.slice(0, 120)})`);
    const hasAlign = chunks.some((c) => c.alignment?.characters?.length);
    return { audio: { pcm: rawPcm(audio) }, alignment: hasAlign ? "char" : "none", ms, path: "text-to-dialogue/stream/with-timestamps" };
  }
  const firstErr = await failText(res);
  const t1 = performance.now();
  const conv = await http(`https://api.elevenlabs.io/v1/text-to-dialogue?output_format=pcm_24000`, { method: "POST", headers, body }, `eleven ${model} dialogue convert`);
  if (!conv.ok) throw new Error(`dialogue stream: ${firstErr} · convert: ${await failText(conv)}`);
  return { audio: { pcm: rawPcm(Buffer.from(await conv.arrayBuffer())) }, alignment: "none", ms: performance.now() - t1, path: "text-to-dialogue (zaman damgası yok)" };
}

/** Üretim yolu: ardışık aynı dilli parçalar birleşir, her grup language_code ile ayrı klip. */
async function elevenProductionSplit(s: Sentence): Promise<SynthResult> {
  const groups: Run[] = [];
  for (const r of s.runs) {
    const prev = groups[groups.length - 1];
    if (prev && prev.lang === r.lang) prev.text += ` ${r.text}`;
    else groups.push({ ...r });
  }
  const parts: Int16Array[] = [];
  let ms = 0;
  let aligned = true;
  for (const [i, g] of groups.entries()) {
    const out = await elevenTts(g.text, "eleven_flash_v2_5", g.lang === "en" ? "en" : s.lang);
    ms += out.ms;
    aligned &&= out.alignment === "char";
    if (i > 0) parts.push(silence(120)); // istemci klipleri art arda çalarken oluşan kısa boşluk
    parts.push(out.audio.pcm);
  }
  return { audio: { pcm: concat(parts) }, alignment: aligned ? "char" : "none", ms, path: `${groups.length} klip` };
}

// --- Inworld ------------------------------------------------------------------------------------

async function inworld(s: Sentence, mode: "candidates" | "tags"): Promise<SynthResult> {
  const l1Locale = L1_LOCALE[s.lang];
  let text = plainOf(s.runs);
  if (mode === "tags") {
    const { core } = await publishedCore(s.coreLessonId);
    const refined = refineRunsForInlineEnglish(s.runs, core, getChrome(s.lang)) as TextRun[];
    text = refined
      .map((r) => `<lang lang="${r.lang === "en" ? "en-US" : l1Locale}">${speakableText(r.text)}</lang>`)
      .join(" ");
  }
  const t0 = performance.now();
  const res = await http(
    "https://api.inworld.ai/tts/v1/voice",
    {
      method: "POST",
      headers: { authorization: `Basic ${KEYS.inworld!}`, "content-type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId: KEYS.inworldVoice,
        modelId: "inworld-tts-2",
        audioConfig: { audioEncoding: "MP3" },
        timestampType: "CHARACTER",
        languageSettings: { candidates: [l1Locale, "en-US"] },
      }),
    },
    "inworld",
  );
  if (!res.ok) throw new Error(`Inworld ${await failText(res)}`);
  const data = (await res.json()) as { audioContent: string; timestampInfo?: { characterAlignment?: { characters?: string[] } } };
  const ms = performance.now() - t0;
  return {
    audio: { pcm: toPcm(Buffer.from(data.audioContent, "base64"), "mp3") },
    alignment: data.timestampInfo?.characterAlignment?.characters?.length ? "char" : "none",
    ms,
  };
}

// --- Gemini ---------------------------------------------------------------------------------------

/** Cevapta ilk ses verisini ara (generateContent: inlineData; interactions: type=audio). */
function findAudio(node: unknown): { data: string; mime: string } | null {
  if (!node || typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  const inline = (o.inlineData ?? o.inline_data) as Record<string, unknown> | undefined;
  if (inline && typeof inline.data === "string") return { data: inline.data, mime: String(inline.mimeType ?? inline.mime_type ?? "") };
  if (typeof o.data === "string" && o.data.length > 1000 && (o.type === "audio" || /audio/.test(String(o.mime_type ?? o.mimeType ?? "")))) {
    return { data: o.data, mime: String(o.mime_type ?? o.mimeType ?? "audio/wav") };
  }
  for (const v of Object.values(o)) {
    const hit = Array.isArray(v) ? v.map(findAudio).find(Boolean) ?? null : findAudio(v);
    if (hit) return hit;
  }
  return null;
}

function geminiPcm(hit: { data: string; mime: string }): Int16Array {
  const buf = Buffer.from(hit.data, "base64");
  if (buf.toString("ascii", 0, 4) === "RIFF") return toPcm(buf, "wav");
  const rate = Number(/rate=(\d+)/.exec(hit.mime)?.[1] ?? SAMPLE_RATE);
  if (rate !== SAMPLE_RATE) throw new Error(`beklenmeyen örnekleme hızı ${rate}`);
  return rawPcm(buf); // audio/L16 — 16-bit little-endian PCM
}

async function gemini(s: Sentence, model: string): Promise<SynthResult> {
  const text = plainOf(s.runs);
  const headers = { "x-goog-api-key": KEYS.gemini!, "content-type": "application/json" };
  const t0 = performance.now();
  const res = await http(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } },
      }),
    },
    "gemini",
  );
  if (res.ok) {
    const hit = findAudio(await res.json());
    const ms = performance.now() - t0;
    if (hit) return { audio: { pcm: geminiPcm(hit) }, alignment: "none", ms, path: "generateContent" };
  }
  const firstErr = res.ok ? "ses yok" : await failText(res);
  const t1 = performance.now();
  const alt = await http(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        input: [{ type: "user_input", content: [{ type: "text", text }] }],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice: "Kore" }] },
      }),
    },
    "gemini interactions",
  );
  if (!alt.ok) throw new Error(`generateContent: ${firstErr} · interactions: ${await failText(alt)}`);
  const hit = findAudio(await alt.json());
  if (!hit) throw new Error("interactions cevabında ses yok");
  return { audio: { pcm: geminiPcm(hit) }, alignment: "none", ms: performance.now() - t1, path: "interactions" };
}

// --- varyantlar ---------------------------------------------------------------------------------

interface Variant {
  id: string;
  provider: "azure" | "elevenlabs" | "inworld" | "gemini";
  label: string;
  available: boolean;
  run: (s: Sentence) => Promise<SynthResult>;
}

const AZURE_MAI: Record<L1, string> = { tr: "tr-TR-Elif:MAI-Voice-2.1", es: "es-ES-Marta:MAI-Voice-2.1" };
const AVA = "en-US-AvaMultilingualNeural";
const OMNI = "en-us-ava:DragonHDOmniLatestNeural";

const VARIANTS: Variant[] = [
  { id: "azure-ava-uretim", provider: "azure", label: `Azure ${AVA} · ÜRETİM YOLU (inlineEnglish + <lang> + hız)`, available: !!KEYS.azure, run: (s) => azureProduction(s, AVA) },
  { id: "azure-ava-etiketsiz", provider: "azure", label: `Azure ${AVA} · tam cümle, etiketsiz`, available: !!KEYS.azure, run: (s) => azureSsml(plainSsml(plainOf(s.runs), AVA, L1_LOCALE[s.lang])) },
  { id: "azure-mai21-anadil", provider: "azure", label: "Azure MAI-Voice-2.1 anadil sesi (tr: Elif, es: Marta) · tam cümle", available: !!KEYS.azure, run: (s) => azureSsml(plainSsml(plainOf(s.runs), AZURE_MAI[s.lang], L1_LOCALE[s.lang])) },
  { id: "azure-dragonhd-omni", provider: "azure", label: `Azure ${OMNI} · tam cümle (otomatik dil algılama)`, available: !!KEYS.azure, run: (s) => azureSsml(plainSsml(plainOf(s.runs), OMNI, L1_LOCALE[s.lang])) },
  { id: "eleven-flash-uretim", provider: "elevenlabs", label: "ElevenLabs Flash v2.5 · ESKİ üretim yolu (dil başına klip + language_code; 4 Kas'ta tam cümleye geçildi)", available: !!KEYS.eleven && !!KEYS.elevenVoice, run: elevenProductionSplit },
  { id: "eleven-flash-tam", provider: "elevenlabs", label: "ElevenLabs Flash v2.5 · tam cümle, dil zorlamasız", available: !!KEYS.eleven && !!KEYS.elevenVoice, run: (s) => elevenTts(plainOf(s.runs), "eleven_flash_v2_5") },
  { id: "eleven-multilingual-v2", provider: "elevenlabs", label: "ElevenLabs Multilingual v2 · tam cümle", available: !!KEYS.eleven && !!KEYS.elevenVoice, run: (s) => elevenTts(plainOf(s.runs), "eleven_multilingual_v2") },
  { id: "eleven-v3", provider: "elevenlabs", label: "ElevenLabs Eleven v3 · tam cümle", available: !!KEYS.eleven && !!KEYS.elevenVoice, run: (s) => elevenTts(plainOf(s.runs), "eleven_v3") },
  { id: "eleven-v4", provider: "elevenlabs", label: "ElevenLabs Eleven v4 · tam cümle (Text-to-Dialogue)", available: !!KEYS.eleven && !!KEYS.elevenVoice, run: (s) => elevenDialogue(plainOf(s.runs), "eleven_v4") },
  { id: "inworld-tts2-aday", provider: "inworld", label: "Inworld TTS-2 · tam cümle + languageSettings.candidates", available: !!KEYS.inworld && !!KEYS.inworldVoice, run: (s) => inworld(s, "candidates") },
  { id: "inworld-tts2-etiket", provider: "inworld", label: "Inworld TTS-2 · <lang> etiketli parçalar + candidates", available: !!KEYS.inworld && !!KEYS.inworldVoice, run: (s) => inworld(s, "tags") },
  { id: "gemini-3.8-flash-tts", provider: "gemini", label: "Gemini 3.8 Flash TTS (ses: Kore) · tam cümle", available: !!KEYS.gemini, run: (s) => gemini(s, "gemini-3.8-flash-tts") },
];

// --- koşum ----------------------------------------------------------------------------------------

interface Outcome {
  variant: string;
  sentence: string;
  ok: boolean;
  ms?: number;
  alignment?: Alignment;
  path?: string;
  error?: string;
  pcm?: Int16Array;
}

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
};

const html = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function main() {
  mkdirSync(join(OUT, "raw"), { recursive: true });
  mkdirSync(join(OUT, "clips"), { recursive: true });
  mkdirSync(join(OUT, "reels"), { recursive: true });

  const sentences = await buildSentences();
  const variants = VARIANTS.filter((v) => v.available && (!args.only || v.id.includes(args.only)));
  const skipped = VARIANTS.filter((v) => !v.available).map((v) => v.id);
  console.log(`cümle: ${sentences.length} · varyant: ${variants.length}${skipped.length ? ` (anahtarsız atlanan: ${skipped.join(", ")})` : ""}`);
  console.log(`çıktı: ${OUT}`);

  // Sağlayıcılar paralel, sağlayıcı içi sıralı (eşzamanlı istek limitleri)
  const outcomes: Outcome[] = [];
  const byProvider = new Map<string, Variant[]>();
  for (const v of variants) byProvider.set(v.provider, [...(byProvider.get(v.provider) ?? []), v]);
  await Promise.all(
    [...byProvider.values()].map(async (vs) => {
      for (const v of vs) {
        for (const s of sentences) {
          try {
            const r = await v.run(s);
            outcomes.push({ variant: v.id, sentence: s.id, ok: true, ms: r.ms, alignment: r.alignment, path: r.path, pcm: normalize(r.audio.pcm) });
            process.stdout.write(".");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            outcomes.push({ variant: v.id, sentence: s.id, ok: false, error: msg });
            process.stdout.write("x");
          }
        }
      }
    }),
  );
  process.stdout.write("\n");

  // Kör harfler: en az bir klibi olan varyantlar
  const produced = variants.filter((v) => outcomes.some((o) => o.variant === v.id && o.ok));
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const codeOf = new Map(shuffle(produced).map((v, i) => [v.id, letters[i]!]));
  const langs = [...new Set(sentences.map((s) => s.lang))];

  for (const o of outcomes) {
    if (!o.ok || !o.pcm) continue;
    writeFileSync(join(OUT, "clips", `${o.sentence}-${codeOf.get(o.variant)}.wav`), wavFile(o.pcm));
  }
  // Makara: ses başına, dil başına tüm cümleler art arda (0,8 sn ara)
  for (const v of produced) {
    for (const lang of langs) {
      const parts: Int16Array[] = [];
      for (const s of sentences.filter((x) => x.lang === lang)) {
        const o = outcomes.find((x) => x.variant === v.id && x.sentence === s.id && x.ok);
        if (!o?.pcm) continue;
        if (parts.length) parts.push(silence(800));
        parts.push(o.pcm);
      }
      if (parts.length) writeFileSync(join(OUT, "reels", `${codeOf.get(v.id)}-${lang}.wav`), wavFile(concat(parts)));
    }
  }

  // --- key.json + results.md ---
  const key = produced.map((v) => ({ code: codeOf.get(v.id), id: v.id, label: v.label })).sort((a, b) => a.code!.localeCompare(b.code!));
  writeFileSync(join(OUT, "key.json"), JSON.stringify(key, null, 2));

  const rows = variants.map((v) => {
    const os = outcomes.filter((o) => o.variant === v.id);
    const ok = os.filter((o) => o.ok);
    const aligns = [...new Set(ok.map((o) => o.alignment))].join("/") || "—";
    const paths = [...new Set(ok.map((o) => o.path).filter(Boolean))].join("; ");
    const errs = [...new Set(os.filter((o) => !o.ok).map((o) => o.error))].slice(0, 2).join(" | ");
    return `| ${codeOf.get(v.id) ?? "—"} | ${v.label} | ${ok.length}/${os.length} | ${Number.isNaN(median(ok.map((o) => o.ms!))) ? "—" : Math.round(median(ok.map((o) => o.ms!)))} ms | ${aligns} | ${[paths, errs].filter(Boolean).join(" · ").replace(/\|/g, "/")} |`;
  });
  const md = [
    `# Ses kulak testi — ölçümler (${STAMP})`,
    ``,
    `> Önce \`listen.html\` ile KÖR dinleyin ve puanlayın; bu dosya harflerin hangi sese ait olduğunu açık eder.`,
    ``,
    `| Harf | Varyant | Başarılı | Medyan süre (toplam, akışsız) | Zaman damgası | Not / hata |`,
    `|---|---|---|---|---|---|`,
    ...rows,
    ``,
    `## Cümleler`,
    ...sentences.map((s) => `- **${s.id}** (${s.lang}, ${s.source} — ${s.note}): ${plainOf(s.runs)}`),
    ``,
    `Notlar: süreler akışsız uçlarda TOPLAM süredir (TTFB değil); üretim tabanı Azure'da üretim hızıyla (-10%), diğerleri doğal hızda okundu. Tüm klipler 24 kHz mono'ya çevrilip aynı RMS düzeyine getirildi.`,
  ].join("\n");
  writeFileSync(join(OUT, "results.md"), md);

  // --- listen.html ---
  const codes = key.map((k) => k.code!);
  const keyB64 = Buffer.from(JSON.stringify(key)).toString("base64");
  const reelRows = codes
    .map((c) => {
      const players = langs
        .map((l) => (existsSync(join(OUT, "reels", `${c}-${l}.wav`)) ? `<div class="reel"><span class="tag">${l.toUpperCase()}</span><audio controls preload="none" src="reels/${c}-${l}.wav"></audio></div>` : ""))
        .join("");
      const axes = ["L1 doğallığı", "İngilizce doğallığı", "Geçiş akıcılığı", "Ses kimliği"]
        .map((a, i) => `<label>${a}<select data-code="${c}" data-axis="${i}"><option value="">–</option>${[1, 2, 3, 4, 5].map((n) => `<option>${n}</option>`).join("")}</select></label>`)
        .join("");
      return `<section class="card"><h3>Ses ${c}</h3><div class="players">${players}</div><div class="axes">${axes}</div><input class="note" data-code="${c}" placeholder="Not (ör. T07'de 'are' Türkçe okundu)"></section>`;
    })
    .join("\n");
  const sentenceRows = sentences
    .map((s) => {
      const players = codes
        .map((c) => (existsSync(join(OUT, "clips", `${s.id}-${c}.wav`)) ? `<div class="clip"><span class="tag">${c}</span><audio controls preload="none" src="clips/${s.id}-${c}.wav"></audio></div>` : ""))
        .join("");
      return `<section class="card"><h3>${s.id} <small>${html(s.source)} · ${html(s.note)}</small></h3><p class="text">${html(plainOf(s.runs))}</p><div class="grid">${players}</div></section>`;
    })
    .join("\n");

  const page = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ses kulak testi</title>
<style>
:root{--bg:#faf8f6;--card:#fff;--fg:#1d1a17;--muted:#6f655c;--border:#e6dfd8;--brand:#b94d17}
@media (prefers-color-scheme:dark){:root{--bg:#1a1613;--card:#241e1a;--fg:#f3ece6;--muted:#a89a8e;--border:#3a312a;--brand:#ee8146}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 80px}h1{font-size:24px;margin:0 0 4px}h2{margin:32px 0 12px;font-size:18px}
.lead{color:var(--muted);margin:0 0 16px}.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin:10px 0}
.card h3{margin:0 0 8px;font-size:16px}.card h3 small{color:var(--muted);font-weight:400;font-size:13px}.text{margin:0 0 10px}
.players,.grid{display:flex;flex-wrap:wrap;gap:8px 16px}.reel,.clip{display:flex;align-items:center;gap:6px}
.tag{display:inline-block;min-width:26px;text-align:center;font-weight:700;color:var(--brand)}audio{height:32px;max-width:260px}
.axes{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:10px}.axes label{display:flex;gap:6px;align-items:center;color:var(--muted);font-size:13px}
select,input.note,button{font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:4px 8px}
input.note{width:100%;margin-top:8px}button{cursor:pointer;padding:8px 14px}.bar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
#key{display:none;white-space:pre-wrap;font-size:13px}
</style></head><body><main>
<h1>Ses kulak testi</h1>
<p class="lead">${sentences.length} cümle · ${codes.length} ses · harfler rastgele. Önce her sesin makarasını dinleyip dört eksende 1–5 puan verin (5 = anadil gibi). Sonra zor cümleleri (T07, T09, T11, T12) aşağıda cümle cümle karşılaştırın. Puanlar bu tarayıcıda saklanır; bitince "Puanları indir" ile JSON alın. Anahtarı en son açın.</p>
<div class="bar"><button id="dl">Puanları indir (JSON)</button><button id="reveal">Anahtarı göster</button></div>
<pre id="key" class="card"></pre>
<h2>1 · Ses başına makara</h2>
${reelRows}
<h2>2 · Cümle cümle</h2>
${sentenceRows}
</main>
<script>
const KEY_B64=${JSON.stringify(keyB64)};const STORE="glotmate-bakeoff-${STAMP}";
let state={};try{state=JSON.parse(localStorage.getItem(STORE)||"{}")}catch(e){}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){}};
document.querySelectorAll("select[data-code]").forEach(el=>{const k=el.dataset.code+":"+el.dataset.axis;if(state[k])el.value=state[k];el.addEventListener("change",()=>{state[k]=el.value;save()})});
document.querySelectorAll("input.note").forEach(el=>{const k=el.dataset.code+":note";if(state[k])el.value=state[k];el.addEventListener("input",()=>{state[k]=el.value;save()})});
document.getElementById("dl").onclick=()=>{const b=new Blob([JSON.stringify({run:${JSON.stringify(STAMP)},ratings:state},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="bakeoff-puanlar.json";a.click()};
document.getElementById("reveal").onclick=()=>{if(!confirm("Anahtar harflerin hangi sese ait olduğunu gösterir. Puanlamayı bitirdiniz mi?"))return;const k=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(KEY_B64),c=>c.charCodeAt(0))));const el=document.getElementById("key");el.textContent=k.map(x=>x.code+" → "+x.label).join("\\n");el.style.display="block"};
document.addEventListener("play",e=>{document.querySelectorAll("audio").forEach(a=>{if(a!==e.target)a.pause()})},true);
</script></body></html>`;
  writeFileSync(join(OUT, "listen.html"), page);

  console.log(md.split("\n## Cümleler")[0]);
  console.log(`\ndinleme sayfası: ${join(OUT, "listen.html")}`);
}

try {
  await main();
} finally {
  await sql.end();
}
