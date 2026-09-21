"use client";

import { PanelShell } from "@/components/shared/PanelShell";
import { Redirect } from "@/components/shared/Redirect";
import { ForbiddenScreen } from "@/screens/forbidden/ForbiddenScreen";
import { useAuthStore } from "@/stores/useAuthStore";

/** Auth + admin kapısı TEK yerde; alt rotalar tekrarlamaz (mobil `(tabs)/_layout` kuralı). */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { session, isAdmin } = useAuthStore();
  if (!session) return <Redirect href="/login" />;
  if (!isAdmin) return <ForbiddenScreen />;
  return <PanelShell>{children}</PanelShell>;
}
