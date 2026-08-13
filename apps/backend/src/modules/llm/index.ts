import { db } from "../../db/client.js";
import { llmCalls } from "../../db/schema.js";
import { openaiProvider } from "./openai.js";
import type { CompleteJsonOptions, CompleteTextOptions, LLMPurpose } from "./types.js";

/** Amaç → model yönlendirmesi. Tek yerden değişir; kod dağılmaz. */
const MODEL_BY_PURPOSE: Record<LLMPurpose, string> = {
  plan_gen: "gpt-4.1",
  lesson_gen: "gpt-4.1",
  // v7 katmanları: çekirdek ve sahne pedagoji taşır → güçlü model.
  // Dil paketi de güçlü modelde: kötü ana-dil düzyazısı ekibin GÖREMEYECEĞİ hatadır.
  lesson_core: "gpt-4.1",
  lesson_scenes: "gpt-4.1",
  lesson_locale: "gpt-4.1",
  chat: "gpt-4o-mini",
  memory_extract: "gpt-4o-mini",
  embedding: "text-embedding-3-small",
};

/** Bir amacın hangi modele gittiğini dışarıdan sormak için (kayıt/log alanları). */
export function modelForPurpose(purpose: LLMPurpose): string {
  return MODEL_BY_PURPOSE[purpose];
}

/** Hafıza vektörlerinin boyutu — memories.embedding kolonuyla aynı olmalı */
export const EMBEDDING_DIMENSIONS = 1536;

/** USD / 1M token (liste fiyatı; model eklenince burası güncellenir) */
const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4.1": { in: 2.0, out: 8.0 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "text-embedding-3-small": { in: 0.02, out: 0 },
};

function costUsd(model: string, inTok: number, outTok: number): string {
  const p = PRICING[model];
  if (!p) return "0";
  return (((inTok * p.in) + (outTok * p.out)) / 1_000_000).toFixed(6);
}

/** JSON içinden ilk dengeli objeyi çıkar (model bazen açıklama ekler) */
function extractJson(text: string): string {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return text.slice(start);
}

/**
 * JSON üretim çağrısı: model yönlendirme + Zod doğrulama + 1 onarım denemesi +
 * her API çağrısının llm_calls'a maliyetiyle loglanması.
 */
export async function completeJson<T>(opts: CompleteJsonOptions<T>): Promise<T> {
  const model = MODEL_BY_PURPOSE[opts.purpose];
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const user =
      attempt === 0
        ? opts.user
        : `${opts.user}\n\nÖNCEKİ DENEMEN ŞU DOĞRULAMA HATALARINI VERDİ, DÜZELTEREK TEKRAR ÜRET:\n${lastError}`;

    const startedAt = Date.now();
    const result = await openaiProvider.completeJson({
      model,
      system: opts.system,
      user,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
    });
    const latencyMs = Date.now() - startedAt;

    await db.insert(llmCalls).values({
      userId: opts.userId,
      sessionId: opts.sessionId,
      provider: openaiProvider.name,
      model,
      purpose: opts.purpose,
      promptVersion: opts.promptVersion,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: costUsd(model, result.inputTokens, result.outputTokens),
      latencyMs,
    });

    try {
      const parsed = JSON.parse(extractJson(result.text));
      const validated = opts.schema.safeParse(parsed);
      if (validated.success) return validated.data;
      lastError = JSON.stringify(validated.error.issues.slice(0, 10));
    } catch (e) {
      lastError = `JSON parse hatası: ${String(e).slice(0, 200)}`;
    }
  }

  throw new Error(`LLM çıktısı ${opts.purpose} şemasını 2 denemede geçemedi: ${lastError.slice(0, 500)}`);
}

/** Düz metin sohbet tamamlaması (ders içi chat) — llm_calls loglamalı. */
export async function completeText(opts: CompleteTextOptions): Promise<string> {
  const model = MODEL_BY_PURPOSE[opts.purpose];
  const startedAt = Date.now();

  const result = await openaiProvider.completeText({
    model,
    system: opts.system,
    messages: opts.messages,
    maxTokens: opts.maxTokens,
    temperature: opts.temperature,
  });

  await db.insert(llmCalls).values({
    userId: opts.userId,
    sessionId: opts.sessionId,
    provider: openaiProvider.name,
    model,
    purpose: opts.purpose,
    promptVersion: opts.promptVersion,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    costUsd: costUsd(model, result.inputTokens, result.outputTokens),
    latencyMs: Date.now() - startedAt,
  });

  return result.text;
}

/** Metin → vektör. Tek çağrıda toplu embed eder; maliyeti llm_calls'a yazar. */
export async function embed(
  inputs: string[],
  opts: { userId?: string; sessionId?: string } = {},
): Promise<number[][]> {
  if (inputs.length === 0) return [];

  const model = MODEL_BY_PURPOSE.embedding;
  const startedAt = Date.now();
  const result = await openaiProvider.embed({ model, inputs });

  await db.insert(llmCalls).values({
    userId: opts.userId,
    sessionId: opts.sessionId,
    provider: openaiProvider.name,
    model,
    purpose: "embedding",
    promptVersion: null,
    inputTokens: result.inputTokens,
    outputTokens: 0,
    costUsd: costUsd(model, result.inputTokens, 0),
    latencyMs: Date.now() - startedAt,
  });

  return result.vectors;
}
