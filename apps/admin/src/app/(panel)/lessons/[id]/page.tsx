"use client";

import { useParams } from "next/navigation";
import { LessonDetailScreen } from "@/screens/lesson-detail/LessonDetailScreen";

export default function LessonDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <LessonDetailScreen lessonId={id} />;
}
