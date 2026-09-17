/**
 * B1 İNCELEME TUR-2 DÜZELTMELERİ — elle yazıldı, LLM'siz.
 *
 *   set -a; source .env; set +a; npx tsx scripts/patch-b1-review2.ts [--dry]
 *
 * Kaynak: kullanıcının 2. tur incelemesi + Claude'un elicitation taraması (68×5 sahne).
 * Kurallar patch-b1-review.ts ile aynı: expect → değiştir → şema + lint → yaz.
 *
 * ÖZEL DURUM — L5 (b1-suddenly-meanwhile-later) YAYINLI ve dil paketleri var.
 * `sourceHash` yalnız katalog BAŞLIĞINI parmak-izler; çekirdek iddiası değişince
 * paketler kendiliğinden bayatlamaz. Bu yüzden L5'in locale satırları SİLİNİR
 * (sessions.locale_id FK'sı ON DELETE SET NULL — güvenli); ilk istekte ya da
 * warm-locales'ta yeniden üretilirler. "retired" durumu KULLANILMAZ: claim
 * döngüsü retired'ı tanımıyor, aynı anahtarla sonsuza dek "in progress" beklerdi.
 */
import { eq, inArray } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonLocales, lessonSceneSets } from "../src/db/schema.js";
import { SCENE_FORMAT, lessonCoreSchema, sceneSetSchema, type LessonCore, type SceneSet } from "@glotmate/contracts";
import { lintCore, lintScenes } from "../src/modules/lesson/lintLayers.js";

const dry = process.argv.includes("--dry");

/** Yayınlı olduğu hâlde bilerek düzeltilen dersler (dil paketleri silinir) */
const ALLOW_PUBLISHED = new Set(["b1-suddenly-meanwhile-later"]);

const notes: string[] = [];

