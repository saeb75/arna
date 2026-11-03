import { db } from "../../db/client.js";
import { llmCalls } from "../../db/schema.js";
import { generateJson } from "./generate.js";
import { MODEL_BY_PURPOSE } from "./models.js";

export { modelForPurpose } from "./models.js";
import { openaiProvider } from "./openai.js";
import type { CompleteJsonOptions, CompleteTextOptions, LLMPurpose } from "./types.js";

/** Hafıza vektörlerinin boyutu — memories.embedding kolonuyla aynı olmalı */
export const EMBEDDING_DIMENSIONS = 1536;

/** USD / 1M token (liste fiyatı; model eklenince burası güncellenir) */
const PRICING: Record<string, { in: number; out: number }> = {
  "gpt-4.1": { in: 2.0, out: 8.0 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-5.6-luna": { in: 0.2, out: 1.2 },
  // 3 Kas 2026 — üçüncü taraf kaynaklardan (OpenAI fiyat sayfasıyla DOĞRULANMALI):
  // gpt-6.1-terra $1/$5, gpt-6-astra $10/$50 (bir kaynak $5/$25 diyor)
  "gpt-6.1-terra": { in: 1.0, out: 5.0 },
  "gpt-6-astra": { in: 10.0, out: 50.0 },
  "text-embedding-3-small": { in: 0.02, out: 0 },
};

function costUsd(model: string, inTok: number, outTok: number): string {
  const p = PRICING[model];
  // Fiyatı bilinmeyen model maliyeti SESSİZCE 0 yazardı — bütçe takibi böyle körleşir.
  if (!p) {
    console.warn(`[llm] "${model}" PRICING'de yok — llm_calls.cost_usd 0 yazılıyor`);
    return "0";
  }
  return (((inTok * p.in) + (outTok * p.out)) / 1_000_000).toFixed(6);
}

/**
 * JSON üretim çağrısı: model yönlendirme + Zod doğrulama + 1 onarım denemesi +
 * her API çağrısının llm_calls'a maliyetiyle loglanması. Çekirdek `generateJson`
 * (DB'siz) — konuşma taraması aynı yolu kullanır.
 */
export async function completeJson<T>(opts: CompleteJsonOptions<T>): Promise<T> {
  const model = MODEL_BY_PURPOSE[opts.purpose];
  try {
    return await generateJson({
      model,
      system: opts.system,
      user: opts.user,
      schema: opts.schema,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
      onCall: async (result, latencyMs) => {
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
      },
    });
  } catch (err) {
    throw new Error(`[${opts.purpose}] ${err instanceof Error ? err.message : String(err)}`);
  }
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
