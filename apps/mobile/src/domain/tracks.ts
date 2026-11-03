import { Briefcase, GraduationCap, MessageCircle, Plane, Target, type LucideIcon } from "lucide-react-native";
import type { Track } from "@glotmate/contracts";

/** Konuşma bağlamı → ikon (etiket tr.tracks'ten). Track = sahne dekoru, "öğrenme yolu" DEĞİL. */
export const TRACK_ICON: Record<Track, LucideIcon> = {
  everyday: MessageCircle,
  work: Briefcase,
  travel: Plane,
  academic: GraduationCap,
  exam: Target,
};
