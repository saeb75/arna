import type { TtsProvider as TtsProviderName } from "@glotmate/contracts";

/**
 * TTS SAĞLAYICI SOYUTLAMASI — `modules/llm/types.ts` ile aynı desen.
 *
 * İstemci sözleşmesi (`packages/contracts/src/avatarProtocol.ts` → `AvatarClip`)
 * ElevenLabs'in KARAKTER bazlı zaman damgası biçimidir ve sabittir: her
 * sağlayıcı kendi çıktısını bu biçime çevirir, istemci (web · mobil · WebView
 * avatarı) sağlayıcıyı bilmez. Zamanlar saniye, klip başına 0'dan göreli.
 */
export interface CharAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

/** Dil kodu çözülmüş parça — `languageCode` sağlayıcının kendi kodu (Azure: `tr-TR`, ElevenLabs: `tr`) */
export interface TtsRun {
  languageCode: string;
  text: string;
}

export interface SynthesizeRequest {
  text: string;
  /** Sağlayıcının kendi dil kodu — `provider.languageCode()` çıktısı */
  languageCode: string;
  voiceId: string;
  modelId: string;
}

export interface SynthesizeRunsRequest {
  runs: TtsRun[];
  voiceId: string;
  modelId: string;
}

export interface SynthesizeResult {
  /** mp3 bayt, base64 — istemci `audio/mpeg` blob'u kurar */
  audioBase64: string;
  alignment: CharAlignment | null;
}

export interface TtsProvider {
  name: TtsProviderName;
  /** Panelde seçilebilecek modeller; ilki varsayılan. TEK öğe = sağlayıcıda model kavramı yok */
  models: readonly string[];
  /** API anahtarı .env'de var mı */
  configured(): boolean;
  /** .env'den gelen varsayılan ses — panelde `voiceId: null` bırakılınca bu */
  defaultVoiceId(): string | null;
  /**
   * Normalize ana dil (`lib/language.ts` biçimi: `tr`, `zh-hans`, `pt-br`) →
   * sağlayıcının dil kodu; kapsam dışıysa `null` (çağıran parçayı sessiz bırakır).
   */
  languageCode(normalized: string): string | null;
  synthesize(req: SynthesizeRequest): Promise<SynthesizeResult>;
  /**
   * Bir speak çağrısının TÜM parçalarını (karışık dil) TEK klipte üretir —
   * tek istek, kesintisiz prosodi, tek alignment. Yoksa gateway dil başına
   * gruplayıp `synthesize`i çağırır (ElevenLabs/Inworld yolu).
   */
  synthesizeRuns?(req: SynthesizeRunsRequest): Promise<SynthesizeResult>;
  /**
   * Sesin konuşabildiği dil kodları (sağlayıcı biçiminde); `null` = bilinmiyor,
   * gateway hepsine izin verir. `languageCode` saf kalır; kapsam ağdan gelir.
   */
  coverage?(voiceId: string): Promise<ReadonlySet<string> | null>;
}

export class TtsError extends Error {
  constructor(
    public code: "tts_unavailable" | "provider_not_configured",
    message: string,
  ) {
    super(message);
  }
}
