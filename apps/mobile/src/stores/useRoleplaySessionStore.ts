import { create } from "zustand";
import { DEFAULT_AVATAR_ID, type RichText, type RoleplayDebriefView, type RoleplaySessionOpen } from "@glotmate/contracts";

export interface RoleplayMessage {
  id: string;
  role: "teacher" | "user";
  text: string;
  runs?: RichText;
}

export type RoleplayPhase = "idle" | "opening" | "playing" | "ending" | "debrief";

/**
 * Rol yapma OTURUMU — ders store'unun sade kardeşi. Rol yapmada beat makinesi
 * yok: persona yalnız öğrencinin sözüne cevap verir, bitiren YALNIZ "Bitir"
 * butonudur (roleplay sözleşmesi md. 6). Yalnız RoleplaySessionController yazar.
 */
interface RoleplaySessionState {
  slug: string | null;
  session: RoleplaySessionOpen | null;
  avatarId: string;
  phase: RoleplayPhase;
  messages: RoleplayMessage[];
  /** Hedef kimliği → tamamlandı mı (canlı liste) */
  done: Record<string, boolean>;
  /** Son turda yeni tiklenen hedef — çip kutlama animasyonu için */
  lastHit: string | null;
  debrief: RoleplayDebriefView | null;
  error: string | null;
  /** Kısa sistem uyarısı (NoticeBar) — STT/sohbet/ses aksadığında; eskiden sessizdi */
  notice: string | null;

  speaking: boolean;
  recording: boolean;
  /** Persona düşünüyor — girdinin TEK kilit sebebi (ders kuralıyla aynı) */
  busy: boolean;
  /** Yeni persona balonundan sonraki kısa kilit (500 ms) */
  grace: boolean;
  /** Cevap bekleniyor (persona sustu) */
  awaiting: boolean;
  /** Ekrandan çıkıldı — yürüyen zincir artık hiçbir şey yazmaz */
  stopped: boolean;

  set: (p: Partial<Omit<RoleplaySessionState, "set" | "push" | "reset">>) => void;
  push: (m: RoleplayMessage) => void;
  reset: () => void;
}

const initial = {
  slug: null,
  session: null,
  avatarId: DEFAULT_AVATAR_ID,
  phase: "idle" as RoleplayPhase,
  messages: [] as RoleplayMessage[],
  done: {} as Record<string, boolean>,
  lastHit: null as string | null,
  debrief: null,
  error: null,
  notice: null as string | null,
  speaking: false,
  recording: false,
  busy: false,
  grace: false,
  awaiting: false,
  stopped: false,
};

export const useRoleplaySessionStore = create<RoleplaySessionState>((set) => ({
  ...initial,
  set: (p) => set(p),
  push: (m) => set((s) => ({ messages: [...s.messages, m] })),
  reset: () => set(initial),
}));
