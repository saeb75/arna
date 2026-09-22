import { errorCode } from "@/api";
import { AdminUsersService } from "@/services/AdminUsersService";
import { useUsersStore } from "@/stores/useUsersStore";

/** Kullanıcı listesi: Screen → UsersController → AdminUsersService → useUsersStore. */
export class UsersController {
  static async load(): Promise<void> {
    const store = useUsersStore.getState();
    store.setLoading(true);
    try {
      store.setData(await AdminUsersService.fetchList());
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}
