"use client";

import { Redirect } from "@/components/shared/Redirect";

/** /settings bir kabuk değil; iki bağımsız sayfa var — varsayılan olarak ses */
export default function SettingsRoute() {
  return <Redirect href="/settings/voice" />;
}
