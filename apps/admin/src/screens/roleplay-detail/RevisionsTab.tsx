"use client";

import type { AdminRoleplayDetail } from "@glotmate/contracts";
import { Copy, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RoleplayDetailController } from "@/controllers/RoleplayDetailController";
import { formatDateTime, formatRelative } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useRoleplayDetailStore, type RoleplayBusy } from "@/stores/useRoleplayDetailStore";
import { RevisionStatusPill } from "@/screens/roleplay-detail/RevisionStatusPill";
import { RevisionViewDialog } from "@/screens/roleplay-detail/RevisionViewDialog";

/**
 * Revizyon geçmişi, yeniden eskiye. Yayınlı revizyon değişmez; eski bir revizyona
 * dönmek = onu taslağa kopyalamak (açık taslak varken sunucu reddeder — buton da kapalı).
 */
export function RevisionsTab({
  detail,
  busy,
  editorDirty,
}: {
  detail: AdminRoleplayDetail;
  busy: RoleplayBusy | null;
  editorDirty: boolean;
}) {
  const paging = useRoleplayDetailStore((s) => s.paging.revisions);
  const setPaging = useRoleplayDetailStore((s) => s.setPaging);
  const sorted = useMemo(() => [...detail.revisions].sort((a, b) => b.revision - a.revision), [detail.revisions]);
  const paged = useMemo(() => paginate(sorted, paging.page, paging.pageSize), [sorted, paging]);
  const id = detail.roleplay.id;

  if (sorted.length === 0) return <EmptyState title="No revisions" hint="Save the editor to create the first draft." />;

  const duplicateBlock = detail.draft
    ? `Draft r${detail.draft.revision} is already open — publish or discard it first`
    : editorDirty
      ? "Save or reset the editor changes first"
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 pl-4">Revision</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-36">Hash</TableHead>
              <TableHead className="w-32">Created</TableHead>
              <TableHead className="w-32">Updated</TableHead>
              <TableHead className="w-56 pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-4 font-mono text-xs font-medium">r{r.revision}</TableCell>
                <TableCell>
                  <RevisionStatusPill status={r.status} />
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs">
                  {r.spec.title}
                  <span className="text-muted-foreground"> · {r.spec.objectives.length} objectives</span>
                </TableCell>
                <TableCell className="font-mono text-[11px] text-muted-foreground">{r.specHash}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <span title={formatDateTime(r.createdAt)}>{formatRelative(r.createdAt)}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <span title={formatDateTime(r.updatedAt)}>{formatRelative(r.updatedAt)}</span>
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <RevisionViewDialog revision={r} />
                    {r.status !== "draft" && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span>
                              <Button
                                variant="outline"
                                size="xs"
                                disabled={!!duplicateBlock || busy !== null}
                                onClick={() => void RoleplayDetailController.duplicate(id, r.id)}
                              >
                                {busy === "duplicate" ? (
                                  <Loader2 className="animate-spin" data-icon="inline-start" />
                                ) : (
                                  <Copy data-icon="inline-start" />
                                )}
                                Duplicate as draft
                              </Button>
                            </span>
                          }
                        />
                        <TooltipContent>{duplicateBlock ?? `Copy r${r.revision} into a new draft and open the editor`}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        paged={paged}
        onPage={(page) => setPaging("revisions", { page })}
        onPageSize={(pageSize) => setPaging("revisions", { pageSize })}
        noun="revisions"
      />
    </div>
  );
}
