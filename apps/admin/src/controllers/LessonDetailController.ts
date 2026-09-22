import { toast } from "sonner";
import { errorCode } from "@/api";
import { LessonsController } from "@/controllers/LessonsController";
import { formatCore, parseDraft } from "@/lib/coreDraft";
import { errorLabel } from "@/lib/labels";
import { AdminLessonsService } from "@/services/AdminLessonsService";
import { useLessonDetailStore, type DetailBusy } from "@/stores/useLessonDetailStore";
import axios from "axios";
import type { LintReport } from "@glotmate/contracts";

/**
 * Ders detayı akışı: Screen → LessonDetailController → AdminLessonsService → store.
 * Her mutasyon detail döner → store'a yazılır → matris de tazelenir (liste ile
 * detay birbirine yalan söylemesin). Sonuç bildirimi (toast) TEK yerde, burada.
 */
export class LessonDetailController {
  static async load(id: string): Promise<void> {
    const store = useLessonDetailStore.getState();
    if (store.detail?.lesson.id !== id) store.clear();
    store.setLoading(true);
    try {
      const detail = await AdminLessonsService.fetchDetail(id);
      store.setDetail(detail);
      // Taslak yalnız başka dersten geliyorsa yeniden kurulur — operatörün yazdığı kaybolmaz
      if (store.draftLessonId !== id) store.setDraft(detail.core?.core ? formatCore(detail.core.core) : "", id);
    } catch (err) {
      store.setError(errorCode(err));
    } finally {
      store.setLoading(false);
    }
  }

  /** Ortak mutasyon zarfı: busy kilidi → servis → detail + matris → toast */
  private static async mutate(busy: DetailBusy, run: () => Promise<Awaited<ReturnType<typeof AdminLessonsService.fetchDetail>>>, okMessage: string): Promise<boolean> {
    const store = useLessonDetailStore.getState();
    if (store.busy) return false;
    store.setBusy(busy);
    try {
      const detail = await run();
      store.setDetail(detail);
      toast.success(okMessage);
      void LessonsController.load();
      return true;
    } catch (err) {
      const code = errorCode(err);
      const report = LessonDetailController.reportOf(err);
      if (report) store.setLintReport(report);
      toast.error(errorLabel(code));
      return false;
    } finally {
      store.setBusy(null);
    }
  }

  /** 422/502 gövdesindeki `report`u çıkarır — editör hataları satır satır gösterir */
  private static reportOf(err: unknown): LintReport | null {
    if (!axios.isAxiosError(err)) return null;
    const data = err.response?.data as { report?: LintReport } | undefined;
    return data?.report ?? null;
  }

  static regenerateCore(id: string) {
    return this.mutate("core", () => AdminLessonsService.regenerateCore(id), "Core regenerated — review and publish.");
  }

  static regenerateScenes(id: string) {
    return this.mutate("scenes", () => AdminLessonsService.regenerateScenes(id), "Scene set regenerated.");
  }

  static generateLocale(id: string, language: string, force: boolean) {
    return this.mutate(`locale:${language}`, () => AdminLessonsService.generateLocale(id, language, force), `${language.toUpperCase()} language pack ready.`);
  }

  static publish(id: string) {
    return this.mutate("publish", () => AdminLessonsService.publish(id), "Lesson published.");
  }

  // --- Çekirdek editörü ---------------------------------------------------------

  static setDraft(text: string): void {
    const store = useLessonDetailStore.getState();
    store.setDraft(text, store.draftLessonId);
    if (store.lintReport) store.setLintReport(null);
  }

  static resetDraft(): void {
    const store = useLessonDetailStore.getState();
    const core = store.detail?.core?.core;
    store.setDraft(core ? formatCore(core) : "", store.detail?.lesson.id ?? null);
    store.setLintReport(null);
  }

  static formatDraft(): void {
    const store = useLessonDetailStore.getState();
    const parsed = parseDraft(store.draft);
    if (parsed.ok) store.setDraft(formatCore(parsed.core), store.draftLessonId);
  }

  /** Sunucu lint'i (kuru koşu). İstemci şema kapısından geçmeyen taslak gönderilmez. */
  static async lintDraft(id: string): Promise<void> {
    const store = useLessonDetailStore.getState();
    const parsed = parseDraft(store.draft);
    if (!parsed.ok || store.busy) return;
    store.setBusy("lint");
    try {
      const { report } = await AdminLessonsService.lintCore(id, parsed.core);
      store.setLintReport(report);
      toast.success(report.warnings.length ? `Lint passed with ${report.warnings.length} warning(s).` : "Lint passed.");
    } catch (err) {
      const report = this.reportOf(err);
      store.setLintReport(report ?? { errors: [errorLabel(errorCode(err))], warnings: [] });
    } finally {
      store.setBusy(null);
    }
  }

  static async saveDraft(id: string): Promise<void> {
    const store = useLessonDetailStore.getState();
    const parsed = parseDraft(store.draft);
    if (!parsed.ok) return;
    const ok = await this.mutate("save", () => AdminLessonsService.saveCore(id, parsed.core), "Core saved (ready) — remember to publish.");
    if (ok) {
      const fresh = useLessonDetailStore.getState();
      // Sunucu mustUse'u katalogdan dayattı; taslak saklanan hâle eşitlenir
      if (fresh.detail?.core?.core) fresh.setDraft(formatCore(fresh.detail.core.core), id);
      fresh.setLintReport(fresh.detail?.core?.report ?? null);
    }
  }
}
