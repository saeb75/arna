import type { AudioPlayer } from "expo-audio";
import { alignmentToLine, buildTimeline, estimateLine, scaleLine, type Line, type Timeline } from "@glotmate/contracts/avatar";
import type { AvatarClip } from "@glotmate/contracts";

/**
 * KONUŞMA SAATİ — native 2.5D avatarın (SpriteAvatar) ses kaynağı. VoiceService her
 * klibi expo-audio'yla çalarken buraya bildirir; avatar her karede saati, ses
 * enerjisini ve klibin viseme timeline'ını OKUR. Akış kararı DEĞİLDİR — yalnız ağız
 * ve beden hareketini sürer (WebView köprüsündeki started/ended'in yerini almaz;
 * `onEnd` sahipliği VoiceService'te kalır).
 *
 * Neden ses WebView'da değil burada: WKWebView içindeki Web Audio, uygulamanın ses
 * oturumu değişince (mikrofon her açılıp kapandığında) askıya düşüp sesi tamamen
 * kesiyordu; ağız yine oynuyordu (5 Kas 2026 canlı hata). Ses + saat aynı native
 * oynatıcıdan geldiği için dudak senkronu bozulmaz ve kesinti sınıfı ortadan kalkar.
 *
 * Seviye: expo-audio ses örnekleri (PCM, -1..1) → RMS. Örnekleme açılamazsa seviye
 * null kalır; ağız timeline'a göre orta açıklıkta oynar (mouth.ts stepMouth sözleşmesi).
 */

let player: AudioPlayer | null = null;
let sampling: { remove: () => void } | null = null;
let timeline: Timeline | null = null;
/** Zaman damgası yokken metinden tahmin edilen satır — gerçek süre öğrenilince gerilir */
let estimated: { line: Line; scaled: boolean } | null = null;
let level: number | null = null;
let levelAt = 0;
/** Saatin en son ilerlediği an — ilerlemeyen saat "konuşmuyor" sayılır */
let lastTime = -1;
let lastAdvanceAt = 0;
/**
 * Oynatıcı "çalıyor" derken ses fiilen akmayabilir (akış tamponda, akış sonu bekleniyor):
 * saat bu süre ilerlemezse konuşma yok sayılır → ağız kapanır. Yoksa ağız son konumda
 * açık donuyordu (5 Kas 2026, Gemini akışı).
 */
const STALL_MS = 400;
/** Ses örneği bu kadar eskiyse yok sayılır (örnekleme durduysa son değer asılı kalmasın) */
const LEVEL_FRESH_MS = 250;
/** Timeline değişim sayacı — avatar ağız aralıklarını yalnız değişince yeniden kurar */
let version = 0;

function rmsOf(frames: number[]): number {
  if (!frames.length) return 0;
  let sum = 0;
  for (const v of frames) sum += v * v;
  return Math.sqrt(sum / frames.length);
}

export const SpeechClock = {
  /**
   * Bir klip/akış çalmaya başlıyor: saati bu oynatıcıya bağla. Zaman damgası yoksa
   * (Gemini) `text`ten tahmini kelime zamanlaması kurulur — ağız ŞEKLİ (O/E/M/F) ondan
   * gelir; yoksa avatar tek şekille açılıp kapanıyordu (5 Kas 2026).
   */
  begin(next: AudioPlayer, alignment: AvatarClip["alignment"] | null, text?: string): void {
    this.end();
    player = next;
    level = null;
    lastTime = -1;
    lastAdvanceAt = Date.now();
    estimated = null;
    if (alignment) timeline = buildTimeline([alignmentToLine(alignment)], null);
    else if (text?.trim()) {
      const line = estimateLine(text);
      estimated = { line, scaled: false };
      timeline = buildTimeline([line], null);
    } else timeline = null;
    version++;
    try {
      next.setAudioSamplingEnabled(true);
      sampling = next.addListener("audioSampleUpdate", (sample) => {
        const ch = sample.channels[0];
        if (ch) {
          level = rmsOf(ch.frames);
          levelAt = Date.now();
        }
      });
    } catch {
      sampling = null; // örnekleme yoksa ağız timeline'la oynar
    }
  },

  /** Klip bitti / kesildi. `owner` verilirse yalnız o oynatıcı hâlâ sahipse temizler */
  end(owner?: AudioPlayer): void {
    if (owner && owner !== player) return;
    try {
      sampling?.remove();
    } catch {
      /* oynatıcı zaten kaldırılmış */
    }
    sampling = null;
    player = null;
    level = null;
    estimated = null;
    if (timeline) {
      timeline = null;
      version++;
    }
  },

  /** Ses fiilen akıyorsa klip içindeki saniye, yoksa null (boşta / tamponda / takılı) */
  getTime(): number | null {
    try {
      if (!player?.playing || player.isBuffering) return null;
      const t = player.currentTime;
      const now = Date.now();
      // Tam klipte süre yüklenince tahmini zamanlamayı gerçek süreye ger (bir kez)
      if (estimated && !estimated.scaled) {
        const d = player.duration;
        if (d > 0 && Number.isFinite(d)) {
          estimated.scaled = true;
          const est = estimated.line.timestamp[1];
          if (Math.abs(d - est) / est > 0.06) {
            timeline = buildTimeline([scaleLine(estimated.line, d)], null);
            version++;
          }
        }
      }
      if (t !== lastTime) {
        lastTime = t;
        lastAdvanceAt = now;
      }
      return now - lastAdvanceAt > STALL_MS ? null : t;
    } catch {
      return null; // remove() edilmiş oynatıcı
    }
  },

  /** Anlık RMS; ses akmıyorsa ya da taze örnek yoksa null */
  getLevel(): number | null {
    if (this.getTime() === null || level === null) return null;
    return Date.now() - levelAt > LEVEL_FRESH_MS ? null : level;
  },

  getTimeline(): Timeline | null {
    return timeline;
  },

  getVersion(): number {
    return version;
  },
};
