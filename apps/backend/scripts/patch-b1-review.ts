/**
 * B1 İNCELEME DÜZELTMELERİ — elle yazıldı, LLM'siz.
 *
 *   set -a; source .env; set +a; npx tsx scripts/patch-b1-review.ts [--dry]
 *
 * Kaynak: kullanıcının pedagojik incelemesi (/tmp/review-b1.md, Ağu 2026).
 * Her düzeltme mevcut değeri ÖNCE doğrular (expect) — içerik bu arada değiştiyse
 * script o derste durur, sessizce yanlış şeyi ezmez. Düzeltme sonrası çekirdek
 * şemadan ve lintCore'dan geçmeden DB'ye yazılmaz; sahne düzeltmeleri lintScenes'ten.
 *
 * Katalog targetPhrases değişen 5 derste core satırının spec_hash'i katalogdaki
 * yeni değere taşınır ve practice.mustUse katalogdan yeniden yazılır (kural:
 * mustUse KATALOGDAN gelir). Bu YAYIN ÖNCESİ cerrahidir: bu derslerin hiçbirinin
 * dil paketi yok, hiçbiri published değil.
 */
import { inArray } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonSceneSets } from "../src/db/schema.js";
import { SCENE_FORMAT, lessonCoreSchema, sceneSetSchema, type LessonCore, type SceneSet } from "@arna/contracts";
import { lintCore, lintScenes } from "../src/modules/lesson/lintLayers.js";

const dry = process.argv.includes("--dry");

// ---------------------------------------------------------------------------
// Yardımcılar — drift emniyeti
// ---------------------------------------------------------------------------

const notes: string[] = [];

