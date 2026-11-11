/**
 * AĞIZ İZİ — akışlı sesin ham PCM'inden kare başına ses seviyesi (RMS, 0..1).
 *
 * Neden sunucuda: mobil oynatıcı (expo-audio/AVPlayer) sesi UZAK ADRESTEN çalarken ses
 * örneği vermiyor (ölçüldü 5 Kas 2026: akış 0 örnek, uzak tam dosya 0, cihazdaki dosya
 * ~12/sn). Gemini akışında avatarın ağzı bu yüzden gerçek sesi hiç duymuyor, sahte hece
 * ritmiyle oynuyordu. Ham PCM mp3'e çevrilmeden önce zaten elimizde — seviyeyi burada
 * hesaplayıp ayrı uçtan veriyoruz, istemci oynatıcının saatine göre okur.
 */

/** Kare hızı: 20 ms — ağız zarfının (stepEnvelope) çözünürlüğünden ince */
export const MOUTH_FPS = 50;

/**
 * mp3 kodlayıcı + çözücü gecikmesi (lame: 576 + 529 örnek). Akışta LAME/Xing başlığı
 * olmadığı için oynatıcı bu boşluğu kırpmaz → ses PCM'den ~46 ms (24 kHz) geç duyulur.
 * İz baştan bu kadar boş kareyle kaydırılır; istemci yalnız `t * fps` okur.
 */
const MP3_DELAY_SAMPLES = 1105;

/** s16le mono PCM parçaları → kare seviyeleri. Kare/bayt sınırı parçalar arasında taşınır. */
export function createLevelMeter(sampleRate: number, fps = MOUTH_FPS) {
  const frameLen = Math.max(1, Math.round(sampleRate / fps));
  let carry: Buffer | null = null;
  let acc = 0;
  let count = 0;
  let lead = Math.round((MP3_DELAY_SAMPLES / sampleRate) * fps);
  return {
    push(pcm: Buffer): number[] {
      const out: number[] = [];
      while (lead > 0) {
        out.push(0);
        lead--;
      }
      let buf = carry ? Buffer.concat([carry, pcm]) : pcm;
      carry = null;
      if (buf.length % 2) {
        carry = Buffer.from(buf.subarray(buf.length - 1));
        buf = buf.subarray(0, buf.length - 1);
      }
      for (let i = 0; i < buf.length; i += 2) {
        const v = buf.readInt16LE(i) / 32768;
        acc += v * v;
        if (++count === frameLen) {
          out.push(Math.sqrt(acc / frameLen));
          acc = 0;
          count = 0;
        }
      }
      return out;
    },
    /** Yarım son kare */
    end(): number[] {
      if (!count) return [];
      const v = Math.sqrt(acc / count);
      acc = 0;
      count = 0;
      return [v];
    },
  };
}
