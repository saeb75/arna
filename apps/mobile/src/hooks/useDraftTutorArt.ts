import { DEFAULT_AVATAR_ID } from "@glotmate/contracts";
import { tutorHero } from "../domain/tutorHero";
import { tutorPortrait } from "../domain/tutors";
import { useMeStore } from "../stores/useMeStore";
import { useOnboardingStore } from "../stores/useOnboardingStore";
import { useTutorsStore } from "../stores/useTutorsStore";

/**
 * Onboarding'de öğretmenin görseli (`TutorFigure` girdisi): taslakta seçilen öğretmen, yoksa
 * listenin varsayılanı, o da yoksa /me'nin çözdüğü ya da genel varsayılan avatar. Tanıtım
 * sayfalarında seçim henüz yapılmadığı için varsayılan öğretmen görünür.
 */
export function useDraftTutorArt(): { hero: number | null; portrait: number | null } {
  const draftId = useOnboardingStore((s) => s.tutorId);
  const tutors = useTutorsStore((s) => s.tutors);
  const defaultId = useTutorsStore((s) => s.defaultId);
  const meAvatar = useMeStore((s) => s.me?.tutor?.avatarId);
  const pick = tutors?.find((t) => t.id === draftId) ?? tutors?.find((t) => t.id === defaultId);
  const avatarId = pick?.avatarId ?? meAvatar ?? DEFAULT_AVATAR_ID;
  return { hero: tutorHero(avatarId), portrait: tutorPortrait(avatarId) };
}
