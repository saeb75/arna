/**
 * YAYINLI ÇEKİRDEKLERİ REPO KAYNAĞINA ÇEVİRİR. LLM ÇAĞRISI YOK.
 *
 *   set -a; source .env; set +a; npx tsx scripts/export-authored.ts --level B1 [--out scripts/authored/b1-gen.ts]
 *
 * NEDEN: B1, yazarlık kararından ÖNCE LLM'e üretildi ve içeriği yalnızca DB'de
 * yaşıyor. Sonucu somut: A1'de bir hata bulunca dosyayı düzeltip yeniden yazıyoruz,
 * B1'de ise her düzeltme için ayrı bir yama script'i gerekiyor (patch-b1-review.ts,
 * patch-b1-review2.ts, patch-open-rubrics.ts). Ayrıca DB sıfırlanırsa A1/A2 iki
 * komutla geri gelir, B1 gelmez.
 *
 * KAYIPSIZLIK KAPISI: her ders için üretilen `Authored` kaydı `buildCore`dan
 * geçirilip DB'deki çekirdekle KANONİK olarak karşılaştırılır (Postgres jsonb
 * anahtar sırasını değiştirdiği için düz stringify yanıltır). Fark varsa ders
 * raporlanır ve dosyaya yine yazılır — ama farkın ne olduğunu bilerek.
 */
import { writeFileSync } from "node:fs";
import { and, asc, eq } from "drizzle-orm";
import { SCENE_FORMAT, TRACKS, type LessonCore, type SceneSet } from "@glotmate/contracts";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonSceneSets } from "../src/db/schema.js";
import { buildCore, buildScenes, type Authored, type Ex, type Q, type Sc } from "./authored/dsl.js";

const args = process.argv.slice(2);
const level = args[args.indexOf("--level") + 1];
if (!level || level.startsWith("--")) {
  console.error("--level zorunlu (ör. --level B1)");
  process.exit(1);
}
const outPath = args.includes("--out") ? args[args.indexOf("--out") + 1]! : `scripts/authored/${level.toLowerCase()}.ts`;

const canonical = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]),
    );
  }
  return v;
};
const canon = (v: unknown) => JSON.stringify(canonical(v));

const rows = await db
  .select({ cat: catalogLessons, core: lessonCores, scenes: lessonSceneSets })
  .from(catalogLessons)
  .innerJoin(lessonCores, and(eq(lessonCores.catalogLessonId, catalogLessons.id), eq(lessonCores.status, "published")))
  .innerJoin(lessonSceneSets, and(eq(lessonSceneSets.coreId, lessonCores.id), eq(lessonSceneSets.status, "published")))
  .where(and(eq(catalogLessons.level, level), eq(catalogLessons.status, "active")))
  .orderBy(asc(catalogLessons.position));

