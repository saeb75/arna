import { correctedSentence, type DrillItem } from "@glotmate/contracts";

const TYPE_LABEL: Record<DrillItem["type"], string> = {
  fill_choice: "fill the gap",
  arrange: "arrange",
  situation: "situation",
  find_error: "find the error",
  complete_chat: "complete the chat",
  match: "match",
  listen_choose: "listen & choose",
  listen_arrange: "listen & arrange",
  speak: "speak",
};

/** Doğru şık İLK yazılır ama önizleme indeksten okur — servis karıştırması da aynı alanı kullanır */
function body(d: DrillItem): { text: string; answer: string } {
  switch (d.type) {
    case "fill_choice":
      return { text: `${d.sentence} (${d.options.join(" | ")})`, answer: d.options[d.correctIndex] ?? "" };
    case "situation":
      return { text: `${d.context} (${d.options.join(" | ")})`, answer: d.options[d.correctIndex] ?? "" };
    case "complete_chat":
      return {
        text: `${d.lines.map((l) => `${l.who}: ${l.text ?? "___"}`).join(" / ")} (${d.options.join(" | ")})`,
        answer: d.options[d.correctIndex] ?? "",
      };
    case "listen_choose":
      return { text: `🔊 ${d.options.join(" | ")}`, answer: d.audio };
    case "arrange":
      return { text: d.extraTiles.length ? `extra tiles: ${d.extraTiles.join(", ")}` : "", answer: d.answer };
    case "listen_arrange":
      return { text: `🔊${d.extraTiles.length ? ` extra tiles: ${d.extraTiles.join(", ")}` : ""}`, answer: d.audio };
    case "find_error":
      return { text: d.sentence, answer: correctedSentence(d) };
    case "match":
      return { text: "", answer: d.pairs.map((p) => `${p.left} ↔ ${p.right}`).join(" · ") };
    case "speak":
      return { text: "🎤", answer: [d.sentence, ...d.accepted].join(" / ") };
  }
}

/** Oyun bloğu — madde başına tür, öğretim maddesi ve doğru cevap */
export function DrillsPreview({ items }: { items: DrillItem[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {items.map((d) => {
        const b = body(d);
        return (
          <li key={d.id} className="rounded-md bg-muted/40 p-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">{d.id}</span>
              <span className="rounded bg-muted px-1.5 font-mono">{TYPE_LABEL[d.type]}</span>
              <span className="font-mono">{d.pointRef}</span>
            </div>
            {b.text && <p className="mt-1">{b.text}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">answer → {b.answer}</p>
          </li>
        );
      })}
    </ol>
  );
}
