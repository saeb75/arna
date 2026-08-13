/**
 * TTS SPIKE — dikey dilimin ses yarısı.
 *
 *   set -a; source .env; set +a; npx tsx scripts/tts-spike.ts
 *
 * Gerçek üretilmiş dil paketlerinden (tr/ar/zh-hans) anlatım parçalarını alır,
 * her parçayı KENDİ language_code'uyla ElevenLabs'ten okutur, klipleri birleştirip
 * dil başına bir mp3 yazar. Karar insan kulağıyla verilir: ana-dil açıklama +
 * İngilizce örnek aynı seste doğal mı?
 */
import { writeFileSync } from "node:fs";
import { eq, and } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonCores, lessonLocales } from "../src/db/schema.js";
import type { LessonCore, LessonLocalePack } from "@arna/contracts";

const VOICE = process.env.ELEVENLABS_VOICE_ID!;
const KEY = process.env.ELEVENLABS_API_KEY!;
/** ElevenLabs flash v2.5 ISO-639-1 kodları; zh-hans → zh */
const TTS_LANG: Record<string, string> = { tr: "tr", ar: "ar", "zh-hans": "zh" };

async function clip(text: string, languageCode: string): Promise<Buffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "content-type": "application/json" },
      body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", language_code: languageCode }),
    },
  );
  if (!res.ok) throw new Error(`TTS ${languageCode}: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// A1 dersinin çekirdeği + üç dil paketi
const [coreRow] = await db
  .select()
  .from(lessonCores)
  .where(eq(lessonCores.catalogLessonId, "a1-she-works-at-night"))
  .limit(1);
if (!coreRow?.core) throw new Error("Önce slice-generate koşulmalı");
const core = coreRow.core as LessonCore;

const teach = core.lecture.beats.find((b) => b.kind === "teach");
const point = teach?.kind === "teach" ? teach.points[0]! : null;
if (!point) throw new Error("teach point yok");

for (const lang of ["tr", "ar", "zh-hans"]) {
  const [row] = await db
    .select()
    .from(lessonLocales)
    .where(and(eq(lessonLocales.coreId, coreRow.id), eq(lessonLocales.language, lang), eq(lessonLocales.status, "ready")))
    .limit(1);
  if (!row?.pack) {
    console.log(`⏭  ${lang}: paket yok`);
    continue;
  }
  const pack = row.pack as LessonLocalePack;
  const runs = pack.teachPoints[point.id]?.runs ?? [];

  // core_ref'leri çöz → [dil, metin] klip listesi
  const refText = new Map<string, string>([[point.id, point.formEn], ...point.examples.map((e) => [e.id, e.textEn] as [string, string])]);
  const segments: Array<{ lang: string; text: string }> = [];
  for (const r of runs) {
    if (r.kind === "l1") segments.push({ lang: TTS_LANG[lang]!, text: r.text });
    else {
      const t = refText.get(r.refId);
      if (t) segments.push({ lang: "en", text: t });
    }
  }

  console.log(`\n${lang} — ${segments.length} parça:`);
  for (const s of segments) console.log(`  [${s.lang}] ${s.text.slice(0, 80)}`);

  const t0 = Date.now();
  const clips: Buffer[] = [];
  for (const s of segments) clips.push(await clip(s.text, s.lang));
  const out = `/tmp/tts-mixed-${lang}.mp3`;
  writeFileSync(out, Buffer.concat(clips));
  console.log(`  → ${out} (${((Date.now() - t0) / 1000).toFixed(1)} sn, ${clips.length} klip)`);
}

await sql.end();
