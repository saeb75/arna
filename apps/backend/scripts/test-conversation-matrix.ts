/** KONUŞMA TARAMASI — "öğrenci dersin bu anında bunu söylerse Emma ne yapar?"
 *
 *  Canlı motoru (src/modules/session/turn) GERÇEK modelle, DB'siz koşar: her anı
 *  (hazır mısın, soru penceresi, üç alıştırma biçimi, açık uçlu, ikinci hak, tavan)
 *  bilerek tuhaf sözlerle dener. İki katmanda ölçer:
 *   1. YAPISAL: tür/doğruluk/akış beklentisi (kesin, kodla).
 *   2. SÖZ: güçlü bir değerlendirici model rubrikle okur (selamı tekrarlıyor mu,
 *      görevde kalıyor mu, cevabı sızdırıyor mu, akışla tutarlı mı, dil doğru mu).
 *  Hata kullanıcıdan ÖNCE burada görülür. Prompt/model değişikliğinden önce ve
 *  sonra koşulur; rapor her vakanın tam cevabını içerir (insan da okur).
 *
 *  Çalıştırma (apps/backend):
 *    npx tsx scripts/test-conversation-matrix.ts                 # canlı chat modeli
 *    npx tsx scripts/test-conversation-matrix.ts --model=gpt-5.5 --only=say
 *    seçenekler: --model --grader --only=<an/vaka alt dizesi> --lang=tr|es --concurrency=6 --no-grade --out=<dizin>
 *              --tutor=Kai:male  (seçilen öğretmen: ad + cinsiyet; rol yapma karakterini o oynar — tutor/cast.ts)
 *
 *  Maliyet: ~150 vaka × (1 motor + 1 değerlendirici) çağrısı. */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { type RichText } from "@glotmate/contracts";
import { getChrome } from "../src/i18n/index.js";
import { languageName } from "../src/lib/language.js";
import { generateJson } from "../src/modules/llm/generate.js";
import { MODEL_BY_PURPOSE } from "../src/modules/llm/models.js";
import { runLectureTurn } from "../src/modules/session/turn/index.js";
import { describeTask, runsToPlain } from "../src/modules/session/turn/prompt.js";
import type { Learner, TurnLlm } from "../src/modules/session/turn/types.js";
import { buildCases, buildConvCases, buildInterjectCases, type Case, type ConvCase, type InterjectCase } from "./conversation/cases.js";
import { runConversationTurn } from "../src/modules/session/turn/conversation.js";
import { runInterjectionTurn } from "../src/modules/session/turn/interjection.js";
import { normalizeUtterance } from "@glotmate/contracts";
import { castPersona, swapName } from "../src/modules/tutor/cast.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
) as Record<string, string>;

const MODEL = args.model ?? MODEL_BY_PURPOSE.chat;
const GRADER = args.grader ?? "gpt-6.1-sol";
const CONCURRENCY = Number(args.concurrency ?? 6);
const GRADE = args["no-grade"] !== "true";
const OUT = args.out ?? join(tmpdir(), "glotmate-conversation-reports");
/** Öğretmen kaydı varmış gibi: hoca adı/cinsiyeti + karakteri öğretmen oynar. Yoksa eski hoca (Emma). */
const [TUTOR_NAME, TUTOR_GENDER] = (args.tutor ?? "").split(":") as [string | undefined, string | undefined];
const TUTOR = TUTOR_NAME ? { name: TUTOR_NAME, gender: (TUTOR_GENDER === "male" ? "male" : "female") as Learner["tutorGender"] } : null;

const LEARNERS: Record<Case["lang"], Learner> = {
  tr: { name: "Saeb", cefrLevel: "A1", nativeLanguage: "tr", l1Name: languageName("tr"), tutorLanguage: "native", tutorName: "Emma", tutorGender: "female" },
  es: { name: "Lucía", cefrLevel: "A1", nativeLanguage: "es", l1Name: languageName("es"), tutorLanguage: "native", tutorName: "Emma", tutorGender: "female" },
};
if (TUTOR) for (const l of Object.values(LEARNERS)) Object.assign(l, { tutorName: TUTOR.name, tutorGender: TUTOR.gender });
/** İspanyolca vakalarda hocanın açılış cümlesi de İspanyolca olmalı */
const ES_LINES: Record<string, string> = {
  b1: "¡Hola Lucía! Hoy vamos a aprender Introducing yourself. ¿Lista para empezar?",
};

