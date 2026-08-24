import { L10N_FORMAT, TRACKS, type LessonCore, type SceneSet } from "@arna/contracts";
import { languageName } from "../../../lib/language.js";

export const LESSON_LOCALE_VERSION = "lesson-locale.v1";

export interface LocaleGenContext {
  /** BCP-47, normalize */
  language: string;
  cefrLevel: string;
  /** Katalogdaki kanonik İngilizce başlık — L1 başlığın kaynağı */
  titleEn: string;
  themeHint: string;
  core: LessonCore;
  sceneSet: SceneSet;
}

/**
 * DİL PAKETİ üretimi — çeviri DEĞİL, "bu iddiaları bu dilin konuşanına anlat".
 *
 * İki yapısal koruma:
 * 1. Modelin çıktı şemasında İNGİLİZCE METİN ALANI YOKTUR. Örnek cümleler
 *    yalnızca {"kind":"core_ref","refId":"p1e1"} ile ANILIR; assembler metni
 *    çekirdekten çözer. Model örneği bozamaz, çeviremez, kopyalayamaz.
 *    (Bu kural `mustUse`'un iki canlı hatasından öğrenildi: talimatla korunan
 *    sınır delinir, şemayla korunan delinemez.)
 * 2. Girdi claimsEn İDDİA LİSTESİDİR: model bunları hedef dilde AÇIKLAR ama
 *    yeni gramer iddiası ekleyemez. Pedagojinin denetimi çekirdekte kalır.
 */
