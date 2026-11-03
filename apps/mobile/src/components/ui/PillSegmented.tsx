import { Pressable, Text, View } from "react-native";

/**
 * Birkaç seçenekten biri, iz üstünde haplar; seçili olan marka dolgulu
 * (Görünüm: Sistem/Açık/Koyu). Satırına sığmazsa yazı küçülür, taşmaz.
 */
export function PillSegmented<T extends string>({
  options,
  value,
  onChange,
  small = false,
  onCard = false,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  small?: boolean;
  /** Kart içinde: iz `muted` olur ki görünsün */
  onCard?: boolean;
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      className={`max-w-full flex-row self-center rounded-full p-1 ${onCard ? "bg-muted" : "bg-card"}`}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}
            onPress={() => !selected && onChange(o.value)}
            className={`shrink items-center justify-center rounded-full ${small ? "h-8 px-3.5" : "h-10 px-5"} ${selected ? "bg-primary" : "active:bg-muted"}`}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              className={`${small ? "text-sm" : "text-[15px]"} font-semibold ${selected ? "text-primary-foreground" : "text-muted-foreground"}`}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
