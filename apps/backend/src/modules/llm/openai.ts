import OpenAI from "openai";
import { env } from "../../config/env.js";
import type {
  EmbedRequest,
  EmbedResult,
  JsonRequest,
  LLMProvider,
  ProviderResult,
  TextRequest,
} from "./types.js";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export { client as openaiClient };

/**
 * gpt-5 ailesi ve o-serisi eski iki parametreyi REDDEDER (canlı doğrulandı, 400):
 *   max_tokens          → "Use 'max_completion_tokens' instead."
 *   temperature: 0.2    → "Only the default (1) value is supported."
 *
 * Bu yüzden çağrı gövdesi model ailesine göre kurulur. Aile büyüdükçe tek yerden
 * genişler; çağıranların (`completeJson`/`completeText`) imzası değişmez.
 */
function isNewTier(model: string): boolean {
  return /^(gpt-5|o[1-9])/.test(model);
}

/** Token tavanı + sıcaklık — modelin kabul ettiği adlarla. */
function tuning(model: string, maxTokens: number, temperature: number) {
  return isNewTier(model)
    ? { max_completion_tokens: maxTokens }
    : { max_tokens: maxTokens, temperature };
}

export const openaiProvider: LLMProvider = {
  name: "openai",

  async completeJson(req: JsonRequest): Promise<ProviderResult> {
    const res = await client.chat.completions.create({
      model: req.model,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      response_format: { type: "json_object" },
      ...tuning(req.model, req.maxTokens ?? 8000, req.temperature ?? 0.7),
    });

    const text = res.choices[0]?.message?.content ?? "";
    return {
      text,
      inputTokens: res.usage?.prompt_tokens ?? 0,
      outputTokens: res.usage?.completion_tokens ?? 0,
    };
  },

  async completeText(req: TextRequest): Promise<ProviderResult> {
    const res = await client.chat.completions.create({
      model: req.model,
      messages: [{ role: "system" as const, content: req.system }, ...req.messages],
      ...tuning(req.model, req.maxTokens ?? 220, req.temperature ?? 0.7),
    });

    const text = res.choices[0]?.message?.content ?? "";
    return {
      text,
      inputTokens: res.usage?.prompt_tokens ?? 0,
      outputTokens: res.usage?.completion_tokens ?? 0,
    };
  },

  async embed(req: EmbedRequest): Promise<EmbedResult> {
    const res = await client.embeddings.create({ model: req.model, input: req.inputs });
    return {
      // Sıra garanti değil — index'e göre yerleştir
      vectors: [...res.data].sort((a, b) => a.index - b.index).map((d) => d.embedding),
      inputTokens: res.usage?.prompt_tokens ?? 0,
    };
  },
};
