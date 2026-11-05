// Framework'süz TTS klip çalıcı — /embed/avatar (mobil WebView) için.
//
// Sözleşme: `play()` başına en fazla BİR onEnded — yeni play/stop eskisini
// sessizce geçersiz kılar (token), eski zincir hiçbir şey yayınlamaz.
//
// SES ÇIKIŞI WEB AUDIO'DAN GEÇMEZ (5 Kas 2026, canlı hata): eskiden <audio>
// `createMediaElementSource` ile bir AudioContext'e bağlanıyor, ağız enerjisi
// oradaki analyser'dan okunuyordu. Bağlanan elemanın sesi YALNIZ o bağlamdan
// çıkar; iOS WKWebView'da bağlam, uygulamanın ses oturumu değişince (mikrofona
// her basışta kayıt modu açılıp kapanıyor) "interrupted/suspended" düşüyor ve
// SES TAMAMEN KESİLİYORDU — eleman yine "çalıyor", currentTime ilerliyor, ağız
// timeline'la oynuyor, onended zamanında geliyor; dışarıdan her şey normal.
// Öğrenci cevap verdikten sonraki hoca sözü sessiz kalıyordu ("bazen konuşuyor
// bazen konuşmuyor": bağlam ara ara kendiliğinden toparlanıyordu).
//
// Şimdi: ses düz <audio>'dan çalar (ses oturumu kesintisinden etkilenmez);
// ağız enerjisi klip bir kez OfflineAudioContext ile çözülüp çıkarılan RMS
// zarfından, currentTime'a göre okunur. OfflineAudioContext donanıma/ses
// oturumuna hiç dokunmaz — askıya düşecek bir şey yok. Zarf hazır olana dek
// (çözme ~100-300 ms) seviye `null` döner; embed timeline'a göre sahte seviyeye düşer.

export interface PlayerClip {
  audioBase64: string;
}

export interface PlayCallbacks {
  /** Her klip başlarken — embed bu anda timeline'ı klipe göre değiştirir */
  onClipStart: (clipIndex: number) => void;
  /** İlk klip gerçekten çalmaya başladı (audio.play() çözüldü) */
  onStarted: () => void;
  /** Tüm klipler bitti — play() çağrısı başına tam bir kez */
  onEnded: () => void;
}

export interface ClipPlayer {
  play: (clips: PlayerClip[], cb: PlayCallbacks) => Promise<void>;
  stop: () => void;
  /** Ses çalıyorsa currentTime, yoksa null — AvatarScene.getTime sözleşmesi */
  getTime: () => number | null;
  /** Sesin anlık RMS enerjisi; çalmıyorsa ya da zarf henüz hazır değilse null */
  getLevel: () => number | null;
}

/** Zarf çözünürlüğü: saniyede 100 kare (10 ms adım) */
const ENVELOPE_RATE = 100;
/** RMS penceresi ~23 ms — eski analyser'ın fftSize 1024 @ 44.1 kHz penceresiyle aynı ölçek */
const WINDOW_SECONDS = 1024 / 44_100;
/** Çözme örnek hızı — enerji zarfı için yeterli, çözmeyi ucuzlatır */
const DECODE_RATE = 22_050;

type OfflineCtor = new (channels: number, length: number, sampleRate: number) => OfflineAudioContext;

function offlineCtor(): OfflineCtor | null {
  const w = window as unknown as { OfflineAudioContext?: OfflineCtor; webkitOfflineAudioContext?: OfflineCtor };
  return w.OfflineAudioContext ?? w.webkitOfflineAudioContext ?? null;
}

/** mp3 baytlarından RMS zarfı; çözülemezse null (ağız timeline'la oynar, ses etkilenmez) */
async function envelopeOf(bytes: Uint8Array): Promise<Float32Array | null> {
  const Ctor = offlineCtor();
  if (!Ctor) return null;
  try {
    const ctx = new Ctor(1, 1, DECODE_RATE);
    // decodeAudioData tamponu devralır (detach) — kopyası verilir, <audio> blob'u etkilenmez
    const copy = bytes.slice().buffer;
    const audio = await new Promise<AudioBuffer>((resolve, reject) => {
      const p = ctx.decodeAudioData(copy, resolve, reject) as Promise<AudioBuffer> | undefined;
      p?.then(resolve, reject);
    });
    const data = audio.getChannelData(0);
    const rate = audio.sampleRate;
    const hop = rate / ENVELOPE_RATE;
    const half = Math.max(1, Math.round((WINDOW_SECONDS * rate) / 2));
    const frames = Math.ceil(data.length / hop);
    const env = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      const center = Math.round(f * hop);
      const from = Math.max(0, center - half);
      const to = Math.min(data.length, center + half);
      let sum = 0;
      for (let i = from; i < to; i++) sum += data[i]! * data[i]!;
      env[f] = to > from ? Math.sqrt(sum / (to - from)) : 0;
    }
    return env;
  } catch {
    return null;
  }
}

export function createClipPlayer(): ClipPlayer {
  let audio: HTMLAudioElement | null = null;
  let envelope: Float32Array | null = null;
  let blobUrl: string | null = null;
  let token = 0; // yeni play/stop eski zinciri geçersiz kılar

  const ensureAudio = (): HTMLAudioElement => {
    if (!audio) audio = new Audio();
    return audio;
  };

  return {
    async play(clips, cb) {
      const my = ++token;
      const el = ensureAudio();

      let ended = false;
      const endOnce = () => {
        if (ended || my !== token) return;
        ended = true;
        cb.onEnded();
      };

      let index = 0;
      let startedSent = false;
      const playClip = async (): Promise<void> => {
        const clip = clips[index];
        if (!clip || my !== token) {
          endOnce();
          return;
        }
        const bytes = Uint8Array.from(atob(clip.audioBase64), (c) => c.charCodeAt(0));
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        blobUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));

        // Zarf bu klibe ait: eski klibin zarfı yeni klibin zamanına uygulanmasın
        envelope = null;
        const clipIndex = index;
        void envelopeOf(bytes).then((env) => {
          if (my === token && index === clipIndex) envelope = env;
        });

        // Bozuk/çalınamayan klip: kalanları dene, hiçbiri gitmezse yine bitir
        const advance = () => {
          index += 1;
          if (my !== token) return;
          if (index < clips.length) void playClip();
          else endOnce();
        };
        cb.onClipStart(index);
        el.src = blobUrl;
        el.onended = advance;
        el.onerror = advance;
        try {
          await el.play();
          if (my === token && !startedSent) {
            startedSent = true;
            cb.onStarted();
          }
        } catch {
          advance();
        }
      };
      await playClip();
    },

    stop() {
      token += 1;
      envelope = null;
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
    },

    getTime() {
      if (audio && !audio.paused && !audio.ended) return audio.currentTime;
      return null;
    },

    getLevel() {
      if (!audio || audio.paused || audio.ended || !envelope) return null;
      const f = Math.floor(audio.currentTime * ENVELOPE_RATE);
      return envelope[Math.min(f, envelope.length - 1)] ?? null;
    },
  };
}
