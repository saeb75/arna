// Avatar köprü protokolü — RN (mobil) ↔ WebView (/embed/avatar) mesajları.
//
// Mimari karar (mobil avatar dilimi): dudak senkronu, ses ile timeline'ın AYNI
// JS bağlamında olmasını gerektirir (AvatarScene her karede getTime/getLevel
// yoklar). Bu yüzden avatar aktifken SES WEBVIEW İÇİNDE ÇALAR: RN yetkili TTS
// isteğini atar (JWT WebView'a ASLA girmez) ve base64 klipleri köprüden
// geçirir; embed sayfası çalar + sahneyi sürer, olayları geri bildirir.
//
// `id` = RN VoiceService'in generation sayacı. RN, started/ended/error'ı yalnız
// id güncel nesle eşitse kabul eder — bayat bir `ended` asla yanlış konuşmayı
// sonlandıramaz. `ended` id başına TAM BİR KEZ yayınlanır (settle disiplini).
//
// Taşıma: RN→Web injectJavaScript + `window.__ARNA_AVATAR__.push(json)`;
// Web→RN `window.ReactNativeWebView.postMessage(json)`. Yalnız tip — runtime yok.

/** TTS ucunun döndürdüğü klip — backend `POST /v1/sessions/:id/tts` şekliyle birebir. */
export interface AvatarClip {
  /** mp3 baytları, base64 */
  audioBase64: string;
  /** ElevenLabs karakter zamanlamaları; kapsam dışı dilde null olabilir */
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  } | null;
  lang: string;
}

/** RN → WebView komutları */
export type AvatarCommand =
  | { type: "speak"; id: number; clips: AvatarClip[] }
  | { type: "stop" };

/** WebView → RN olayları */
export type AvatarEvent =
  /** Köprü kuruldu, ses hattı kullanılabilir (GLB hâlâ iniyor olabilir) */
  | { type: "ready" }
  /** GLB yüklendi + ilk render — RN yükleme örtüsünü kaldırır */
  | { type: "sceneReady" }
  /** İlk klip gerçekten çalmaya başladı */
  | { type: "started"; id: number }
  /** Tüm klipler bitti — id başına tam bir kez */
  | { type: "ended"; id: number }
  | { type: "error"; id: number | null; code: string };
