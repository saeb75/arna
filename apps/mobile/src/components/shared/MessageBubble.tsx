import { Text, View } from "react-native";
import type { RichText } from "@glotmate/contracts";

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

/**
 * Kullanıcı balonu mor zeminde: metin `onPrimary`, `en` vurgusu yalnız kalınlıkla.
 * Hoca balonu beyaz kartta: metin `foreground`, `en` parçalar `accent`.
 */
function Runs({ runs, onPrimary }: { runs: RichText; onPrimary: boolean }) {
  const body = onPrimary ? "text-onPrimary" : "text-foreground";
  const en = onPrimary ? "text-onPrimary" : "text-accent";
  return (
    <Text className={`text-base leading-6 ${body}`}>
      {runs.map((r, i) => {
        const sep = needsSpace(runs[i - 1]?.text, r.text) ? " " : "";
        return r.lang === "en" ? (
          <Text key={i} className={`${r.emphasis ? "font-bold" : "font-semibold"} ${en}`}>
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
        isUser ? "self-end bg-primary" : "self-start border border-border bg-card"
      }`}
    >
      {points?.length ? (
        <View className="gap-2">
          {points.map((p, i) => (
            <Runs key={i} runs={p} onPrimary={isUser} />
          ))}
        </View>
      ) : runs?.length ? (
        <Runs runs={runs} onPrimary={isUser} />
      ) : (
        <Text className={`text-base leading-6 ${isUser ? "text-onPrimary" : "text-foreground"}`}>{text}</Text>
      )}
    </View>
  );
}
