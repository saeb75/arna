import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import type { RichText } from "@glotmate/contracts";
import { RunsText } from "./RunsText";

interface MessageBubbleProps {
  role: "teacher" | "user";
  text: string;
  runs?: RichText;
  /** Anlatım maddeleri — balonda satır satır */
  points?: RichText[];
  /** Tamamı İngilizce sohbet (rol yapma) — `en` vurgusu yok */
  plain?: boolean;
  /** Hoca balonunda İngilizce kelimeye dokunma (anlamı gösterilir) */
  onWord?: (word: string, sentence: string) => void;
}

const rise = FadeInDown.duration(260).easing(Easing.out(Easing.cubic));

/**
 * Sohbet balonu — ders VE rol yapma. Hoca solda kartta (`en` parçalar marka
 * renginde), öğrenci sağda dolu `primary` zeminde. Gradyan DEĞİL: ember
 * gradyanın açık ucu beyaz gövde metniyle ~2.8:1 kalıyor (GlotCast kuralı:
 * metin taşıyan dolu yüzey `primary`, gradyan yalnız CTA/mikrofon/hero).
 */
export function MessageBubble({ role, text, runs, points, plain = false, onWord }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <Animated.View
      entering={rise}
      // Maddeli balon SABİT genişlikte: içerik boyutlu balonda madde metni sıfır
      // genişliğe çöküp harf harf kırılıyordu (canlı hata, 3 Kas 2026)
      className={`${points?.length ? "w-[85%]" : "max-w-[85%]"} overflow-hidden rounded-3xl px-4 py-3 ${
        isUser ? "self-end rounded-br-lg bg-primary" : "self-start rounded-bl-lg border border-border bg-card"
      }`}
    >
      {points?.length ? (
        <View className="gap-2.5">
          {points.map((p, i) => (
            <View key={i} className="flex-row gap-2.5">
              <View className={`mt-2.5 size-1.5 rounded-full ${isUser ? "bg-primary-foreground" : "bg-brand"}`} />
              <RunsText runs={p} onPrimary={isUser} plain={plain} onWord={onWord} className="flex-1" />
            </View>
          ))}
        </View>
      ) : runs?.length ? (
        <RunsText runs={runs} onPrimary={isUser} plain={plain} onWord={onWord} />
      ) : (
        <Text className={`text-[16px] leading-6 ${isUser ? "text-primary-foreground" : "text-foreground"}`}>{text}</Text>
      )}
    </Animated.View>
  );
}
