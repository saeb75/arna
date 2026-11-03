import { Pressable, Text } from "react-native";

/** Bağlantı gibi okunan sakin düğme ("Şimdi değil", "Geç"). */
export function TextButton({ label, onPress, center = false }: { label: string; onPress: () => void; center?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      className={`rounded-md px-2 py-2 active:bg-muted ${center ? "self-center" : "-ml-2 self-start"}`}
    >
      <Text className="text-[15px] font-medium text-muted-foreground">{label}</Text>
    </Pressable>
  );
}
