import { DEFAULT_AVATAR_ID, type PublicTutor } from "@glotmate/contracts";
import { SPRITE_ASSETS } from "./spriteAssets";

/**
 * Öğretmen görünümü — saf yardımcılar.
 *
 * Öğretmen kaydı sunucuda (admin panel) yaşar ama YÜZÜ bu derlemeye paketlenmiş 2.5D
 * rig görselleridir. Uygulamadan yeni bir rig'e bağlanmış öğretmenin portresi yoksa
 * seçtirilmez (boş kart göstermek yerine).
 */

/** Hiç öğretmen kaydı yokken (eski davranış) ve /me gelmeden önce görünen ad */
export const FALLBACK_TUTOR_NAME = "Emma";

/** Seçim kartındaki portre (paketlenmiş görsel) — yoksa null */
export function tutorPortrait(avatarId: string): number | null {
  return SPRITE_ASSETS[avatarId as keyof typeof SPRITE_ASSETS]?.base ?? null;
}

/** Bu derlemede yüzü olan öğretmenler */
export function pickableTutors(tutors: PublicTutor[]): PublicTutor[] {
  return tutors.filter((t) => tutorPortrait(t.avatarId) !== null);
}

/**
 * GET /v1/avatar cevabından sahnenin yüzü + adı (`{ activeId, tutorName }` — kullanıcının
 * öğretmeni, sunucu çözer). İstek düşerse /me'deki öğretmen, o da yoksa eski varsayılanlar.
 */
export function tutorOfAvatarResponse(data: unknown, meTutor: PublicTutor | null | undefined): { avatarId: string; tutorName: string } {
  const d = (data ?? {}) as { activeId?: unknown; tutorName?: unknown };
  return {
    avatarId: typeof d.activeId === "string" ? d.activeId : (meTutor?.avatarId ?? DEFAULT_AVATAR_ID),
    tutorName: typeof d.tutorName === "string" && d.tutorName ? d.tutorName : (meTutor?.name ?? FALLBACK_TUTOR_NAME),
  };
}
