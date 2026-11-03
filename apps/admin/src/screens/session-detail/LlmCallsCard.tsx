"use client";

import type { AdminLlmCall } from "@glotmate/contracts";
import { useMemo } from "react";
import { TablePagination } from "@/components/shared/TablePagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateTime, formatMs, formatUsd } from "@/lib/labels";
import { paginate } from "@/lib/paginate";
import { useSessionDetailStore } from "@/stores/useSessionDetailStore";

/**
 * Oturumun LLM çağrıları — amaç, model, token, gecikme, maliyet; çağrı sırasıyla
 * (kronolojik). İstemci sayfalı; en yavaş çağrı (≥3 sn) kalın. Yavaş/pahalı turu burada yakalarsın.
 */
export function LlmCallsCard({ calls }: { calls: AdminLlmCall[] }) {
  const paging = useSessionDetailStore((s) => s.callsPaging);
  const setPaging = useSessionDetailStore((s) => s.setCallsPaging);
  const ordered = useMemo(() => [...calls].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id), [calls]);
  const paged = useMemo(() => paginate(ordered, paging.page, paging.pageSize), [ordered, paging]);
  const totalUsd = calls.reduce((a, c) => a + c.costUsd, 0);
  const maxLatency = Math.max(0, ...calls.map((c) => c.latencyMs ?? 0));

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">LLM calls</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {calls.length} · {formatUsd(totalUsd)}
        </span>
      </div>
      {calls.length === 0 ? (
        <p className="text-xs text-muted-foreground">No LLM calls logged for this session.</p>
      ) : (
        <>
          <table className="w-full text-[11px]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-1 text-left font-medium">Purpose</th>
                <th className="pb-1 text-right font-medium">Tokens</th>
                <th className="pb-1 text-right font-medium">Latency</th>
                <th className="pb-1 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-1">
                    <Tooltip>
                      <TooltipTrigger className="text-left font-mono">{c.purpose}</TooltipTrigger>
                      <TooltipContent>
                        {c.model}
                        {c.promptVersion ? ` · ${c.promptVersion}` : ""} · {formatDateTime(c.createdAt)}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="py-1 text-right tabular-nums text-muted-foreground">
                    {c.inputTokens ?? "—"}/{c.outputTokens ?? "—"}
                  </td>
                  <td
                    className={
                      "py-1 text-right tabular-nums" +
                      (c.latencyMs !== null && c.latencyMs === maxLatency && maxLatency >= 3000 ? " font-medium" : "")
                    }
                  >
                    {c.latencyMs !== null ? formatMs(c.latencyMs) : "—"}
                  </td>
                  <td className="py-1 text-right tabular-nums">{formatUsd(c.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            paged={paged}
            onPage={(page) => setPaging({ page })}
            onPageSize={(pageSize) => setPaging({ pageSize })}
            noun="calls"
          />
        </>
      )}
    </section>
  );
}
