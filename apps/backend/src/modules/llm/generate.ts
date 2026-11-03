import type { z } from "zod";
import { openaiProvider } from "./openai.js";
import type { ProviderResult, ReasoningEffort } from "./types.js";

/**
 * Şemalı JSON üretimi — DB'SİZ çekirdek. `completeJson` (index.ts) bunu llm_calls
 * loguyla sarar; konuşma taraması betiği doğrudan çağırır, böylece canlıdakiyle
 * AYNI çağrı yolunu (model ayarı, onarım denemesi, şema) sınar.
 */

/**
 * Modele özgü akıl yürütme düzeyi. Sesli derste gecikme belirleyici: düşünmesi
 * kapatılabilen modeller "none" ile, kapatılamayanlar en düşük düzeyle çağrılır
 * (API "none"u reddediyor — 3 Kas 2026 yoklaması).
 */
const REASONING_BY_MODEL: Record<string, ReasoningEffort> = {
  "gpt-5.5": "none",
  "gpt-5.4": "none",
  "gpt-5.2": "none",
  "gpt-5.6-sol": "none",
  "gpt-5.6-terra": "none",
  "gpt-5.6-luna": "none",
  "gpt-6.1-terra": "none",
  "gpt-6-luna": "none",
  "gpt-6.1-sol": "low",
  "gpt-6-astra": "low",
};

export function reasoningEffortFor(model: string): ReasoningEffort | undefined {
  return REASONING_BY_MODEL[model];
}

/** JSON içinden ilk dengeli objeyi çıkar (model bazen açıklama ekler) */
export function extractJson(text: string): string {
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

export interface GenerateJsonRequest<T> {
  model: string;
  system: string;
  user: string;
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  maxTokens?: number;
  temperature?: number;
  /** Verilmezse modelin tablodaki düzeyi kullanılır */
  reasoningEffort?: ReasoningEffort;
  /** Her sağlayıcı çağrısından sonra (onarım denemesi dahil) — loglama kancası */
  onCall?: (result: ProviderResult, latencyMs: number) => Promise<void> | void;
}

/** Sağlayıcı çağrısı + Zod doğrulama + 1 onarım denemesi. */
export async function generateJson<T>(req: GenerateJsonRequest<T>): Promise<T> {
  let lastError = "";
  const effort = req.reasoningEffort ?? reasoningEffortFor(req.model);

  for (let attempt = 0; attempt < 2; attempt++) {
    const user =
      attempt === 0
        ? req.user
        : `${req.user}\n\nYOUR PREVIOUS OUTPUT FAILED VALIDATION — FIX IT AND OUTPUT AGAIN:\n${lastError}`;

    const startedAt = Date.now();
    const result = await openaiProvider.completeJson({
      model: req.model,
      system: req.system,
      user,
      maxTokens: req.maxTokens,
      temperature: req.temperature,
      reasoningEffort: effort,
    });
    await req.onCall?.(result, Date.now() - startedAt);

    try {
      const parsed = JSON.parse(extractJson(result.text));
      const validated = req.schema.safeParse(parsed);
      if (validated.success) return validated.data;
      lastError = JSON.stringify(validated.error.issues.slice(0, 10));
    } catch (e) {
      lastError = `JSON parse error: ${String(e).slice(0, 200)}`;
    }
  }

  throw new Error(`LLM çıktısı şemayı 2 denemede geçemedi (${req.model}): ${lastError.slice(0, 500)}`);
}
