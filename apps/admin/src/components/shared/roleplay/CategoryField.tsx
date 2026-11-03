"use client";

import { ROLEPLAY_CATEGORIES } from "@glotmate/contracts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleplayEditorController } from "@/controllers/RoleplayEditorController";
import { LIMITS } from "@/lib/roleplayDraft";
import { FormField } from "@/components/shared/roleplay/FormField";

const CUSTOM = "__custom__";
const KNOWN: readonly string[] = ROLEPLAY_CATEGORIES;
const ITEMS = [...ROLEPLAY_CATEGORIES.map((c) => ({ value: c, label: c })), { value: CUSTOM, label: "Custom…" }];

/**
 * Kategori: bilinen raflar listeden, gerisi serbest metin. "Custom" seçimi
 * değeri boşaltır — listede olmayan her değer serbest kutuda görünür (ek durum yok).
 */
export function CategoryField({ value, issues }: { value: string; issues?: string[] }) {
  const custom = !KNOWN.includes(value);
  return (
    <FormField
      label="Category"
      htmlFor="rp-category"
      issues={issues}
      count={custom ? { value: value.trim().length, max: LIMITS.category } : undefined}
      hint={custom ? "Unknown categories land on the app's “Other” shelf." : "Discovery shelf in the app."}
    >
      <div className="flex gap-2">
        <Select
          value={custom ? CUSTOM : value}
          onValueChange={(v) => RoleplayEditorController.setField("category", v === CUSTOM ? "" : String(v))}
          items={ITEMS}
        >
          <SelectTrigger id="rp-category" className={custom ? "w-32" : "w-full"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {custom && (
          <Input
            value={value}
            onChange={(e) => RoleplayEditorController.setField("category", e.target.value)}
            placeholder="e.g. Leisure"
            aria-invalid={!!issues?.length || undefined}
          />
        )}
      </div>
    </FormField>
  );
}
