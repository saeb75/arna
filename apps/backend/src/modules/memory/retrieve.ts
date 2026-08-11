import { and, desc, eq, isNotNull, ne, sql, cosineDistance } from "drizzle-orm";
import { db } from "../../db/client.js";
import { memories, sessionSummaries } from "../../db/schema.js";
import { embed } from "../llm/index.js";

/** Konuya göre getirilecek gerçek sayısı. */
const TOP_K_RELEVANT = 6;
/** Konuyla ilgisiz olsa da her zaman eklenen en yeni gerçek sayısı. */
const ALWAYS_RECENT = 3;
/** Blok tavanı — prompt'u şişirmemek için. */
const MAX_BLOCK_CHARS = 700;

export interface MemoryLessonContext {
  topic: string;
  focus: string;
  theme: string;
}

/**
 * Hocanın "öğrenciyi tanıması" için prompt'a giren blok:
 * (1) geçen dersin kapanışından süreklilik kancası, (2) bu dersin konusuyla ilgili
 * gerçekler + en yeni birkaç gerçek.
 *
 * Profil alanları (meslek, ilgi alanları) BURADA DEĞİL, tutorPrompt'un temel
 * bloğunda — onlar onboarding'den gelen yapısal veri, bunlar konuşmadan öğrenilen.
 *
 * Hiçbir şey bilinmiyorsa null döner (blok prompt'a hiç eklenmez).
 */
export async function buildMemoryBlock(
  userId: string,
  lesson: MemoryLessonContext,
  opts: { excludeSessionId?: string } = {},
): Promise<string | null> {
  const [continuity, facts] = await Promise.all([
    lastSummary(userId, opts.excludeSessionId),
    relevantFacts(userId, lesson),
  ]);

  const lines: string[] = [];

  if (continuity) {
    lines.push(`Previous lesson: ${continuity.lessonTitle ?? "(untitled)"}.`);
    if (continuity.continuityHook) lines.push(`Opening idea: ${continuity.continuityHook}`);
  }

  if (facts.length > 0) {
    lines.push(`Known about the student:`);
    for (const f of facts) {
      const line = `- ${f.text}`;
      if (lines.join("\n").length + line.length > MAX_BLOCK_CHARS) break;
      lines.push(line);
    }
  }

  return lines.length > 0 ? lines.join("\n") : null;
}

/** Kullanıcının en son özetlenen oturumu (bu oturum hariç). */
async function lastSummary(userId: string, excludeSessionId?: string) {
  const [row] = await db
    .select({
      lessonTitle: sessionSummaries.lessonTitle,
      continuityHook: sessionSummaries.continuityHook,
    })
    .from(sessionSummaries)
    .where(
      excludeSessionId
        ? and(
            eq(sessionSummaries.userId, userId),
            ne(sessionSummaries.sessionId, excludeSessionId),
          )
        : eq(sessionSummaries.userId, userId),
    )
    .orderBy(desc(sessionSummaries.createdAt))
    .limit(1);
  return row ?? null;
}

/** Konuya vektör benzerliğiyle seçilen gerçekler + en yeniler (tekrarsız birleşim). */
async function relevantFacts(userId: string, lesson: MemoryLessonContext) {
  const recent = await db
    .select({ id: memories.id, text: memories.text })
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.createdAt))
    .limit(ALWAYS_RECENT);

  let related: { id: string; text: string }[] = [];
  try {
    const [queryVector] = await embed([`${lesson.topic}. ${lesson.focus}. ${lesson.theme}`], {
      userId,
    });
    if (queryVector) {
      const similarity = sql<number>`1 - (${cosineDistance(memories.embedding, queryVector)})`;
      related = await db
        .select({ id: memories.id, text: memories.text })
        .from(memories)
        .where(and(eq(memories.userId, userId), isNotNull(memories.embedding)))
        .orderBy(desc(similarity))
        .limit(TOP_K_RELEVANT);
    }
  } catch {
    // Embedding çağrısı düşerse hafıza tamamen kaybolmasın — en yenilerle devam
    related = [];
  }

  const seen = new Set<string>();
  const merged: { id: string; text: string }[] = [];
  for (const f of [...related, ...recent]) {
    if (seen.has(f.id)) continue;
    seen.add(f.id);
    merged.push(f);
  }
  return merged;
}