export function buildLocalePrompt(ctx: LocaleGenContext): { system: string; user: string } {
  const lang = languageName(ctx.language);

  const system = [
    `You are an expert English teacher who is a NATIVE ${lang} speaker, writing the ${lang} edition`,
    `of one English lesson. The pedagogy is FIXED — you receive the lesson's teaching claims and`,
    `examples in English. Your job is to EXPLAIN them in natural, warm ${lang}, the way a good`,
    `${lang}-speaking English teacher explains to a ${ctx.cefrLevel} student.`,
    ``,
    `THE ONE RULE THAT MATTERS MOST:`,
    `You may NOT introduce any grammar claim that is not in the given claims. You explain, you`,
    `illustrate the GIVEN claims, you never extend them. If a claim feels incomplete, explain it`,
    `as given — the claims were reviewed by humans; your additions would not be.`,
    ``,
    `ENGLISH MATERIAL IS REFERENCED, NEVER WRITTEN.`,
    `Two kinds of reference, both inserted as SEPARATE array items:`,
    `- the FORM being taught (its name): {"kind":"core_ref","refId":"<point id>"} — renders the form, e.g. "all of a sudden"`,
    `- an example sentence: {"kind":"core_ref","refId":"<example id>"}`,
    `The app renders the English from the master copy. Never write English sentences or the form's`,
    `text inside your ${lang} runs — not even translated back. Never write brace characters or any`,
    `placeholder syntax inside text; a reference is ONLY ever its own array item. Weave references`,
    // BU CÜMLE BİLİNÇLİ OLARAK DURUYOR. Selamlama prompt'unda benzer bir "önce
    // X, sonra Y, sonra devam" reçetesi modeli üçüncü parçayı DOLDURMAYA zorlayıp
    // saçmalık ürettirdi. Burada aynı hata olmuyor çünkü referans metin parçası
    // DEĞİL, kendi `kind`'i olan ayrı bir dizi öğesi — ve şemada İngilizce metin
    // alanı hiç yok. 790 paket tarandı: sonu asılı 0, bitişik tekrar 0. Üstelik
    // `LESSON_LOCALE_VERSION` paket ARAMA ANAHTARININ parçası (layers.ts:148),
    // yani bu satırı "düzeltip" sürümü bumplamak 790 paketi bayatlatır — ölçüm
    // kusur göstermiyorken ödenecek gerçek bir para. Değiştirme.
    `naturally into ${lang} word order (e.g. ${lang} text, then the form ref, then ${lang} text continuing the sentence).`,
    ``,
    `Output STRICT JSON only:`,
    `{`,
    `  "l10nFormat": ${L10N_FORMAT},`,
    `  "title": "<lesson title in ${lang} — natural, short, based on the English title and focus>",`,
    `  "theme": "<one short ${lang} phrase: the lesson's context>",`,
    `  "summary": "<2 short ${lang} sentences: what this lesson taught>",`,
    `  "teachPoints": {`,
    `    "<point id>": { "runs": [ {"kind":"l1","text":"<${lang} explanation>"}, {"kind":"core_ref","refId":"<example id>"}, ... ] },`,
    `    ...one entry for EVERY teaching point id given below...`,
    `  },`,
    `  "scenes": {`,
    TRACKS.map(
      (t) => `    "${t}": {"scenario":"<one ${lang} sentence: the scene>","userGoal":"<${lang}: what the learner must accomplish>","personaRole":"<${lang}: the character's role, short>"}`,
    ).join(",\n"),
    `  },`,
    `  "quizFeedback": { "<quiz item id>": ["<${lang} feedback for option 1>", "<for option 2>", ...] }  ← only for mcq items, one entry per option, aligned by order`,
    `}`,
    ``,
    `RULES:`,
    `- Explanations are SHORT (1-3 sentences per point) and spoken-style — a teacher talking, not a textbook.`,
    `- Reference every example of a point at least once (core_ref).`,
    `- Scene descriptions are grounded translations of the given English scenes — same setting, same goal, natural ${lang}.`,
    `- Quiz feedback says WHY an option is right or wrong, one short sentence each.`,
    `- English grammar TERMS may appear untranslated only when ${lang} learners conventionally use the English term.`,
    `- The no-English rule is strict INSIDE teachPoints runs (use core_ref there, always). In plain fields`,
    `  (title, theme, summary, scenes, quizFeedback) you MAY quote a short English phrase when naming it is needed,`,
    `  e.g. a summary that says which phrases were learned.`,
    `- No markdown, no commentary — JSON only.`,
  ].join("\n");

  const teachPointsBlock = ctx.core.lecture.beats
    .filter((b) => b.kind === "teach")
    .flatMap((b) => (b.kind === "teach" ? b.points : []))
    .map((p) =>
      [
        `- point "${p.id}" — form (reference with refId "${p.id}"): ${p.formEn}`,
        ...p.claimsEn.map((c) => `    claim: ${c}`),
        ...p.examples.map((ex) => `    example "${ex.id}": ${ex.textEn}`),
      ].join("\n"),
    )
    .join("\n");

  const scenesBlock = Object.entries(ctx.sceneSet.scenes)
    .map(([track, s]) => `- ${track}: scene "${s.scene}" · learner objective "${s.objective}" · character role "${s.persona.role}"`)
    .join("\n");

  const quizBlock =
    ctx.core.quiz
      ?.filter((q) => q.type === "mcq")
      .map((q) => (q.type === "mcq" ? `- quiz "${q.id}" (correct: option ${q.correctIndex + 1}):\n${q.options.map((o, i) => `    option ${i + 1}: ${o}`).join("\n")}` : ""))
      .join("\n") || "(no mcq quiz items)";

  const user = [
    `Target language: ${lang} (${ctx.language})`,
    `Learner level: ${ctx.cefrLevel}`,
    ``,
    `LESSON`,
    `- English title: ${ctx.titleEn}`,
    `- Focus: ${ctx.core.focus}`,
    `- Topic: ${ctx.core.topic}`,
    `- Context flavour: ${ctx.themeHint}`,
    `- English summary (source for yours): ${ctx.core.summary}`,
    ``,
    `TEACHING POINTS (explain these claims — do not extend them)`,
    teachPointsBlock,
    ``,
    `SCENES (write the ${lang} descriptions)`,
    scenesBlock,
    ``,
    `QUIZ ITEMS (write per-option feedback)`,
    quizBlock,
    ``,
    `Write the ${lang} package JSON now.`,
  ].join("\n");

  return { system, user };
}
