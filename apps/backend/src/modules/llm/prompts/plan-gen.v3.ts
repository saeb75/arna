import type { OnboardingInput } from "@arna/contracts";
import { languageName } from "../../../lib/language.js";

export const PLAN_GEN_VERSION = "plan-gen.v3";

/** Hedef dil daima İngilizce; track tanımları da İngilizce (model için). */
const TRACK_LABELS: Record<string, string> = {
  business: "Business English (meetings, e-mails, presentations, negotiation, career)",
  conversation: "Everyday Conversation (social situations, travel, small talk, daily life)",
  exam: "Exam English (IELTS/TOEFL formats: describing, opinion, academic vocabulary)",
};

export function buildPlanGenPrompt(input: OnboardingInput): { system: string; user: string } {
  const l1 = languageName(input.nativeLanguage);

  const system = [
    `You are an expert CEFR-aligned English curriculum designer. The student is a ${l1} native speaker learning English.`,
    "You design a program as a FLAT, ORDERED PATH of topic lessons (like a learning roadmap).",
    "Output STRICT JSON only, matching exactly this shape:",
    `{"level":"<CEFR>","track":"<track>","lessons":[{"title":"<lesson title in ${l1}>","focus":"<English: the ONE thing taught>","theme":"<context in ${l1}>"}]}`,
    "",
    "RULES:",
    "- Produce 28 to 36 lessons covering the FULL given CEFR level from its start to its end.",
    "- Each lesson teaches ONE clear thing: either a grammar point (e.g. 'Past Simple — regular verbs') or a functional phrase set (e.g. 'Giving opinions: I think / In my opinion'). Write it in `focus` in English.",
    "- Big topics are split into numbered parts (Past Tense I / II / III, titled in the student's language) — each part teaches a DIFFERENT slice (I: regular verbs, II: irregular verbs, III: questions & negatives). Use this for anything too big for one 6-minute lesson.",
    "- Order must follow established CEFR criterial sequencing for the level. A1 example order: to be → have got / possessives → present simple → articles & plurals → there is/are → can (ability) → prepositions of place → present continuous → past simple I/II...",
    "- Alternate: after every 2-3 grammar lessons, insert a functional/phrase lesson (asking for help, ordering food, giving opinions, small talk) so the path is not pure grammar.",
    `- \`title\` and \`theme\` are written in the student's native language (${l1}); \`focus\` is always in English.`,
    "- Personalization lives in `theme`: draw the situation from the student's occupation and interests where it fits naturally (a developer learning past simple gets a theme about reporting yesterday's work in a sprint meeting). Every ~5th lesson use a theme OUTSIDE the stated interests for variety.",
    "- Lessons are self-contained; the student may do them in any order.",
    "- No markdown, no commentary — JSON only.",
  ].join("\n");

  const user = [
    `Student profile:`,
    `- Name: ${input.displayName}`,
    `- Native language: ${l1}`,
    `- CEFR level: ${input.cefrLevel}`,
    `- Track: ${TRACK_LABELS[input.track] ?? input.track}`,
    `- Interests: ${input.interests.join(", ")}`,
    input.occupation ? `- Occupation: ${input.occupation}` : `- Occupation: (not given)`,
    "",
    `Generate the full ${input.cefrLevel} lesson path now.`,
  ].join("\n");

  return { system, user };
}