function expect(actual: unknown, expected: unknown, ctx: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${ctx}: mevcut değer beklenenden farklı — içerik değişmiş olabilir.\n  beklenen: ${e}\n  bulunan:  ${a}`);
  }
}

/** expect + ata + logla */
function put<T>(obj: Record<string, unknown>, key: string, expected: T, next: T, ctx: string): void {
  expect(obj[key], expected, ctx);
  obj[key] = next;
  notes.push(`  ${ctx}: ${JSON.stringify(expected)} → ${JSON.stringify(next)}`);
}

function beat(core: LessonCore, id: string): Record<string, unknown> {
  const b = core.lecture.beats.find((b) => b.id === id);
  if (!b) throw new Error(`beat bulunamadı: ${id}`);
  return b as unknown as Record<string, unknown>;
}

function quizItem(core: LessonCore, id: string): Record<string, unknown> {
  const q = core.quiz?.find((q) => q.id === id);
  if (!q) throw new Error(`quiz maddesi bulunamadı: ${id}`);
  return q as unknown as Record<string, unknown>;
}

function teachPoint(core: LessonCore, beatId: string, pointId: string): Record<string, unknown> {
  const b = beat(core, beatId) as { points?: Array<{ id: string }> };
  const p = b.points?.find((p) => p.id === pointId);
  if (!p) throw new Error(`teach point bulunamadı: ${beatId}/${pointId}`);
  return p as unknown as Record<string, unknown>;
}

interface FixCtx {
  core: LessonCore;
  scenes: Record<string, Record<string, unknown>>;
  catalog: { targetPhrases: string[] };
  /** sahne setine dokunulduysa işaretle */
  scenesTouched: () => void;
}

// ---------------------------------------------------------------------------
// Düzeltmeler — ders başına açık kod (inceleme maddeleriyle birebir)
// ---------------------------------------------------------------------------

const FIXES: Record<string, (f: FixCtx) => void> = {
  // L2 — MCQ belirsizdi ("had just left" / "just left" / "was just leaving" üçü de
  // savunulabilirdi); bağlam artık yalnız past perfect'i doğru kılıyor. Quiz q2'nin
  // açık boşluğu cevaplanamazdı (her past perfect uyar) — yardımcı fiile daraltıldı.
  "b1-by-the-time-i-got-there": ({ core }) => {
    const q2 = quizItem(core, "q2");
    put(q2, "text", "By the time she called, I ___ .", "By the time she called, I ___ already left.", "q2.text");
    put(q2, "answers", [["had just left"]], [["had"]], "q2.answers");

    const b6 = beat(core, "b6");
    put(b6, "item", "He ___ when I arrived at his office.", "By the time I arrived at his office, he ___ .", "b6.item");
    put(
      b6,
      "options",
      ["had just left", "just left", "was just leaving"],
      ["had already left", "has already left", "will already leave"],
      "b6.options",
    );
    put(b6, "exampleAnswer", "had just left", "had already left", "b6.exampleAnswer");
  },

  // L7 — "for three years" kişisel gerçek dayatıyordu; katalog nötr kalıba geçti.
  "b1-ive-lived-here-for-years": ({ core, catalog }) => {
    put(
      core.practice as unknown as Record<string, unknown>,
      "mustUse",
      ["I've lived here", "for three years", "since I was"],
      catalog.targetPhrases,
      "practice.mustUse",
    );
    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(rubric, "mustUse", ["I've lived here", "for three years", "since I was"], catalog.targetPhrases, "b8.rubric.mustUse");
    put(b8, "exampleAnswer", "I've studied English for three years.", "I've studied English for a long time.", "b8.exampleAnswer");
    put(
      core.tutorNotes as unknown as Record<string, unknown>,
      "target",
      "I've lived here for three years / since I was...",
      "I've lived here for a long time / since I was...",
      "tutorNotes.target",
    );
  },

  // L9 — "she's been away" hem kişisel gerçek hem present perfect continuous DEĞİL
  // (be fiilinin perfect simple'ı). Ders boyunca sızmıştı: örnek, quiz, say_sentence,
  // rubric, mustUse ve sahne hedefleri ("explain why a coworker is absent").
  "b1-ive-been-working-on-it": ({ core, catalog, scenes, scenesTouched }) => {
    const p1 = teachPoint(core, "b2", "p1");
    const examples = p1.examples as Array<Record<string, unknown>>;
    put(examples[1]!, "textEn", "She's been away for two weeks.", "She's been learning to drive.", "p1e2.textEn");

    const q3 = quizItem(core, "q3");
    put(
      q3,
      "options",
      ["She been away for a week.", "She's been away for a week.", "She is been away for a week."],
      ["She's been working from home all week.", "She been working from home all week.", "She is been working from home all week."],
      "q3.options",
    );
    put(q3, "correctIndex", 1, 0, "q3.correctIndex");

    const b7 = beat(core, "b7");
    put(b7, "item", "she / be / away / for a week", "she / learn / English / all week", "b7.item");
    const spec = b7.answerSpec as Record<string, unknown>;
    put(
      spec,
      "accepted",
      ["She's been away for a week.", "She has been away for a week."],
      ["She's been learning English all week.", "She has been learning English all week."],
      "b7.accepted",
    );
    put(b7, "exampleAnswer", "She's been away for a week.", "She's been learning English all week.", "b7.exampleAnswer");

    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(rubric, "mustUse", ["I've been working", "we've been trying", "she's been away"], catalog.targetPhrases, "b8.rubric.mustUse");
    put(
      core.practice as unknown as Record<string, unknown>,
      "mustUse",
      ["I've been working", "we've been trying", "she's been away"],
      catalog.targetPhrases,
      "practice.mustUse",
    );
    put(
      core.tutorNotes as unknown as Record<string, unknown>,
      "target",
      "I've been working, we've been trying, she's been away",
      "I've been working, we've been trying, I've been learning",
      "tutorNotes.target",
    );

    put(
      scenes.exam!,
      "objective",
      "Describe what has been keeping you busy, what you and others have been trying to do, and mention someone who is currently away.",
      "Describe what has been keeping you busy and what you have been trying to do lately.",
      "scenes.exam.objective",
    );
    put(
      scenes.work!,
      "objective",
      "Describe your ongoing work, mention your team's efforts, and explain why a coworker is absent.",
      "Describe your ongoing work and what your team has been trying to finish.",
      "scenes.work.objective",
    );
    put(
      scenes.travel!,
      "objective",
      "Share what you have been doing during your trip, mention your travel companions' ongoing activities, and explain why someone from your group is not present.",
      "Share what you have been doing during your trip and what you have been trying to see.",
      "scenes.travel.objective",
    );
    put(
      scenes.academic!,
      "objective",
      "Explain your recent academic activities, your group's ongoing work, and mention a member who is currently away.",
      "Explain your recent academic activities and what your group has been working on together.",
      "scenes.academic.objective",
    );
    put(
      scenes.everyday!,
      "objective",
      "Explain what you have been doing lately and mention a mutual friend who has not been around.",
      "Explain what you have been doing lately and what you have been learning.",
      "scenes.everyday.objective",
    );
    scenesTouched();
  },

  // L10 — "since last year" kişisel gerçek dayatıyordu (öğretim noktası kalıyor,
  // yalnız öğrencinin SÖYLEMEK zorunda olduğu liste nötrleşiyor).
  "b1-how-long-have-you-been-doing-that": ({ core, catalog }) => {
    put(
      core.practice as unknown as Record<string, unknown>,
      "mustUse",
      ["how long have you", "have you been", "since last year"],
      catalog.targetPhrases,
      "practice.mustUse",
    );
    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(rubric, "mustUse", ["how long have you", "have you been", "since last year"], catalog.targetPhrases, "b8.rubric.mustUse");
    put(
      b8,
      "exampleAnswer",
      "How long have you been playing the guitar? Have you been playing since last year?",
      "How long have you been playing the guitar? Have you been playing for a while?",
      "b8.exampleAnswer",
    );
  },

  // L11 — MCQ kırık cümle üretiyordu ("For the first time living on my own last
  // year."); work sahnesi açılışı da hatalıydı ("I've just started here last week").
  "b1-milestones-and-firsts": ({ core, scenes, scenesTouched }) => {
    const ex2 = beat(core, "ex2");
    put(ex2, "item", "Which phrase completes the sentence? ___ living on my own last year.", "Which sentence is correct?", "ex2.item");
    put(
      ex2,
      "options",
      ["I've just started", "It's been about", "For the first time"],
      [
        "Last year I lived on my own for the first time.",
        "For the first time living on my own last year.",
        "I am living on my own for the first time last year.",
      ],
      "ex2.options",
    );
    const spec = ex2.answerSpec as Record<string, unknown>;
    put(spec, "correctIndex", 2, 0, "ex2.correctIndex");
    put(ex2, "exampleAnswer", "For the first time", "Last year I lived on my own for the first time.", "ex2.exampleAnswer");

    put(
      scenes.work!,
      "avatarOpening",
      "Hey, I’ve just started here last week. How long have you been with the company?",
      "Hey, I've just started here. How long have you been with the company?",
      "scenes.work.avatarOpening",
    );
    scenesTouched();
  },

  // L14 — "we'll have moved" kişisel gerçek dayatıyordu.
  "b1-ill-have-finished-by-then": ({ core, catalog }) => {
    put(
      core.practice as unknown as Record<string, unknown>,
      "mustUse",
      ["I'll have finished", "by next month", "we'll have moved"],
      catalog.targetPhrases,
      "practice.mustUse",
    );
    put(
      core.tutorNotes as unknown as Record<string, unknown>,
      "target",
      "I'll have finished, by next month, we'll have moved",
      "I'll have finished, by next month, by the end of",
      "tutorNotes.target",
    );
  },

  // L21 — in case / if seçiminde iki şık da savunulabilirdi; bağlam artık
  // "önceden önlem" durumunu teke zorluyor.
  "b1-in-case-it-rains": ({ core }) => {
    const q1 = quizItem(core, "q1");
    put(
      q1,
      "stem",
      "Which sentence shows a precaution?",
      "You are leaving home and do not know how the weather will change. Which sentence shows a precaution?",
      "q1.stem",
    );
    const b6 = beat(core, "b6");
    put(
      b6,
      "item",
      "Which sentence is correct for a precaution?",
      "You are packing tonight and cannot know tomorrow's weather. Which sentence is a precaution?",
      "b6.item",
    );
  },

  // L24 — 2. koşul dersinde "if you see" kabul ediliyordu.
  "b1-what-would-you-do": ({ core }) => {
    const ex3 = beat(core, "ex3");
    const spec = ex3.answerSpec as Record<string, unknown>;
    put(
      spec,
      "accepted",
      ["What would you do if you saw a celebrity in a cafe?", "What would you do if you see a celebrity in a cafe?"],
      ["What would you do if you saw a celebrity in a cafe?"],
      "ex3.accepted",
    );
  },

  // L25 — "she told me she ___ come" could/would ikisini de kabul ediyordu ama
  // test hiçbir şey ölçmüyordu; doğrudan söz verilince will→would kayması ölçülür.
  "b1-he-said-he-was-tired": ({ core }) => {
    const b5 = beat(core, "b5");
    put(
      b5,
      "item",
      "She told me she ___ come to the meeting.",
      "Direct speech: 'I will come to the meeting.' Reported: She told me she ___ come to the meeting.",
      "b5.item",
    );
    const spec = b5.answerSpec as Record<string, unknown>;
    put(spec, "accepted", ["could", "would"], ["would"], "b5.accepted");
    put(b5, "exampleAnswer", "could", "would", "b5.exampleAnswer");
  },

  // L27 — advised/told/asked üçü de gramerce uyan boşluklarda tek fiil dayatılıyordu;
  // kabul listeleri savunulabilir olanların tamamına genişledi. MCQ'da "told me to"
  // çeldiricisi savunulabilirdi — yapısal olarak yanlış çeldiriciyle değişti.
  "b1-they-told-me-to-wait": ({ core }) => {
    const q2 = quizItem(core, "q2");
    put(q2, "answers", [["advised me to"]], [["advised me to", "told me to"]], "q2.answers");
    const q4 = quizItem(core, "q4");
    put(q4, "answers", [["told me to"]], [["told me to", "asked me to"]], "q4.answers");

    const b5 = beat(core, "b5");
    const spec5 = b5.answerSpec as Record<string, unknown>;
    put(spec5, "accepted", ["told me to"], ["told me to", "asked me to", "advised me to"], "b5.accepted");

    const b6 = beat(core, "b6");
    put(
      b6,
      "options",
      ["My friend advised me to eat healthier.", "My friend told me to eat healthier.", "My friend asked me to eat healthier."],
      ["My friend advised me to eat healthier.", "My friend asked me to eat healthier.", "My friend told me that I eat healthier."],
      "b6.options",
    );
  },

  // L34 — cleft ("Who was it that...") pasif soruyla karışmıştı; ders artık
  // baştan sona pasif soru biçimini öğretiyor ("Who was it made by?").
  "b1-who-was-it-made-by": ({ core, scenes, scenesTouched }) => {
    const p1 = teachPoint(core, "b2", "p1");
    put(p1, "formEn", "who was it", "Who was it made by?", "p1.formEn");
    put(
      p1,
      "claimsEn",
      [
        "Use 'Who was it' at the start of a question to ask who did something when the doer is not known.",
        "This form is often used with passive sentences.",
      ],
      [
        "To ask who did something when you see the result, use a passive question: Who was it made by?",
        "The thing is the subject; 'by' at the end asks about the person who did it.",
      ],
      "p1.claimsEn",
    );
    const p1ex = p1.examples as Array<Record<string, unknown>>;
    put(p1ex[0]!, "textEn", "Who was it that broke the window?", "Who was it made by?", "p1e1.textEn");
    put(p1ex[1]!, "textEn", "Who was it that made this cake?", "Who was this cake made by?", "p1e2.textEn");

    const q2 = quizItem(core, "q2");
    const q2opts = q2.options as string[];
    expect(q2opts[0], "Who was it that fixed the car?", "q2.options[0]");
    q2opts[0] = "Who was the car fixed by?";
    notes.push('  q2.options[0]: cleft → "Who was the car fixed by?"');

    const q4 = quizItem(core, "q4");
    put(q4, "text", "___ that wrote this book?", "Who was this book written ___?", "q4.text");
    put(q4, "answers", [["Who was it"]], [["by"]], "q4.answers");

    const b6 = beat(core, "b6");
    const b6opts = b6.options as string[];
    expect(b6opts[0], "Who was it that made this sculpture?", "b6.options[0]");
    b6opts[0] = "Who was this sculpture made by?";
    notes.push('  b6.options[0]: cleft → "Who was this sculpture made by?"');
    put(b6, "exampleAnswer", "Who was it that made this sculpture?", "Who was this sculpture made by?", "b6.exampleAnswer");

    put(
      scenes.everyday!,
      "avatarOpening",
      "This cake looks amazing! Who was it that made it?",
      "This cake looks amazing! Who was it made by?",
      "scenes.everyday.avatarOpening",
    );
    scenesTouched();
  },

  // L38 — "my brother who" non-defining hedefi virgülsüz temsil ediyordu (katalogdan
  // da çıktı); kapanış virgülü eksik kabul varyantı ayıklandı.
  "b1-my-brother-who-lives-abroad": ({ core, catalog }) => {
    const b7 = beat(core, "b7");
    const spec = b7.answerSpec as Record<string, unknown>;
    put(
      spec,
      "accepted",
      ["My brother, who happens to be a teacher, lives in Rome.", "My brother, who happens to be a teacher lives in Rome."],
      ["My brother, who happens to be a teacher, lives in Rome."],
      "b7.accepted",
    );
    put(
      core.practice as unknown as Record<string, unknown>,
      "mustUse",
      ["my brother who", "which was lovely", "who happens to be"],
      catalog.targetPhrases,
      "practice.mustUse",
    );
    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(rubric, "mustUse", ["my brother who", "which was lovely", "who happens to be"], catalog.targetPhrases, "b8.rubric.mustUse");
  },

  // L40 — kural TERS yazılmıştı ("Do not put ... 'old nice' as 'nice old'") ve
  // yanlış sıra ("old nice") kabul ediliyordu.
  "b1-a-nice-old-wooden-table": ({ core }) => {
    const p1 = teachPoint(core, "b2", "p1");
    const claims = p1.claimsEn as string[];
    expect(claims[1], "Do not put 'big red' as 'red big' or 'old nice' as 'nice old'.", "p1.claimsEn[1]");
    claims[1] = "Say 'nice old', not 'old nice'; say 'big red', not 'red big'.";
    notes.push("  p1.claimsEn[1]: ters kural düzeltildi");

    const b5 = beat(core, "b5");
    const spec = b5.answerSpec as Record<string, unknown>;
    put(spec, "accepted", ["nice old", "old nice"], ["nice old"], "b5.accepted");
  },

  // L43 — kanıtsız "must" isteniyordu; bağlam güçlendirildi, zayıf kanıt sorusu
  // açıkça belirsizliğe işaret ediyor.
  "b1-she-must-be-tired": ({ core }) => {
    const q2 = quizItem(core, "q2");
    put(
      q2,
      "text",
      "He is not at home. He ___ be at the gym.",
      "He is not at home. I am not sure where he is. He ___ be at the gym.",
      "q2.text",
    );
    const b5 = beat(core, "b5");
    put(b5, "item", "Look at her face. She ___ be very happy.", "She just won the lottery. She ___ be very happy.", "b5.item");
    const b6 = beat(core, "b6");
    put(
      b6,
      "item",
      "He is not answering his phone. What do you think?",
      "He is not answering his phone, but you have no idea why. What is the best guess?",
      "b6.item",
    );
  },

  // L44 — "çok yorgun" tek başına must have için zayıf kanıttı.
  "b1-it-cant-have-been-him": ({ core }) => {
    const b6 = beat(core, "b6");
    put(
      b6,
      "item",
      "He is very tired today. What do you say?",
      "He is very tired today and he was at a party until 3 a.m. What do you say?",
      "b6.item",
    );
  },

  // L45 — SES duyulan soruda doğru cevap "looks like" olamaz.
  "b1-it-looks-like-rain": ({ core }) => {
    const ex2 = beat(core, "ex2");
    const opts = ex2.options as string[];
    expect(opts[0], "It looks like something fell.", "ex2.options[0]");
    opts[0] = "It sounds like something fell.";
    notes.push('  ex2.options[0]: "It looks like..." → "It sounds like something fell."');
    put(ex2, "exampleAnswer", "It looks like something fell.", "It sounds like something fell.", "ex2.exampleAnswer");
  },

  // L58 — açık boşluklarda üç kalıp da savunulabilirdi (kabul genişledi);
  // MCQ tek savunulabilir cevaba zorlayan bağlama taşındı.
  "b1-saying-it-more-precisely": ({ core }) => {
    const ex1 = beat(core, "ex1");
    const spec1 = ex1.answerSpec as Record<string, unknown>;
    put(spec1, "accepted", ["more like"], ["more like", "to be precise", "what I mean is"], "ex1.accepted");

    const ex2 = beat(core, "ex2");
    put(ex2, "item", "The window is not broken. ___, it is just hard to open.", "It is 3:58. We have two minutes, ___.", "ex2.item");
    put(ex2, "options", ["To be precise", "More like", "What I mean is"], ["to be precise", "more like", "what I mean is"], "ex2.options");
    put(ex2, "exampleAnswer", "To be precise", "to be precise", "ex2.exampleAnswer");

    const q2 = quizItem(core, "q2");
    put(q2, "answers", [["more like"]], [["more like", "to be precise", "what I mean is"]], "q2.answers");
    const q4 = quizItem(core, "q4");
    put(
      q4,
      "answers",
      [["To be precise", "to be precise"]],
      [["To be precise", "to be precise", "What I mean is", "what I mean is"]],
      "q4.answers",
    );
  },

  // L60 — "even though feeling sick" yanlış İngilizceydi (even though yan cümle
  // ister); madde yan cümleye çevrildi. Bozuk kabul varyantı ayıklandı.
  "b1-although-however-despite": ({ core }) => {
    const b6 = beat(core, "b6");
    put(b6, "item", "She went to the party ___ feeling sick.", "She went to the party ___ she felt sick.", "b6.item");
    const b7 = beat(core, "b7");
    const spec = b7.answerSpec as Record<string, unknown>;
    put(
      spec,
      "accepted",
      ["He was nervous. Despite that, he gave a great presentation.", "He was nervous, despite that he gave a great presentation."],
      ["He was nervous. Despite that, he gave a great presentation."],
      "b7.accepted",
    );
  },

  // L62 — "We have a meeting..., haven't we?" yanlış tag (have burada ana fiil →
  // don't we). Sahnelerde de aynı hata iki kez ("haven't you?", "aren't you?").
  "b1-youre-coming-arent-you": ({ core, scenes, scenesTouched }) => {
    const b8 = beat(core, "b8");
    put(b8, "exampleAnswer", "We have a meeting at 10, haven't we?", "We have agreed to meet at 10, haven't we?", "b8.exampleAnswer");

    put(
      scenes.exam!,
      "avatarOpening",
      "You have breakfast every morning, haven't you?",
      "You have breakfast every morning, don't you?",
      "scenes.exam.avatarOpening",
    );
    put(
      scenes.travel!,
      "avatarOpening",
      "You want the taxi at 8 am, aren't you?",
      "You want the taxi at 8 am, don't you?",
      "scenes.travel.avatarOpening",
    );
    scenesTouched();
  },

  // L64 — "not enough" kabulü çifte olumsuz üretiyordu ("do not have not enough");
  // exampleAnswer da aynı hatayı ekranda gösteriyordu.
  "b1-enough-too-much-plenty": ({ core }) => {
    const b5 = beat(core, "b5");
    const spec = b5.answerSpec as Record<string, unknown>;
    put(spec, "accepted", ["enough", "not enough"], ["enough"], "b5.accepted");
    put(b5, "exampleAnswer", "not enough", "enough", "b5.exampleAnswer");
  },

  // L68 — "No offence but," virgül yanlış yerdeydi (doğrusu "No offence, but ...");
  // kabalık uyarısı iddia olarak eklendi.
  "b1-telling-it-like-it-is": ({ core }) => {
    const p3 = teachPoint(core, "b2", "p3");
    const claims = p3.claimsEn as string[];
    expect(claims.length, 3, "p3.claimsEn.length");
    claims.push("Even with this phrase, your words can still sound rude, so use it only with people you know well.");
    notes.push("  p3.claimsEn: kabalık uyarısı eklendi");

    const p3ex = p3.examples as Array<Record<string, unknown>>;
    put(
      p3ex[0]!,
      "textEn",
      "No offence but, I think you could do better next time.",
      "No offence, but I think you could do better next time.",
      "p3e1.textEn",
    );
    put(p3ex[1]!, "textEn", "No offence but, I do not agree with your idea.", "No offence, but I do not agree with your idea.", "p3e2.textEn");

    const q1 = quizItem(core, "q1");
    const q1opts = q1.options as string[];
    expect(q1opts[0], "No offence but", "q1.options[0]");
    q1opts[0] = "No offence, but";
    notes.push('  q1.options[0]: "No offence, but"');

    const q4 = quizItem(core, "q4");
    put(q4, "text", "___, I do not really like the colors you chose.", "___ I do not really like the colors you chose.", "q4.text");
    put(q4, "answers", [["No offence but", "no offence but"]], [["No offence, but", "no offence, but"]], "q4.answers");

    const ex2 = beat(core, "ex2");
    const ex2opts = ex2.options as string[];
    expect(ex2opts[0], "No offence but", "ex2.options[0]");
    ex2opts[0] = "No offence, but";
    notes.push('  ex2.options[0]: "No offence, but"');
    put(ex2, "exampleAnswer", "No offence but", "No offence, but", "ex2.exampleAnswer");
  },
};

// ---------------------------------------------------------------------------
// Ana akış
// ---------------------------------------------------------------------------

const ids = Object.keys(FIXES);
const lessons = await db.select().from(catalogLessons).where(inArray(catalogLessons.id, ids));
const cores = await db.select().from(lessonCores).where(inArray(lessonCores.catalogLessonId, ids));
const sceneSets = await db
  .select()
  .from(lessonSceneSets)
  .where(inArray(lessonSceneSets.coreId, cores.map((c) => c.id)));

const missing = ids.filter((id) => !lessons.some((l) => l.id === id) || !cores.some((c) => c.catalogLessonId === id));
if (missing.length) throw new Error(`katalog/çekirdek eksik: ${missing.join(", ")}`);

let patched = 0;
let scenesPatched = 0;

for (const id of ids) {
  const lesson = lessons.find((l) => l.id === id)!;
  const coreRow = cores.find((c) => c.catalogLessonId === id)!;
  const sceneRow = sceneSets.find((s) => s.coreId === coreRow.id);
  if (!sceneRow) throw new Error(`${id}: sahne seti yok`);
  if (coreRow.status === "published") throw new Error(`${id}: YAYINLANMIŞ çekirdek — bu script yayın öncesi cerrahi içindir`);

  const core = structuredClone(coreRow.core) as LessonCore;
  const scenes = structuredClone(sceneRow.scenes) as Record<string, Record<string, unknown>>;
  let touchedScenes = false;

  notes.length = 0;
  FIXES[id]!({ core, scenes, catalog: { targetPhrases: lesson.targetPhrases as string[] }, scenesTouched: () => (touchedScenes = true) });

  // Şema + lint kapısı — geçmeyen düzeltme DB'ye yazılmaz
  const parsedCore = lessonCoreSchema.parse(core);
  const coreReport = lintCore(parsedCore, { forbidden: [] });
  if (coreReport.errors.length) throw new Error(`${id}: lintCore red — ${coreReport.errors.join(" · ")}`);

  const parsedScenes = sceneSetSchema.parse({ sceneFormat: SCENE_FORMAT, scenes }) as SceneSet;
  if (touchedScenes) {
    const sceneReport = lintScenes(parsedScenes, { forbidden: [] });
    if (sceneReport.errors.length) throw new Error(`${id}: lintScenes red — ${sceneReport.errors.join(" · ")}`);
  }

  const hashMoves = coreRow.specHash !== lesson.specHash ? ` · spec_hash ${coreRow.specHash} → ${lesson.specHash}` : "";
  console.log(`\n■ ${id}${hashMoves}`);
  for (const n of notes) console.log(n);

  if (!dry) {
    await db
      .update(lessonCores)
      .set({ core: parsedCore, specHash: lesson.specHash, updatedAt: new Date() })
      .where(inArray(lessonCores.id, [coreRow.id]));
    if (touchedScenes) {
      await db
        .update(lessonSceneSets)
        .set({ scenes: parsedScenes.scenes, updatedAt: new Date() })
        .where(inArray(lessonSceneSets.id, [sceneRow.id]));
      scenesPatched++;
    }
    patched++;
  }
}

console.log(
  `\n${dry ? "[KURU KOŞU] " : ""}${ids.length} ders işlendi · ${patched} çekirdek yazıldı · ${scenesPatched} sahne seti yazıldı`,
);
await sql.end();
