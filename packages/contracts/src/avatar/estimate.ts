// TAHMİNİ KELİME ZAMANLAMASI — zaman damgası vermeyen TTS (Gemini) için.
//
// Ağız ŞEKLİ (O/E/M/F…) viseme timeline'ından gelir; timeline olmayınca avatar tek bir
// "konuşma" şekliyle açılıp kapanıyordu (5 Kas 2026 canlı geri bildirim: "tek bir visleme
// çalışıyor gibi"). Konuşulan metni zaten biliyoruz: her kelimeye harf sayısıyla orantılı
// süre, noktalamaya durak verilir → `buildTimeline`in kelime kipi (aralara sessizlik koyar,
// kayma cümle boyunca birikmez). Açıklığı yine ses enerjisi sürer — şekil yaklaşık olsa da
// sessizlikte ağız kapalı kalır.
//
// Kalibrasyon (Gemini 3.8 Flash/Lite, Türkçe+İngilizce karışık): 1.156 karakter → 77–80 sn,
// 150 karakter → 9,0–9,2 sn. `scaleLine` gerçek süre öğrenilince (oynatıcı `duration`)
// tahmini ona gerer.
import type { Line, Word } from "./viseme.js";

/** Gemini sese kısa bir sessizlikle başlıyor (ilk PCM parçası sıfır) */
const LEAD_SEC = 0.2;
/** Harf başına konuşma süresi (sn) — noktalama durakları hariç */
const SEC_PER_LETTER = 0.062;
/** Kelime başına sabit pay (sessiz harf geçişleri, kısa kelimeler) */
const SEC_PER_WORD = 0.05;
const PAUSE: Array<[RegExp, number]> = [
  [/\n\s*\n|\n/, 0.45], // paragraf / satır arası
  [/[.!?…]["'”’)]*$/, 0.38], // cümle sonu
  [/[:;]$/, 0.3],
  [/[,—–]$/, 0.16],
];

function pauseAfter(word: string, following: string): number {
  if (/\n/.test(following)) return PAUSE[0]![1];
  for (const [re, sec] of PAUSE.slice(1)) if (re.test(word)) return sec;
  return 0.02;
}

/** Metin → tahmini kelime zamanlı satır (sn, 0'dan) */
export function estimateLine(text: string): Line {
  const words: Word[] = [];
  const parts = text.split(/(\s+)/);
  let t = LEAD_SEC;
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i]!;
    if (!w || /^\s+$/.test(w)) continue;
    const letters = (w.match(/[\p{L}\p{N}]/gu) ?? []).length;
    if (!letters) {
      // Yalnız noktalama ("…", "—"): kelime değil, durak
      t += /…/.test(w) ? 0.35 : 0.1;
      continue;
    }
    const dur = SEC_PER_WORD + letters * SEC_PER_LETTER;
    words.push({ text: w, start: t, end: t + dur });
    t += dur + pauseAfter(w, parts[i + 1] ?? "");
  }
  return { text, timestamp: [0, t], words };
}

/** Tahmini satırı gerçek süreye ger (oynatıcı süreyi öğrenince) */
export function scaleLine(line: Line, duration: number): Line {
  const est = line.timestamp[1];
  if (!(est > 0) || !(duration > 0)) return line;
  const k = duration / est;
  return {
    ...line,
    timestamp: [0, duration],
    words: line.words?.map((w) => ({ ...w, start: w.start * k, end: w.end * k })),
  };
}
