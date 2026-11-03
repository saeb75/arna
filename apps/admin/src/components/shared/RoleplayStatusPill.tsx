import type { AdminRoleplayRow } from "@glotmate/contracts";
import { StatusPill } from "@/components/shared/StatusPill";

/**
 * Senaryonun öğrenciye görünürlüğü — liste ve detay başlığı aynı dili konuşur:
 *   Live = keşifte + yayınlı revizyon var (tek vurgu) · Unpublished = keşifte ama
 *   yayın yok (gri) · Retired = keşiften çekilmiş (sönük).
 */
export function RoleplayStatusPill({ row }: { row: Pick<AdminRoleplayRow, "status" | "publishedRevision"> }) {
  if (row.status === "retired") return <StatusPill tone="muted">Retired</StatusPill>;
  if (row.publishedRevision === null) return <StatusPill tone="neutral">Unpublished</StatusPill>;
  return <StatusPill tone="accent">Live</StatusPill>;
}
