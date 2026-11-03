"use client";

import { AVATAR_LABELS, AVATAR_SYSTEM_LABELS, AVATAR_SYSTEMS, DEFAULT_AVATAR_ID, type AvatarId, type AvatarSystem } from "@glotmate/contracts";
import { Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsController } from "@/controllers/SettingsController";
import { formatDateTime } from "@/lib/labels";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Aktif avatar seçimi — TtsActiveProviderCard'ın aynası. Önce çizim SİSTEMİ
 * (3D / 2.5D), sonra o sistemin avatarı seçilir; kaydedilen tek değer avatar
 * kimliğidir, sistem ondan türer (contracts AVATAR_SYSTEM_OF). Liste koddaki
 * avatar kaydından gelir; panel yalnız aktif olanı seçer.
 */
export function AvatarActiveCard() {
  const data = useSettingsStore((s) => s.avatarData);
  const draft = useSettingsStore((s) => s.avatarDraft);
  const saving = useSettingsStore((s) => s.avatarSaving);
  if (!data || !draft) return null;

  const dirty = draft.activeId !== data.settings.activeId;
  const systemOf = (id: AvatarId) => data.avatars.find((a) => a.id === id)?.system ?? "3d";
  const system = systemOf(draft.activeId);
  const choices = data.avatars.filter((a) => a.system === system);

  // Sistem değişince: kayıtlı avatar o sistemdeyse ona, değilse sistemin ilk avatarına geç
  const pickSystem = (next: AvatarSystem) => {
    if (next === system) return;
    const saved = data.settings.activeId;
    const target = systemOf(saved) === next ? saved : data.avatars.find((a) => a.system === next)?.id;
    if (target) SettingsController.setAvatar(target);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutor avatar</CardTitle>
        <CardDescription>
          Which rendering system and character students see in lessons and roleplays. Applies to newly opened
          sessions on web and mobile; open sessions are not interrupted.
          {data.updatedAt
            ? ` Last saved ${formatDateTime(data.updatedAt)}.`
            : ` Not saved yet — using the default (${AVATAR_LABELS[DEFAULT_AVATAR_ID]}, ${AVATAR_SYSTEM_LABELS[systemOf(DEFAULT_AVATAR_ID)]}).`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="avatar-system">Rendering system</Label>
          <Select
            value={system}
            onValueChange={(v) => pickSystem(v as AvatarSystem)}
            items={AVATAR_SYSTEMS.map((s) => ({ value: s, label: AVATAR_SYSTEM_LABELS[s] }))}
          >
            <SelectTrigger id="avatar-system" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVATAR_SYSTEMS.map((s) => (
                <SelectItem key={s} value={s} disabled={!data.avatars.some((a) => a.system === s)}>
                  {AVATAR_SYSTEM_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="avatar-active">Avatar</Label>
          <Select
            value={draft.activeId}
            onValueChange={(v) => SettingsController.setAvatar(v as AvatarId)}
            items={choices.map((a) => ({ value: a.id, label: a.label }))}
          >
            <SelectTrigger id="avatar-active" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {choices.map((a) => (
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