interface Timed {
  latencies: number[];
}

function makeLlm(model: string, timing: Timed): TurnLlm {
  return (req) =>
    generateJson({
      model,
      system: req.system,
      user: req.user,
      schema: req.schema,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
      onCall: (_r, ms) => {
        timing.latencies.push(ms);
      },
    });
}

// --- değerlendirici -------------------------------------------------------------

const gradeSchema = z.object({
  issues: z
    .array(
      z.object({
        rule: z.string(),
        severity: z.enum(["major", "minor"]),
        why: z.string(),
      }),
    )
    .default([]),
});

function gradeSystem(): string {
  return [
    `You review ONE reply of "Emma", an AI English teacher in a voice lesson app, for a QA test suite. Be strict but fair: report only real problems a user would notice or that break the lesson. Read Emma's reply in its language (it may be Turkish, Spanish, ...).`,
    ``,
    `What the app does is decided by code, not by Emma; you are told what happens next. Judge Emma's words against that.`,
    ``,
    `RULES (major unless noted):`,
    `R1 ANCHOR — Emma stays on the current task/moment. She must not invent a different task or question, ask the student something unrelated, or drift into another subject.`,
    `R2 NO RE-GREETING — Emma greeted the student once at the very start of the lesson. After that she must never greet again (hello/hi/merhaba/hola/welcome…), not even when the student greets her (she should just show she's listening and carry on), and never re-introduce herself or the lesson (answering when the student explicitly asks who she is or what the lesson is about is fine).`,
    `R3 HONEST & RESPONSIVE — the reply responds to what the student actually said; it doesn't treat a non-answer as an answer or vice versa, doesn't praise a wrong answer or reject a right one, doesn't claim the student said something they didn't, and isn't a generic line that ignores their message.`,
    `R4 FLOW-CONSISTENT — given WHAT HAPPENS NEXT: if the student still has a try at this task, Emma must not reveal the correct answer (not the sentence, not the option letter, not the exact fix spelled out word for word, and in multiple choice no surface clue like "look for the word X" that singles out one option — but explaining WHY the student's chosen option is wrong is good teaching and fine, even if it narrows the choice); if the lesson moves on next, Emma must not invite another try, and for a task the student did not get right she should give the correct answer; if the app will read the task again, Emma must not say "let's move on" and must not turn it into a DIFFERENT task. (Briefly explaining what the task asks is fine when the student said they don't understand or asked for help; repeating the task word for word right before the app does is only minor.)`,
    `R5 LANGUAGE — in native-tutor mode Emma speaks the student's native language ("l1" runs) and English words/sentences appear as separate "en" runs. A whole reply in English (except English material) is major; an English word left inside an l1 run is minor.`,
    `R6 CORRECT TEACHING — anything Emma says about English is correct and matches the lesson.`,
    `R7 NATURAL & SHORT (minor) — 1-2 short spoken sentences (up to 3 in a question window), sounds like a real, warm teacher; no robotic or odd phrasing; no question when the moment forbids one (readiness: Emma must NOT ask a question — that is major).`,
    `R9 LEVEL & LESSON (role play only) — at A1–A2 the character speaks very simple English built from today's lesson (short sentences, everyday words) and each turn opens a natural chance for one of today's target phrases the student has not said yet (a question, or — when the phrase is itself a question the student should ask — a short friendly statement that leaves them room to ask it). Asking about unrelated topics the lesson did not teach (travel plans, feelings, jobs, hobbies…) or using clearly harder language is major. At B1+ only clearly too-hard language is flagged.`,
    `R8 DECISION (major) — the system's classification of the student's message ("kind") and the correctness judgment are reasonable. Kinds: answer (a try at the task, incl. nonsense letters or an answer in the native language), give_up, ask_help, repeat, other (greeting, small talk, feelings, unrelated, unclear). Flag only CLEARLY wrong decisions; when the test lists several acceptable kinds, any of them is fine.`,
    ``,
    `Return STRICT JSON: {"issues":[{"rule":"R1".."R9","severity":"major"|"minor","why":"<one sentence, quote the problem>"}]} — an empty list if the reply is fine.`,
  ].join("\n");
}

