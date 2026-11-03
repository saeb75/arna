import {
  isAttemptKind,
  isSurrender,
  judgedBeatDone,
  outcomeOfVerdict,
  TURN_KINDS,
  type CoreBeat,
  type FlowBeat,
  type RichText,
  type TurnKind,
  type TurnVerdict,
} from "@glotmate/contracts";
import { z } from "zod";
import {
  acceptedAnswers,
  describeTask,
  GREETING_RULE,
  identityBlock,
  languageBlock,
  leaksAnswer,
  renderDialogue,
  replyRunsSchema,
  runsToPlain,
  STYLE_RULES,
  taskPosition,
} from "./prompt.js";
import type { LectureTurnInput, TaskTurnResult, TurnLlm } from "./types.js";

export const TASK_TURN_VERSION = "task-turn.v1";

type TaskBeat = Extract<CoreBeat, { kind: "exercise" | "open_response" }>;

const taskVerdictSchema = z.object({
  kind: z.enum(TURN_KINDS),
  correct: z.boolean(),
  reply: replyRunsSchema,
});

/** Akış makinesinin gördüğü şekil (contracts FlowBeat). */
function flowBeatOf(beat: TaskBeat): FlowBeat {
  return beat.kind === "open_response"
    ? { kind: "open_response", maxAttempts: beat.maxAttempts }
    : { kind: "exercise" };
}

/** Bu adımda öğrencinin toplam deneme hakkı (talimattaki "X hakkın var" için). */
function totalTries(beat: TaskBeat): number {
  return beat.kind === "open_response" ? beat.maxAttempts : 2;
}

/** "Cevabı ver ve devam et" — adım bu sözden sonra kapanıyorsa. */
function revealLine(beat: TaskBeat): string {
  return beat.kind === "open_response"
    ? `give them a model answer as a full ENGLISH sentence in its own "en" run — one that actually does the task and meets the criteria, never a rephrasing of what they just said`
    : `give them the correct answer in its own "en" run (for a fill-in-the-blank, say the whole completed sentence)`;
}

/**
 * Her olası hüküm için "bundan sonra ne olacak + ne söyle" satırları.
 *
 * Satırların "ilerle/bekle" kısmı ELLE YAZILMAZ — contracts `outcomeOfVerdict`ten
 * türetilir; istemci akışı aynı fonksiyonla yürütür. Model hangi hükmü seçerse
 * seçsin, söylediği şey akışın yapacağıyla tutarlıdır.
 */
function consequenceLines(beat: TaskBeat, input: LectureTurnInput): string[] {
  const flow = flowBeatOf(beat);
  const at = (v: TurnVerdict) => outcomeOfVerdict(flow, input.counters, v);
  const reveal = revealLine(beat);
  const ends = `This task ENDS after your reply — the lesson moves on by itself, so do NOT invite another try.`;
  // Açık uçlu soruda ekranda okunacak bir CÜMLE yok — model "ekrandaki cümleyi
  // söyle" diyordu (tarama). Görev neyse adıyla anılır.
  const reAsked =
    beat.kind === "open_response"
      ? `Right after your reply the app asks the question again — so do NOT repeat, reword or invent it yourself, and never tell them to read or say a sentence "on the screen": they answer in their own words.`
      : `Right after your reply the app shows and reads the task again — so do NOT repeat, reword or invent the task yourself.`;
  const noAnswer = `Your reply must NOT contain the correct answer in any form (not the sentence, not the option letter, not a quote of it) — they still get to try.`;
  // CANLI TARAMA: "my'ı name'den önce, is'i sonra koy" düzeltmeyi harfiyen veriyordu;
  // "name kelimesine dikkat et" tek şıkkı yüzey ipucuyla gösteriyordu.
  const hintRule = `A hint points at WHAT is wrong or missing and why ("a word is missing in the middle", "think about which helper verb goes with he") — it never spells out the fix word for word, and in multiple choice it never singles out an option by a surface clue ("look for the word X"). Explaining why their chosen option is wrong is good.`;

  const wrong = at({ isAttempt: true, ok: false, surrendered: false });
  const giveUp = at({ isAttempt: true, ok: false, surrendered: true });
  const other = at({ isAttempt: false, ok: false, surrendered: false });

  return [
    `- kind "answer", correct=true → Praise them in a few warm words (if they made a small slip you may show the correct form as an "en" run). The lesson moves on right after you; ask nothing.`,
    wrong === "wait"
      ? `- kind "answer", correct=false → They get another try. In one or two short sentences say kindly what is off and give ONE small hint toward the target, then invite them to try again. ${hintRule} ${noAnswer}`
      : `- kind "answer", correct=false → ${ends} Kindly say what was off in a few words and ${reveal}, with a word of encouragement.`,
    giveUp === "wait"
      ? `- kind "give_up" → Encourage them in a few words and give ONE small hint that makes it easier, then invite them to have a go. ${hintRule} ${noAnswer}`
      : `- kind "give_up" → ${ends} Reassure them in a few words and ${reveal}.`,
    other === "wait"
      ? [
          `- kind "ask_help" → Help with exactly what they asked: what the task wants, what a word means, a translation of a word — in one or two short sentences, plus at most one small hint. ${hintRule} ${noAnswer} ${reAsked}`,
          `- kind "repeat" → Only a few warm words such as "of course" or "sure". ${reAsked}`,
          `- kind "other" → React briefly and naturally to what they ACTUALLY said (if they greeted you, don't greet back — see GREETINGS; if you cannot make sense of it, say so gently instead of pretending you understood). Then steer back to this task in one short clause. ${noAnswer} ${reAsked}`,
        ].join("\n")
      : `- kind "ask_help", "repeat" or "other" → ${ends} React to what they said in a few words, then ${reveal}, and say you will continue.`,
  ];
}

