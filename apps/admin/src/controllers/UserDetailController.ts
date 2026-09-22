import { errorCode } from "@/api";
import { AdminUsersService } from "@/services/AdminUsersService";
import { useUserDetailStore } from "@/stores/useUserDetailStore";

/** Kullanıcı detayı: Screen → UserDetailController → AdminUsersService → useUserDetailStore. */
export class UserDetailController {
  static async load(id: string): Promise<void> {
    const store = useUserDetailStore.getState();
    if (store.detail?.user.id !== id) store.clear();
    store.setLoading(true);
    try {
      store.setDetail(await AdminUsersService.fetchDetail(id));
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }
}
