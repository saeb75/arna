import { Image, Text, View } from "react-native";
import { BookOpen } from "lucide-react-native";
import { FadeFill } from "../../components/ui/FadeFill";
import { GradientFill } from "../../components/ui/GradientFill";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { unitArt } from "../../domain/unitArt";
import { tr } from "../../i18n/tr";
import { UNIT_ROW_H } from "../../lib/lessonPath";
import { useThemeColors } from "../../theme/useThemeColors";

/**
 * Ünitenin kapağı: soft 3D illüstrasyon, altında karartma üstünde ünite no +
 * ilerleme, başlık ve `goal` (can-do) cümlesi; kartın dibinde ince ilerleme çubuğu.
 * Katalog metni kanonik İngilizce. Görsel yoksa marka gradyanı + ikon.
 * Yükseklik lib'den — getItemLayout ile aynı kaynak (bkz. PathNode).
 */
export function UnitCard({
  level,
  unitIndex,
  title,
  goal,
  done,
  total,
}: {
  level: string;
  unitIndex: number;
  title: string;
  goal: string;
  done: number;
  total: number;
}) {
  const colors = useThemeColors();
  const art = unitArt(level, unitIndex);
  return (
    <View className="justify-end px-4 pb-4" style={{ height: UNIT_ROW_H }}>
      <View className="h-[184px] overflow-hidden rounded-3xl border border-border bg-card">
        {art ? (
          <Image source={art} resizeMode="cover" className="absolute inset-0 h-full w-full" accessibilityIgnoresInvertColors />
        ) : (
          <>
            <GradientFill opacity={0.85} />
            <View className="absolute right-6 top-6 opacity-60">
              <BookOpen color={colors["on-image"]} size={56} strokeWidth={1.6} />
            </View>
          </>
        )}
        {/* Alt yarıda karartma: illüstrasyon açık tonlu, beyaz metin her temada okunsun */}
        <View className="absolute inset-x-0 bottom-0 h-[118px]">
          <FadeFill color={colors.scrim} from={0} to={0.72} />
        </View>
        <View className="absolute inset-x-0 bottom-0 gap-0.5 px-4 pb-4">
          <Text className="text-[11px] font-bold tracking-widest text-on-image-muted">
            {tr.home.unitEyebrow(unitIndex)} · {tr.home.unitProgress(done, total)}
          </Text>
          <Text numberOfLines={1} className="text-xl font-extrabold tracking-tight text-on-image">
            {title}
          </Text>
          <Text numberOfLines={2} className="text-[13px] leading-[17px] text-on-image-muted">
            {goal}
          </Text>
        </View>
        <View className="absolute inset-x-0 bottom-0">
          <ProgressBar value={total ? done / total : 0} className="h-1 rounded-none" trackClass="bg-on-image/20" />
        </View>
      </View>
    </View>
  );
}
