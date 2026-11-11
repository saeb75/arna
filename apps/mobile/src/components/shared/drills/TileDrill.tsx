import { View } from "react-native";
import type { DrillOf } from "@glotmate/contracts";
import { TileBuilder } from "../TileBuilder";
import { ListenButton } from "./ListenButton";
import { TapToTranslate } from "./TapToTranslate";

interface Props {
  item: DrillOf<"arrange"> | DrillOf<"listen_arrange">;
  /** Karıştırılmış kartlar (DrillCard bir kez karıştırır) */
  tiles: string[];
  built: number[];
  checked: boolean;
  verdictOk: boolean | null;
  onChange: (built: number[]) => void;
}

/**
 * Kelimeleri sırala / Duyduğuna dokun — kart mantığı ünite testiyle ortak.
 * Sıralamada ipucu cümlenin ANLAMIDIR (dokun-çevir); dinlemede ses.
 */
export function TileDrill({ item, tiles, built, checked, verdictOk, onChange }: Props) {
  return (
    <View className="gap-6">
      {item.type === "listen_arrange" ? <ListenButton text={item.audio} /> : <TapToTranslate text={item.answer} />}
      <TileBuilder
        tiles={tiles}
        built={built}
        checked={checked}
        onChange={onChange}
        tone={verdictOk === null ? undefined : verdictOk ? "positive" : "negative"}
      />
    </View>
  );
}
