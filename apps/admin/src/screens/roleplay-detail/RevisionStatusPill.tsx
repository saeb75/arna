import { StatusPill } from "@/components/shared/StatusPill";
import { REVISION_STATUS_LABEL } from "@/lib/labels";

/** Revizyon durumu: yayında = tek vurgu; taslak = kesik çerçeveli gri (açık iş); emekli = sönük */
export function RevisionStatusPill({ status }: { status: "draft" | "published" | "retired" }) {
  if (status === "published") return <StatusPill tone="accent">{REVISION_STATUS_LABEL.published}</StatusPill>;
  if (status === "draft") return <StatusPill tone="neutral" dashed>{REVISION_STATUS_LABEL.draft}</StatusPill>;
  return <StatusPill tone="muted">{REVISION_STATUS_LABEL.retired}</StatusPill>;
}
