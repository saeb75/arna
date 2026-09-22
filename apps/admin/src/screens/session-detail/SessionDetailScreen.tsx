"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { SessionDetailController } from "@/controllers/SessionDetailController";
import { useSessionDetailStore } from "@/stores/useSessionDetailStore";
import { LlmCallsCard } from "@/screens/session-detail/LlmCallsCard";
import { SessionDetailHeader } from "@/screens/session-detail/SessionDetailHeader";
import { SessionDetailSkeleton } from "@/screens/session-detail/SessionDetailSkeleton";
import { SessionPositionCard } from "@/screens/session-detail/SessionPositionCard";
import { SessionSummaryCard } from "@/screens/session-detail/SessionSummaryCard";
import { TranscriptView } from "@/screens/session-detail/TranscriptView";

/** Oturum detayı: transkript ana alan, sağda imleç/özet/LLM çağrıları. Salt okunur. */
export function SessionDetailScreen({ sessionId }: { sessionId: string }) {
  const { detail, error } = useSessionDetailStore();

  useEffect(() => {
    void SessionDetailController.load(sessionId);
  }, [sessionId]);

  if (error && !detail) return <ErrorState code={error} onRetry={() => void SessionDetailController.load(sessionId)} />;
  if (!detail || detail.session.id !== sessionId) return <SessionDetailSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <SessionDetailHeader session={detail.session} layers={detail.layers} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TranscriptView turns={detail.turns} hitTurns={detail.practiceHitTurns} />
        <div className="flex flex-col gap-4">
          <SessionPositionCard position={detail.position} hitTurns={detail.practiceHitTurns} />
          <SessionSummaryCard summary={detail.summary} />
          <LlmCallsCard calls={detail.llmCalls} />
        </div>
      </div>
    </div>
  );
}
