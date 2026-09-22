import type { AdminSession } from "@glotmate/contracts";
import type { SessionFilters, SessionSort } from "@/stores/useSessionsStore";

/** Saf süzme/sıralama/özet — React'sız; `scripts/test-session-filters.ts` ile sınanır. */
export function applySessionFilters(sessions: AdminSession[], f: SessionFilters): AdminSession[] {
  const q = f.q.trim().toLowerCase();
  return sessions.filter((s) => {
    if (f.kind !== "all" && s.kind !== f.kind) return false;
    if (f.status === "open" && s.endedAt) return false;
    if (f.status === "ended" && !s.endedAt) return false;
    if (f.level !== "all" && s.level !== f.level) return false;
    if (f.onlyErrors && s.errorCount === 0) return false;
    if (f.onlyChat && s.chatTurnCount === 0) return false;
    if (q) {
      const hay = `${s.userEmail ?? ""} ${s.userName ?? ""} ${s.lessonTitle ?? ""} ${s.catalogLessonId ?? ""} ${s.roleplayId ?? ""} ${s.id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortSessions(sessions: AdminSession[], sort: SessionSort): AdminSession[] {
  const xs = [...sessions];
  switch (sort) {
    case "newest":
      return xs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    case "oldest":
      return xs.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    case "longest":
      return xs.sort((a, b) => b.turnCount - a.turnCount);
    case "costliest":
      return xs.sort((a, b) => b.llmCostUsd - a.llmCostUsd);
    case "slowest":
      return xs.sort((a, b) => (b.maxLatencyMs ?? -1) - (a.maxLatencyMs ?? -1));
  }
}

export interface SessionsSummary {
  total: number;
  open: number;
  withErrors: number;
  avgDurationSec: number | null;
  totalCostUsd: number;
}

export function summarizeSessions(sessions: AdminSession[]): SessionsSummary {
  let open = 0, withErrors = 0, totalCostUsd = 0, durSum = 0, durN = 0;
  for (const s of sessions) {
    if (!s.endedAt) open++;
    if (s.errorCount > 0) withErrors++;
    totalCostUsd += s.llmCostUsd;
    if (s.durationSec !== null) {
      durSum += s.durationSec;
      durN++;
    }
  }
  return { total: sessions.length, open, withErrors, avgDurationSec: durN ? Math.round(durSum / durN) : null, totalCostUsd };
}
