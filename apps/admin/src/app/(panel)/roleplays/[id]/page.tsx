"use client";

import { useParams } from "next/navigation";
import { RoleplayDetailScreen } from "@/screens/roleplay-detail/RoleplayDetailScreen";

export default function RoleplayDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <RoleplayDetailScreen roleplayId={id} />;
}
