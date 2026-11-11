import { DRILL_TYPES, type DrillItem } from "./drills.js";

/**
 * Oyun bloğu cevabının TRANSKRİPT SATIRI — mobil yazar, admin okur (bug avı).
 * `transcript_turns.text` düz metin olduğu için biçim burada TEK yerde tanımlanır:
 *
 *   ✗ [fill_choice] I ___ a student.
 *   → is
 *   = am
 *
 * 1. satır sonuç + tür + soru · 2. satır öğrencinin cevabı · 3. satır (yalnız yanlışta) doğrusu.
 * Eski satırlar ("✓ [type] cevap", soru yok) da okunur.
 */
export interface DrillTurn {
  ok: boolean;
  type: DrillItem["type"];
  /** Sorunun okunur hâli; eski satırlarda yok */
  prompt: string | null;
  answer: string;
  /** Doğru cevap — yalnız yanlışta yazılır */
  expected: string | null;
}

const PART_MAX = 500; // 3 parça + işaretler sync sınırının (2000) altında kalır
const clip = (s: string) => (s.length > PART_MAX ? `${s.slice(0, PART_MAX - 1)}…` : s);
const oneLine = (s: string) => s.replace(/\s*\n\s*/g, " · ");

export function formatDrillTurn(t: DrillTurn): string {
  const head = `${t.ok ? "✓" : "✗"} [${t.type}]${t.prompt ? ` ${clip(oneLine(t.prompt))}` : ""}`;
  const lines = [head, `→ ${clip(oneLine(t.answer))}`];
  if (!t.ok && t.expected) lines.push(`= ${clip(oneLine(t.expected))}`);
  return lines.join("\n");
}

const HEAD = /^([✓✗]) \[([a-z_]+)\](?: (.*))?$/;

export function parseDrillTurn(text: string): DrillTurn | null {
  const [head = "", ...rest] = text.split("\n");
  const m = HEAD.exec(head);
  if (!m || !(DRILL_TYPES as readonly string[]).includes(m[2]!)) return null;
  const ok = m[1] === "✓";
  const type = m[2] as DrillItem["type"];
  const answerLine = rest.find((l) => l.startsWith("→ "));
  // Eski biçim: tek satır, başlıktaki metin sorunun değil CEVABIN kendisidir
  if (!answerLine) return { ok, type, prompt: null, answer: m[3] ?? "", expected: null };
  const expectedLine = rest.find((l) => l.startsWith("= "));
  return {
    ok,
    type,
    prompt: m[3] ?? null,
    answer: answerLine.slice(2),
    expected: expectedLine ? expectedLine.slice(2) : null,
  };
}