/** DB çekirdeğinden `Authored` çıkarır — DSL'in ürettiği yapıyı tersine çevirir. */
function toAuthored(core: LessonCore, scenes: SceneSet, id: string): Authored {
  const beats = core.lecture.beats;
  const teach = beats.find((b) => b.kind === "teach");
  if (!teach || teach.kind !== "teach") throw new Error(`${id}: teach beat yok`);

  // Beat kimlikleri KORUNUR: oturum script'i `state.script.beats[beat.id]` ile
  // anahtarlanıyor, id değişirse açık oturumlarda hocanın cümlesi kaybolur.
  const ex: Ex[] = [];
  let n = 0;
  for (const b of beats) {
    if (b.kind !== "exercise") continue;
    n++;
    const keep = b.id === `ex${n}` ? {} : { id: b.id };
    if (b.format === "fill_blank" && b.answerSpec.kind === "token") {
      const accepted = [...b.answerSpec.accepted];
      ex.push({ t: "fill", item: b.item, accept: accepted, ...keep,
        ...(b.exampleAnswer === accepted[0] ? {} : { example: b.exampleAnswer }) });
    } else if (b.format === "mcq" && b.answerSpec.kind === "choice") {
      ex.push({ t: "mcq", item: b.item, options: [...(b.options ?? [])], correct: b.answerSpec.correctIndex, ...keep });
    } else if (b.format === "say_sentence" && b.answerSpec.kind === "utterance") {
      const accepted = [...b.answerSpec.accepted];
      ex.push({ t: "say", item: b.item, accept: accepted, ...keep,
        ...(b.exampleAnswer === accepted[0] ? {} : { example: b.exampleAnswer }),
        ...(b.answerSpec.contractionsAllowed === false ? { contractions: false } : {}) });
    } else {
      throw new Error(`${id}: bilinmeyen alıştırma biçimi ${b.format}`);
    }
  }

  // Derse özel intent metinleri kanoniğe indirgenmemeli
  const chrome = {
    readiness: beats.find((b) => b.kind === "ask" && b.purpose === "readiness")?.intent,
    teach: teach.introIntent,
    questions: beats.find((b) => b.kind === "ask" && b.purpose === "questions")?.intent,
    say: beats.find((b) => b.kind === "say")?.intent,
  };
  const CANON = {
    readiness: "greet, name today's topic, ask if ready",
    teach: "announce the explanation",
    questions: "invite any question before the exercises",
    say: "acknowledge and announce a few practice questions",
  } as const;
  const intents = Object.fromEntries(
    Object.entries(chrome).filter(([k, v]) => v && v !== CANON[k as keyof typeof CANON]),
  ) as Authored["intents"];

  const openBeat = beats.find((b) => b.kind === "open_response");
  const open =
    openBeat?.kind === "open_response"
      ? {
          q: openBeat.question,
          must: [...openBeat.rubric.mustUse],
          criteria: openBeat.rubric.criteria,
          example: openBeat.exampleAnswer,
        }
      : undefined;

  const quiz: Q[] | undefined = core.quiz?.map((q) =>
    q.type === "mcq"
      ? { t: "qmcq" as const, stem: q.stem, options: [...q.options], correct: q.correctIndex }
      : { t: "qfill" as const, text: q.text, answers: [...(q.answers[0] ?? [])] },
  );

  const sc5 = TRACKS.map((t) => {
    const v = scenes.scenes[t];
    if (!v) throw new Error(`${id}: "${t}" sahnesi yok`);
    return {
      name: v.persona.name,
      role: v.persona.role,
      goal: v.persona.goal,
      scene: v.scene,
      objective: v.objective,
      opening: v.avatarOpening,
      ...(v.persona.mood ? { mood: v.persona.mood } : {}),
    } as Sc;
  }) as [Sc, Sc, Sc, Sc, Sc];

  return {
    id,
    topic: core.topic,
    objectives: [...core.objectives],
    goal: core.communicationGoal,
    target: core.tutorNotes.target,
    correction: core.tutorNotes.correctionStyle,
    summary: core.summary,
    minutes: core.estMinutes,
    ...(intents && Object.keys(intents).length ? { intents } : {}),
    points: teach.points.map((p) => ({ form: p.formEn, claims: [...p.claimsEn], ex: p.examples.map((e) => e.textEn) })),
    ex,
    ...(open ? { open } : {}),
    success: core.practice.successCriteria,
    ...(core.practice.minTargetUses !== 2 ? { minUses: core.practice.minTargetUses } : {}),
    ...(core.practice.maxTurns !== 8 ? { maxTurns: core.practice.maxTurns } : {}),
    ...(quiz?.length ? { quiz } : {}),
    scenes: sc5,
  };
}

// --- Kayıpsızlık kapısı -------------------------------------------------------
const authored: Authored[] = [];
const drifted: string[] = [];
for (const r of rows) {
  const core = r.core.core as LessonCore;
  const sceneSet = { sceneFormat: SCENE_FORMAT, scenes: r.scenes.scenes } as SceneSet;
  const a = toAuthored(core, sceneSet, r.cat.id);
  authored.push(a);

  const rebuiltCore = buildCore(a, { focus: r.cat.focus, mustUse: r.cat.targetPhrases as string[] });
  const rebuiltScenes = buildScenes(a);
  const coreDiff = canon(rebuiltCore) !== canon(core);
  const sceneDiff = canon(rebuiltScenes.scenes) !== canon(sceneSet.scenes);
  if (coreDiff || sceneDiff) drifted.push(`${r.cat.id}${coreDiff ? " [çekirdek]" : ""}${sceneDiff ? " [sahne]" : ""}`);
}

// --- Dosyayı yaz --------------------------------------------------------------
const q = (s: string) => JSON.stringify(s);
const arr = (xs: string[], ind: string) => `[\n${xs.map((x) => `${ind}  ${q(x)},`).join("\n")}\n${ind}]`;

