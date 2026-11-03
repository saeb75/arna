import {
  curriculumResponseSchema,
  meResponseSchema,
  meStatsSchema,
  type ProfilePatch,
} from "@glotmate/contracts";
import { api, errorCode } from "../api";
import { deviceTimezone } from "../domain/language";
import { tr } from "../i18n/tr";
import { useCurriculumStore } from "../stores/useCurriculumStore";
import { useMeStore } from "../stores/useMeStore";
import { ToastController } from "./ToastController";

/**
 * Öğrencinin kendi hesabı — GET/PATCH /v1/me*. Kapı (`/`) `me.profile`'a
 * bakar: null → onboarding. Seviye/track değişimi müfredatı da döndürür;
 * yol aynı cevaptan yeniden kurulur (ilerleme kaybolmaz — katalog kimliğine bağlı).
 */
export class MeController {
  /** GET /v1/me — doğrular, store'a yazar. Dönüş: başarılı mı (açılış zinciri için). */
  static async load(): Promise<boolean> {
    const store = useMeStore.getState();
    store.set({ loading: true, error: null });
    try {
      const res = await api.get("/v1/me");
      store.set({ me: meResponseSchema.parse(res.data) });
      return true;
    } catch (err) {
      store.set({ error: errorCode(err) });
      return false;
    } finally {
      store.set({ loading: false });
    }
  }

  /** GET /v1/me/stats — seri, bugünkü dakika, son 7 gün */
  static async loadStats(): Promise<void> {
    try {
      const res = await api.get("/v1/me/stats", { params: { tz: deviceTimezone() } });
      useMeStore.getState().set({ stats: meStatsSchema.parse(res.data) });
    } catch {
      // İstatistik bir süs — düşerse ekran sıfırlarla devam eder
    }
  }

  /**
   * PATCH /v1/me/profile — profil alanı(ları) + müfredat tazelenir.
   * Dönüş: kaydedildi mi (sheet kapanışı buna bakar).
   */
  static async updateProfile(patch: ProfilePatch, opts: { quiet?: boolean } = {}): Promise<boolean> {
    const store = useMeStore.getState();
    store.set({ saving: true });
    try {
      const res = await api.patch("/v1/me/profile", patch);
      useCurriculumStore.getState().setCurriculum(curriculumResponseSchema.parse(res.data));
      const me = useMeStore.getState().me;
      if (me?.profile) {
        const { timezone, ...rest } = patch;
        store.set({
          me: {
            ...me,
            profile: {
              ...me.profile,
              ...rest,
              occupation: rest.occupation === undefined ? me.profile.occupation : rest.occupation,
              ...(timezone ? { timezone } : {}),
            },
          },
        });
      }
      if (!opts.quiet) ToastController.success(tr.settings.saved);
      return true;
    } catch {
      if (!opts.quiet) ToastController.error(tr.errors.generic);
      return false;
    } finally {
      store.set({ saving: false });
    }
  }

  /** Cihazın saat dilimi değiştiyse (seyahat) sessizce güncelle — kota ve seri doğru güne göre sayılsın */
  static async syncTimezone(): Promise<void> {
    const profile = useMeStore.getState().me?.profile;
    const tz = deviceTimezone();
    if (profile && profile.timezone !== tz) await this.updateProfile({ timezone: tz }, { quiet: true });
  }

  /** DELETE /v1/me — hesabı ve kişisel veriyi siler. Dönüş: başarılı mı. */
  static async deleteAccount(): Promise<boolean> {
    try {
      await api.delete("/v1/me");
      return true;
    } catch {
      ToastController.error(tr.errors.generic);
      return false;
    }
  }
}
