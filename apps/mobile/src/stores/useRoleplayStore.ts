import { create } from "zustand";
import type { RoleplayBrief, RoleplayListItem } from "@glotmate/contracts";

/** Rol yapma kataloğu + brief önizlemeleri (oturum AÇMADAN). Yalnız RoleplayController yazar. */
interface RoleplayState {
  list: RoleplayListItem[] | null;
  loading: boolean;
  error: string | null;
  briefs: Record<string, RoleplayBrief>;
  briefError: string | null;
  set: (p: Partial<Omit<RoleplayState, "set" | "putBrief">>) => void;
  putBrief: (b: RoleplayBrief) => void;
}

export const useRoleplayStore = create<RoleplayState>((set) => ({
  list: null,
  loading: false,
  error: null,
  briefs: {},
  briefError: null,
  set: (p) => set(p),
  putBrief: (b) => set((s) => ({ briefs: { ...s.briefs, [b.slug]: b }, briefError: null })),
}));
