"use client";

import type { AdminRoleplayRevision } from "@glotmate/contracts";
import { Eye } from "lucide-react";
import { SpecJsonView } from "@/components/shared/roleplay/SpecJsonView";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { REVISION_STATUS_LABEL, formatDateTime } from "@/lib/labels";

/** Revizyonun spec'i, salt okunur — yayınlı/emekli revizyon DEĞİŞMEZ; düzenlemek için taslağa kopyalanır */
export function RevisionViewDialog({ revision: r }: { revision: AdminRoleplayRevision }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="xs">
            <Eye data-icon="inline-start" />
            View
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Revision r{r.revision} · {REVISION_STATUS_LABEL[r.status]}
          </DialogTitle>
          <DialogDescription>
            {r.spec.title} · hash <span className="font-mono">{r.specHash}</span> · updated {formatDateTime(r.updatedAt)}. Read-only —
            use “Duplicate as draft” to edit it.
          </DialogDescription>
        </DialogHeader>
        <SpecJsonView value={r.spec} className="max-h-[60vh]" />
      </DialogContent>
    </Dialog>
  );
}
