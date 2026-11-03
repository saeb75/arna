import { roleplayBriefSchema, roleplayListResponseSchema } from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { useRoleplayStore } from "../stores/useRoleplayStore";

/**
 * Rol yapma kataloğu + brief ÖNİZLEMESİ. Brief oturum AÇMAZ (sunucu kuralı:
 * her bakışta oturum açılsaydı hiç oynanmamış denemeler doğardı) — oturumu
 * yalnız "Başla" açar (RoleplaySessionController.start).
 */
export class RoleplayController {
  /** GET /v1/roleplays — yayınlı senaryolar + kullanıcının son denemesi */
  static async loadList(): Promise<void> {
    const store = useRoleplayStore.getState();
    store.set({ loading: true, error: null });
    try {
      const res = await api.get("/v1/roleplays");
      store.set({ list: roleplayListResponseSchema.parse(res.data).roleplays });
    } catch (err) {
      store.set({ error: errorCode(err) });
    } finally {
      store.set({ loading: false });
    }
  }

  /** GET /v1/roleplays/:slug — oynanacak seviye + hedefler */
  static async loadBrief(slug: string): Promise<void> {
    try {
      const res = await api.get(`/v1/roleplays/${slug}`);
      useRoleplayStore.getState().putBrief(roleplayBriefSchema.parse(res.data));
    } catch (err) {
      useRoleplayStore.getState().set({ briefError: errorCode(err) });
    }
  }
}
