import type { CoreBeat, LessonCore, RichText } from "@glotmate/contracts";
import { z } from "zod";
import { GREETING_RULE, identityBlock, languageBlock, replyRunsSchema, STYLE_RULES, taskPosition } from "./prompt.js";
import type { Learner, TurnLlm } from "./types.js";

/**
 * ARAYA GİRME (4 Kas 2026) — öğrenci, hoca CEVAP BEKLEMEYEN bir şey söylerken
 * (anlatım, geçiş, övgü) söz aldı.
 *
 * Eskiden söz kuyruğa giriyor, akış sessizce ileri sarılıyor ve söz BİR SONRAKİ
 * bekleme noktasına teslim ediliyordu: övgü okunurken sorulan "peki neden are
 * değil?" sorusu, öğrencinin henüz duymadığı YENİ alıştırmanın cevabı gibi
 * değerlendiriliyordu ("cevap veriyorum, hoca başka şey söylüyor"). Artık istemci
 * sesi durdurur, bu çağrıyla hocanın kısa cevabını alır ve ders KALDIĞI YERDEN
 * sürer — gerçek bir öğretmenin sözü kesildiğinde yaptığı gibi.
 *
 * AKIŞ KARARI YOK: bu turdan sonra ne olacağı zaten belli (ders kendiliğinden devam
 * eder), modele kesin söylenir — söz ile akış ayrışamaz.
 */
export const INTERJECTION_TURN_VERSION = "interjection-turn.v1";

const interjectionSchema = z.object({ reply: replyRunsSchema });

export interface InterjectionInput {
  core: LessonCore;
  /** Öğrencinin araya girdiği anki adım (anlatım, geçiş ya da az önce biten görev) */
  beatId: string;
  learner: Learner;
  /** Son konuşma satırları (en eskiden yeniye, şimdiki söz HARİÇ) — sunucu transkriptinden */
  recent: Array<{ role: "student" | "tutor"; text: string }>;
  studentText: string;
  /** Hoca sözü kesildiğinde ne söylüyordu (istemcinin ekrandaki son hoca sözü) */
  interruptedText?: string;
}

function whereWeAre(core: LessonCore, beat: CoreBeat | undefined, name: string): string {
  if (!beat) return `You are in the middle of the lesson.`;
  switch (beat.kind) {
    case "teach":
      return `You were in the middle of explaining today's topic to ${name}.`;
    case "say":
      return `You had just finished explaining and were telling ${name} that some short practice questions come next.`;
    case "ask":
      return beat.purpose === "readiness"
        ? `You had just greeted ${name} and named today's topic.`
        : `You were inviting ${name} to ask questions about the topic.`;
    case "exercise":
    case "open_response": {
      const pos = taskPosition(core, beat.id);
      return `${name} had just finished task ${pos.index} of ${pos.total} (it is done — their answer was already handled) and you were reacting to it before moving on.`;
    }
    case "drills":
      return `${name} was in the middle of a short practice game on the screen.`;
  }
}

/** Bu adımdan sonra ne geliyor — model kendisi DUYURMASIN diye bilmesi yeterli. */
function whatComesNext(core: LessonCore, beatId: string): string {
  const beats = core.lecture.beats;
  const i = beats.findIndex((b) => b.id === beatId);
  if (beats[i]?.kind === "teach") return `the rest of your explanation`;
  const next = beats[i + 1];
  if (!next) return `a short role play`;
  if (next.kind === "exercise" || next.kind === "open_response") return `the next practice question`;
  if (next.kind === "drills") return `a short practice game on the screen`;
  if (next.kind === "ask") return `a moment for their questions`;
  return `the next part of the lesson`;
}

export async function runInterjectionTurn(input: InterjectionInput, llm: TurnLlm): Promise<{ reply: RichText }> {
  const { core, learner } = input;
  const beat = core.lecture.beats.find((b) => b.id === input.beatId);
  const interrupted = input.interruptedText?.trim();

  const system = [
    identityBlock(core, learner),
    ``,
    languageBlock(learner),
    ``,
    GREETING_RULE,
    ``,
    `WHERE WE ARE: ${whereWeAre(core, beat, learner.name)} ${learner.name} cut in while you were speaking — like a student raising a hand.`,
    ...(interrupted ? [`WHAT YOU WERE SAYING when they cut in: ${JSON.stringify(interrupted.slice(0, 600))}`] : []),
    ``,
    `YOUR REPLY — answer what they ACTUALLY said, in at most two short sentences:`,
    `- A question about today's topic, or about the task they just did (why an answer is right or wrong): answer it clearly and briefly, with one short English example as its own "en" run if it helps.`,
    `- They ask you to repeat, slow down, or say they didn't understand: restate the key point of what you were saying in one or two simple sentences.`,
    `- A greeting, thanks, small talk or a feeling: react warmly in a few words (don't greet back — see GREETINGS).`,
    `- Something you cannot make sense of: say gently that you didn't catch it.`,
    `Then stop. Right after your reply the lesson continues ON ITS OWN with ${whatComesNext(core, input.beatId)} — so ask NO question, never start, invent or announce a task or the next step yourself, and never say goodbye.`,
    ``,
    STYLE_RULES,
    ``,
    `Reply with STRICT JSON: {"reply":[{"lang":"l1"|"en","text":"..."}]}`,
  ].join("\n");

  const lines = [`RECENT DIALOGUE (oldest first):`];
  for (const t of input.recent.slice(-8)) {
    lines.push(`  ${t.role === "tutor" ? learner.tutorName : learner.name}: ${JSON.stringify(t.text.slice(0, 400))}`);
  }
  lines.push(`  ${learner.name} (LATEST MESSAGE — cut in while you were speaking): ${JSON.stringify(input.studentText)}`);

  const out = await llm({
    system,
    user: lines.join("\n"),
    schema: interjectionSchema,
    promptVersion: INTERJECTION_TURN_VERSION,
    maxTokens: 300,
    temperature: 0.4,
  });
  return { reply: out.reply };
}
