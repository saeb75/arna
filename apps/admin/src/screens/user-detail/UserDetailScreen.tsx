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
import { QuotaCard } from "@/screens/user-detail/QuotaCard";
import { SubscriptionCard } from "@/screens/user-detail/SubscriptionCard";
import { UserDetailHeader } from "@/screens/user-detail/UserDetailHeader";
import { UserDetailSkeleton } from "@/screens/user-detail/UserDetailSkeleton";
import { UserSessionsCard } from "@/screens/user-detail/UserSessionsCard";

/**
 * Kullanıcı detayı: hesap, profil, maliyet, abonelik (tek yazma: Pro tanıma), bugünkü
 * kota, ilerleme, oturumlar + hafıza (sunucu sayfalı), ünite testleri.
 */
export function UserDetailScreen({ userId }: { userId: string }) {
  const { detail, error, proBusy } = useUserDetailStore();

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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SubscriptionCard userId={userId} entitlement={detail.entitlement} busy={proBusy} />
        <QuotaCard quota={detail.quota} />
      </div>
      <ProgressCard progress={detail.progress} />
      <UserSessionsCard userId={userId} />
      <div className="grid gap-4 lg:grid-cols-2">
        <MemoriesCard userId={userId} />
        <CheckpointsCard checkpoints={detail.checkpoints} />
      </div>
    </div>
  );
}
