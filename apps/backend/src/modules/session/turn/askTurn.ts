import type { CoreBeat } from "@glotmate/contracts";
import { z } from "zod";
import { GREETING_RULE, identityBlock, languageBlock, renderDialogue, replyRunsSchema, STYLE_RULES } from "./prompt.js";
import type { AskTurnResult, LectureTurnInput, TurnLlm } from "./types.js";

export const ASK_TURN_VERSION = "ask-turn.v1";

type AskBeat = Extract<CoreBeat, { kind: "ask" }>;

const askReplySchema = z.object({ reply: replyRunsSchema });

/**
 * "Hazır mısın?" — öğrenci net bir onay/ret dışında bir şey söyledi (ya da "hayır").
 * Hoca cevap verir, SONRA ders kendiliğinden anlatıma geçer (akış: readiness →
 * her durumda ilerle). Bu yüzden hoca soru SORMAZ.
 */
function readinessLines(input: LectureTurnInput): string[] {
  const name = input.learner.name;
  return [
    `WHERE WE ARE: the lesson is just starting. You greeted ${name}, named today's topic and asked if they are ready.`,
    `Right after your reply the lesson continues on its own: you will briefly explain ${input.core.focus}.`,
    ``,
    `YOUR REPLY — at most two short sentences, answering what they ACTUALLY said:`,
    `- They greeted you: you JUST said hello — don't say it again (see GREETINGS). Show in a few warm words that you're glad they're here.`,
    `- They asked something about the lesson: answer it in one plain sentence.`,
    `- They are hesitant, nervous, tired or not ready: reassure them warmly in one sentence (it will be short and easy, you'll go step by step).`,
    `- Small talk: acknowledge it in a few words.`,
    `- Something you cannot make sense of: don't pretend you understood — say kindly that you'll just get started.`,
    `Then stop. Never ask a question here — the lesson continues immediately. Don't start explaining the topic and don't start an exercise.`,
  ];
}

/** "Sormak istediğin bir şey var mı?" penceresi — gerçek soru-cevap anı. */
function questionsLines(input: LectureTurnInput): string[] {
  return [
    `WHERE WE ARE: you have just explained today's topic and asked whether ${input.learner.name} has any questions before the exercises. They may ask anything about ${input.core.focus}.`,
    ``,
    `YOUR REPLY — answer what they ACTUALLY said, reading it together with the dialogue above (a short follow-up like "why?" refers to what you just discussed):`,
    `- A question about the topic: answer it clearly in 1-3 short sentences, with ONE concrete example sentence (its own "en" run) that uses the target. Don't re-teach the whole topic.`,
    `- They say they have a question but haven't said what it is: just invite them to ask it — don't guess.`,
    `- They say they are done or have no questions: a few warm words only — no example, no new explanation.`,
    `- A greeting (don't greet back — see GREETINGS), small talk or another subject: answer in one short clause and bring them back to today's topic.`,
    input.lastExchange
      ? `- This is the LAST question you can take now: after answering, say warmly that you'll move on to some practice questions. Do NOT ask whether they have another question — the lesson continues right after you.`
      : `- After answering a question, ask whether they have another one (if they said they're done, a short "anything else?" check is enough).`,
    `Never start an exercise or a task — the lesson does that next by itself.`,
  ];
}

/**
 * ask adımında (readiness / questions) öğrencinin sözüne hocanın cevabı.
 * Akış kararı istemcide (`decideAfterTutorReply`); burada yalnız söz üretilir.
 */
export async function runAskTurn(input: LectureTurnInput, beat: AskBeat, llm: TurnLlm): Promise<AskTurnResult> {
  const asked = input.askedLine?.trim();
  const system = [
    identityBlock(input.core, input.learner),
    ``,
    languageBlock(input.learner),
    ``,
    GREETING_RULE,
    ``,
    ...(beat.purpose === "readiness" ? readinessLines(input) : questionsLines(input)),
    ``,
    STYLE_RULES,
    ``,
    `Reply with STRICT JSON: {"reply":[{"lang":"l1"|"en","text":"..."}]}`,
  ].join("\n");

  const opening = asked
    ? `DIALOGUE SO FAR:\n  Emma: ${JSON.stringify(asked)}`
    : `DIALOGUE SO FAR:\n  (You just asked the student a short question.)`;
  const user = renderDialogue(opening, input.history, input.learner, input.studentText);

  const out = await llm({
    system,
    user,
    schema: askReplySchema,
    promptVersion: ASK_TURN_VERSION,
    maxTokens: 300,
    temperature: 0.4,
  });
  return { reply: out.reply };
}
