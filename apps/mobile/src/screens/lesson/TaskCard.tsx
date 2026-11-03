import { Text, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";
import type { RichText } from "@glotmate/contracts";
import { RunsText } from "../../components/shared/RunsText";
import { tr } from "../../i18n/tr";
import { OptionButtons } from "./OptionButtons";

const rise = FadeInDown.duration(320).easing(Easing.out(Easing.cubic));

/**
 * GÖREV KARTI — alıştırma / açık uçlu soru ekranın ortasına gelir: sıra, soru
 * (yönerge + madde, dil etiketli) ve çoktan seçmelide büyük şıklar. Şıkka
 * dokunmak cevabı ANINDA gönderir (MCQ ürün kuralı: tek harf STT'nin en kötü girdisi).
 */
export function TaskCard({
  ordinal,
  total,
  prompt,
  options,
  locked,
  onSelect,
}: {
  ordinal: number;
  total: number;
  prompt: RichText;
  options: string[] | null;
  locked: boolean;
  onSelect: (option: string) => void;
}) {
  return (
    <Animated.View entering={rise} className="gap-4 rounded-3xl border border-border bg-card px-5 pb-5 pt-4">
      <View className="gap-2">
        <Text className="text-xs font-bold tracking-widest text-brand">{tr.lesson.taskEyebrow(ordinal, total)}</Text>
        <RunsText runs={prompt} size="lg" className="font-semibold" />
        <Text className="text-sm text-muted-foreground">{options ? tr.lesson.taskChooseOrSay : tr.lesson.taskSayOrType}</Text>
      </View>
      {options ? <OptionButtons options={options} disabled={locked} onSelect={onSelect} /> : null}
    </Animated.View>
  );
}
