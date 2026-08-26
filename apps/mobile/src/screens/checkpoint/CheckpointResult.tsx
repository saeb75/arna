import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";

interface CheckpointResultProps {
  unitIndex: number;
  /** Canlar tüketilmeden bitirildi mi — rozetin tek şartı (bkz. checkpointPassed) */
  passed: boolean;
  score: number;
  total: number;
  /** Yanlış yapılan maddelerin geldiği dersler — test kapı değil AYNA, buradan tekrara gidilir */
  weakLessonIds: string[];
  saveError: string | null;
  onRetry: () => void;
}

/** Ders kimliğinden okunabilir başlık: "a1-she-works-at-night" → "she works at night" */
function readable(lessonId: string): string {
  return lessonId.replace(/^[a-c][12]-/, "").replace(/-/g, " ");
}

export function CheckpointResult({
  unitIndex,
  passed,
  score,
  total,
  weakLessonIds,
  saveError,
  onRetry,
}: CheckpointResultProps) {
  return (
    <View className="flex-1 justify-center gap-7 px-6">
      <View className="items-center">
        <View
          className={`size-20 items-center justify-center rounded-full ${
            passed ? "bg-success/15" : "bg-red-500/10"
          }`}
        >
          <MaterialCommunityIcons
            name={passed ? "trophy" : "heart-broken"}
            size={40}
            color={passed ? "#22c55e" : "#ef4444"}
          />
        </View>

        <Text className="mt-4 text-xs uppercase tracking-widest text-muted">Ünite {unitIndex} testi</Text>
        <Text className={`mt-2 text-2xl font-bold ${passed ? "text-success" : "text-white"}`}>
          {passed ? "Tamamlandı" : "Canların bitti"}
        </Text>
        <Text className="mt-1 text-4xl font-bold text-white">
          {score}
          <Text className="text-xl text-muted">/{total}</Text>
        </Text>
        <Text className="mt-2 text-center text-muted">
          {passed
            ? "Bu ünite oturmuş — rozetin ders yolunda seni bekliyor."
            : "Sorun değil, yeni sorularla baştan deneyebilirsin."}
        </Text>
      </View>

      {weakLessonIds.length > 0 && (
        <View className="rounded-2xl bg-surface p-4">
          <Text className="mb-3 text-sm font-medium text-white">Tekrar etmeni önerdiğim dersler</Text>
          <View className="gap-2.5">
            {weakLessonIds.map((id) => (
              <Pressable key={id} onPress={() => router.replace(`/lesson/${id}`)}>
                <Text className="text-sm text-primary">→ {readable(id)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {saveError && <Text className="text-center text-xs text-muted">Sonuç kaydedilemedi, ama testi tamamladın.</Text>}

      <View className="gap-2.5">
        {/* Sunucu her derlemede farklı örneklem veriyor — gerçekten yeni sorular */}
        <Button title="Yeni sorularla tekrar dene" variant="outline" onPress={onRetry} />
        <Button title="Derslere dön" onPress={() => router.replace("/lessons")} />
      </View>
    </View>
  );
}
