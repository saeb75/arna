import { correctedSentence, type DrillItem, type DrillState } from "@glotmate/contracts";

// Oyun bloğunun saf sunum yardımcıları — controller ve ekran ortak kullanır.

/** Maddenin ekrandaki kimliği: tekrar turunda aynı madde YENİ kimlikle (yerel durum sıfırlansın) */
export function drillItemKey(item: DrillItem, state: DrillState): string {
  return `${item.id}@${state.cursor}`;
}

/** Doğru cevabın okunur hâli — geri bildirim panelinde gösterilir */
export function drillCorrectText(item: DrillItem): string {
  switch (item.type) {
    case "fill_choice":
      return item.sentence.replace("___", item.options[item.correctIndex] ?? "___");
    case "situation":
    case "complete_chat":
    case "listen_choose":
      return item.options[item.correctIndex] ?? "";
    case "arrange":
      return item.answer;
    case "listen_arrange":
      return item.audio;
    case "find_error":
      return correctedSentence(item);
    case "match":
      return item.pairs.map((p) => `${p.left} → ${p.right}`).join("\n");
    case "speak":
      return item.sentence;
  }
}

/** Sorunun okunur hâli — transkript satırı (admin bug avı) için; ekranda kullanılmaz */
export function drillPromptText(item: DrillItem): string {
  switch (item.type) {
    case "fill_choice":
    case "find_error":
    case "speak":
      return item.sentence;
    case "situation":
      return item.context;
    case "complete_chat":
      return item.lines.map((l) => `${l.who}: ${l.text ?? "___"}`).join(" / ");
    case "listen_choose":
    case "listen_arrange":
      return `🔊 ${item.audio}`;
    case "arrange":
      return item.answer;
    case "match":
      return item.pairs.map((p) => p.left).join(" · ");
  }
}
