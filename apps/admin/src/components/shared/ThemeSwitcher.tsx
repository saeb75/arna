"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

/**
 * Sidebar altı tema seçici. Panel yalnız `ready` sonrası (istemcide) çizildiği için
 * hidrasyon uyuşmazlığı yok — `theme` ilk render'da localStorage'dan okunmuş olur.
 */
export function ThemeSwitcher() {
  const { theme = "system", setTheme } = useTheme();
  return (
    <div className="flex items-center justify-between gap-2 px-2 pb-2">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Theme</span>
      <Tabs value={theme} onValueChange={(v) => setTheme(String(v))}>
        <TabsList className="h-7">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} aria-label={label} title={label} className="px-2">
              <Icon className="size-3.5" />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
