import { useEffect, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import type { AvatarActivity } from "@glotmate/contracts";
import { AvatarStage } from "../../components/shared/AvatarStage";
import { tr } from "../../i18n/tr";

/** Alıştırmada avatarın küçük (resim-içinde-resim) ölçüsü */
const PIP = 104;
const ease = { duration: 340, easing: Easing.out(Easing.cubic) };

/**
 * Ders sahnesi — anlatımda avatar BÜYÜK (görüntülü görüşme), alıştırmada köşede
 * küçük; yanında ad + durum. İki hâl arasında AYNI WebView ölçü değiştirir —
 * sahne yeniden yüklenmez, dudak senkronu ve ses kesilmez. (Ölçü animasyonu ve
 * ekran yüksekliğine bağlı tavan çalışma zamanı değeri — gerekçeli inline stil.)
 */
export function LessonStage({
  compact,
  speaking,
  avatarId,
  activity,
}: {
  compact: boolean;
  speaking: boolean;
  avatarId: string;
  activity: AvatarActivity;
}) {
  const { height: screenH } = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const w = useSharedValue(0);
  const h = useSharedValue(0);

  useEffect(() => {
    if (!width) return;
    const bigH = Math.min(width * 0.92, screenH * 0.42);
    const first = w.value === 0;
    const tw = compact ? PIP : width;
    const th = compact ? PIP : bigH;
    w.value = first ? tw : withTiming(tw, ease);
    h.value = first ? th : withTiming(th, ease);
  }, [compact, width, screenH, w, h]);

  const frame = useAnimatedStyle(() => ({ width: w.value, height: h.value }));
  const status = speaking ? tr.lesson.talking : activity === "listening" ? tr.lesson.listening : null;

  return (
    <View className="px-4 pb-3 pt-1" onLayout={(e) => setWidth(e.nativeEvent.layout.width - 32)}>
      <View className="flex-row items-center gap-3.5">
        <Animated.View className="overflow-hidden rounded-3xl border border-border bg-card" style={frame}>
          <AvatarStage fill speaking={speaking} avatarId={avatarId} activity={activity} />
        </Animated.View>
        {compact ? (
          <Animated.View entering={FadeIn.duration(260).delay(160)} className="flex-1 gap-1">
            <Text className="text-lg font-bold text-foreground">{tr.lesson.tutorName}</Text>
            <View className="flex-row items-center gap-1.5">
              <View className={`size-2 rounded-full ${status ? "bg-positive" : "bg-muted-foreground/40"}`} />
              <Text className="text-sm text-muted-foreground">{status ?? tr.lesson.waiting}</Text>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
