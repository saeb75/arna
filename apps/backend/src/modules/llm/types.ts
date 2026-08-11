import type { z } from "zod";

export type LLMPurpose =
  | "plan_gen"
  | "lesson_gen"
  | "chat"
  | "memory_extract"
  | "embedding";

export interface JsonRequest {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TextRequest {
  model: string;
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface ProviderResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface EmbedRequest {
  model: string;
  inputs: string[];
}

export interface EmbedResult {
  vectors: number[][];
  inputTokens: number;
}

export interface LLMProvider {
  name: string;
  /** JSON modunda tamamlama — ham metin döner, doğrulama gateway'de */
  completeJson(req: JsonRequest): Promise<ProviderResult>;
  /** Düz metin sohbet tamamlaması (ders içi chat) */
  completeText(req: TextRequest): Promise<ProviderResult>;
  /** Metin → vektör (hafıza saklama ve benzerlik araması) */
  embed(req: EmbedRequest): Promise<EmbedResult>;
}

export interface CompleteTextOptions {
  purpose: LLMPurpose;
  system: string;
  messages: ChatMessage[];
  promptVersion: string;
  userId?: string;
  sessionId?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CompleteJsonOptions<T> {
  purpose: LLMPurpose;
  system: string;
  user: string;
  /** Giriş tipi serbest (default'lu şemalar giriş≠çıkış olur); T her zaman ÇIKIŞ tipi */
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  promptVersion: string;
  userId?: string;
  sessionId?: string;
  maxTokens?: number;
  temperature?: number;
}
