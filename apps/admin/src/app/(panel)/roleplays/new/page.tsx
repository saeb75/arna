"use client";

import { Redirect } from "@/components/shared/Redirect";
import { RoleplayNewScreen } from "@/screens/roleplay-new/RoleplayNewScreen";
import { useRoleplayEditorStore } from "@/stores/useRoleplayEditorStore";

/** Oluşturma başarılıysa controller `createdId` yazar → deklaratif yönlendirme burada (ekran yönlendirmez). */
export default function RoleplayNewRoute() {
  const createdId = useRoleplayEditorStore((s) => s.createdId);
  if (createdId) return <Redirect href={`/roleplays/${createdId}`} />;
  return <RoleplayNewScreen />;
}
