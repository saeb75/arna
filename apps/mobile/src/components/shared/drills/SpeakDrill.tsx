import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { spokenWordHits, type DrillOf } from "@glotmate/contracts";
import { MicButton } from "../MicButton";
import { TextButton } from "../../ui/TextButton";
import { tr } from "../../../i18n/tr";
import { useDrillHost } from "./DrillHost";
import { ListenButton } from "./ListenButton";
import { TapToTranslate } from "./TapToTranslate";

interface Props {
  item: DrillOf<"speak">;
  checked: boolean;
}

/**
 * Bu cümleyi söyle — bas-konuş. Söylendikten sonra hedef cümlenin hangi kelimeleri
 * duyulduğu vurgulanır (yalnız sunum; karar `gradeDrill`). İki denemeden sonra kart
 * cezasız geçer; "Şu an konuşamıyorum" bloktaki konuşma kartlarını atlar.
 */
export function SpeakDrill({ item, checked }: Props) {
  const { speech } = useDrillHost();
  const recording = speech?.recording ?? false;
  const busy = speech?.busy ?? false;
  const heard = speech?.heard ?? null;
  const attempts = speech?.attempts ?? 0;
  const words = item.sentence.split(/\s+/);
  const hits = heard ? spokenWordHits(item.sentence, heard) : null;

  return (
    <View className="grow gap-6">
      <View className="gap-3 rounded-3xl border border-border bg-card p-4">
        <Text className="text-2xl font-bold leading-9 tracking-tight">
          {words.map((w, i) => (
            <Text key={i} className={hits ? (hits[i] ? "text-positive" : "text-negative") : "text-foreground"}>
              {i > 0 ? " " : ""}
              {w}
            </Text>
          ))}
        </Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <ListenButton text={item.sentence} large={false} />
          <TapToTranslate text={item.sentence} />
        </View>
      </View>

      {heard && !checked && (
        <Animated.View entering={FadeIn.duration(200)} className="gap-0.5 px-1">
          <Text className="text-xs font-semibold text-muted-foreground">{tr.drill.youSaid}</Text>
          <Text className="text-base text-foreground">{heard}</Text>
          {attempts > 0 && <Text className="pt-1 text-sm font-semibold text-warning">{tr.drill.tryAgain}</Text>}
        </Animated.View>
      )}

      {!checked && speech && (
        // Mikrofon kartın altındaki boş alanın ortasında (grow + justify-center)
        <View className="grow items-center justify-center gap-3 pb-6">
          <MicButton
            size={84}
            locked={busy}
            recording={recording}
            onPressIn={speech.press}
            onPressOut={speech.release}
          />
          <Text className="text-sm text-muted-foreground">{tr.drill.holdToSpeak}</Text>
          <TextButton center label={tr.drill.cantSpeak} onPress={speech.cantSpeak} />
        </View>
      )}
    </View>
  );
}