function momentStory(c: Case): string {
  const beat = c.moment.core.lecture.beats.find((b) => b.id === c.moment.beatId)!;
  const learner = LEARNERS[c.lang];
  const lines = [
    `LESSON: ${c.moment.core.topic} — ${c.moment.core.focus}`,
    `STUDENT: ${learner.name}, native language ${learner.l1Name}, native-tutor mode (Emma explains in ${learner.l1Name}).`,
  ];
  if (beat.kind === "ask") {
    lines.push(
      beat.purpose === "readiness"
        ? `MOMENT: lesson start. Emma greeted and asked if the student is ready. After Emma's reply the lesson ALWAYS continues to the explanation (so Emma must not ask anything).`
        : `MOMENT: question window after the explanation — the student may ask about the topic. The system also decides whether the student is done with questions (done=true closes the window: the app itself announces the exercises right after Emma's reply, so Emma must not announce them or ask anything). ${c.moment.lastExchange ? "This is the LAST question Emma can take; after her reply the exercises start." : "When done=false the student can ask another question after Emma's reply."}`,
    );
  } else if (beat.kind === "exercise" || beat.kind === "open_response") {
    lines.push(`MOMENT: mid-lesson task. Emma already greeted and taught earlier.`, `TASK:`, ...describeTask(beat));
    lines.push(`Answer tries used before this message: ${c.moment.counters.attempt}.`);
  }
  lines.push(``, `DIALOGUE SO FAR:`, `  Emma: ${JSON.stringify(c.moment.askedLine ?? "(read the task aloud)")}`);
  for (const t of c.moment.history) {
    lines.push(t.role === "app" ? `  (${t.text})` : `  ${t.role === "tutor" ? "Emma" : learner.name}: ${JSON.stringify(t.text)}`);
  }
  lines.push(`  ${learner.name} (latest): ${JSON.stringify(c.input)}`);
  return lines.join("\n");
}

function nextStep(r: CaseResult): string {
  if (r.windowDone === true) return `the question window closes — the app announces the exercises itself right after Emma's reply`;
  if (r.windowDone === false) return `the question window stays open — the student can ask another question`;
  if (r.kind === undefined) return `the lesson continues as described in MOMENT`;
  if (r.outcome === "advance") return `the task is over — the lesson moves to the next step right after Emma's reply`;
  if (r.reAsk) return `the app shows the same task on screen and reads it aloud again right after Emma's reply; the student still has a try`;
  return `the student answers the same task again right after Emma's reply (they still have a try)`;
}

// --- koşu ---------------------------------------------------------------------

interface CaseResult {
  id: string;
  label: string;
  lang: string;
  input: string;
  kind?: string;
  correct?: boolean;
  outcome?: string;
  reAsk?: boolean;
  repaired?: boolean;
  windowDone?: boolean;
  reply: RichText;
  latencyMs: number;
  structural: string[];
  issues: Array<{ rule: string; severity: string; why: string }>;
  error?: string;
}

