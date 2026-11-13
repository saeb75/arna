import { Text } from "react-native";
import type { RichText } from "@glotmate/contracts";
import { separateExamples } from "../../domain/richText";

/**
 * Ardışık parçalar bitişik yazılmasın ("başlayalım.Today" canlı hatası) — ama
 * kapanış noktalaması ve kesmeyle başlayan ek bir öncekine YAPIŞIR: "saeb !",
 * "are 'ı" ve "about . Are" görüntüleri buradan geliyordu. Açılış işaretinden
 * ("(", "¿", "«") sonra da boşluk girmez. Kural noktalamaya bakar, dile değil.
 */
function needsSpace(prev: string | undefined, cur: string): boolean {
  if (!prev) return false;
  if (/\s$/.test(prev) || /^\s/.test(cur)) return false;
  if (/^[.,!?;:…)\]}'’»”%]/.test(cur)) return false;
  return !/[(\[{¿¡«“]$/.test(prev);
}

/**
 * Dil etiketli parçalar — `en` (öğretilen İngilizce) vurgulu, ana dil düz.
 * Text iç içe olduğu için RTL dillerde İngilizce'nin yön yalıtımı (web'deki
 * <bdi>) RN'de kendiliğinden sağlanır.
 */
export function RunsText({
  runs: input,
  onPrimary = false,
  plain = false,
  size = "md",
  className = "",
}: {
  runs: RichText;
  /** Dolu `primary` zemin (öğrenci balonu): gövde ve `en` aynı ön plan rengi */
  onPrimary?: boolean;
  /** Tamamı İngilizce sohbet (rol yapma): vurgu anlamsız, `en` düz yazılır */
  plain?: boolean;
  /** md: sohbet balonu · lg: ders ekranının altyazı/görev kartı */
  size?: "md" | "lg";
  className?: string;
}) {
  const runs = separateExamples(input); // örnek cümle kendi satırında
  const body = onPrimary ? "text-primary-foreground" : "text-foreground";
  const en = onPrimary ? "text-primary-foreground" : "text-brand";
  return (
    <Text className={`${size === "lg" ? "text-[19px] leading-[27px]" : "text-[16px] leading-6"} ${body} ${className}`}>
      {runs.map((r, i) => {
        const sep = needsSpace(runs[i - 1]?.text, r.text) ? " " : "";
        return r.lang === "en" && !plain ? (
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
