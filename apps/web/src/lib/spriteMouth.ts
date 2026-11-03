// 2.5D AĞIZ ZAMANLAMASI — rig v0.3 `viseme-scheduler.js`in TS karşılığı (davranış
// birebir; eşdeğerlik paketin JS'iyle rastgele girdilerde karşılaştırıldı).
//
// Viseme timeline'ı (viseme.ts, Oculus 15'li) ağız pozu aralıklarına çevrilir,
// sonra iki filtre: (1) minMinorMs altı mikro pozlar komşusuna katılır,
// (2) ardışık konuşma pozları minHoldMs dolana kadar birleştirilir — saniyede
// 10-15 değişim titreme gibi görünüyordu. M/B/P kapanışı ve ≥60 ms sessizlik
// ASLA silinmez (yoksa /m/ /b/ /p/ yanlış okunur, cümle arası ağız açık kalır).
import { VISEME_TO_MOUTH, type MouthShape } from "./spriteRigs";
import type { Timeline } from "./viseme";

export type MouthSpan = { startMs: number; endMs: number; shape: MouthShape };

export interface MouthTiming {
  smooth: boolean;
  minMinorMs: number;
  minHoldMs: number;
}

export const DEFAULT_MOUTH_TIMING: MouthTiming = { smooth: true, minMinorMs: 55, minHoldMs: 120 };

const isClosure = (s: MouthShape) => s === "M";

/** viseme.ts frame'leri (sn, Oculus indeksi) → ağız pozu aralıkları (ms) */
export function spansFromTimeline(tl: Timeline): MouthSpan[] {
  return tl.frames.map((f) => ({
    startMs: f.t * 1000,
    endMs: (f.t + f.d) * 1000,
    shape: VISEME_TO_MOUTH[f.v] ?? "REST",
  }));
}

function merge(rows: MouthSpan[]): MouthSpan[] {
  const out: MouthSpan[] = [];
  for (const r of rows) {
    const last = out[out.length - 1];
    if (last && last.shape === r.shape && r.startMs <= last.endMs + 0.001) last.endMs = Math.max(last.endMs, r.endMs);
    else out.push({ ...r });
  }
  return out;
}

/** Sırala, çakışmaları kes, boşlukları açık REST yap; her an tek poz */
export function normalizeSpans(input: MouthSpan[]): MouthSpan[] {
  const list = input
    .map((s, i) => ({ ...s, i }))
    .filter((s) => Number.isFinite(s.startMs) && Number.isFinite(s.endMs) && s.endMs > s.startMs && s.endMs >= 0)
    .sort((a, b) => a.startMs - b.startMs || a.i - b.i);
  const spans: MouthSpan[] = [];
  let cursor = 0;
  for (const s of list) {
    const startMs = Math.max(cursor, Math.max(0, s.startMs));
    if (s.endMs <= startMs) continue;
    if (startMs > cursor) spans.push({ startMs: cursor, endMs: startMs, shape: "REST" });
    spans.push({ startMs, endMs: s.endMs, shape: s.shape });
    cursor = s.endMs;
  }
  return merge(spans);
}

export function smoothSpans(input: MouthSpan[], timing: MouthTiming): MouthSpan[] {
  const minMinor = Math.max(0, timing.minMinorMs);
  const minHold = Math.max(0, timing.minHoldMs);
  const rows = normalizeSpans(input);
  if (!timing.smooth || rows.length < 2) return rows;
  // Yalnız mikro pozlar; ≥60 ms sessizlik açık bir ara olarak kalır
  for (let j = 1; j < rows.length - 1; j++) {
    const r = rows[j];
    const dur = r.endMs - r.startMs;
    if (isClosure(r.shape) || dur >= minMinor || (r.shape === "REST" && dur >= 60)) continue;
    const left = rows[j - 1];
    const right = rows[j + 1];
    if (left.shape === right.shape) {
      r.shape = left.shape;
      continue;
    }
    if (isClosure(left.shape) || isClosure(right.shape)) continue;
    r.shape = right.endMs - right.startMs > (left.endMs - left.startMs) * 1.2 ? right.shape : left.shape;
  }
  const out: MouthSpan[] = [];
  for (const r of merge(rows)) {
    const last = out[out.length - 1];
    // Konuşma pozlarını tutma süresine kadar grupla; sessizliği konuşmaya uzatma, kapanışı silme
    if (
      last &&
      last.shape !== "REST" &&
      r.shape !== "REST" &&
      !isClosure(last.shape) &&
      !isClosure(r.shape) &&
      last.endMs - last.startMs < minHold
    ) {
      last.endMs = r.endMs;
    } else out.push({ ...r });
  }
  return merge(out);
}

// ---- Ses enerjisi: ağzın NE KADAR açık olacağını o seçer ----
// Ölçüldü (Inworld klibi, 14 sn): yalnız metin zamanlamasıyla sessiz anların
// %68'inde ağız AÇIK kalıyordu (TTS karakter zamanları duraklamayı noktalama/
// boşluk karakterlerine yayıyor, timeline'da sessizlik oluşmuyor) ve ağız
// açıklığı ile ses enerjisi uyumu 0.09'du. 3D sahne bunu çeneyi ses
// enerjisiyle çarparak çözüyor; burada aynı zarf poz seçer → uyum 0.52,
// sessizlikte açık ağız %15. Kalan fark ayrık pozların doğası (3D çene sürekli).

