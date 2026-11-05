"use client";

import type { AdminUserDetail } from "@glotmate/contracts";
import { Loader2, ShieldOff } from "lucide-react";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { ProPill } from "@/components/shared/ProPill";
import { Button } from "@/components/ui/button";
import { UserDetailController } from "@/controllers/UserDetailController";
import { PRO_SOURCE_LABEL, formatDateTime, formatRelative } from "@/lib/labels";
import { GrantProDialog } from "@/screens/user-detail/GrantProDialog";

/**
 * Abonelik görünümü: Pro durumu + kaynağı, mağaza tarafı (RevenueCat) ve admin
 * tanıması ayrı satırlarda. İki kaynak birden varsa kaynak "store" görünür; admin
 * tanımasını geri almak mağaza aboneliğine dokunmaz.
 */
export function SubscriptionCard({
  userId,
  entitlement: e,
  busy,
}: {
  userId: string;
  entitlement: AdminUserDetail["entitlement"];
  busy: boolean;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Status", <ProPill key="s" isPro={e.isPro} source={e.source} />],
    ["Source", e.source ? PRO_SOURCE_LABEL[e.source] : "—"],
    ["Product", e.productId ? <span className="font-mono text-xs">{e.productId}</span> : "—"],
    ["Expires", e.isPro ? (e.expiresAt ? formatDateTime(e.expiresAt) : "No expiry") : "—"],
    ["Store subscription", e.rcActive ? "Active" : "Inactive"],
    ["Admin grant", e.adminGranted ? (e.adminGrantUntil ? `Until ${formatDateTime(e.adminGrantUntil)}` : "No expiry") : "None"],
    [
      "Last store check",
      e.checkedAt ? <span title={formatDateTime(e.checkedAt)}>{formatRelative(e.checkedAt)}</span> : "Never",
    ],
  ];

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-sm font-semibold">Subscription</h2>
        <div className="flex items-center gap-1.5">
          {e.adminGranted && (
            <ConfirmAction
              trigger={
                <Button variant="outline" size="sm" disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <ShieldOff data-icon="inline-start" />}
                  Revoke admin Pro
                </Button>
              }
              title="Revoke admin Pro?"
              description={
                e.rcActive
                  ? "The admin grant is removed. The learner keeps Pro through their active store subscription."
                  : "The admin grant is removed. Everything is currently free, so the learner keeps full access."
              }
              confirmLabel="Revoke"
              destructive
              onConfirm={() => void UserDetailController.revokePro(userId)}
            />
          )}
          <GrantProDialog userId={userId} label={e.adminGranted ? "Change grant" : "Grant Pro"} busy={busy} />
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
