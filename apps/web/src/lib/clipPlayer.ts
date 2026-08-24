// Framework'süz TTS klip çalıcı — /embed/avatar (mobil WebView) için.
//
// useVoiceSession.ts:72-204'ün SADELEŞTİRİLMİŞ kopyasıdır (aynı analyser
// parametreleri, aynı sıralı klip zinciri, aynı "bozuk klip kalanları denesin"
// disiplini). Bilinçli kopya: hook TTS fetch/barge-in/fastForward/React
// state'ine dolanmış durumda; bu dilimde onu refactor etmek çalışan web
// dersini riske atardı. İleride useVoiceSession bu çalıcının üstüne taşınabilir.
//
// Sözleşme: `play()` başına en fazla BİR onEnded — yeni play/stop eskisini
// sessizce geçersiz kılar (token), eski zincir hiçbir şey yayınlamaz.

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
  /** Sesin anlık RMS enerjisi; çalmıyorsa null — AvatarScene.getLevel sözleşmesi */
  getLevel: () => number | null;
  /** AudioContext askıda kaldıysa true — embed sahte çene seviyesine düşer */
  analyserSuspended: () => boolean;
}

export function createClipPlayer(): ClipPlayer {
  let audio: HTMLAudioElement | null = null;
  let ctx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let samples: Float32Array<ArrayBuffer> | null = null;
  let blobUrl: string | null = null;
  let token = 0; // yeni play/stop eski zinciri geçersiz kılar

  const ensureAudio = (): HTMLAudioElement => {
    if (audio) return audio;
    audio = new Audio();
    ctx = new AudioContext();
    const node = ctx.createAnalyser();
    node.fftSize = 1024;
    node.smoothingTimeConstant = 0.35;
    ctx.createMediaElementSource(audio).connect(node);
    node.connect(ctx.destination);
    analyser = node;
    samples = new Float32Array(node.fftSize);
    return audio;
  };

  return {
    async play(clips, cb) {
      const my = ++token;
      const el = ensureAudio();
      // WKWebView'da autoplay serbest olsa da context askıda başlayabilir
      if (ctx?.state === "suspended") void ctx.resume().catch(() => undefined);

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
      if (!analyser || !samples || !audio || audio.paused || audio.ended) return null;
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i]! * samples[i]!;
      return Math.sqrt(sum / samples.length);
    },

    analyserSuspended() {
      return ctx?.state === "suspended";
    },
  };
}
