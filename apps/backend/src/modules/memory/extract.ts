import type { LessonContent } from "@arna/contracts";
import { and, asc, cosineDistance, desc, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import {
  lessons,
  memories,
  sessionSummaries,
  sessions,
  transcriptTurns,
  userProfiles,
} from "../../db/schema.js";
import { nativeLanguageOf } from "../../lib/language.js";
import { completeJson, embed } from "../llm/index.js";
import {
  buildMemoryExtractPrompt,
  MEMORY_EXTRACT_VERSION,
} from "../llm/prompts/memory-extract.v1.js";

/**
 * Bu eşiğin üstündeki benzerlik "aynı şeyi zaten biliyoruz" demektir.
 * Ölçüldü (text-embedding-3-small): aynı gerçeğin farklı ifadeleri 0.79–0.96,
 * birbirinden farklı gerçekler 0.22–0.51 aralığında. 0.75 iki bandın arasındaki
 * boşlukta duruyor — paraphrase'i yakalar, yeni bir gerçeği yanlışlıkla yutmaz.
 * (Asıl savunma prompt'taki "ALREADY KNOWN" listesi; bu onun güvenlik ağı.)
 */
export const DEDUP_SIMILARITY = 0.75;
/** Modele gönderilen transkript tavanı (son N tur). */
const MAX_TRANSCRIPT_TURNS = 60;
/** Çıkarımın anlamlı olması için gereken en az öğrenci turu. */
const MIN_USER_TURNS = 2;

const extractionSchema = z.object({
  facts: z
    .array(
      z.object({
        kind: z.enum(["fact", "preference", "goal", "context"]),
        text: z.string().trim().min(3).max(200),
      }),
    )
    .max(8),
  summary: z.string().trim().min(1).max(600),
  continuityHook: z.string().trim().max(200),
  errors: z.array(z.string().trim().min(1).max(200)).max(4),
});

export interface ExtractionResult {
  status: "ok" | "skipped_short" | "no_lesson";
  factsAdded: number;
  factsSkippedAsDuplicate: number;
  continuityHook: string;
}

/**
 * Ders bitiminde çalışır: transkriptten kalıcı öğrenci bilgisi + oturum özeti +
 * sonraki dersin açılış kancası çıkarır. Fire-and-forget çağrılır; hata fırlatmaz
 * ANLAMINDA değil — çağıran yakalar (endSession yanıtı bundan etkilenmemeli).
 */
export async function extractSessionMemory(sessionId: string): Promise<ExtractionResult> {
  const [row] = await db
    .select({ session: sessions, lesson: lessons })
    .from(sessions)
    .leftJoin(lessons, eq(sessions.lessonId, lessons.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) throw new Error(`Oturum bulunamadı: ${sessionId}`);
  const content = row.lesson?.content as LessonContent | null;
  if (!content) return { status: "no_lesson", factsAdded: 0, factsSkippedAsDuplicate: 0, continuityHook: "" };

  const userId = row.session.userId;

  const turns = await db
    .select({ role: transcriptTurns.role, text: transcriptTurns.text })
    .from(transcriptTurns)
    .where(eq(transcriptTurns.sessionId, sessionId))
    .orderBy(asc(transcriptTurns.id));

  // Not: script'li hoca replikleri transkripte yazılmıyor (Faz 6.3) — çıkarım zaten
  // öğrencinin söylediklerine bakıyor, ders başlığı bağlamı yeterli.
  const userTurns = turns.filter((t) => t.role === "user");
  if (userTurns.length < MIN_USER_TURNS) {
    return { status: "skipped_short", factsAdded: 0, factsSkippedAsDuplicate: 0, continuityHook: "" };
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const existing = await db
    .select({ text: memories.text })
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt))
    .limit(40);

  const { system, user } = buildMemoryExtractPrompt({
    nativeLanguage: nativeLanguageOf(profile),
    lessonTitle: content.title,
    lessonFocus: content.focus,
    existingFacts: existing.map((e) => e.text),
    transcript: turns.slice(-MAX_TRANSCRIPT_TURNS).map((t) => ({
      role: t.role,
      text: t.text.slice(0, 500),
    })),
  });

  const extraction = await completeJson({
    purpose: "memory_extract",
    system,
    user,
    schema: extractionSchema,
    promptVersion: MEMORY_EXTRACT_VERSION,
    userId,
    sessionId,
    maxTokens: 700,
    temperature: 0.2,
  });

  // Oturum özeti — yeniden çalıştırılabilir olsun diye upsert
  await db
    .insert(sessionSummaries)
    .values({
      sessionId,
      userId,
      lessonTitle: content.title,
      summary: extraction.summary,
      continuityHook: extraction.continuityHook || null,
      errorsObserved: extraction.errors,
    })
    .onConflictDoUpdate({
      target: sessionSummaries.sessionId,
      set: {
        summary: extraction.summary,
        continuityHook: extraction.continuityHook || null,
        errorsObserved: extraction.errors,
      },
    });

  let factsAdded = 0;
  let factsSkippedAsDuplicate = 0;

  if (extraction.facts.length > 0) {
    const vectors = await embed(
      extraction.facts.map((f) => f.text),
      { userId, sessionId },
    );

    // Aynı turda gelen birbirine çok benzer gerçekleri de eleriz
    const acceptedVectors: number[][] = [];

    for (let i = 0; i < extraction.facts.length; i++) {
      const fact = extraction.facts[i]!;
      const vector = vectors[i];
      if (!vector) continue;

      if (acceptedVectors.some((v) => cosine(v, vector) >= DEDUP_SIMILARITY)) {
        factsSkippedAsDuplicate++;
        continue;
      }

      const similarity = sql<number>`1 - (${cosineDistance(memories.embedding, vector)})`;
      const [nearest] = await db
        .select({ similarity })
        .from(memories)
        .where(and(eq(memories.userId, userId), isNotNull(memories.embedding)))
        .orderBy(desc(similarity))
        .limit(1);

      if (nearest && Number(nearest.similarity) >= DEDUP_SIMILARITY) {
        factsSkippedAsDuplicate++;
        continue;
      }

      await db.insert(memories).values({
        userId,
        kind: fact.kind,
        text: fact.text,
        sourceSessionId: sessionId,
        embedding: vector,
      });
      acceptedVectors.push(vector);
      factsAdded++;
    }
  }

  return {
    status: "ok",
    factsAdded,
    factsSkippedAsDuplicate,
    continuityHook: extraction.continuityHook,
  };
}

/** Aynı istekte üretilmiş vektörler arası benzerlik (DB'ye gitmeden). */
function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
