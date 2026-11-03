import { errorCode } from "@/api";
import { AdminRoleplaysService } from "@/services/AdminRoleplaysService";
import { useRoleplaysStore } from "@/stores/useRoleplaysStore";

/** Roleplay listesi: Screen → RoleplaysController → AdminRoleplaysService → useRoleplaysStore. */
export class RoleplaysController {
  static async load(): Promise<void> {
    const store = useRoleplaysStore.getState();
    store.setLoading(true);
    try {
      store.setData(await AdminRoleplaysService.fetchList());
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}
