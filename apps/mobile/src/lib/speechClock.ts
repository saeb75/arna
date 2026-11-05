import type { AudioPlayer } from "expo-audio";
import { alignmentToLine, buildTimeline, type Timeline } from "@glotmate/contracts/avatar";
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
let level: number | null = null;
/** Timeline değişim sayacı — avatar ağız aralıklarını yalnız değişince yeniden kurar */
let version = 0;

function rmsOf(frames: number[]): number {
  if (!frames.length) return 0;
  let sum = 0;
  for (const v of frames) sum += v * v;
  return Math.sqrt(sum / frames.length);
}

export const SpeechClock = {
  /** Bir klip/akış çalmaya başlıyor: saati bu oynatıcıya bağla (`alignment` yoksa ağız yalnız enerjiyle) */
  begin(next: AudioPlayer, alignment: AvatarClip["alignment"] | null): void {
    this.end();
    player = next;
    level = null;
    timeline = alignment ? buildTimeline([alignmentToLine(alignment)], null) : null;
    version++;
    try {
      next.setAudioSamplingEnabled(true);
      sampling = next.addListener("audioSampleUpdate", (sample) => {
        const ch = sample.channels[0];
        if (ch) level = rmsOf(ch.frames);
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
    if (timeline) {
      timeline = null;
      version++;
    }
  },

  /** Ses çalıyorsa klip içindeki saniye, yoksa null (boşta) */
  getTime(): number | null {
    try {
      return player?.playing ? player.currentTime : null;
    } catch {
      return null; // remove() edilmiş oynatıcı
    }
  },

  /** Anlık RMS; ses çalmıyorsa ya da örnek yoksa null */
  getLevel(): number | null {
    return this.getTime() === null ? null : level;
  },

  getTimeline(): Timeline | null {
    return timeline;
  },

  getVersion(): number {
    return version;
  },
};
