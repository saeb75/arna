import { Text, View } from "react-native";
import { tr } from "../../i18n/tr";
import { UNIT_ROW_H } from "../../lib/lessonPath";

/**
 * Ünitenin başlığı — GÖRSEL YOK (11 Kas 2026, kullanıcı kararı: soft 3D kapaklar
 * kaldırıldı). İnce ayraç çizgileri arasında ünite no + ilerleme, altında başlık
 * ve `goal` (can-do) cümlesi. Katalog metni kanonik İngilizce.
 * Yükseklik lib'den — getItemLayout ile aynı kaynak.
 */
export function UnitHeader({
  unitIndex,
  title,
  goal,
  done,
  total,
}: {
  unitIndex: number;
  title: string;
  goal: string;
  done: number;
  total: number;
}) {
  return (
    <View className="items-center justify-center gap-1 px-6" style={{ height: UNIT_ROW_H }}>
      <View className="w-full flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="text-[11px] font-extrabold tracking-widest text-muted-foreground">
          {tr.home.unitEyebrow(unitIndex)} · {tr.home.unitProgress(done, total)}
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      <Text numberOfLines={1} className="text-center text-xl font-extrabold tracking-tight text-foreground">
        {title}
      </Text>
      <Text numberOfLines={2} className="text-center text-[13px] leading-[18px] text-muted-foreground">
        {goal}
      </Text>
    </View>
  );
}
