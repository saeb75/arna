import { useMemo } from "react";
import { View } from "react-native";
import Animated, { Easing, FadeIn } from "react-native-reanimated";
import type { RichText } from "@glotmate/contracts";

/**
 * AKAN YAZI — hocanın sözü kelime kelime yumuşak solmayla belirir (5 Kas 2026, kullanıcı
 * isteği: "ChatGPT gibi tık tık harf yazmasın, hale geçişi olsun, kutu sağa büyümesin").
 *
 * Kelimeler BAŞTAN yerleşik: satır kırılımı ve kutu yüksekliği ilk karede kesindir, yalnız
 * opaklık açılır — kutu ne sağa ne aşağı zıplar. Yazı düzeni `RunsText` ile aynıdır
 * (noktalama yapışır, `en` vurgulu, "\n" satır arası); fark yalnız kelimelerin satır içi
 * `Text` yerine sarılan bir satırda ayrı öğeler olmasıdır (RN iç içe Text'te kelime başına
 * animasyon desteklemiyor).
 *
 * `animate` yalnız BAĞLANIŞTA okunur: geçmişteki söz (ekran açılışı, devam) anında görünür,
 * sonradan prop değişse de yeniden oynamaz. Uzun anlatımda toplam süre tavanlıdır.
 */

// 5 Kas 2026 geri bildirimi: ilk ayar (32 ms aralık / 260 ms solma) "çok hızlı" bulundu —
// kelimeler birbirine karışarak, uzun ve yumuşak solmayla gelir
const STEP_MS = 80;
const MAX_TOTAL_MS = 4000;
const FADE_MS = 600;

/** RunsText.needsSpace ile aynı kural — noktalamaya bakar, dile değil */
function needsSpace(prev: string | undefined, cur: string): boolean {
  if (!prev) return false;
  if (/\s$/.test(prev) || /^\s/.test(cur)) return false;
  if (/^[.,!?;:…)\]}'’»”%]/.test(cur)) return false;
  return !/[(\[{¿¡«“]$/.test(prev);
}

type Token = { kind: "word"; text: string; en: boolean; bold: boolean } | { kind: "break"; blank: boolean };

function tokenize(runs: RichText): Token[] {
  const out: Token[] = [];
  let glued = false; // önceki kelimeye yapışacak (boşluksuz devam)
  runs.forEach((r, i) => {
    const text = needsSpace(runs[i - 1]?.text, r.text) ? ` ${r.text}` : r.text;
    // Boşluklar ve satır sonları ayrı parçalar — kelimeler satır sarımında bölünmez
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        const lines = (part.match(/\n/g) ?? []).length;
        if (lines) out.push({ kind: "break", blank: lines > 1 });
        else {
          const last = out[out.length - 1];
          if (last?.kind === "word") last.text += " ";
        }
        glued = false;
        continue;
      }
      const last = out[out.length - 1];
      const en = r.lang === "en";
      // Boşluksuz devam (ek, noktalama) aynı kelimeye eklenir ama rengi kendi parçasının
      if (glued && last?.kind === "word" && last.en === en) last.text += part;
      else out.push({ kind: "word", text: part, en, bold: Boolean(r.emphasis) });
      glued = true;
    }
    glued = !/\s$/.test(text);
  });
  return out;
}

/** Kelime aralığı: kısa sözde STEP_MS, uzunda toplam MAX_TOTAL_MS'e sığacak kadar sık */
function stepFor(words: number): number {
  return words ? Math.min(STEP_MS, MAX_TOTAL_MS / words) : STEP_MS;
}

/** Akışın bitiş anı (ms) — ardından gelecek öğe (MCQ şıkları) bunu bekler */
export function streamDurationMs(runs: RichText): number {
  const words = tokenize(runs).filter((t) => t.kind === "word").length;
  return words ? Math.round((words - 1) * stepFor(words) + FADE_MS) : 0;
}

export function StreamingRunsText({
  runs,
  animate,
  size = "lg",
  strong = false,
  className = "",
}: {
  runs: RichText;
  animate: boolean;
  size?: "md" | "lg";
  /** Gövde (ana dil) kelimeleri de yarı kalın — görev kartı sorusu */
  strong?: boolean;
  className?: string;
}) {
  const tokens = useMemo(() => tokenize(runs), [runs]);
  const step = stepFor(tokens.filter((t) => t.kind === "word").length);
  const text = size === "lg" ? "text-[17px] leading-[25px]" : "text-[15px] leading-[22px]";

  let w = 0;
  return (
    <View className={`flex-row flex-wrap ${className}`}>
      {tokens.map((t, i) => {
        if (t.kind === "break") {
          // Satır arası: tam genişlik öğe sonraki kelimeyi alt satıra iter; boş satırda yarım satır yüksekliği
          return <View key={i} className={t.blank ? "h-3 w-full" : "h-0 w-full"} />;
        }
        const delay = Math.round(w++ * step);
        return (
          <Animated.Text
            key={i}
            entering={animate ? FadeIn.duration(FADE_MS).delay(delay).easing(Easing.inOut(Easing.quad)) : undefined}
            className={`${text} ${t.en ? `${t.bold ? "font-bold" : "font-semibold"} text-brand` : `text-foreground ${strong ? "font-semibold" : ""}`}`}
          >
            {t.text}
          </Animated.Text>
        );
      })}
    </View>
  );
}