export interface MouthEnvelope {
  peak: number;
  env: number;
}

export const newEnvelope = (): MouthEnvelope => ({ peak: 0, env: 0 });

/**
 * AvatarScene'in zarfı (tepe takibi = mp3 seviyesine otomatik kalibrasyon) +
 * daha hızlı kapanış: ayrık pozda geç kapanan ağız sessizlikte açık asılı kalıyor.
 */
export function stepEnvelope(e: MouthEnvelope, rms: number, dt: number): number {
  e.peak = Math.max(rms, e.peak * Math.pow(0.9985, dt * 60));
  const raw = Math.min(1, rms / Math.max(0.03, e.peak * 0.72));
  e.env += (raw - e.env) * (1 - Math.exp(-(raw > e.env ? 45 : 25) * dt));
  return e.env;
}

// ---- Kademesiz ağız: pozlar arası atlama değil, sürekli parametreler ----
// Kullanıcı geri bildirimi: ayrık poz seçimi (kapalı/yarı/tam) açılıp kapanmayı
// sert ve abartılı gösteriyordu. Atlasın optik akış ara kareleri artık tek bir
// AÇIKLIK ekseni olarak okunur (REST → talk → A, 11 kare) ve ağız bu eksende
// sesin enerjisiyle — 3D çene gibi — kayar; şekil ailesi (O/E/M) yumuşak
// ağırlıklarla üstüne karışır. Genlik bilerek kısık: tam A yalnız çok yüksek seste.

export interface MouthParams {
  /** 0 kapalı … 1 tam açık (A); MOUTH_AMPLITUDE ile sınırlı */
  open: number;
  /** yuvarlak (O) ağırlığı */
  round: number;
  /** yayvan (E) ağırlığı */
  spread: number;
  /** dudak bastırma (M/B/P) ağırlığı */
  press: number;
  /** F/V (üst dişler alt dudakta) ağırlığı */
  fv: number;
}

export const newMouthParams = (): MouthParams => ({ open: 0, round: 0, spread: 0, press: 0, fv: 0 });

const approach = (cur: number, tgt: number, up: number, down: number, dt: number) =>
  cur + (tgt - cur) * (1 - Math.exp(-(tgt > cur ? up : down) * dt));

/**
 * Bir kare ilerlet. `family` timeline'ın şekil ailesi, `energy` ses zarfı (0..1;
 * null = ses yok → timeline'a göre orta açıklık varsayılır). Kapanış (M) hızlı,
 * açılış/kapanış yumuşak — /p/ /b/ /m/ dudak kapanması kaybolmasın.
 */
export function stepMouth(
  m: MouthParams,
  family: MouthShape,
  energy: number | null,
  speaking: boolean,
  dt: number,
  /** rig'in en büyük açıklığı (Praktika tarzı ölçülü konuşma: tam açık yalnız çok yüksek seste) */
  amplitude = 0.7,
): MouthParams {
  const e = energy ?? (speaking && family !== "REST" && family !== "M" ? 0.6 : 0);
  let open = speaking ? Math.min(1, Math.max(0, (e - 0.15) / 0.7)) : 0;
  if (family === "M") open = 0;
  else if (family === "REST") open *= 0.5; // timeline sessiz ama ses var: hafif aralık
  open *= amplitude;
  // hız taraması (Inworld klibi): 60/30 → enerjiyle uyum 0.67 (en iyi 0.72, 17 ms geride),
  // sessizlikte açık %9; yumuşatmasız uyum 0.73 ama ağız titriyor
  m.open = approach(m.open, open, 60, family === "M" ? 60 : 30, dt);
  // şekil ailesi değişimi hızlı (~50 ms): iki ağzın karışık göründüğü an 1-2 kareyle sınırlı
  m.round = approach(m.round, family === "O" ? 1 : 0, 22, 18, dt);
  m.spread = approach(m.spread, family === "E" || family === "smile" ? 1 : 0, 22, 18, dt);
  m.press = approach(m.press, family === "M" ? 1 : 0, 40, 12, dt);
  m.fv = approach(m.fv, family === "F" ? 1 : 0, 30, 14, dt);
  return m;
}

/** Eksende konum → iki komşu kare + karışım oranı */
export function axisFrames(axis: readonly string[], pos: number): [string, string, number] {
  const u = Math.max(0, Math.min(1, pos)) * (axis.length - 1);
  const i = Math.min(axis.length - 2, Math.floor(u));
  return [axis[i]!, axis[i + 1]!, u - i];
}

export function shapeAt(rows: MouthSpan[], ms: number): MouthShape {
  if (!rows.length || ms < 0) return "REST";
  let lo = 0;
  let hi = rows.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const x = rows[m];
    if (ms < x.startMs) hi = m - 1;
    else if (ms >= x.endMs) lo = m + 1;
    else return x.shape;
  }
  return "REST";
}
