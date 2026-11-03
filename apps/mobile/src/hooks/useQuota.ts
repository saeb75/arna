import { quotaRemaining } from "@glotmate/contracts";
import { useMeStore } from "../stores/useMeStore";
import { usePro } from "./usePro";

/** Ücretsiz kullanıcının bugünkü kalan hakları; Pro'da null (gösterge çizilmez). */
export function useQuota(): { lessons: number; roleplays: number } | null {
  const pro = usePro();
  const quota = useMeStore((s) => s.me?.quota);
  if (pro || !quota) return null;
  return {
    lessons: quotaRemaining(quota.lesson) ?? 0,
    roleplays: quotaRemaining(quota.roleplay) ?? 0,
  };
}
