import { create } from "zustand";
import type { PublicTutor } from "@glotmate/contracts";

/**
 * Seçilebilir öğretmenler (GET /v1/tutors) + ses örneği durumu. Yalnız
 * TutorController yazar. `tutors === null` → henüz yüklenmedi; boş liste →
 * öğretmen kaydı yok (seçici hiçbir yerde görünmez, eski davranış).
 */
interface TutorsState {
  /** Yalnız bu derlemede portresi olanlar (domain/tutors `pickableTutors`) */
  tutors: PublicTutor[] | null;
  /** Ön seçili öğretmen — sunucunun varsayılanı, portresi yoksa listenin ilki */
  defaultId: string | null;
  error: string | null;
  /** Ses örneği istenen/çalan öğretmen — kartta dalga ikonu */
  sampling: string | null;
  set: (p: Partial<Omit<TutorsState, "set">>) => void;
}

export const useTutorsStore = create<TutorsState>((set) => ({
  tutors: null,
  defaultId: null,
  error: null,
  sampling: null,
  set: (p) => set(p),
}));