async function runCase(c: Case, llm: TurnLlm, graderLlm: TurnLlm): Promise<CaseResult> {
  const learner = LEARNERS[c.lang];
  const chrome = getChrome(c.lang);
  const askedLine = c.lang === "es" ? ES_LINES[c.moment.beatId] ?? c.moment.askedLine : c.moment.askedLine;
  const t0 = Date.now();
  const base: CaseResult = {
    id: c.id,
    label: c.moment.label,
    lang: c.lang,
    input: c.input,
    reply: [],
    latencyMs: 0,
    structural: [],
    issues: [],
  };
  try {
    const out = await runLectureTurn(
      {
        core: c.moment.core,
        beatId: c.moment.beatId,
        learner,
        history: c.moment.history,
        studentText: c.input,
        counters: c.moment.counters,
        surrenderTokens: chrome.surrender,
        askedLine,
        lastExchange: c.moment.lastExchange,
      },
      llm,
    );
    if (!out) throw new Error(`adım bulunamadı: ${c.moment.beatId}`);
    base.latencyMs = Date.now() - t0;
    base.reply = out.reply;
    base.windowDone = out.windowDone;
    if (c.expect.windowDone !== undefined && out.windowDone !== c.expect.windowDone) {
      base.structural.push(`windowDone=${out.windowDone}, beklenen ${c.expect.windowDone}`);
    }
    if (out.task) {
      base.kind = out.task.kind;
      base.correct = out.task.ok;
      base.outcome = out.task.outcome;
      base.reAsk = out.task.reAsk;
      base.repaired = out.task.repaired;
      const e = c.expect;
      if (e.kinds && !e.kinds.includes(out.task.kind)) base.structural.push(`kind=${out.task.kind}, beklenen ${e.kinds.join("|")}`);
      if (e.correct !== undefined && out.task.ok !== e.correct) base.structural.push(`correct=${out.task.ok}, beklenen ${e.correct}`);
      if (e.outcome && out.task.outcome !== e.outcome) base.structural.push(`outcome=${out.task.outcome}, beklenen ${e.outcome}`);
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
    return base;
  }
  if (GRADE) {
    try {
      const g = await graderLlm({
        system: gradeSystem(),
        user: [
          momentStory(c),
          ``,
          `SYSTEM DECISION: ${base.kind ? `kind=${base.kind}, correct=${base.correct}` : base.windowDone !== undefined ? `done=${base.windowDone}` : "(no classification at this moment)"}${c.expect.kinds ? ` — acceptable kinds for this test: ${c.expect.kinds.join(", ")}` : ""}`,
          `WHAT HAPPENS NEXT: ${nextStep(base)}.`,
          c.focus ? `TEST NOTE (what this case probes): ${c.focus}` : ``,
          ``,
          `EMMA'S REPLY (language-tagged runs): ${JSON.stringify(base.reply)}`,
        ].join("\n"),
        schema: gradeSchema,
        promptVersion: "conv-grade.v1",
        maxTokens: 600,
        temperature: 0,
      });
      base.issues = g.issues ?? [];
    } catch (err) {
      base.issues = [{ rule: "GRADER", severity: "minor", why: `değerlendirici düştü: ${String(err).slice(0, 120)}` }];
    }
  }
  return base;
}

function convStory(c: ConvCase): string {
  const learner = LEARNERS[c.lang];
  const m = c.moment;
  const lines = [
    `LESSON: ${m.core.topic} — ${m.core.focus}`,
    `LESSON LEVEL: ${m.lessonLevel ?? "A1"} · today's target phrases: ${m.core.practice.mustUse.join(" / ")}`,
    `STUDENT: ${learner.name}, native language ${learner.l1Name}, native-tutor mode.`,
    m.phase === "practice"
      ? `MOMENT: the role play inside the lesson. Emma plays ${m.scene.persona.name} (${m.scene.persona.role}); the role play is ENGLISH ONLY and Emma stays in character. Scene: ${m.scene.scene}. The scene already started with the character's opening line (which was the greeting). ${m.closesNow ? "THE APP ENDS THE SCENE RIGHT AFTER THIS REPLY — the character must wrap up warmly and ask NO question." : "The scene CONTINUES after this reply — the character must NOT wrap up or say goodbye."}`
      : `MOMENT: the short chat at the very end of the lesson. Emma is the teacher again (not a role-play character), speaking ${learner.l1Name}. The student can ask questions; the lesson ends only when the student presses a button. Emma must not start new exercises or role plays.`,
    ``,
    `CONVERSATION SO FAR (this phase):`,
    ...m.history.map((t) => `  ${t.role === "user" ? learner.name : "Emma"}: ${JSON.stringify(t.text)}`),
    `  ${learner.name} (latest): ${JSON.stringify(c.input)}`,
  ];
  return lines.join("\n");
}

async function runConvCase(c: ConvCase, llm: TurnLlm, graderLlm: TurnLlm): Promise<CaseResult> {
  const learner = LEARNERS[c.lang];
  const base: CaseResult = { id: c.id, label: c.moment.label, lang: c.lang, input: c.input, reply: [], latencyMs: 0, structural: [], issues: [] };
  const t0 = Date.now();
  try {
    const out = await runConversationTurn(
      {
        phase: c.moment.phase,
        core: c.moment.core,
        scene: c.moment.scene,
        learner,
        history: c.moment.history,
        studentText: c.input,
        turnIndex: c.moment.turnIndex,
        turnCap: c.moment.turnCap,
        closesNow: c.moment.closesNow,
        goalMet: c.moment.goalMet,
        lessonLevel: c.moment.lessonLevel ?? "A1",
      },
      llm,
    );
    base.latencyMs = Date.now() - t0;
    base.reply = out.reply;
    if (c.usesTarget !== undefined) {
      // Canlıdaki kanıt guard'ının aynısı: alıntı öğrencinin sözünde geçmeli
      const quote = normalizeUtterance(out.evidence ?? "");
      const counted = out.usedTarget === true && quote.length >= 3 && normalizeUtterance(c.input).includes(quote);
      if (counted !== c.usesTarget) base.structural.push(`hedef sayımı=${counted}, beklenen ${c.usesTarget} (usedTarget=${out.usedTarget}, evidence=${JSON.stringify(out.evidence)})`);
    }
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
    return base;
  }
  if (GRADE) {
    try {
      const g = await graderLlm({
        system: gradeSystem(),
        user: [convStory(c), c.focus ? `TEST NOTE: ${c.focus}` : ``, ``, `EMMA'S REPLY (language-tagged runs): ${JSON.stringify(base.reply)}`].join("\n"),
        schema: gradeSchema,
        promptVersion: "conv-grade.v1",
        maxTokens: 600,
        temperature: 0,
      });
      base.issues = g.issues ?? [];
    } catch (err) {
      base.issues = [{ rule: "GRADER", severity: "minor", why: `değerlendirici düştü: ${String(err).slice(0, 120)}` }];
    }
  }
  return base;
}

function interjectStory(c: InterjectCase): string {
  const learner = LEARNERS[c.lang];
  const m = c.moment;
  return [
    `LESSON: ${m.core.topic} — ${m.core.focus}`,
    `STUDENT: ${learner.name}, native language ${learner.l1Name}, native-tutor mode (Emma explains in ${learner.l1Name}).`,
    `MOMENT: mid-lesson. Emma was speaking (not waiting for an answer) and the student CUT IN. What Emma was saying: ${JSON.stringify(m.interruptedText)}. After Emma's reply the lesson continues ON ITS OWN with what comes next — so Emma must answer briefly, ask NO question (major), never start, invent or announce a task, and never say goodbye. The student's words are NOT an answer to any task.`,
    ``,
    `RECENT DIALOGUE:`,
    ...m.recent.map((t) => `  ${t.role === "tutor" ? "Emma" : learner.name}: ${JSON.stringify(t.text)}`),
    `  ${learner.name} (latest, cut in): ${JSON.stringify(c.input)}`,
  ].join("\n");
}

async function runInterjectCase(c: InterjectCase, llm: TurnLlm, graderLlm: TurnLlm): Promise<CaseResult> {
  const base: CaseResult = { id: c.id, label: c.moment.label, lang: c.lang, input: c.input, reply: [], latencyMs: 0, structural: [], issues: [] };
  const t0 = Date.now();
  try {
    const out = await runInterjectionTurn(
      {
        core: c.moment.core,
        beatId: c.moment.beatId,
        learner: LEARNERS[c.lang],
        recent: c.moment.recent,
        studentText: c.input,
        interruptedText: c.moment.interruptedText,
      },
      llm,
    );
    base.latencyMs = Date.now() - t0;
    base.reply = out.reply;
  } catch (err) {
    base.error = err instanceof Error ? err.message : String(err);
    return base;
  }
  if (GRADE) {
    try {
      const g = await graderLlm({
        system: gradeSystem(),
        user: [interjectStory(c), `WHAT HAPPENS NEXT: the lesson continues on its own right after Emma's reply.`, c.focus ? `TEST NOTE (what this case probes): ${c.focus}` : ``, ``, `EMMA'S REPLY (language-tagged runs): ${JSON.stringify(base.reply)}`].join("\n"),
        schema: gradeSchema,
        promptVersion: "conv-grade.v1",
        maxTokens: 600,
        temperature: 0,
      });
      base.issues = g.issues ?? [];
    } catch (err) {
      base.issues = [{ rule: "GRADER", severity: "minor", why: `değerlendirici düştü: ${String(err).slice(0, 120)}` }];
    }
  }
  return base;
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]!);
      }
    }),
  );
  return out;
}

