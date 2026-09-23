"use client";

import type { AvatarId } from "@glotmate/contracts";
import { Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { formatDateTime } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Aktif avatar seçimi — TtsActiveProviderCard'ın aynası. Liste koddaki avatar
 * kaydından gelir (yeni avatar = GLB + web profili + contracts listesi);
 * panel yalnız aktif olanı seçer.
 */
export function AvatarActiveCard() {
  const data = useSettingsStore((s) => s.avatarData);
  const draft = useSettingsStore((s) => s.avatarDraft);
  const saving = useSettingsStore((s) => s.avatarSaving);
  if (!data || !draft) return null;

  const dirty = draft.activeId !== data.settings.activeId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor avatar</CardTitle>
        <CardDescription>
          Which 3D character students see in lessons. Applies to newly opened lessons on web and mobile; open
          lessons are not interrupted.
          {data.updatedAt ? ` Last saved ${formatDateTime(data.updatedAt)}.` : " Not saved yet — using the default (Fat Man)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="avatar-active">Active avatar</Label>
          <Select
            value={draft.activeId}
            onValueChange={(v) => SettingsController.setAvatar(v as AvatarId)}
            items={data.avatars.map((a) => ({ value: a.id, label: a.label }))}
          >
            <SelectTrigger id="avatar-active" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.avatars.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => SettingsController.resetAvatarDraft()}
            disabled={!dirty || saving}
          >
            <Undo2 data-icon="inline-start" />
            Undo
          </Button>
          <Button size="sm" onClick={() => void SettingsController.saveAvatar()} disabled={!dirty || saving}>
            <Save data-icon="inline-start" className={saving ? "animate-pulse" : undefined} />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
