"use client";

import { useParams } from "next/navigation";
import { SessionDetailScreen } from "@/screens/session-detail/SessionDetailScreen";

export default function SessionDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <SessionDetailScreen sessionId={id} />;
}
