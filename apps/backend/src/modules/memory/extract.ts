import type { LessonCore } from "@glotmate/contracts";
import { and, asc, cosineDistance, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import {
  catalogLessons,
  lessonCores,
  memories,
  roleplayRevisions,
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
  // v7: oturum çekirdeğe + katalog satırına bağlı. Hafıza sistemi İNGİLİZCE
  // çalıştığı için başlık da kanonik İngilizce başlıktır — v6 burada L1 başlığı
  // yazıyordu, tamamı İngilizce bir hafıza sistemindeki gizli tutarsızlıktı.
  const [row] = await db
    .select({
      session: sessions,
      coreRow: lessonCores,
      catalogTitle: catalogLessons.title,
      roleplayRevRow: roleplayRevisions,
    })
    .from(sessions)
    .leftJoin(lessonCores, eq(sessions.coreId, lessonCores.id))
    .leftJoin(catalogLessons, eq(sessions.catalogLessonId, catalogLessons.id))
    .leftJoin(roleplayRevisions, eq(sessions.roleplayRevisionId, roleplayRevisions.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) throw new Error(`Oturum bulunamadı: ${sessionId}`);
  const core = row.coreRow?.core as LessonCore | null;

  // ROLEPLAY: hafıza burada da çıkarılır — öğrenci kendinden bahsetti, sistemin
  // değeri tam bu. Başlık pinli revizyonun spec'inden (kanonik İngilizce);
  // transkript çıkarımının geri kalanı DERSLE AYNI yoldan akar.
  let roleplayTitle: string | null = null;
  if (row.session.sessionKind === "roleplay" && row.roleplayRevRow) {
    const spec = row.roleplayRevRow.spec as { title?: unknown } | null;
    if (typeof spec?.title === "string") roleplayTitle = spec.title;
  }

  if (!core && !roleplayTitle) {
    return { status: "no_lesson", factsAdded: 0, factsSkippedAsDuplicate: 0, continuityHook: "" };
  }
  const lessonTitle = roleplayTitle ?? row.catalogTitle ?? core?.topic ?? "conversation";

  const userId = row.session.userId;

  // Script'li HOCA replikleri pencereden dışlanır (selamlama/anlatım/alıştırma
  // metni — resume dilimiyle artık transkripte yazılıyorlar ama çıkarıma katkıları
  // yok, 60-turluk pencereyi şişirirler). Öğrencinin script-kaynaklı satırları
  // (istemcide çözülen doğru cevaplar, ack'ler) DAHİL: hep doğru cevaplayan
  // öğrenci artık hafızasız kalmıyor.
  const turns = await db
    .select({ role: transcriptTurns.role, text: transcriptTurns.text })
    .from(transcriptTurns)
    .where(
      and(
        eq(transcriptTurns.sessionId, sessionId),
        or(eq(transcriptTurns.role, "user"), eq(transcriptTurns.source, "chat")),
      ),
    )
    .orderBy(asc(transcriptTurns.id));
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
    lessonTitle,
    lessonFocus: core?.focus ?? "a role-play conversation",
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
      lessonTitle,
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
