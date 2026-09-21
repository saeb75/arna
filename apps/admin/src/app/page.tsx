"use client";

import { Redirect } from "@/components/shared/Redirect";
import { useAuthStore } from "@/stores/useAuthStore";

export default function IndexRoute() {
  const session = useAuthStore((s) => s.session);
  return <Redirect href={session ? "/lessons" : "/login"} />;
}
