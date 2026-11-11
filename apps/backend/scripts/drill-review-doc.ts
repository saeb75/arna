/**
 * OYUN BLOĞU DIŞ İNCELEME DOSYASI — başka bir yapay zekâya analiz ettirmek için.
 *
 *   npx tsx scripts/drill-review-doc.ts --level A1 --units 1,2
 *
 * Elle yazılan kaynaktan (scripts/authored) okur, DB'ye dokunmaz. Çıktı:
 * docs/review/drills-<level>-u<units>.md — başta inceleyici için talimat (kurallar,
 * neye bakılacağı, cevap biçimi), altında ders başına öğretim maddeleri, oyun
 * bloğu (doğru şık ✔) ve rol yapma sahnelerinin açılışı.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { correctedSentence, type CefrLevel, type DrillItem } from "@glotmate/contracts";
import { CURRICULUM, lessonId } from "../src/curriculum/index.js";
import { buildCore, type Authored } from "./authored/dsl.js";

const args = process.argv.slice(2);
const level = args[args.indexOf("--level") + 1]!;
const units = (args[args.indexOf("--units") + 1] ?? "").split(",").map(Number).filter(Boolean);
if (!level || !units.length) {
  console.error("kullanım: --level A1 --units 1,2");
  process.exit(1);
}

const { LESSONS } = (await import(`./authored/${level.toLowerCase()}.js`)) as { LESSONS: Authored[] };
const spec = CURRICULUM[level as CefrLevel];
if (!spec) throw new Error(`müfredatta yok: ${level}`);
const catalog = spec.lessons
  .filter((l) => units.includes(l.unitIndex))
  .sort((a, b) => a.position - b.position)
  .map((l) => ({ ...l, id: lessonId(level as CefrLevel, l) }));

const TYPE: Record<DrillItem["type"], string> = {
  fill_choice: "Fill the gap",
  arrange: "Arrange the words",
  situation: "Read the situation, choose",
  find_error: "Tap the wrong word",
  complete_chat: "Complete the chat",
  match: "Match the pairs",
  listen_choose: "Listen and choose",
  listen_arrange: "Listen and arrange",
  speak: "Say this sentence",
};

function choices(options: string[], correct: number): string {
  return options.map((o, i) => (i === correct ? `**✔ ${o}**` : o)).join(" · ");
}

function describe(d: DrillItem): string {
  switch (d.type) {
    case "fill_choice":
      return `${d.sentence} → ${choices(d.options, d.correctIndex)}`;
    case "situation":
      return `${d.context} → ${choices(d.options, d.correctIndex)}`;
    case "arrange":
      return `**${d.answer}**${d.extraTiles.length ? ` (extra tiles: ${d.extraTiles.join(", ")})` : ""}`;
    case "find_error":
      return `${d.sentence} → wrong word: **${d.sentence.split(" ")[d.wrongIndex]}** → ${correctedSentence(d)}`;
    case "complete_chat":
      return `${d.lines.map((l) => `${l.who === "you" ? "YOU" : "THEM"}: ${l.text ?? "___"}`).join(" / ")} → ${choices(d.options, d.correctIndex)}`;
    case "match":
      return d.pairs.map((p) => `${p.left} ↔ ${p.right}`).join(" · ");
    case "listen_choose":
      return `🔊 "${d.audio}" → ${choices(d.options, d.correctIndex)}`;
    case "listen_arrange":
      return `🔊 **${d.audio}**${d.extraTiles.length ? ` (extra tiles: ${d.extraTiles.join(", ")})` : ""}`;
    case "speak":
      return `🎤 **${d.sentence}**${d.accepted.length ? ` (also accepted: ${d.accepted.join(" / ")})` : ""}`;
  }
}

const TRACK_LABEL = ["everyday", "work", "travel", "academic", "exam"];

const out: string[] = [
  `# GlotMate — ${level} units ${units.join(", ")}: practice block review`,
  ``,
  `## Instructions for the reviewer`,
  ``,
  `You are reviewing exercise content for **GlotMate**, an app that teaches English to adult learners (this document: level ${level}) through conversation with a tutor avatar. Each lesson has three parts:`,
  ``,
  `1. **Lecture** — the tutor explains the teaching points (shown below as "Teaching points").`,
  `2. **Practice block** — tap-based exercises, no keyboard (shown below). Every item has exactly ONE correct answer, graded by code (no AI).`,
  `3. **Role play** — free conversation with a character; the character's first line is shown below as "Role play openings" (one per learner context: everyday, work, travel, academic, exam).`,
  ``,
  `**Exercise types:** Fill the gap (choose the word) · Arrange the words (build the sentence from tiles; extra tiles are distractors) · Read the situation, choose · Tap the wrong word · Complete the chat · Match the pairs · Listen and choose (audio plays, choose what you heard) · Listen and arrange · Say this sentence (speech recognition).`,
  ``,
  `**Rules the content must follow:**`,
  `- **Exactly one correct answer.** No distractor may also be acceptable in the given context. This is the most important check.`,
  `- **Level ${level}.** Words and grammar a ${level} learner can handle; only what the lesson teaches plus very common words.`,
  `- **Coverage:** each teaching point (p1, p2…) has at least 3 items; lessons with 2+ points end with at least 2 mixed ("mix") items.`,
  `- Distractors should be plausible learner mistakes, not nonsense.`,
  `- "Arrange" items: only one correct word order. "Listen and choose": options must sound different enough to tell apart.`,
  `- "Say this sentence": no names that speech recognition could misspell.`,
  `- "Tap the wrong word": only ONE word can fix the sentence (no subject–verb agreement errors, where changing the subject would also work).`,
  `- "Arrange the words": the first tile keeps its capital and the last tile keeps the final . ? ! — so a statement cannot be rebuilt as a question.`,
  `- Anything a drill tests (and every role play target phrase) must be taught in the teaching points.`,
  `- Role play openings: language at the lesson level (very simple at A1–A2), end with a question, and invite the learner to use the lesson's target phrases right away. The role play is voice only: an opening may ask about the learner's OWN life or things (they can imagine them), but never about a picture or object only the character can see.`,
  ``,
  `**What to return:** a list of concrete problems only (skip items that are fine). For each: lesson id, the item (quote it), the problem, and your suggested fix. Use these categories: AMBIGUOUS (more than one correct answer), WRONG (the marked answer is not correct), LEVEL (too hard / unnatural for ${level}), WEAK (works but could teach better), COVERAGE (a teaching point is under-practised), OPENING (role play opening issue). End with any general suggestions.`,
  ``,
];

for (const c of catalog) {
  const a = LESSONS.find((l) => l.id === c.id);
  if (!a) {
    out.push(`---`, ``, `## ${c.position}. ${c.title} \`${c.id}\` — NOT AUTHORED`, ``);
    continue;
  }
  const core = buildCore(a, { focus: c.focus, mustUse: [...c.targetPhrases] });
  out.push(`---`, ``, `## ${c.position}. ${c.title}  \`${c.id}\``, ``);
  out.push(`**Type:** ${c.kind} · **Focus:** ${c.focus} · **Role play targets:** ${c.targetPhrases.join(" / ")}`, ``);
  const teach = core.lecture.beats.find((b) => b.kind === "teach");
  if (teach?.kind === "teach") {
    out.push(`**Teaching points**`, ``);
    for (const p of teach.points) {
      out.push(`- **${p.id} — ${p.formEn}**: ${p.claimsEn.join(" ")} _Examples:_ ${p.examples.map((e) => e.textEn).join(" / ")}`);
    }
    out.push(``);
  }
  const drills = core.lecture.beats.find((b) => b.kind === "drills");
  if (drills?.kind === "drills") {
    out.push(`**Practice block (${drills.items.length} items)**`, ``);
    drills.items.forEach((d, i) => out.push(`${i + 1}. \`${d.pointRef}\` _${TYPE[d.type]}_ — ${describe(d)}`));
    out.push(``);
  } else {
    out.push(`_(old format — no practice block yet)_`, ``);
  }
  out.push(`**Role play openings**`, ``);
  a.scenes.forEach((s, i) => out.push(`- ${TRACK_LABEL[i]}: ${s.name} (${s.role}) — "${s.opening}"`));
  out.push(``);
}

const file = resolve(import.meta.dirname, `../../../docs/review/drills-${level}-u${units.join("-")}.md`);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, out.join("\n"));
console.log(`yazıldı: ${file}`);
