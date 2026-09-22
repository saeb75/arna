import type { AdminLesson } from "@glotmate/contracts";
import { toast } from "sonner";
import { errorCode } from "@/api";
import { LessonsController } from "@/controllers/LessonsController";
import { missingLocales } from "@/lib/lessonFilters";
import { AdminLessonsService } from "@/services/AdminLessonsService";
import { useLocaleWarmStore } from "@/stores/useLocaleWarmStore";

/** Aynı anda kaç paket — sunucu limiti 30/dk/kullanıcı; paket ~10–20 sn → 2 güvenli */
const CONCURRENCY = 2;

/**
 * Toplu dil paketi ısıtması — `warm-locales.ts`'in panel karşılığı, İSTEMCİDE
 * orkestre edilir: sunucuda kuyruk yok, tek ders ucu N kez çağrılır. İlerleme ve
 * iptal store'da; sayfa kapanırsa süren iş biter, kalanı bir sonraki koşuda
 * (eksik/bayat hesabı yeniden yapıldığı için) kaldığı yerden devam eder.
 */
export class LocaleWarmController {
  static async start(level: string, lessons: AdminLesson[], languages: string[]): Promise<void> {
    const store = useLocaleWarmStore.getState();
    if (store.running) return;

    const targets = missingLocales(lessons, languages);
    if (targets.length === 0) {
      toast.info("No missing or stale packs at this level.");
      return;
    }
    store.start({ level, languages, total: targets.length });

    const queue = [...targets];
    const worker = async () => {
      for (;;) {
        if (useLocaleWarmStore.getState().cancelRequested) return;
        const t = queue.shift();
        if (!t) return;
        try {
          await AdminLessonsService.generateLocale(t.lessonId, t.language, t.force);
          useLocaleWarmStore.getState().tick();
        } catch (err) {
          useLocaleWarmStore.getState().tick({ lessonId: t.lessonId, language: t.language, code: errorCode(err) });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));

    const s = useLocaleWarmStore.getState();
    s.finish();
    if (s.cancelRequested) toast.info(`Warm-up stopped: ${s.done}/${s.total}.`);
    else if (s.failures.length) toast.warning(`Warm-up finished: ${s.failures.length} packs failed.`);
    else toast.success(`Warm-up finished: ${s.total} packs ready.`);
    void LessonsController.load();
  }

  static cancel(): void {
    useLocaleWarmStore.getState().requestCancel();
  }

  static dismiss(): void {
    useLocaleWarmStore.getState().reset();
  }
}
