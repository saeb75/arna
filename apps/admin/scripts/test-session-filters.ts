/**
 * Oturum süzme/sıralama/özet yardımcılarının doğruluk tablosu — LLM'siz, DB'siz.
 *   npx tsx scripts/test-session-filters.ts
 */
import assert from "node:assert/strict";
import type { AdminSession } from "@glotmate/contracts";
import { applySessionFilters, sortSessions, summarizeSessions } from "../src/lib/sessionFilters";

const S = (p: Partial<AdminSession> & Pick<AdminSession, "id" | "startedAt">): AdminSession => ({
  userId: "00000000-0000-0000-0000-000000000001",
  userEmail: "a@x.com",
  userName: null,
  kind: "lesson",
  catalogLessonId: "a1-one",
  lessonTitle: "Lesson One",
  level: "A1",
  roleplayId: null,
  track: "everyday",
  tutorLanguage: "native",
  endedAt: null,
  durationSec: null,
  phase: "lecture",
  awaiting: null,
  turnCount: 0,
  userTurnCount: 0,
  chatTurnCount: 0,
  llmCalls: 0,
  llmCostUsd: 0,
  avgLatencyMs: null,
  maxLatencyMs: null,
  hasSummary: false,
  errorCount: 0,
  ...p,
});

const sessions: AdminSession[] = [
  S({ id: "s1", startedAt: "2026-09-21T10:00:00Z", endedAt: "2026-09-21T10:10:00Z", durationSec: 600, turnCount: 12, chatTurnCount: 5, llmCostUsd: 0.02, maxLatencyMs: 1200, errorCount: 2, hasSummary: true }),
  S({ id: "s2", startedAt: "2026-09-21T12:00:00Z", turnCount: 3, chatTurnCount: 0, level: "B1", lessonTitle: "Ordering coffee", catalogLessonId: "b1-coffee" }),
  S({ id: "s3", startedAt: "2026-09-20T09:00:00Z", kind: "roleplay", catalogLessonId: null, lessonTitle: null, level: null, roleplayId: "rp-restaurant-order", turnCount: 29, chatTurnCount: 28, llmCostUsd: 0.4, maxLatencyMs: 3400, endedAt: "2026-09-20T09:20:00Z", durationSec: 1200 }),
];
const base = { q: "", kind: "all" as const, status: "all" as const, level: "all" as const, onlyErrors: false, onlyChat: false };
const ids = (xs: AdminSession[]) => xs.map((s) => s.id);

assert.deepEqual(ids(applySessionFilters(sessions, base)), ["s1", "s2", "s3"]);
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, kind: "roleplay" })), ["s3"], "tür");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, status: "open" })), ["s2"], "açık");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, status: "ended" })), ["s1", "s3"], "bitmiş");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, level: "B1" })), ["s2"], "seviye");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, onlyErrors: true })), ["s1"], "hatalı");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, onlyChat: true })), ["s1", "s3"], "chat turu olan");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, q: "COFFEE" })), ["s2"], "arama ders başlığı");
assert.deepEqual(ids(applySessionFilters(sessions, { ...base, q: "rp-rest" })), ["s3"], "arama roleplay slug");

assert.deepEqual(ids(sortSessions(sessions, "newest")), ["s2", "s1", "s3"]);
assert.deepEqual(ids(sortSessions(sessions, "oldest")), ["s3", "s1", "s2"]);
assert.deepEqual(ids(sortSessions(sessions, "longest")), ["s3", "s1", "s2"]);
assert.deepEqual(ids(sortSessions(sessions, "costliest")), ["s3", "s1", "s2"]);
assert.deepEqual(ids(sortSessions(sessions, "slowest")), ["s3", "s1", "s2"], "gecikmesi olmayan sona");

const sum = summarizeSessions(sessions);
assert.deepEqual({ ...sum, totalCostUsd: Number(sum.totalCostUsd.toFixed(6)) }, { total: 3, open: 1, withErrors: 1, avgDurationSec: 900, totalCostUsd: 0.42 });

console.log("✅ sessionFilters: tüm vakalar geçti");