const body = authored
  .map((a) => {
    const points = a.points
      .map((p) => `      {\n        form: ${q(p.form)},\n        claims: ${arr(p.claims, "        ")},\n        ex: ${arr(p.ex, "        ")},\n      },`)
      .join("\n");
    const opts = (e: Ex) => {
      const o: string[] = [];
      if (e.id) o.push(`id: ${q(e.id)}`);
      if (e.example) o.push(`example: ${q(e.example)}`);
      if (e.t === "say" && e.contractions === false) o.push("contractions: false");
      return o.length ? `, { ${o.join(", ")} }` : "";
    };
    const exs = a.ex
      .map((e) =>
        e.t === "fill"
          ? `      fill(${q(e.item)}, ${JSON.stringify(e.accept)}${opts(e)}),`
          : e.t === "say"
            ? `      say(${q(e.item)}, ${JSON.stringify(e.accept)}${opts(e)}),`
            : `      mcq(${q(e.item)}, ${arr(e.options, "      ")}, ${e.correct}${opts(e)}),`,
      )
      .join("\n");
    const quiz = a.quiz
      ?.map((x) =>
        x.t === "qmcq"
          ? `      qmcq(${q(x.stem)}, ${arr(x.options, "      ")}, ${x.correct}),`
          : `      qfill(${q(x.text)}, ${JSON.stringify(x.answers)}),`,
      )
      .join("\n");
    const scenes = a.scenes
      .map((s) => `      sc(${q(s.name)}, ${q(s.role)}, ${q(s.goal)},\n        ${q(s.scene)},\n        ${q(s.objective)},\n        ${q(s.opening)}${s.mood ? `, ${q(s.mood)}` : ""}),`)
      .join("\n");
    return `  {
    id: ${q(a.id)},
    topic: ${q(a.topic)},
    objectives: ${arr(a.objectives, "    ")},
    goal: ${q(a.goal)},
    target: ${q(a.target)},
    correction: ${q(a.correction)},
    summary: ${q(a.summary)},
    minutes: ${a.minutes},${
      a.intents
        ? `
    intents: {
${Object.entries(a.intents).map(([k, v]) => `      ${k}: ${q(v as string)},`).join("\n")}
    },`
        : ""
    }
    points: [
${points}
    ],
    ex: [
${exs}
    ],${
      a.open
        ? `
    open: {
      q: ${q(a.open.q)},
      must: ${JSON.stringify(a.open.must)},
      criteria: ${q(a.open.criteria)},
      example: ${q(a.open.example)},
    },`
        : ""
    }
    success: ${q(a.success)},${a.minUses !== undefined ? `\n    minUses: ${a.minUses},` : ""}${a.maxTurns !== undefined ? `\n    maxTurns: ${a.maxTurns},` : ""}${
      quiz
        ? `
    quiz: [
${quiz}
    ],`
        : ""
    }
    scenes: [
${scenes}
    ],
  },`;
  })
  .join("\n\n");

const header = `/** ${level} dersleri — DB'deki YAYINLI çekirdeklerden dışa aktarıldı (export-authored.ts).
 *
 *  Bu seviye yazarlık kararından ÖNCE LLM'e üretilmişti ve içeriği yalnızca DB'de
 *  yaşıyordu; buradan sonra tek doğruluk kaynağı BU DOSYADIR. Düzeltmeler artık
 *  yama script'iyle değil, normal dosya düzenlemesiyle yapılır:
 *
 *    npx tsx scripts/author-cores.ts --level ${level} --dry
 *
 *  Dışa aktarım kayıpsızlık kapısından geçti: her ders \`buildCore\`dan geçirilip
 *  DB'deki çekirdekle kanonik olarak karşılaştırıldı.
 */
import { fill, mcq, qfill, qmcq, say, sc, type Authored } from "./dsl.js";

export const LESSONS: Authored[] = [
`;

writeFileSync(outPath, `${header}${body}\n];\n`);

console.log(`\n${rows.length} ders dışa aktarıldı → ${outPath}`);
if (drifted.length) {
  console.log(`\n⚠ ${drifted.length} derste DSL'e birebir oturmayan alan var:`);
  for (const d of drifted) console.log(`   ${d}`);
  console.log(`\n   Bunlar dosyaya YAZILDI. Farkı görmek için --level ${level} ile author-cores --dry koş.`);
} else {
  console.log(`✅ ${rows.length}/${rows.length} ders kayıpsız — buildCore çıktısı DB ile birebir aynı.`);
}
console.log();

await sql.end();
