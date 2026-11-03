import { useEffect, useState } from "react";
import { Text } from "react-native";

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Bir kez sayarak yükselen sayı (seri, dakika); tam `to`'da biter. */
export function CountUp({
  to,
  format = (v) => String(Math.round(v)),
  delay = 0,
  duration = 1100,
  className = "",
}: {
  to: number;
  format?: (value: number) => string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setValue(to * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(tick)), delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, delay, duration]);
  return (
    <Text accessibilityLabel={format(to)} className={`tabular-nums ${className}`}>
      {format(value)}
    </Text>
  );
}
