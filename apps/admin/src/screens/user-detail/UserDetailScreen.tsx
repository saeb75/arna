"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { UserDetailController } from "@/controllers/UserDetailController";
import { useUserDetailStore } from "@/stores/useUserDetailStore";
import { CheckpointsCard } from "@/screens/user-detail/CheckpointsCard";
import { CostCard } from "@/screens/user-detail/CostCard";
import { MemoriesCard } from "@/screens/user-detail/MemoriesCard";
import { ProfileCard } from "@/screens/user-detail/ProfileCard";
import { ProgressCard } from "@/screens/user-detail/ProgressCard";
import { SessionsCard } from "@/screens/user-detail/SessionsCard";
import { UserDetailHeader } from "@/screens/user-detail/UserDetailHeader";
import { UserDetailSkeleton } from "@/screens/user-detail/UserDetailSkeleton";

/** Kullanıcı detayı — salt okunur; hesap, profil, ilerleme, oturumlar, hafıza, maliyet. */
export function UserDetailScreen({ userId }: { userId: string }) {
  const { detail, error } = useUserDetailStore();

  useEffect(() => {
    void UserDetailController.load(userId);
  }, [userId]);

  if (error && !detail) return <ErrorState code={error} onRetry={() => void UserDetailController.load(userId)} />;
  if (!detail || detail.user.id !== userId) return <UserDetailSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <UserDetailHeader user={detail.user} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileCard user={detail.user} profile={detail.profile} />
        <CostCard cost={detail.cost} />
      </div>
      <ProgressCard progress={detail.progress} />
      <SessionsCard sessions={detail.sessions} />
      <div className="grid gap-4 lg:grid-cols-2">
        <MemoriesCard memories={detail.memories} />
        <CheckpointsCard checkpoints={detail.checkpoints} />
      </div>
    </div>
  );
}
