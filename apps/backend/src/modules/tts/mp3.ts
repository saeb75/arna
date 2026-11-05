import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * PCM → MP3 (saf JS, lamejs). İstemci sözleşmesi (`AvatarClip`) mp3 ister; Gemini ham
 * 16-bit PCM üretir (tam cevapta WAV başlıklı, akışta başlıksız `audio/l16`). WAV'ı
 * olduğu gibi yollamak ~10 kat büyük olurdu (24 kHz × 2 bayt = 48 KB/sn).
 * 64 kbps mono konuşma için yeterli ve ElevenLabs'in 128 kbps'inin yarısı.
 */
const KBPS = 64;

/** Akış kodlayıcı: s16le mono PCM parçaları → mp3 parçaları. Parça sınırında tek bayt kalırsa taşınır. */
export function createMp3Stream(sampleRate: number) {
  const encoder = new Mp3Encoder(1, sampleRate, KBPS);
  let carry: Buffer | null = null;
  return {
    push(pcm: Buffer): Buffer {
      let buf = carry ? Buffer.concat([carry, pcm]) : pcm;
      carry = null;
      if (buf.length % 2) {
        carry = Buffer.from(buf.subarray(buf.length - 1));
        buf = buf.subarray(0, buf.length - 1);
      }
      if (!buf.length) return Buffer.alloc(0);
      // Hizalı kopya: Buffer havuzundaki ofset 2'ye bölünmeyebilir
      const samples = new Int16Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
      return Buffer.from(encoder.encodeBuffer(samples));
    },
    end(): Buffer {
      return Buffer.from(encoder.flush());
    },
  };
}

/** WAV (RIFF) → PCM baytları + örnek hızı; başlık yoksa olduğu gibi (varsayılan hızla) döner */
export function wavToPcm(buf: Buffer, fallbackRate: number): { pcm: Buffer; sampleRate: number } {
  if (buf.length < 12 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    return { pcm: buf, sampleRate: fallbackRate };
  }
  let sampleRate = fallbackRate;
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt " && body + 8 <= buf.length) sampleRate = buf.readUInt32LE(body + 4);
    // Akış/eksik uzunluklu WAV'da data boyutu 0xFFFFFFFF olabilir — dosya sonuna kadar al
    if (id === "data") return { pcm: buf.subarray(body, Math.min(buf.length, body + size)), sampleRate };
    off = body + size + (size % 2);
  }
  return { pcm: Buffer.alloc(0), sampleRate };
}

/** Tek seferde PCM → mp3 */
export function pcmToMp3(pcm: Buffer, sampleRate: number): Buffer {
  const enc = createMp3Stream(sampleRate);
  return Buffer.concat([enc.push(pcm), enc.end()]);
}
