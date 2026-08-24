import { useLocalSearchParams } from "expo-router";
import { LessonScreen } from "../../screens/lesson/LessonScreen";

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonScreen catalogLessonId={id} />;
}
