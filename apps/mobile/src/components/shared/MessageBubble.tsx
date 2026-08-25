import { Text, View } from "react-native";
import type { RichText } from "@arna/contracts";

/**
 * RichText parçalı sohbet balonu — `en` parçalar vurgulu (ders malzemesi),
 * L1 parçalar düz. Roleplay ekranı da bunu kullanacak (shared kuralı).
 * RTL dillerde İngilizce'nin yön yalıtımı RN'de writingDirection ile çözülür;
 * Text iç içe olduğu için web'deki <bdi> ihtiyacının karşılığı budur.
 */
interface MessageBubbleProps {
  role: "teacher" | "user";
  text: string;
  runs?: RichText;
  points?: RichText[];
}

/** Ardışık run'lar bitişik yazılmasın: önceki boşlukla bitmiyor VE yenisi boşlukla başlamıyorsa araya boşluk gir ("başlayalım.Today" canlı hatası). */
function needsSpace(prev: string | undefined, cur: string): boolean {
  if (!prev) return false;
  return !/\s$/.test(prev) && !/^\s/.test(cur);
}

function Runs({ runs }: { runs: RichText }) {
  return (
    <Text className="text-base leading-6 text-white">
      {runs.map((r, i) => {
        const sep = needsSpace(runs[i - 1]?.text, r.text) ? " " : "";
        return r.lang === "en" ? (
          <Text key={i} className={r.emphasis ? "font-bold text-indigo-300" : "font-semibold text-indigo-200"}>
            {sep + r.text}
          </Text>
        ) : (
          <Text key={i}>{sep + r.text}</Text>
        );
      })}
    </Text>
  );
}

export function MessageBubble({ role, text, runs, points }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <View
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
        isUser ? "self-end bg-primary" : "self-start bg-card"
      }`}
    >
      {points?.length ? (
        <View className="gap-2">
          {points.map((p, i) => (
            <Runs key={i} runs={p} />
          ))}
        </View>
      ) : runs?.length ? (
        <Runs runs={runs} />
      ) : (
        <Text className="text-base leading-6 text-white">{text}</Text>
      )}
    </View>
  );
}