const pct = (xs: number[], p: number) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]!;
};

async function main() {
  let cases = buildCases();
  if (args.only) cases = cases.filter((c) => c.id.includes(args.only!) || c.moment.label.includes(args.only!));
  if (args.lang) cases = cases.filter((c) => c.lang === args.lang);
  let convCases = buildConvCases();
  // Canlıdaki gibi: öğretmen kaydı varsa rol yapma karakterini öğretmen KENDİ adıyla oynar
  // (geçmişteki karakter sözleri de: canlıda transkript zaten öğretmenin adıyla açılan sahneden gelir)
  if (TUTOR) {
    convCases = convCases.map((c) => {
      const from = c.moment.scene.persona.name;
      return {
        ...c,
        moment: {
          ...c.moment,
          scene: castPersona(c.moment.scene, TUTOR.name),
          history: c.moment.history.map((t) => ({ ...t, text: swapName(t.text, from, TUTOR.name) })),
        },
      };
    });
  }
  if (args.only) convCases = convCases.filter((c) => c.id.includes(args.only!) || c.moment.label.includes(args.only!));
  if (args.lang) convCases = convCases.filter((c) => c.lang === args.lang);
  let interjectCases = buildInterjectCases();
  if (args.only) interjectCases = interjectCases.filter((c) => c.id.includes(args.only!) || c.moment.label.includes(args.only!));
  if (args.lang) interjectCases = interjectCases.filter((c) => c.lang === args.lang);

  const timing: Timed = { latencies: [] };
  const llm = makeLlm(MODEL, timing);
  const graderRaw = makeLlm(GRADER, { latencies: [] });
  // Değerlendirici metni "Emma" der; öğretmen verildiyse hocanın adı o
  const asTutor = (t: string) => (TUTOR ? t.replaceAll("Emma", TUTOR.name).replaceAll("EMMA", TUTOR.name.toUpperCase()) : t);
  const graderLlm: TurnLlm = (req) => graderRaw({ ...req, system: asTutor(req.system), user: asTutor(req.user) });

  console.log(`Konuşma taraması — model=${MODEL} değerlendirici=${GRADE ? GRADER : "kapalı"} vaka=${cases.length + convCases.length + interjectCases.length}`);
  const results = [
    ...(await pool(cases, CONCURRENCY, (c) => runCase(c, llm, graderLlm))),
    ...(await pool(convCases, CONCURRENCY, (c) => runConvCase(c, llm, graderLlm))),
    ...(await pool(interjectCases, CONCURRENCY, (c) => runInterjectCase(c, llm, graderLlm))),
  ];

  const failed = results.filter((r) => r.error || r.structural.length || r.issues.some((i) => i.severity === "major"));
  const minors = results.filter((r) => !failed.includes(r) && r.issues.length);

  // Konsol özeti
  for (const r of failed) {
    console.log(`\n❌ ${r.id}  [${r.label}]  «${r.input}»`);
    if (r.error) console.log(`   HATA: ${r.error}`);
    if (r.kind) console.log(`   hüküm: kind=${r.kind} correct=${r.correct} → ${r.outcome}${r.reAsk ? " + görev yeniden" : ""}`);
    console.log(`   Emma: ${runsToPlain(r.reply)}`);
    for (const s of r.structural) console.log(`   · YAPISAL: ${s}`);
    for (const i of r.issues) console.log(`   · ${i.rule} ${i.severity}: ${i.why}`);
  }
  const lat = timing.latencies;
  console.log(
    `\n${failed.length === 0 ? "✅" : "❌"} ${results.length - failed.length}/${results.length} geçti · küçük kusurlu ${minors.length} · ` +
      `gecikme p50 ${pct(lat, 50)}ms p90 ${pct(lat, 90)}ms (model=${MODEL})`,
  );

  // Tam rapor (insan okur)
  mkdirSync(OUT, { recursive: true });
  const stamp = `${MODEL}-${Date.now()}`;
  writeFileSync(join(OUT, `${stamp}.json`), JSON.stringify({ model: MODEL, grader: GRADER, results }, null, 2));
  const md = [
    `# Konuşma taraması — ${MODEL}`,
    ``,
    `${results.length - failed.length}/${results.length} geçti · p50 ${pct(lat, 50)}ms · p90 ${pct(lat, 90)}ms`,
    ``,
    ...results.map((r) =>
      [
        `### ${failed.includes(r) ? "❌" : r.issues.length ? "⚠️" : "✅"} ${r.id} — ${r.label}`,
        `- öğrenci: «${r.input}»`,
        r.kind ? `- hüküm: \`${r.kind}\` correct=${r.correct} → ${r.outcome}${r.reAsk ? " + görev yeniden" : ""}${r.repaired ? " (sızıntı onarıldı)" : ""}` : ``,
        `- Emma: ${r.reply.map((x) => (x.lang === "en" ? `**${x.text}**` : x.text)).join(" ")}`,
        ...r.structural.map((s) => `- YAPISAL: ${s}`),
        ...r.issues.map((i) => `- ${i.rule} (${i.severity}): ${i.why}`),
        r.error ? `- HATA: ${r.error}` : ``,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].join("\n\n");
  writeFileSync(join(OUT, `${stamp}.md`), md);
  console.log(`rapor: ${join(OUT, `${stamp}.md`)}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

void main();
