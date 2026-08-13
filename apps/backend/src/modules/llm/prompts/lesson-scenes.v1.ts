import { SCENE_FORMAT, TRACKS, type LessonCore } from "@arna/contracts";

export const LESSON_SCENES_VERSION = "lesson-scenes.v1";

export interface SceneGenContext {
  cefrLevel: string;
  core: Pick<LessonCore, "topic" | "focus" | "communicationGoal" | "practice">;
  themeHint: string;
}

/**
 * SAHNE SETİ üretimi — beş track'in rol yapma varyantı TEK çağrıda.
 *
 * Neden tek çağrı: (1) beş sahne aynı hedef kalıplara hizmet eder, model
 * tutarlılığı tek bağlamda daha iyi kurar; (2) inceleme dökümünde beşi yan
 * yana karşılaştırılır; (3) 371 ders × 1 çağrı, 371 × 5 değil.
 *
 * Sahne İngilizce'dir (tutorPrompt'a girer); ana-dil tarifleri dil paketinde.
 * Track yalnızca DEKORU değiştirir: öğretilen yapı, hedef kalıplar ve ölçüm
 * çekirdekte sabittir.
 */
export function buildScenesPrompt(ctx: SceneGenContext): { system: string; user: string } {
  const system = [
    `You are an expert English lesson author writing FIVE role-play scene variants for one lesson.`,
    `The lesson core (teaching, exercises, measurement) is fixed and shared; each scene only changes`,
    `the SETTING so the learner practises the same target phrases in the context they chose.`,
    ``,
    `The five contexts:`,
    `- everyday: daily life — friends, shops, neighbours, family`,
    `- work: professional life — meetings, colleagues, interviews, clients`,
    `- travel: being abroad — airports, hotels, landlords, clinics, officials`,
    `- academic: study life — classes, seminars, study groups, advisors`,
    `- exam: a speaking-exam setting — an examiner asks structured questions (setting only; no exam-format tasks)`,
    ``,
    `Output STRICT JSON only:`,
    `{"sceneFormat": ${SCENE_FORMAT}, "scenes": {`,
    TRACKS.map(
      (t) =>
        `  "${t}": {"persona":{"name":"<English name, NEVER Emma>","role":"<their role>","mood":"friendly|curious|busy","goal":"<what this character wants from the conversation>"},"scene":"<one sentence: the setting>","objective":"<what the learner must accomplish>","avatarOpening":"<the character's first line, natural, ends with a question>"}`,
    ).join(",\n"),
    `}}`,
    ``,
    `RULES:`,
    `- ALL five contexts, each a genuinely different SETTING for the same practice.`,
    `- Build every scene so the learner NATURALLY needs the given target phrases.`,
    `- avatarOpening is spoken aloud by the character: simple English at the learner's level, ends with "?".`,
    `- Persona names vary across the five scenes (not the same person five times), never "Emma".`,
    `- NO personal data, no learner names. PLAIN ASCII. No markdown — JSON only.`,
  ].join("\n");

  const user = [
    `Lesson:`,
    `- CEFR level: ${ctx.cefrLevel}`,
    `- Topic: ${ctx.core.topic}`,
    `- Focus: ${ctx.core.focus}`,
    `- Communication goal: ${ctx.core.communicationGoal}`,
    `- Situation flavour: ${ctx.themeHint}`,
    `- Target phrases the learner must say (build scenes around these): ${ctx.core.practice.mustUse.join(" · ")}`,
    ``,
    `Write the five scene variants now.`,
  ].join("\n");

  return { system, user };
}
