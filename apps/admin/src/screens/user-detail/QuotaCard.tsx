import type { AdminUserDetail } from "@glotmate/contracts";
import { RatioBar } from "@/components/shared/RatioBar";
import { formatDateTime, formatRelative } from "@/lib/labels";

const KINDS = [
  { key: "lesson", label: "Lessons" },
  { key: "roleplay", label: "Role-plays" },
] as const;

/**
 * Bugünkü ücretsiz kota (öğrencinin saat diliminde). Sayılan şey oturum değil, gün
 * içinde açılan FARKLI ders/senaryo — devam ve baştan başlama hak yakmaz. Pro = sınırsız.
 */
export function QuotaCard({ quota }: { quota: AdminUserDetail["quota"] }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Today&apos;s free quota</h2>
        <span className="text-xs text-muted-foreground" title={formatDateTime(quota.resetsAt)}>
          resets {formatRelative(quota.resetsAt)}
        </span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 text-sm">
        {KINDS.map(({ key, label }) => {
          const u = quota[key];
          return (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>
                {u.limit === null ? (
                  <span>
                    <span className="tabular-nums">{u.used}</span> used · <span className="text-muted-foreground">unlimited (Pro)</span>
                  </span>
                ) : (
                  <RatioBar ratio={u.limit > 0 ? u.used / u.limit : 1} label={`${u.used}/${u.limit}`} className="max-w-56" />
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="text-[11px] text-muted-foreground">
        Distinct lessons and scenarios opened today in the learner&apos;s time zone. Resuming or restarting does not use a slot.
      </p>
    </section>
  );
}
