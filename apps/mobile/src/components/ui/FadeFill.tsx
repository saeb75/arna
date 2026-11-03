import { useId } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/** Saydamdan bir renge solma — liste kenarı, kapak üstü karartma, sabit başlık altı. */
export function FadeFill({
  color,
  from = 0,
  to = 1,
  reverse = false,
}: {
  color: string;
  from?: number;
  to?: number;
  /** Aşağıdan yukarı solar */
  reverse?: boolean;
}) {
  const id = `fade${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1={reverse ? "1" : "0"} x2="0" y2={reverse ? "0" : "1"}>
          <Stop offset="0" stopColor={color} stopOpacity={from} />
          <Stop offset="1" stopColor={color} stopOpacity={to} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