function judgingRules(beat: TaskBeat, input: LectureTurnInput): string[] {
  const { l1Name } = input.learner;
  if (beat.kind === "open_response") {
    return [
      `JUDGING an answer (only when kind is "answer"):`,
      `- correct=true when they use the target the lesson measures, in their OWN words, with their own subject and content. The example phrases are not a checklist.`,
      `- Judge meaning and structure, not perfection: a small slip elsewhere (an article, a plural) does not make it wrong — you may mention it kindly.`,
      `- correct=false when the target structure is missing or used wrongly, when it does not answer the question, or when it is not in English.`,
    ];
  }
  return [
    `JUDGING an answer (only when kind is "answer"):`,
    `- First repair obvious typing or speech-recognition slips: letters one or two characters away from a word that fits ("Doo" → "Do", "schoool" → "school", "Anna" for "Ana"). Casing, punctuation and contractions never matter. Judge the repaired answer.`,
    `- Letters that resemble no fitting word at all ("erf", "kloi", "asdf") are not slips — they are a wrong answer.`,
    `- Judge against WHAT THE LESSON TEACHES. The written answers are examples: another word that fits the sentence naturally and uses the target correctly is correct.`,
    `- correct=false when it breaks the taught target (wrong tense, form or agreement), does not fit, leaves out a needed part, is said in ${l1Name} instead of English, or when the task is about one specific expression and they used another.`,
    beat.format === "mcq"
      ? `- Multiple choice: the option's letter, its text, or naming it in other words ("the first one") all count as choosing it.`
      : beat.format === "say_sentence"
        ? `- Build-the-sentence task: they must say the whole English sentence from the cue words; a missing cue word is not correct.`
        : `- Fill-in-the-blank: saying only the missing piece OR the whole completed sentence are both fine.`,
  ];
}

