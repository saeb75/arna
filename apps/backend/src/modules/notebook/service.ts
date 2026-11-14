import { createHash } from "node:crypto";
import {
  wordKey,
  type AnswerReview,
  type AnswerReviewKind,
  type MistakeItem,
  type MistakeKind,
  type MistakesResponse,
  type SavedWord,
  type WordLookupResponse,
} from "@glotmate/contracts";
import { and, count, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { answerReviews, savedWords, userProfiles } from "../../db/schema.js";
import { languageName, nativeLanguageOf } from "../../lib/language.js";
import { completeText } from "../llm/index.js";
import { translateCached } from "../translate/index.js";

/**
 * DEFTER — incelemelerin kalıcı kaydı (önbellek + "Hatalarım") ve kaydedilen kelimeler.
 * İnceleme ÜRETMEZ: üretim `session/service.reviewAnswer`'da; burası yalnız okur/yazar.
 */

type ReviewRow = typeof answerReviews.$inferSelect;

const hashOf = (text: string) => createHash("sha256").update(text.trim()).digest("hex");

function runsOf(row: Pick<ReviewRow, "explanation" | "explanationLang">): AnswerReview["runs"] {
  return row.explanation ? [{ lang: row.explanationLang === "en" ? "en" : "l1", text: row.explanation }] : [];
}

export function toAnswerReview(row: ReviewRow): AnswerReview {
  return {
    id: row.id,
    kind: row.kind as AnswerReviewKind,
    corrected: row.kind === "correct" ? "" : row.corrected,
    runs: runsOf(row),
    pronunciation: null,
  };
}

/** Aynı oturumda aynı söz daha önce incelendiyse o satır — LLM'e ikinci kez gidilmez */
export async function findReview(sessionId: string, text: string): Promise<ReviewRow | null> {
  const [row] = await db
    .select()
    .from(answerReviews)
    .where(and(eq(answerReviews.sessionId, sessionId), eq(answerReviews.textHash, hashOf(text))))
    .limit(1);
  return row ?? null;
}

export async function saveReview(input: {
  userId: string;
  sessionId: string;
  text: string;
  kind: Exclude<AnswerReviewKind, "too_short">;
  corrected: string;
  explanation: string;
  explanationLang: "l1" | "en";
  origin: { kind: "lesson" | "roleplay"; title: string; ref: string | null };
}): Promise<ReviewRow | null> {
  await db
    .insert(answerReviews)
    .values({
      userId: input.userId,
      sessionId: input.sessionId,
      textHash: hashOf(input.text),
      text: input.text.trim(),
      kind: input.kind,
      corrected: input.corrected,
      explanation: input.explanation,
      explanationLang: input.explanationLang,
      originKind: input.origin.kind,
      originTitle: input.origin.title,
      originRef: input.origin.ref,
    })
    // İki eşzamanlı istek (rozet + dokunuş): ilki kazanır, ikisi de aynı satırı okur
    .onConflictDoNothing();
  return findReview(input.sessionId, input.text);
}

// ---------------------------------------------------------------------------
// Hatalarım
// ---------------------------------------------------------------------------

const MISTAKE_KINDS: MistakeKind[] = ["error", "unnatural"];

export async function listMistakes(
  userId: string,
  opts: { kind?: MistakeKind; before?: string; limit: number },
): Promise<MistakesResponse> {
  const live = and(eq(answerReviews.userId, userId), isNull(answerReviews.dismissedAt));
  const before = opts.before ? new Date(opts.before) : null;
  const rows = await db
    .select()
    .from(answerReviews)
    .where(
      and(
        live,
        opts.kind ? eq(answerReviews.kind, opts.kind) : inArray(answerReviews.kind, MISTAKE_KINDS),
        before && !Number.isNaN(before.getTime()) ? lt(answerReviews.createdAt, before) : undefined,
      ),
    )
    .orderBy(desc(answerReviews.createdAt))
    .limit(opts.limit + 1);

  const totals = await db
    .select({ kind: answerReviews.kind, n: count() })
    .from(answerReviews)
    .where(and(live, inArray(answerReviews.kind, MISTAKE_KINDS)))
    .groupBy(answerReviews.kind);
  const counts = { error: 0, unnatural: 0 };
  for (const t of totals) if (t.kind === "error" || t.kind === "unnatural") counts[t.kind] = t.n;

  const page = rows.slice(0, opts.limit);
  const items: MistakeItem[] = page.map((r) => ({
    id: r.id,
    kind: r.kind as MistakeKind,
    text: r.text,
    corrected: r.corrected,
    runs: runsOf(r),
    origin: { kind: r.originKind === "roleplay" ? "roleplay" : "lesson", title: r.originTitle, ref: r.originRef },
    createdAt: r.createdAt.toISOString(),
  }));
  return {
    items,
    next: rows.length > opts.limit ? page[page.length - 1]!.createdAt.toISOString() : null,
    counts,
  };
}

/**
 * "Bunu ben söylemedim" — STT yanlış duyduysa öğrenci söylemediği hatayla anılmasın.
 * Satır SİLİNMEZ (önbellek: aynı söz yeniden LLM'e gitmesin), listeden düşer.
 */
export async function dismissMistake(userId: string, id: string): Promise<boolean> {
  const rows = await db
    .update(answerReviews)
    .set({ dismissedAt: new Date() })
    .where(and(eq(answerReviews.id, id), eq(answerReviews.userId, userId)))
    .returning({ id: answerReviews.id });
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Kelimeler
// ---------------------------------------------------------------------------

/** Kullanıcı başına kayıt tavanı — liste tek sayfada okunuyor */
const MAX_SAVED_WORDS = 1000;

export class NotebookError extends Error {
  constructor(public code: "word_limit" | "not_found") {
    super(code);
    this.name = "NotebookError";
  }
}

async function nativeLanguageFor(userId: string): Promise<string> {
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return nativeLanguageOf(profile);
}

/**
 * Kelimenin ana dildeki karşılığı — dokun-çevirin kalıcı önbelleğinden
 * (`text_translations`): bir kelime her dil için BİR KEZ çevrilir, sonra herkese bedava.
 */
async function translateWord(userId: string, key: string, nativeLanguage: string): Promise<string> {
  const out = await translateCached(key, nativeLanguage, () =>
    completeText({
      purpose: "chat",
      system: `Translate the English word into ${languageName(nativeLanguage)}. Output ONLY the most common translation (at most three, comma-separated) — no quotes, no explanation, no English.`,
      messages: [{ role: "user", content: key }],
      promptVersion: "translate-word.v1",
      userId,
      maxTokens: 40,
      temperature: 0.2,
    }),
  );
  return out.text;
}

export async function lookupWord(userId: string, word: string, sentence?: string): Promise<WordLookupResponse> {
  const key = wordKey(word);
  const nativeLanguage = await nativeLanguageFor(userId);
  const [translation, sentenceTranslation, [saved]] = await Promise.all([
    translateWord(userId, key, nativeLanguage),
    // Cümle çevirisi YARDIMCIDIR: düşerse kelimenin anlamı yine döner
    sentence
      ? translateCached(sentence, nativeLanguage, () =>
          completeText({
            purpose: "chat",
            system: `Translate the user's English text into natural, everyday ${languageName(nativeLanguage)}. Output ONLY the translation — no quotes, no explanation, no English.`,
            messages: [{ role: "user", content: sentence }],
            promptVersion: "translate.v1",
            userId,
            maxTokens: 300,
            temperature: 0.2,
          }),
        )
          .then((r) => r.text)
          .catch(() => null)
      : Promise.resolve(null),
    db
      .select({ id: savedWords.id })
      .from(savedWords)
      .where(and(eq(savedWords.userId, userId), eq(savedWords.word, key)))
      .limit(1),
  ]);
  return { word: key, translation, sentenceTranslation, saved: !!saved };
}

const toSavedWord = (r: typeof savedWords.$inferSelect): SavedWord => ({
  id: r.id,
  word: r.word,
  translation: r.translation,
  sentence: r.sentence,
  createdAt: r.createdAt.toISOString(),
});

/** Çeviri istemciden ALINMAZ — sunucu kendi (önbellekli) çevirisini yazar */
export async function saveWord(userId: string, word: string, sentence: string | null): Promise<SavedWord> {
  const key = wordKey(word);
  const [{ n } = { n: 0 }] = await db.select({ n: count() }).from(savedWords).where(eq(savedWords.userId, userId));
  if (n >= MAX_SAVED_WORDS) throw new NotebookError("word_limit");
  const nativeLanguage = await nativeLanguageFor(userId);
  const translation = await translateWord(userId, key, nativeLanguage);
  await db
    .insert(savedWords)
    .values({ userId, word: key, translation, targetLang: nativeLanguage, sentence })
    .onConflictDoNothing();
  const [row] = await db
    .select()
    .from(savedWords)
    .where(and(eq(savedWords.userId, userId), eq(savedWords.word, key)))
    .limit(1);
  return toSavedWord(row!);
}

export async function listWords(userId: string): Promise<SavedWord[]> {
  const rows = await db
    .select()
    .from(savedWords)
    .where(eq(savedWords.userId, userId))
    .orderBy(desc(savedWords.createdAt))
    .limit(MAX_SAVED_WORDS);
  return rows.map(toSavedWord);
}

/** Kelimeyle siler (kimlik değil): ders içindeki kartta kimlik bilinmeyebilir */
export async function deleteWord(userId: string, word: string): Promise<void> {
  await db.delete(savedWords).where(and(eq(savedWords.userId, userId), eq(savedWords.word, wordKey(word))));
}
