import type { AdminRoleplayDetail } from "@glotmate/contracts";
import { toast } from "sonner";
import { errorCode } from "@/api";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { RoleplaysController } from "@/controllers/RoleplaysController";
import { errorLabel } from "@/lib/labels";
import type { PageState } from "@/lib/paginate";
import { AdminRoleplaysService } from "@/services/AdminRoleplaysService";
import { useRoleplayDetailStore, type RoleplayBusy, type RoleplayTab } from "@/stores/useRoleplayDetailStore";

/** Durum çatışmasında (başka sekmede yayınlanmış/atılmış taslak) ekran tazelenir */
const STALE_CODES = new Set(["no_draft", "draft_exists", "exists", "not_found"]);

let attemptsSeq = 0;

/**
 * Senaryo detayı: Screen → RoleplayDetailController → AdminRoleplaysService → store.
 * Mutasyonların TAMAMI detay döner → store'a yazılır → liste de tazelenir (liste ile
 * detay birbirine yalan söylemez) → editör kayıtlı hâle eşitlenir. Toast yalnız burada.
 */
export class RoleplayDetailController {
  static async load(id: string): Promise<void> {
    RoleplayEditorController.clearCreated();
    const store = useRoleplayDetailStore.getState();
    if (store.detail?.roleplay.id !== id) store.clear();
    store.setLoading(true);
    try {
      const detail = await AdminRoleplaysService.fetchDetail(id);
      useRoleplayDetailStore.getState().setDetail(detail);
      RoleplayEditorController.syncWithDetail(detail);
    } catch (err) {
      useRoleplayDetailStore.getState().setError(errorCode(err));
    } finally {
      useRoleplayDetailStore.getState().setLoading(false);
    }
  }

  /** Editör kaydı/oluşturma da detay döner — store'a TEK giriş burası */
  static applyDetail(detail: AdminRoleplayDetail): void {
    useRoleplayDetailStore.getState().setDetail(detail);
    void RoleplaysController.load();
  }

  static setTab(tab: RoleplayTab): void {
    useRoleplayDetailStore.getState().setTab(tab);
  }

  /** Ortak mutasyon zarfı: busy kilidi → servis → detay + liste → editör → toast */
  private static async mutate(
    id: string,
    busy: RoleplayBusy,
    run: () => Promise<AdminRoleplayDetail>,
    okMessage: (d: AdminRoleplayDetail) => string,
    resyncEditor: boolean,
  ): Promise<boolean> {
    const store = useRoleplayDetailStore.getState();
    if (store.busy) return false;
    store.setBusy(busy);
    try {
      const detail = await run();
      this.applyDetail(detail);
      RoleplayEditorController.syncWithDetail(detail, { force: resyncEditor });
      toast.success(okMessage(detail));
      return true;
    } catch (err) {
      const code = errorCode(err);
      toast.error(errorLabel(code));
      if (STALE_CODES.has(code)) void this.load(id);
      return false;
    } finally {
      useRoleplayDetailStore.getState().setBusy(null);
    }
  }

  static publish(id: string) {
    return this.mutate(
      id,
      "publish",
      () => AdminRoleplaysService.publishDraft(id),
      (d) => `Revision r${d.roleplay.publishedRevision ?? "?"} is live — new sessions use it.`,
      true,
    );
  }

  static discard(id: string) {
    return this.mutate(id, "discard", () => AdminRoleplaysService.discardDraft(id), () => "Draft discarded.", true);
  }

  static setStatus(id: string, status: "active" | "retired") {
    return this.mutate(
      id,
      "status",
      () => AdminRoleplaysService.setStatus(id, status),
      () => (status === "retired" ? "Role-play retired — hidden from students." : "Role-play restored to discovery."),
      false,
    );
  }

  /** Eski revizyonu taslağa kopyalar ve Editör sekmesine geçer */
  static async duplicate(id: string, revisionId: string): Promise<void> {
    const ok = await this.mutate(
      id,
      "duplicate",
      () => AdminRoleplaysService.duplicateRevision(id, revisionId),
      (d) => `Copied into draft r${d.draft?.revision ?? "?"} — edit and publish.`,
      true,
    );
    if (ok) this.setTab("editor");
  }

  // --- Denemeler (sunucu sayfalı) -------------------------------------------------

  static async loadAttempts(id: string): Promise<void> {
    const store = useRoleplayDetailStore.getState();
    const seq = ++attemptsSeq;
    store.setAttemptsLoading(true);
    try {
      const data = await AdminRoleplaysService.fetchAttempts(id, store.attemptsQuery);
      if (seq !== attemptsSeq) return;
      useRoleplayDetailStore.getState().setAttempts(data);
    } catch (err) {
      if (seq === attemptsSeq) useRoleplayDetailStore.getState().setAttemptsError(errorCode(err));
    } finally {
      if (seq === attemptsSeq) useRoleplayDetailStore.getState().setAttemptsLoading(false);
    }
  }

  static setAttemptsQuery(id: string, patch: Partial<PageState>): void {
    useRoleplayDetailStore.getState().setAttemptsQuery(patch);
    void this.loadAttempts(id);
  }
}
