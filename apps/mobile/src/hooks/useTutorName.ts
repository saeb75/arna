import { FALLBACK_TUTOR_NAME } from "../domain/tutors";
import { useMeStore } from "../stores/useMeStore";
import { useOnboardingStore } from "../stores/useOnboardingStore";
import { useTutorsStore } from "../stores/useTutorsStore";

/**
 * Öğrencinin öğretmeninin adı — sunucunun çözdüğü `/me.tutor` (seçim gizlenmişse
 * varsayılan). Öğretmen kaydı hiç yoksa (null) eski ad.
 */
export function useTutorName(): string {
  return useMeStore((s) => s.me?.tutor?.name) ?? FALLBACK_TUTOR_NAME;
}

/**
 * Onboarding'de: profil henüz yazılmadı — taslakta seçilen öğretmen, yoksa
 * listenin varsayılanı, o da yoksa /me'nin çözdüğü öğretmen.
 */
export function useDraftTutorName(): string {
  const draftId = useOnboardingStore((s) => s.tutorId);
  const tutors = useTutorsStore((s) => s.tutors);
  const defaultId = useTutorsStore((s) => s.defaultId);
  const fromMe = useTutorName();
  const pick = tutors?.find((t) => t.id === draftId) ?? tutors?.find((t) => t.id === defaultId);
  return pick?.name ?? fromMe;
}
