import type { LessonContent, SessionScript } from "@arna/contracts";
import { z } from "zod";
import { completeJson } from "../llm/index.js";
import {
  buildSessionScriptPrompt,
  SESSION_SCRIPT_VERSION,
} from "../llm/prompts/session-script.v1.js";

/**
 * Model çıktısı — `v` alanını biz koyarız, modelin uydurmasına gerek yok.
 *
 * Alanların hepsi OPSİYONEL: tek bir alan eksik kaldı diye tüm render'ı çöpe atıp
 * yedeğe düşmek, kişiselleştirilmiş selamlamayı da kaybettiriyordu. Eksik alan
 * tek tek yedekten tamamlanır (aşağıda), böylece bozulma kısmi kalır.
 */
const scriptResponseSchema = z.object({
  beats: z.record(z.string(), z.string().trim().min(1)).optional(),
  practiceIntro: z.string().trim().min(1).optional(),
  inviteQuestion: z.string().trim().min(1).optional(),
  wrapup: z.string().trim().min(1).optional(),
  farewell: z.string().trim().min(1).optional(),
  praise: z.array(z.string().trim().min(1)).min(2).max(6).optional(),
});

/** Hangi beat'ler konuşulan bir cümle bekler (exercise'lar authored, script'e girmez). */
function spokenBeatIds(content: LessonContent): string[] {
  return content.lecture.beats
    .filter((b) => b.kind === "say" || b.kind === "ask" || b.kind === "teach")
    .map((b) => b.id);
}

export interface RenderScriptOptions {
  content: LessonContent;
  displayName: string;
  cefrLevel: string;
  nativeLanguage: string;
  memoryBlock: string | null;
  userId: string;
  sessionId: string;
}

/**
 * Oturum açılışında hocanın söyleyeceği cümleleri üretir.
 * ASLA fırlatmaz: model düşerse deterministik yedek script'e düşülür — ders
 * script yüzünden bloke olmaz (tek ekstra çağrı, ~1-2 sn, gpt-4o-mini).
 */
export async function renderSessionScript(opts: RenderScriptOptions): Promise<SessionScript> {
  const fallback = fallbackScript(opts.content, opts.displayName);

  try {
    const { system, user } = buildSessionScriptPrompt({
      content: opts.content,
      displayName: opts.displayName,
      cefrLevel: opts.cefrLevel,
      nativeLanguage: opts.nativeLanguage,
      memoryBlock: opts.memoryBlock,
    });

    const rendered = await completeJson({
      purpose: "chat",
      system,
      user,
      schema: scriptResponseSchema,
      promptVersion: SESSION_SCRIPT_VERSION,
      userId: opts.userId,
      sessionId: opts.sessionId,
      maxTokens: 900,
      temperature: 0.7,
    });

    // Eksik kalan alanlar yedekten tek tek tamamlanır — akış asla boş cümleyle durmaz
    const beats: Record<string, string> = { ...fallback.beats };
    for (const id of spokenBeatIds(opts.content)) {
      const line = rendered.beats?.[id]?.trim();
      if (line) beats[id] = line;
    }

    const missing = [
      Object.keys(rendered.beats ?? {}).length === 0 ? "beats" : null,
      rendered.practiceIntro ? null : "practiceIntro",
      rendered.inviteQuestion ? null : "inviteQuestion",
      rendered.wrapup ? null : "wrapup",
      rendered.farewell ? null : "farewell",
      rendered.praise ? null : "praise",
    ].filter(Boolean);
    if (missing.length > 0) {
      console.warn(`[script] eksik alan yedekten dolduruldu (${opts.sessionId}): ${missing.join(", ")}`);
    }

    return {
      v: 1,
      beats,
      practiceIntro: rendered.practiceIntro ?? fallback.practiceIntro,
      inviteQuestion: rendered.inviteQuestion ?? fallback.inviteQuestion,
      wrapup: rendered.wrapup ?? fallback.wrapup,
      farewell: rendered.farewell ?? fallback.farewell,
      praise: rendered.praise ?? fallback.praise,
    };
  } catch (err) {
    console.error(`[script] üretilemedi (session ${opts.sessionId}), yedeğe düşülüyor:`, err);
    return fallback;
  }
}

/**
 * LLM'siz yedek. Niyet metni SESLENDİRİLEMEZ (talimat gibi duyulur), o yüzden
 * burada beat türüne göre sabit ama doğru cümleler kullanılır.
 */
export function fallbackScript(content: LessonContent, displayName: string): SessionScript {
  const beats: Record<string, string> = {};

  for (const beat of content.lecture.beats) {
    switch (beat.kind) {
      case "ask":
        beats[beat.id] =
          beat.purpose === "readiness"
            ? `Hi ${displayName}! Today we are going to work on ${content.topic}. Are you ready to start?`
            : `Is there anything you want to ask before we try some exercises?`;
        break;
      case "teach":
        beats[beat.id] = `Here is how it works.`;
        break;
      case "say":
        beats[beat.id] = `Great! Let's try a few questions.`;
        break;
      default:
        break; // exercise: prompt authored, script'e girmez
    }
  }

  return {
    v: 1,
    beats,
    practiceIntro: `Nice work! Now let's practise what you learned with a short role play.`,
    inviteQuestion: `Of course! What would you like to know?`,
    wrapup: `That's it for today's lesson, ${displayName} — great work! Is there anything you would like to ask me?`,
    farewell: `Wonderful. Well done today, ${displayName}. See you in the next lesson!`,
    praise: ["Exactly right!", "Well done!", "That's it!", "Perfect!"],
  };
}
