/**
 * TTS gateway uçtan uca duman testi — GERÇEK DB + GERÇEK sağlayıcı çağrısı
 * (birkaç karakter maliyet). Aktif ayarı okur, sağlayıcıyı çözer, kısa klip
 * üretir, alignment sözleşmesini ve önbelleği doğrular.
 *   set -a; source .env; set +a; npx tsx scripts/tts-smoke.ts
 */
import { adminTtsSettingsResponseSchema } from "@glotmate/contracts";
import type { LessonCore } from "@glotmate/contracts";
import { sql } from "../src/db/client.js";
import { buildSsml } from "../src/modules/tts/azure.js";
import { refineRunsForInlineEnglish } from "../src/modules/tts/inlineEnglish.js";
import { getChrome } from "../src/i18n/index.js";
import {
  buildTtsSettingsResponse,
  PROVIDERS,
  resolveActiveTts,
  resolveLanguage,
  synthesizeClip,
  synthesizeRunsToClips,
  type ActiveTts,
} from "../src/modules/tts/index.js";

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

console.log("configured:", { elevenlabs: PROVIDERS.elevenlabs.configured(), inworld: PROVIDERS.inworld.configured(), azure: PROVIDERS.azure.configured() });

// 5) Azure yapılandırılmışsa: TR+EN karışık parçalar → TEK klip, alignment dolu
if (PROVIDERS.azure.configured()) {
  const az: ActiveTts = { provider: PROVIDERS.azure, voiceId: PROVIDERS.azure.defaultVoiceId()!, modelId: "neural" };
  const tr = await resolveLanguage(az, "tr");
  const en = await resolveLanguage(az, "en");
  console.log("azure locale:", { tr, en });
  const t2 = Date.now();
  const clips = await synthesizeRunsToClips(az, [
    { languageCode: tr!, text: "Bugün şu cümleyi öğreneceğiz:" },
    { languageCode: en!, text: "What have you been doing lately?" },
    { languageCode: tr!, text: "Bu cümle, son zamanlarda neler yapıyorsun anlamına geliyor." },
  ]);
  const c = clips[0]!;
  console.log("azure:", { ms: Date.now() - t2, clips: clips.length, audioBytes: Buffer.from(c.audioBase64, "base64").length,
    alignment: c.alignment ? { n: c.alignment.characters.length, text: c.alignment.characters.join("").slice(0, 60), lastEnd: c.alignment.character_end_times_seconds.at(-1) } : null });
  if (clips.length !== 1) throw new Error("Azure tek klip üretmedi");
  if (!c.alignment) throw new Error("Azure alignment boş — wordBoundary olayları gelmedi");

  // 6) Satır içi İngilizce: L1 cümle içinde am/is/are ve tırnaklı 'Yes, I am' → <lang> parçaları, tek klip
  const core = {
    lecture: { beats: [{ kind: "teach", id: "t", introIntent: "x", points: [{ id: "p", formEn: "am / is / are", claimsEn: ["x"], examples: [{ id: "e", textEn: "Yes, I am." }, { id: "e2", textEn: "He is a teacher. She is a nurse. It is red. You are here. We are friends. They are at home." }] }] }] },
    practice: { mustUse: ["do", "does"], minTargetUses: 2, successCriteria: "x", maxTurns: 8 },
  } as unknown as LessonCore;
  const refined = refineRunsForInlineEnglish(
    [{ lang: "l1" as const, text: "Am, I ile kullanılır; is, he, she ve it ile; are ise you, we ve they ile kullanılır. Kısa formlar: I'm, he's, we're." }],
    core,
    getChrome("tr"),
  );
  const coded = refined.map((r) => ({ languageCode: r.lang === "en" ? en! : tr!, text: r.text }));
  console.log("ssml:", buildSsml(coded, az.voiceId));
  const t3 = Date.now();
  const inline = await synthesizeRunsToClips(az, coded);
  console.log("azure inline:", { ms: Date.now() - t3, clips: inline.length, audioBytes: Buffer.from(inline[0]!.audioBase64, "base64").length,
    alignedText: inline[0]!.alignment?.characters.join("").slice(0, 90) });
  if (inline.length !== 1 || !inline[0]!.alignment) throw new Error("Azure satır içi İngilizce klibi bozuk");

  // 7a) Tek başına kısa L1 övgüsü — etiketsiz gidince İngilizce aksan alıyordu
  const praise = await synthesizeRunsToClips(az, [{ languageCode: tr!, text: "Tam isabet!" }]);
  console.log("azure praise:", { clips: praise.length, audioBytes: Buffer.from(praise[0]!.audioBase64, "base64").length, ssml: buildSsml([{ languageCode: tr!, text: "Tam isabet!" }], az.voiceId) });

  // 7) Yönerge + alıştırma maddesi: İngilizce açık etiketli, ___ durak
  const exRuns = [{ languageCode: tr!, text: "Boşluğu doldur:" }, { languageCode: en!, text: "My brother ___ a doctor." }];
  console.log("ssml:", buildSsml(exRuns, az.voiceId));
  const ex = await synthesizeRunsToClips(az, exRuns);
  console.log("azure exercise:", { clips: ex.length, audioBytes: Buffer.from(ex[0]!.audioBase64, "base64").length, alignedText: ex[0]!.alignment?.characters.join("") });
}
await sql.end();
