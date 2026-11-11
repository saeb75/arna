import { randomBytes } from "node:crypto";
import type { ServerResponse } from "node:http";
import type { ActiveTts } from "./index.js";
import { MOUTH_FPS } from "./levels.js";
import { speakableText } from "./speakable.js";
import { TtsError, type TtsRun } from "./types.js";

/**
 * AKIŞLI SES BİLETLERİ — `POST /sessions/:id/tts/stream` bilet keser, `GET /tts/stream/:id`
 * mp3'ü üretim sürdükçe akıtır.
 *
 * Neden bilet + ayrı GET: mobil oynatıcı (expo-audio → AVPlayer/ExoPlayer) sesi bir
 * ADRESTEN çeker; RN fetch akış gövdesini güvenilir okuyamaz. JWT adrese GİRMEZ —
 * bilet kimliği 24 bayt rastgele (tahmin edilemez), kısa ömürlü ve yalnız tek bir
 * konuşmanın sesini taşır.
 *
 * Üretim bilet kesilir kesilmez BAŞLAR (istemci adresi açana dek ilk parçalar hazır
 * olur) ve parçalar biletin içinde birikir: oynatıcı aynı adresi birden çok kez
 * isteyebilir (AVPlayer bayt aralığı yoklaması / yeniden bağlanma) — her istek baştan
 * alır, üretim İKİ KEZ yapılmaz. Kimse dinlemeye gelmezse üretim iptal edilir
 * (ücret durur); bitmiş bilet TTL sonunda silinir.
 */

interface Ticket {
  chunks: Buffer[];
  /** Ağız izi: MOUTH_FPS hızında RMS kareleri (sağlayıcı ham PCM veriyorsa) — `mouthTrack` */
  levels: number[];
  done: boolean;
  failed: boolean;
  /** Akış yeni parça ya da bitiş haber verince çağrılan dinleyiciler */
  listeners: Set<() => void>;
  abort: AbortController;
  createdAt: number;
  /** Bir GET en az bir kez bağlandı mı — bağlanılmamış uzun üretim iptal edilir */
  claimed: boolean;
}

const tickets = new Map<string, Ticket>();
/** Bitmiş biletin yaşam süresi (oynatıcı yeniden isteyebilsin) */
const TTL_MS = 120_000;
/** Bilet kesilip bu sürede kimse adresi açmazsa üretim iptal (istemci tam klip yoluna düşmüş demektir) */
const UNCLAIMED_ABORT_MS = 20_000;
const MAX_TICKETS = 300;

function sweep(now = Date.now()): void {
  for (const [id, t] of tickets) {
    const age = now - t.createdAt;
    if (!t.claimed && !t.done && age > UNCLAIMED_ABORT_MS) t.abort.abort();
    if (age > TTL_MS && t.listeners.size === 0) {
      if (!t.done) t.abort.abort();
      tickets.delete(id);
    }
  }
}
setInterval(() => sweep(), 15_000).unref();

function notify(t: Ticket): void {
  for (const fn of [...t.listeners]) fn();
}

/** Üretimi başlat, bilet kimliğini döndür. Sağlayıcı akış desteklemiyorsa TtsError. */
export function openStream(active: ActiveTts, rawRuns: TtsRun[]): string {
  if (!active.provider.stream) throw new TtsError("tts_unavailable", `${active.provider.name} akış desteklemiyor`);
  sweep();
  if (tickets.size >= MAX_TICKETS) throw new TtsError("tts_unavailable", "Akış kapasitesi dolu");
  const runs = rawRuns.map((r) => ({ ...r, text: speakableText(r.text) })).filter((r) => r.text);
  if (runs.length === 0) throw new TtsError("tts_unavailable", "Seslendirilecek metin yok");

  const id = randomBytes(24).toString("base64url");
  const t: Ticket = { chunks: [], levels: [], done: false, failed: false, listeners: new Set(), abort: new AbortController(), createdAt: Date.now(), claimed: false };
  tickets.set(id, t);
  const source = active.provider.stream({ runs, voiceId: active.voiceId, modelId: active.modelId }, t.abort.signal);
  void (async () => {
    try {
      for await (const piece of source) {
        if (piece.levels?.length) t.levels.push(...piece.levels);
        if (!piece.mp3.length) continue;
        t.chunks.push(piece.mp3);
        notify(t);
      }
    } catch (err) {
      t.failed = true;
      if (!t.abort.signal.aborted) console.warn(`[tts/stream] ${active.provider.name} akışı düştü: ${(err as Error).message}`);
    } finally {
      t.done = true;
      notify(t);
    }
  })();
  return id;
}

export function getStreamTicket(id: string): Ticket | null {
  return tickets.get(id) ?? null;
}

/**
 * Ağız izinin `from` karesinden sonrası. İstemci akış çalarken birkaç yüz ms'de bir
 * yoklar; üretim gerçek zamandan hızlı olduğu için iz oynatmanın önünde gider.
 */
export function mouthTrack(t: Ticket, from: number) {
  const start = Math.max(0, Math.min(from, t.levels.length));
  return {
    fps: MOUTH_FPS,
    from: start,
    levels: t.levels.slice(start).map((v) => Math.round(v * 10000) / 10000),
    done: t.done,
  };
}

/**
 * Bileti HTTP cevabına akıt: birikmiş parçalar + gelenler; üretim bitince kapat.
 * Başlık İLK parça gelince yazılır — ses hiç gelmeden üretim düşerse 502 döner
 * (oynatıcı boş 200 yerine hata görür, istemci tam klip yoluna düşer).
 */
export function pipeStreamTicket(t: Ticket, res: ServerResponse): void {
  t.claimed = true;
  let sent = 0;
  let headed = false;
  const finish = () => {
    t.listeners.delete(pump);
    if (!res.writableEnded) res.end();
  };
  function pump() {
    if (res.destroyed) return finish();
    if (!headed) {
      if (t.chunks.length === 0) {
        if (!t.done) return; // ilk parça bekleniyor
        res.writeHead(502, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "tts_unavailable" }));
        t.listeners.delete(pump);
        return;
      }
      res.writeHead(200, {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
        // ara katman (nginx vb.) akışı tamponlamasın
        "x-accel-buffering": "no",
      });
      headed = true;
    }
    while (sent < t.chunks.length) res.write(t.chunks[sent++]);
    if (t.done) finish();
  }
  res.on("close", () => t.listeners.delete(pump));
  t.listeners.add(pump);
  pump();
}
