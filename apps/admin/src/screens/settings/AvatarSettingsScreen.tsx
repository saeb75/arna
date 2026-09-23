"use client";

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsController } from "@/controllers/SettingsController";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { AvatarActiveCard } from "@/screens/settings/AvatarActiveCard";
import { SettingsSkeleton } from "@/screens/settings/SettingsSkeleton";

/** Avatar ayarları — kendi sayfası (ses ile aynı store, ayrı ekran). */
export function AvatarSettingsScreen() {
  const { avatarData, loading, error } = useSettingsStore();

  useEffect(() => {
    void SettingsController.load();
  }, []);

  return (
    <>
      <PageHeader
        title="Avatar"
        description="Which tutor avatar the clients render. Stored on the server; applies to new sessions."
        actions={
          <Button variant="outline" size="sm" onClick={() => void SettingsController.load()} disabled={loading}>
            <RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : undefined} />
            Refresh
          </Button>
        }
      />
      {error && !avatarData ? (
        <ErrorState code={error} onRetry={() => void SettingsController.load()} />
      ) : !avatarData ? (
        <SettingsSkeleton />
      ) : (
        <AvatarActiveCard />
      )}
    </>
  );
}