function expect(actual: unknown, expected: unknown, ctx: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${ctx}: mevcut değer beklenenden farklı.\n  beklenen: ${e}\n  bulunan:  ${a}`);
  }
}

function put<T>(obj: Record<string, unknown>, key: string, expected: T, next: T, ctx: string): void {
  expect(obj[key], expected, ctx);
  obj[key] = next;
  notes.push(`  ${ctx} güncellendi`);
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
  scenesTouched: () => void;
}

const FIXES: Record<string, (f: FixCtx) => void> = {
  // L5 — 'in the meantime' "aynı anda" değil, İKİ OLAY ARASINDAKİ SÜREYİ anlatır.
  // Yayınlı ders: dil paketleri aşağıda silinir.
  "b1-suddenly-meanwhile-later": ({ core }) => {
    const p3 = teachPoint(core, "b2", "p3");
    const claims = p3.claimsEn as string[];
    expect(claims[0], "Use 'in the meantime' to talk about something happening at the same time as another event.", "p3.claimsEn[0]");
    claims[0] = "Use 'in the meantime' to talk about what happens in the time between two events, often while you wait.";
    notes.push("  p3.claimsEn[0]: 'in the meantime' tanımı hassaslaştırıldı");
  },

  // L8 — "this morning" öğleden sonra BİTMİŞ dilimdir (past simple ister); hedefi
  // temiz ölçmek için her zaman bitmemiş olan "today" kullanıldı.
  "b1-have-you-finished-yet": ({ core }) => {
    const ex1 = beat(core, "ex1");
    put(ex1, "item", "___ your work this morning?", "___ your work today?", "ex1.item");
  },

  // L22 — iddia "were, not was" derken alıştırmalar was'ı kabul ediyordu.
  // Modern kullanım: were dikkatli/resmi tercih, was gündelik dilde yaygın.
  "b1-i-wish-things-were-different": ({ core }) => {
    const p3 = teachPoint(core, "b2", "p3");
    put(
      p3,
      "claimsEn",
      [
        "Use 'I wish it were' (not 'was') to talk about unreal or impossible situations now.",
        "'Were' is used after 'I wish it' for all subjects.",
      ],
      [
        "After 'I wish it', careful and formal English prefers 'were' for unreal situations.",
        "In everyday informal English, 'was' is also common: 'I wish it was easier.'",
      ],
      "p3.claimsEn",
    );
  },

  // L27 — üç fiili de kabul eden boşluklar anlam ayrımını ölçmüyordu; doğrudan
  // söz verilince her madde TEK savunulabilir fiile kilitleniyor (emir→told,
  // should→advised, please→asked).
  "b1-they-told-me-to-wait": ({ core }) => {
    const b5 = beat(core, "b5");
    put(
      b5,
      "item",
      "My teacher ___ do my homework every day.",
      "Your teacher said: 'Do your homework every day.' Reported: My teacher ___ do my homework every day.",
      "b5.item",
    );
    const spec5 = b5.answerSpec as Record<string, unknown>;
    put(spec5, "accepted", ["told me to", "asked me to", "advised me to"], ["told me to"], "b5.accepted");

    const q2 = quizItem(core, "q2");
    put(q2, "text", "The doctor ___ exercise more.", "The doctor said: 'You should exercise more.' Reported: The doctor ___ exercise more.", "q2.text");
    put(q2, "answers", [["advised me to", "told me to"]], [["advised me to"]], "q2.answers");

    const q4 = quizItem(core, "q4");
    put(q4, "text", "My parents ___ clean my room.", "My parents said: 'Please clean your room.' Reported: My parents ___ clean my room.", "q4.text");
    put(q4, "answers", [["told me to", "asked me to"]], [["asked me to"]], "q4.answers");
  },

  // L38 — virgül bilgisi SESLE ölçülemez: başarı kriterlerinden virgül şartı
  // çıkarıldı (virgül öğretimi görsel quiz/MCQ'da zaten var).
  "b1-my-brother-who-lives-abroad": ({ core }) => {
    put(
      core.practice as unknown as Record<string, unknown>,
      "successCriteria",
      "The learner adds extra information with commas using at least one of the required phrases.",
      "The learner adds extra information about a person or thing using at least one of the required phrases.",
      "practice.successCriteria",
    );
    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(
      rubric,
      "criteria",
      "The answer must use at least one phrase from the list and add extra information with commas.",
      "The answer must use at least one phrase from the list to add extra information about a person or thing.",
      "b8.rubric.criteria",
    );
  },

  // L45 — "seems to be not working" doğal değil; madde "broken" üzerinden kuruldu.
  "b1-it-looks-like-rain": ({ core }) => {
    const ex3 = beat(core, "ex3");
    put(ex3, "item", "the printer / not working / use 'seems to be'", "the printer / broken / use 'seems to be'", "ex3.item");
    const spec = ex3.answerSpec as Record<string, unknown>;
    put(
      spec,
      "accepted",
      ["The printer seems to be not working.", "It seems to be not working.", "It seems to be broken."],
      ["The printer seems to be broken.", "It seems to be broken."],
      "ex3.accepted",
    );
    put(ex3, "exampleAnswer", "The printer seems to be not working.", "The printer seems to be broken.", "ex3.exampleAnswer");
  },

  // L46 — yazılı örneklerde virgül eksikleri ve comma splice'lar.
  "b1-im-not-sure-but": ({ core }) => {
    const p1 = teachPoint(core, "b2", "p1");
    const p1ex = p1.examples as Array<Record<string, unknown>>;
    put(p1ex[0]!, "textEn", "I'm not sure but I think the meeting starts at 10.", "I'm not sure, but I think the meeting starts at 10.", "p1e1");
    put(p1ex[1]!, "textEn", "I'm not sure but maybe we should ask the manager.", "I'm not sure, but maybe we should ask the manager.", "p1e2");

    const p2 = teachPoint(core, "b2", "p2");
    const p2ex = p2.examples as Array<Record<string, unknown>>;
    put(p2ex[0]!, "textEn", "It is the last item on the list, I could be wrong.", "It is the last item on the list. I could be wrong.", "p2e1");
    put(p2ex[1]!, "textEn", "She is from the finance team, I could be wrong.", "She is from the finance team, but I could be wrong.", "p2e2");

    const q3 = quizItem(core, "q3");
    const q3opts = q3.options as string[];
    expect(q3opts[0], "I'm not sure but the meeting is on Monday.", "q3.options[0]");
    q3opts[0] = "I'm not sure, but the meeting is on Monday.";
    notes.push("  q3.options[0]: virgül eklendi");

    const q4 = quizItem(core, "q4");
    put(q4, "text", "It is the last item on the list, ___ .", "It is the last item on the list, but ___ .", "q4.text");

    const b7 = beat(core, "b7");
    const spec7 = b7.answerSpec as Record<string, unknown>;
    put(
      spec7,
      "accepted",
      ["I'm not sure but the meeting is at 3", "I am not sure but the meeting is at 3"],
      ["I'm not sure, but the meeting is at 3.", "I am not sure, but the meeting is at 3."],
      "b7.accepted",
    );
    put(b7, "exampleAnswer", "I'm not sure but the meeting is at 3", "I'm not sure, but the meeting is at 3.", "b7.exampleAnswer");
  },

  // L50 — "we'd be happy" tartışmasız yanlış DEĞİL (tekrarlanan geçmiş durum
  // okuması var) → çeldirici tartışmasız yanlış biçimle değişti; mutlak "would
  // asla be ile kullanılmaz" izlenimi veren iddialar yumuşatıldı.
  "b1-we-would-spend-summers-there": ({ core }) => {
    const p2 = teachPoint(core, "b2", "p2");
    put(
      p2,
      "claimsEn",
      [
        "Use 'would' for actions or events, not for states or feelings.",
        "Do not use 'would' for things like 'be', 'know', or 'like' in this way.",
      ],
      [
        "Use 'would' mainly for repeated actions and events in the past.",
        "For permanent past states with verbs like 'be', 'know' or 'like', English usually prefers 'used to' or the past simple.",
      ],
      "p2.claimsEn",
    );
    const p2ex = p2.examples as Array<Record<string, unknown>>;
    put(
      p2ex[1]!,
      "textEn",
      "Not correct: 'When I was young, I would be shy.' (Use 'was' instead.)",
      "Usually not: 'When I was young, I would be shy.' Better: 'I was shy' or 'I used to be shy.'",
      "p2e2",
    );

    const b6 = beat(core, "b6");
    put(
      b6,
      "options",
      ["Every summer we'd visit our cousins.", "Every summer we'd be happy.", "Every summer we'd went to school."],
      ["Every summer we'd visit our cousins.", "Every summer we'd visited our cousins.", "Every summer we'd went to school."],
      "b6.options",
    );

    const q3 = quizItem(core, "q3");
    const q3opts = q3.options as string[];
    expect(q3opts[1], "My family would always be together.", "q3.options[1]");
    q3opts[1] = "My family would always knew everyone in town.";
    notes.push("  q3.options[1]: savunulabilir çeldirici tartışmasız yanlışla değişti");
  },

  // L58 — tek boşluğa üç farklı kalıp doğal oturmuyordu; her kalıp kendi doğal
  // çerçevesini aldı: more like → "not X, more like Y" (öğretilen örneğin birebir
  // kalıbı), what I mean is → yanlış anlaşılmayı düzeltme, to be precise → ex2 (3:58).
  "b1-saying-it-more-precisely": ({ core }) => {
    const ex1 = beat(core, "ex1");
    put(ex1, "item", "The light is not off, ___, it is very dim.", "The light is not off, ___ very dim.", "ex1.item");
    const spec1 = ex1.answerSpec as Record<string, unknown>;
    put(spec1, "accepted", ["more like", "to be precise", "what I mean is"], ["more like"], "ex1.accepted");

    const q2 = quizItem(core, "q2");
    put(
      q2,
      "text",
      "The chair is not broken, ___, it just wobbles a little.",
      "I did not say the food was bad. ___, the portion was small.",
      "q2.text",
    );
    put(q2, "answers", [["more like", "to be precise", "what I mean is"]], [["What I mean is", "what I mean is"]], "q2.answers");
  },

  // L61 — kabul listesinde birebir tekrar; open response "üç kalıbın ÜÇÜ birden"
  // istiyordu (iki hakta B1 için tuzak) → en az ikiye indirildi.
  "b1-explaining-yourself-clearly": ({ core }) => {
    const b5 = beat(core, "b5");
    const spec = b5.answerSpec as Record<string, unknown>;
    put(spec, "accepted", ["let me put it", "let me put it"], ["let me put it"], "b5.accepted");

    const b8 = beat(core, "b8");
    const rubric = b8.rubric as Record<string, unknown>;
    put(
      rubric,
      "criteria",
      "The answer explains something complicated, uses all three target phrases, and is easy to understand.",
      "The answer explains something complicated, uses at least two of the target phrases, and is easy to understand.",
      "b8.rubric.criteria",
    );
  },

  // L64 — "Did you have not enough...?" doğal değil; soru öğretilen kalıpları
  // ("enough" ailesi) doğal biçimde çağıracak şekilde kuruldu.
  "b1-enough-too-much-plenty": ({ core }) => {
    const b8 = beat(core, "b8");
    put(
      b8,
      "question",
      "Think about your last project or event. Did you have not enough, too much, or plenty of time? Explain.",
      "Think about your last project or event. Was there enough time, too much time, or plenty of time? Explain.",
      "b8.question",
    );
  },

  // L10 — mustUse'un tamamı SORU kalıbı; dört sahnede avatar öğrenciyi sorgulayarak
  // cevap moduna itiyordu (travel açılışı iki mustUse'u kendisi söylüyordu).
  // Açılışlar turu öğrencinin SORMASINA devrediyor (exam zaten doğruydu).
  "b1-how-long-have-you-been-doing-that": ({ scenes, scenesTouched }) => {
    put(
      scenes.work!,
      "avatarOpening",
      "Hey! I heard you’ve been really busy. What projects have you been working on?",
      "Hey! I have been buried in a new project for weeks, and nobody ever asks me about it. Why don't you ask me what I have been doing?",
      "scenes.work.avatarOpening",
    );
    put(
      scenes.travel!,
      "avatarOpening",
      "Welcome! Are you new here, or have you been traveling for a while?",
      "Welcome! I have worked at this hostel for ages and I know everything about this city. What would you like to ask me?",
      "scenes.travel.avatarOpening",
    );
    put(
      scenes.academic!,
      "avatarOpening",
      "Hi! Glad you could join us. What have you been studying lately?",
      "Hi! Glad you could join us. New members usually have lots of questions about the group and what we have been studying. What would you like to ask?",
      "scenes.academic.avatarOpening",
    );
    put(
      scenes.everyday!,
      "avatarOpening",
      "Hi! I haven’t seen you much lately. What have you been up to?",
      "Hi! We have not talked in ages, and so much has been happening with me. Do you want to ask me about it?",
      "scenes.everyday.avatarOpening",
    );
    scenesTouched();
  },

  // L34 — beş sahnenin dördünde hedef soruyu AVATAR soruyordu; öğrenciye yalnız
  // cevap kalıyordu. Yeni kural: avatar bilgiyi elinde tuttuğunu söyler, soruyu
  // ÖĞRENCİ sorar.
  "b1-who-was-it-made-by": ({ scenes, scenesTouched }) => {
    put(
      scenes.exam!,
      "avatarOpening",
      "Look at this object. Who was it made by?",
      "Here is a photo of a beautiful handmade object. I know who made it and how. What would you like to ask me about it?",
      "scenes.exam.avatarOpening",
    );
    put(
      scenes.work!,
      "avatarOpening",
      "The report is finished already. Was it done by someone in your team?",
      "This report appeared on my desk finished, but nobody put their name on it. Can you help me find out who did it?",
      "scenes.work.avatarOpening",
    );
    put(
      scenes.travel!,
      "avatarOpening",
      "You found a fruit basket in your room? Who was it arranged by?",
      "I heard there is a fruit basket in your room, a surprise from someone at the hotel. Would you like to ask me about it?",
      "scenes.travel.avatarOpening",
    );
    put(
      scenes.academic!,
      "avatarOpening",
      "This poster looks great! Was it made by your group?",
      "You are looking at the science fair poster, right? I happen to know exactly who created it. What do you want to ask me?",
      "scenes.academic.avatarOpening",
    );
    put(
      scenes.everyday!,
      "avatarOpening",
      "This cake looks amazing! Who was it made by?",
      "Someone left this amazing cake in our kitchen, and I know who it was. Do you want to ask me about it?",
      "scenes.everyday.avatarOpening",
    );
    scenesTouched();
  },

  // L62 — beş açılışın beşi de tag'i AVATARIN ağzına veriyordu; öğrenciye "yes/no"
  // kalıyordu. Yeni kural: avatar emin olmayan taraf, öğrenci detayları tag'lerle
  // TEYİT EDEN taraf.
  "b1-youre-coming-arent-you": ({ scenes, scenesTouched }) => {
    put(
      scenes.exam!,
      "avatarOpening",
      "You have breakfast every morning, don't you?",
      "Before we begin, you probably want to check a few details about the exam with me. What would you like to confirm?",
      "scenes.exam.avatarOpening",
    );
    put(
      scenes.work!,
      "avatarOpening",
      "The meeting starts at ten, doesn't it?",
      "I lost my note with the meeting details, and I am not sure I remember them right. Can you check the details with me?",
      "scenes.work.avatarOpening",
    );
    put(
      scenes.travel!,
      "avatarOpening",
      "You want the taxi at 8 am, don't you?",
      "Here is your check-out summary. It is worth confirming the details, like the taxi time and the bill. What would you like to check?",
      "scenes.travel.avatarOpening",
    );
    put(
      scenes.academic!,
      "avatarOpening",
      "We're meeting in the library tomorrow, aren't we?",
      "About tomorrow's study session, I keep forgetting the details. Can you go over the plan and check it with me?",
      "scenes.academic.avatarOpening",
    );
    put(
      scenes.everyday!,
      "avatarOpening",
      "We're meeting at the park on Saturday, aren't we?",
      "About Saturday, my memory is terrible and I do not want to mix up our plan. Can you check the details with me?",
      "scenes.everyday.avatarOpening",
    );
    scenesTouched();
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

let patched = 0;
let scenesPatched = 0;
let localesDeleted = 0;

for (const id of ids) {
  const lesson = lessons.find((l) => l.id === id);
  const coreRow = cores.find((c) => c.catalogLessonId === id);
  if (!lesson || !coreRow) throw new Error(`katalog/çekirdek eksik: ${id}`);
  const sceneRow = sceneSets.find((s) => s.coreId === coreRow.id);
  if (!sceneRow) throw new Error(`${id}: sahne seti yok`);
  if (coreRow.status === "published" && !ALLOW_PUBLISHED.has(id)) {
    throw new Error(`${id}: yayınlanmış çekirdek — listede yok`);
  }

  const core = structuredClone(coreRow.core) as LessonCore;
  const scenes = structuredClone(sceneRow.scenes) as Record<string, Record<string, unknown>>;
  let touchedScenes = false;

  notes.length = 0;
  const before = JSON.stringify(core);
  FIXES[id]!({ core, scenes, scenesTouched: () => (touchedScenes = true) });
  const coreChanged = JSON.stringify(core) !== before;

  const parsedCore = lessonCoreSchema.parse(core);
  const coreReport = lintCore(parsedCore, { forbidden: [] });
  if (coreReport.errors.length) throw new Error(`${id}: lintCore red — ${coreReport.errors.join(" · ")}`);

  const parsedScenes = sceneSetSchema.parse({ sceneFormat: SCENE_FORMAT, scenes }) as SceneSet;
  if (touchedScenes) {
    const sceneReport = lintScenes(parsedScenes, { forbidden: [] });
    if (sceneReport.errors.length) throw new Error(`${id}: lintScenes red — ${sceneReport.errors.join(" · ")}`);
  }

  console.log(`\n■ ${id}${coreRow.status === "published" ? " (YAYINLI — paketleri silinecek)" : ""}`);
  for (const n of notes) console.log(n);

  if (!dry) {
    if (coreChanged) {
      await db.update(lessonCores).set({ core: parsedCore, updatedAt: new Date() }).where(eq(lessonCores.id, coreRow.id));
      patched++;
    }
    if (touchedScenes) {
      await db.update(lessonSceneSets).set({ scenes: parsedScenes.scenes, updatedAt: new Date() }).where(eq(lessonSceneSets.id, sceneRow.id));
      scenesPatched++;
    }
    if (coreChanged && ALLOW_PUBLISHED.has(id)) {
      const gone = await db
        .delete(lessonLocales)
        .where(eq(lessonLocales.coreId, coreRow.id))
        .returning({ language: lessonLocales.language });
      localesDeleted += gone.length;
      console.log(`  dil paketleri silindi: ${gone.map((g) => g.language).join(", ") || "(yok)"}`);
    }
  }
}

console.log(
  `\n${dry ? "[KURU KOŞU] " : ""}${ids.length} ders işlendi · ${patched} çekirdek · ${scenesPatched} sahne seti · ${localesDeleted} dil paketi silindi`,
);
await sql.end();