function buildSystem(beat: TaskBeat, input: LectureTurnInput, surrendered: boolean): string {
  const { learner, counters } = input;
  const pos = taskPosition(input.core, beat.id);
  const tries = totalTries(beat);
  const used = counters.attempt;

  return [
    identityBlock(input.core, learner),
    ``,
    languageBlock(learner),
    ``,
    `WHERE WE ARE: the lesson has been going for a while — you greeted ${learner.name} at the start and already explained the topic. Now you are on task ${pos.index} of ${pos.total}. You are in the MIDDLE of the lesson: never introduce yourself or the lesson again; just carry on like a teacher mid-lesson.`,
    GREETING_RULE,
    ``,
    `THE TASK (${learner.name} sees it on screen and heard you read it out):`,
    ...describeTask(beat),
    `Answer tries already used on this task: ${used} of ${tries}.`,
    ``,
    `YOUR JOB — three steps.`,
    `1) Decide what ${learner.name}'s LATEST message is ("kind"). Read it together with the dialogue so far:`,
    `  - "answer": a try at THIS task — right, wrong, partial, a guess, a single word, letters that mean nothing, or an answer given in ${learner.l1Name}.`,
    `  - "give_up": they don't know, want to skip, or give up.`,
    `  - "ask_help": they ask for help — a hint, what the task wants, what a word means, a translation — or say they don't understand.`,
    `  - "repeat": they want you to say the task again, or didn't hear it.`,
    `  - "other": anything else — a greeting, thanks, a feeling, small talk, a question or remark addressed to YOU ("who are you?", in any language), something about another subject, only punctuation or noise, or something you cannot make sense of.`,
    `  A greeting, thanks or small talk is "other" even when it is in English, unless it could really be a try at this task.`,
    ...(surrendered ? [`  (Their latest message means they give up — use kind "give_up".)`] : []),
    `2) Only for kind "answer", decide "correct" (for every other kind, correct=false).`,
    ...(beat.kind === "exercise" && beat.format === "mcq"
      ? [`HINTS FOR MULTIPLE CHOICE: a hint must never single out one option — no "pick the one with the word X", no ruling out all the others. Hint at the idea the question tests instead.`]
      : []),
    ...judgingRules(beat, input),
    `3) Write what you say next — 1 or 2 short spoken sentences — following the line for the kind you chose:`,
    ...consequenceLines(beat, input),
    ``,
    `Never invent a different task or ask a different question. Never say they answered when they did not, and never praise a wrong answer.`,
    STYLE_RULES,
    ``,
    `Reply with STRICT JSON: {"kind":"answer"|"give_up"|"ask_help"|"repeat"|"other","correct":true|false,"reply":[{"lang":"l1"|"en","text":"..."}]}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function buildUser(beat: TaskBeat, input: LectureTurnInput): string {
  const opening = `DIALOGUE ON THIS TASK SO FAR:\n  (You read the task aloud.)`;
  return renderDialogue(opening, input.history, input.learner, input.studentText);
}

/**
 * Soru bekleyen adımda (alıştırma / açık uçlu) öğrencinin sözünü işler.
 * Doğru cevabın birebir eşleşmesi istemcide yakalanır ve buraya HİÇ gelmez.
 */
export async function runTaskTurn(
  input: LectureTurnInput,
  beat: TaskBeat,
  llm: TurnLlm,
): Promise<TaskTurnResult> {
  const surrendered = isSurrender(input.studentText, input.surrenderTokens);
  const system = buildSystem(beat, input, surrendered);
  const user = buildUser(beat, input);

  const raw = await llm({
    system,
    user,
    schema: taskVerdictSchema,
    promptVersion: TASK_TURN_VERSION,
    maxTokens: 300,
    temperature: 0.2,
  });

  // Yapısal hüküm — kodun guard'larıyla: pes eden "answer" bile olsa give_up'tır;
  // deneme olmayan söz asla doğru sayılmaz.
  const kind: TurnKind = surrendered ? "give_up" : raw.kind;
  const isAttempt = isAttemptKind(kind);
  const ok = kind === "answer" && raw.correct;
  const verdict: TurnVerdict = { isAttempt, ok, surrendered };
  const flow = flowBeatOf(beat);
  const beatDone = judgedBeatDone(flow, input.counters.attempt, verdict);
  const outcome = outcomeOfVerdict(flow, input.counters, verdict);

  // Sızıntı guard'ı: öğrenci aynı görevde bekleyecekse cevap söylenmemiş olmalı.
  // Yapısal hüküm DEĞİŞMEZ; yalnız metin bir kez yeniden üretilir.
  let reply: RichText = raw.reply;
  let repaired = false;
  const answers = acceptedAnswers(beat);
  if (outcome === "wait" && !ok && answers.length && leaksAnswer(runsToPlain(reply), answers)) {
    repaired = true;
    try {
      const retry = await llm({
        system: [
          system,
          ``,
          `YOUR PREVIOUS DRAFT GAVE AWAY THE ANSWER: ${JSON.stringify(runsToPlain(reply))}`,
          `That is not allowed now — ${input.learner.name} still has a try. Keep kind=${JSON.stringify(kind)} and correct=false, and rewrite the reply without the answer.`,
        ].join("\n"),
        user,
        schema: taskVerdictSchema,
        promptVersion: TASK_TURN_VERSION,
        maxTokens: 300,
        temperature: 0.2,
      });
      reply = retry.reply;
    } catch {
      /* yeniden üretim düşerse aşağıdaki son çare devreye girer */
    }
    if (leaksAnswer(runsToPlain(reply), answers)) {
      // Son çare: sızan metin ASLA seslendirilmez. Görev istemcide zaten ekranda.
      reply = [{ lang: "en", text: "Let's try once more." }];
    }
  }

  return {
    kind,
    isAttempt,
    ok,
    beatDone,
    outcome,
    reply,
    reAsk: !isAttempt && outcome === "wait",
    repaired,
  };
}
