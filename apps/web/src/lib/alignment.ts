// ElevenLabs karakter zamanlamalarını viseme motorunun beklediği
// kelime bazlı Line yapısına çevirir. Zamanlar, cevabın kendi sesinin
// 0 anına görelidir (oynatan <audio>.currentTime ile birebir eşleşir).
import type { Line, Word } from "./viseme";

export type ElevenAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export function alignmentToLine(alignment: ElevenAlignment): Line {
  const words: Word[] = [];
  let text = "";
  let current = "";
  let start = 0;
  let end = 0;

  const flush = () => {
    if (current) words.push({ text: current, start, end });
    current = "";
  };

  for (let i = 0; i < alignment.characters.length; i++) {
    const ch = alignment.characters[i];
    text += ch;
    if (/\s/.test(ch)) {
      flush();
      continue;
    }
    if (!current) start = alignment.character_start_times_seconds[i] ?? end;
    current += ch;
    end = alignment.character_end_times_seconds[i] ?? end;
  }
  flush();

  const total = alignment.character_end_times_seconds.at(-1) ?? end;
  return { text, timestamp: [0, total], words };
}
