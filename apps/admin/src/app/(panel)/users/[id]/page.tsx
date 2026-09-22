"use client";

import { useParams } from "next/navigation";
import { UserDetailScreen } from "@/screens/user-detail/UserDetailScreen";

export default function UserDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <UserDetailScreen userId={id} />;
}
