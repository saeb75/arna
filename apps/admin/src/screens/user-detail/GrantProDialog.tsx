"use client";

import { Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserDetailController } from "@/controllers/UserDetailController";
import { formatDate } from "@/lib/labels";

/** Bugünden sonraki ilk gün, YYYY-MM-DD (tarih kutusunun alt sınırı) */
function tomorrow(): string {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().slice(0, 10);
}

/**
 * Ücretsiz Pro tanıma: süresiz ya da seçilen günün sonuna kadar (UTC). Mağaza
 * aboneliğine dokunmaz. Form alanları yerel state (sunum); iş controller'da.
 */
export function GrantProDialog({ userId, label, busy }: { userId: string; label: string; busy: boolean }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"forever" | "until">("forever");
  const [date, setDate] = useState("");
  const min = tomorrow();
  const until = mode === "until" && date ? new Date(`${date}T23:59:59.000Z`).toISOString() : null;
  const valid = mode === "forever" || (!!date && date >= min);

  async function submit() {
    await UserDetailController.grantPro(userId, mode === "forever" ? null : until);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" disabled={busy}>
            <Crown data-icon="inline-start" />
            {label}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Pro</DialogTitle>
          <DialogDescription>
            A free Pro grant from the admin side. It does not touch store subscriptions and replaces any previous admin grant.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "forever" | "until")}>
            <TabsList>
              <TabsTrigger value="forever" className="px-3">No expiry</TabsTrigger>
              <TabsTrigger value="until" className="px-3">Until a date</TabsTrigger>
            </TabsList>
          </Tabs>
          {mode === "until" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pro-until" className="text-xs">Last day of Pro</Label>
              <Input id="pro-until" type="date" min={min} value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
              <p className="text-[11px] text-muted-foreground">
                {until ? `Pro ends at the end of ${formatDate(until)} (UTC).` : "Pick a future date."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!valid || busy}>
            {busy ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Crown data-icon="inline-start" />}
            Grant Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
