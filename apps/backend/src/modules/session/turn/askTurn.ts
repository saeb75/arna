import type { CoreBeat } from "@glotmate/contracts";
import { z } from "zod";
import { GREETING_RULE, identityBlock, languageBlock, renderDialogue, replyRunsSchema, STYLE_RULES } from "./prompt.js";
import type { AskTurnResult, LectureTurnInput, TurnLlm } from "./types.js";

export const ASK_TURN_VERSION = "ask-turn.v2";

type AskBeat = Extract<CoreBeat, { kind: "ask" }>;

const askReplySchema = z.object({ reply: replyRunsSchema });
/**
 * Soru penceresi: yapısal `done` = öğrencinin sorusu kalmadı / devam etmek istiyor.
 * Saf onay kuralı ("tamam ama…" onay sayılmaz) sonrası "Yok, bu kadar yeterli."
 * gibi sözler buraya geliyor; pencereyi KOD kapatır (contracts windowDone), hocanın
 * cümlesi değil. Söz de bu karardan türer (aşağıdaki satırlar).
 */
const questionsReplySchema = z.object({ done: z.boolean(), reply: replyRunsSchema });

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
    `STEP 1 — decide "done": true when their LATEST message means they have no (more) questions, that they understood, or that they want to move on — in any language, even with extra words ("no, that's enough", "got it, let's continue"). false when they ask something, say they have a question, or say anything else.`,
    `STEP 2 — your reply, answering what they ACTUALLY said, read together with the dialogue above (a short follow-up like "why?" refers to what you just discussed):`,
    `- done=true: a few warm words only — no example, no new explanation, no question. The app announces the exercises right after you, so don't announce them yourself.`,
    `- A question about the topic: answer it clearly in 1-3 short sentences, with ONE concrete example sentence (its own "en" run) that uses the target. Don't re-teach the whole topic.`,
    `- They say they have a question but haven't said what it is: just invite them to ask it — don't guess.`,
    `- A greeting (don't greet back — see GREETINGS), small talk or another subject: answer in one short clause and bring them back to today's topic.`,
    input.lastExchange
      ? `- This is the LAST question you can take now: answer it, and do NOT ask whether they have another question — the exercises start right after you (the app announces them).`
      : `- When done=false and you answered a question, ask whether they have another one.`,
    `Never start an exercise or a task — the lesson does that next by itself.`,
  ];
}

/**
 * ask adımında (readiness / questions) öğrencinin sözüne hocanın cevabı.
 * Akış kararı istemcide (`decideAfterTutorReply`); burada yalnız söz üretilir.
 */
export async function runAskTurn(input: LectureTurnInput, beat: AskBeat, llm: TurnLlm): Promise<AskTurnResult> {
  const asked = input.askedLine?.trim();
  const questions = beat.purpose === "questions";
  const system = [
    identityBlock(input.core, input.learner),
    ``,
    languageBlock(input.learner),
    ``,
    GREETING_RULE,
    ``,
    ...(questions ? questionsLines(input) : readinessLines(input)),
    ``,
    STYLE_RULES,
    ``,
    questions
      ? `Reply with STRICT JSON: {"done":true|false,"reply":[{"lang":"l1"|"en","text":"..."}]}`
      : `Reply with STRICT JSON: {"reply":[{"lang":"l1"|"en","text":"..."}]}`,
  ].join("\n");

  const opening = asked
    ? `DIALOGUE SO FAR:\n  ${input.learner.tutorName}: ${JSON.stringify(asked)}`
    : `DIALOGUE SO FAR:\n  (You just asked the student a short question.)`;
  const user = renderDialogue(opening, input.history, input.learner, input.studentText);

  if (questions) {
    const out = await llm({
      system,
      user,
      schema: questionsReplySchema,
      promptVersion: ASK_TURN_VERSION,
      maxTokens: 300,
      temperature: 0.4,
    });
    return { reply: out.reply, done: out.done };
  }
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
