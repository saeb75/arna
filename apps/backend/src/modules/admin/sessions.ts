import {
  sessionPositionSchema,
  type AdminSession,
  type AdminSessionDetail,
  type AdminSessionsQuery,
  type AdminSessionsResponse,
  type AdminSessionsStats,
  type AdminTranscriptTurn,
  type CefrLevel,
  type RichText,
} from "@glotmate/contracts";
import { and, asc, desc, eq, exists, inArray, isNotNull, isNull, or, sql as dsql, type SQL } from "drizzle-orm";
import { db, sql } from "../../db/client.js";
import {
  catalogLessons,
  llmCalls,
  roleplayRevisions,
  sessions,
  sessionSummaries,
  transcriptTurns,
  userProfiles,
} from "../../db/schema.js";
import { AdminError } from "./queries.js";

/**
 * OTURUM LİSTESİ / DETAYI — bug avı yüzeyi, salt okunur.
 *
 * GİZLİLİK SINIRI: `sessions.state`in yalnız `track`, `tutorLanguage` ve
 * `practice.hitTurns` alanları jsonb yol ifadesiyle okunur; `memoryBlock` ve
 * `script` (prompt malzemesi) hiçbir sorguda SEÇİLMEZ. Transkript öğrencinin ve
 * hocanın söyledikleridir — admin bunu görmek için var.
 *
 * Liste SUNUCU TARAFI SAYFALIDIR: süzme + sıralama + sayfa SQL'de (oturum sayısı
 * büyüdükçe istemciye "son N" taşımak yanlış — kullanıcı geri bildirimi). Sıralama
 * anahtarları tur/LLM sayaçları için korelasyonlu alt sorgular; sayfa satırları
 * için sayaçlar ayrıca GROUP BY ile süslenir. Özet kartları (`stats`) süzülmemiş
 * tüm oturumlar üzerinden tek sorguyla gelir.
 */

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);
const num = (v: unknown) => Number(v ?? 0);
const intOrNull = (v: unknown) => (v === null || v === undefined ? null : Math.round(Number(v)));

const PHASES = new Set(["lecture", "practice", "wrapup"]);

const sessionSelect = {
  id: sessions.id,
  userId: sessions.userId,
  kind: sessions.sessionKind,
  catalogLessonId: sessions.catalogLessonId,
  lessonTitle: catalogLessons.title,
  level: catalogLessons.level,
  roleplayId: roleplayRevisions.roleplayId,
  userName: userProfiles.displayName,
  startedAt: sessions.startedAt,
  endedAt: sessions.endedAt,
  // state'in TAMAMI değil — yalnız pinlenen iki alan
  track: dsql<string | null>`${sessions.state}->>'track'`,
  tutorLanguage: dsql<string | null>`${sessions.state}->>'tutorLanguage'`,
  phase: dsql<string | null>`${sessions.position}->>'phase'`,
  awaiting: dsql<string | null>`${sessions.position}->>'awaiting'`,
  hasSummary: dsql<boolean>`${sessionSummaries.sessionId} is not null`,
  errorCount: dsql<number>`coalesce(jsonb_array_length(case when jsonb_typeof(${sessionSummaries.errorsObserved}) = 'array' then ${sessionSummaries.errorsObserved} else '[]'::jsonb end), 0)::int`,
};

function baseQuery() {
  return db
    .select(sessionSelect)
    .from(sessions)
    .leftJoin(catalogLessons, eq(catalogLessons.id, sessions.catalogLessonId))
    .leftJoin(roleplayRevisions, eq(roleplayRevisions.id, sessions.roleplayRevisionId))
    .leftJoin(userProfiles, eq(userProfiles.userId, sessions.userId))
    .leftJoin(sessionSummaries, eq(sessionSummaries.sessionId, sessions.id));
}
type BaseRow = Awaited<ReturnType<ReturnType<typeof baseQuery>["execute"]>>[number];

async function decorate(rows: BaseRow[]): Promise<AdminSession[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const userIds = [...new Set(rows.map((r) => r.userId))];

  const [emails, turnAgg, llmAgg] = await Promise.all([
    sql<{ id: string; email: string | null }[]>`select id, email from auth.users where id = any(${userIds}::uuid[])`,
    db
      .select({
        sessionId: transcriptTurns.sessionId,
        n: dsql<number>`count(*)::int`,
        user: dsql<number>`sum(case when ${transcriptTurns.role} = 'user' then 1 else 0 end)::int`,
        chat: dsql<number>`sum(case when ${transcriptTurns.source} = 'chat' then 1 else 0 end)::int`,
      })
      .from(transcriptTurns)
      .where(inArray(transcriptTurns.sessionId, ids))
      .groupBy(transcriptTurns.sessionId),
    db
      .select({
        sessionId: llmCalls.sessionId,
        n: dsql<number>`count(*)::int`,
        usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)`,
        avg: dsql<string | null>`avg(${llmCalls.latencyMs})`,
        max: dsql<number | null>`max(${llmCalls.latencyMs})`,
      })
      .from(llmCalls)
      .where(inArray(llmCalls.sessionId, ids))
      .groupBy(llmCalls.sessionId),
  ]);

  const emailBy = new Map(emails.map((e) => [e.id, e.email]));
  const turnBy = new Map(turnAgg.map((t) => [t.sessionId, t]));
  const llmBy = new Map(llmAgg.map((l) => [l.sessionId!, l]));

  return rows.map((r) => {
    const t = turnBy.get(r.id);
    const l = llmBy.get(r.id);
    const started = new Date(r.startedAt);
    return {
      id: r.id,
      userId: r.userId,
      userEmail: emailBy.get(r.userId) ?? null,
      userName: r.userName ?? null,
      kind: r.kind,
      catalogLessonId: r.catalogLessonId,
      lessonTitle: r.lessonTitle ?? null,
      level: (r.level as CefrLevel | null) ?? null,
      roleplayId: r.roleplayId ?? null,
      track: r.track,
      tutorLanguage: r.tutorLanguage,
      startedAt: started.toISOString(),
      endedAt: iso(r.endedAt),
      durationSec: r.endedAt ? Math.max(0, Math.round((new Date(r.endedAt).getTime() - started.getTime()) / 1000)) : null,
      phase: r.phase && PHASES.has(r.phase) ? (r.phase as AdminSession["phase"]) : null,
      awaiting: r.awaiting,
      turnCount: t?.n ?? 0,
      userTurnCount: t?.user ?? 0,
      chatTurnCount: t?.chat ?? 0,
      llmCalls: l?.n ?? 0,
      llmCostUsd: num(l?.usd),
      avgLatencyMs: intOrNull(l?.avg ?? null),
      maxLatencyMs: intOrNull(l?.max ?? null),
      hasSummary: !!r.hasSummary,
      errorCount: r.errorCount ?? 0,
    };
  });
}

const turnCountSql = dsql<number>`(select count(*) from transcript_turns tt where tt.session_id = ${sessions.id})`;
const llmCostSql = dsql<number>`(select coalesce(sum(cost_usd), 0) from llm_calls lc where lc.session_id = ${sessions.id})`;
const llmMaxLatencySql = dsql<number>`(select coalesce(max(latency_ms), -1) from llm_calls lc where lc.session_id = ${sessions.id})`;

/** Filtreleri SQL koşuluna çevirir — istemcideki eski saf süzgeçle aynı anlam */
function whereFor(q: AdminSessionsQuery): SQL | undefined {
  const conds: SQL[] = [];
  if (q.kind !== "all") conds.push(eq(sessions.sessionKind, q.kind));
  if (q.status === "open") conds.push(isNull(sessions.endedAt));
  if (q.status === "ended") conds.push(isNotNull(sessions.endedAt));
  if (q.level !== "all") conds.push(eq(catalogLessons.level, q.level));
  if (q.onlyErrors) conds.push(dsql`jsonb_typeof(${sessionSummaries.errorsObserved}) = 'array' and jsonb_array_length(${sessionSummaries.errorsObserved}) > 0`);
  if (q.onlyChat) {
    conds.push(exists(db.select({ one: dsql`1` }).from(transcriptTurns).where(and(eq(transcriptTurns.sessionId, sessions.id), eq(transcriptTurns.source, "chat")))));
  }
  if (q.q) {
    const like = `%${q.q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    conds.push(
      or(
        dsql`${sessions.userId} in (select id from auth.users where email ilike ${like})`,
        dsql`${userProfiles.displayName} ilike ${like}`,
        dsql`${catalogLessons.title} ilike ${like}`,
        dsql`${sessions.catalogLessonId} ilike ${like}`,
        dsql`${roleplayRevisions.roleplayId} ilike ${like}`,
        dsql`${sessions.id}::text ilike ${like}`,
      )!,
    );
  }
  return conds.length ? and(...conds) : undefined;
}

function orderFor(sort: AdminSessionsQuery["sort"]): SQL[] {
  switch (sort) {
    case "newest":
      return [desc(sessions.startedAt)];
    case "oldest":
      return [asc(sessions.startedAt)];
    case "longest":
      return [desc(turnCountSql), desc(sessions.startedAt)];
    case "costliest":
      return [desc(llmCostSql), desc(sessions.startedAt)];
    case "slowest":
      return [desc(llmMaxLatencySql), desc(sessions.startedAt)];
  }
}

async function getStats(): Promise<AdminSessionsStats> {
  const [row] = await db
    .select({
      total: dsql<number>`count(*)::int`,
      open: dsql<number>`sum(case when ${sessions.endedAt} is null then 1 else 0 end)::int`,
      withErrors: dsql<number>`sum(case when jsonb_typeof(${sessionSummaries.errorsObserved}) = 'array' and jsonb_array_length(${sessionSummaries.errorsObserved}) > 0 then 1 else 0 end)::int`,
      avgDuration: dsql<string | null>`avg(extract(epoch from (${sessions.endedAt} - ${sessions.startedAt})))`,
    })
    .from(sessions)
    .leftJoin(sessionSummaries, eq(sessionSummaries.sessionId, sessions.id));
  const [cost] = await db
    .select({ usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)` })
    .from(llmCalls)
    .where(isNotNull(llmCalls.sessionId));
  return {
    total: row?.total ?? 0,
    open: row?.open ?? 0,
    withErrors: row?.withErrors ?? 0,
    avgDurationSec: row?.avgDuration === null || row?.avgDuration === undefined ? null : Math.round(Number(row.avgDuration)),
    totalCostUsd: num(cost?.usd),
  };
}

export async function getAdminSessions(q: AdminSessionsQuery): Promise<AdminSessionsResponse> {
  const where = whereFor(q);
  const [rows, countRows, stats] = await Promise.all([
    baseQuery()
      .where(where)
      .orderBy(...orderFor(q.sort))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(sessions)
      .leftJoin(catalogLessons, eq(catalogLessons.id, sessions.catalogLessonId))
      .leftJoin(roleplayRevisions, eq(roleplayRevisions.id, sessions.roleplayRevisionId))
      .leftJoin(userProfiles, eq(userProfiles.userId, sessions.userId))
      .leftJoin(sessionSummaries, eq(sessionSummaries.sessionId, sessions.id))
      .where(where),
    getStats(),
  ]);
  return {
    sessions: await decorate(rows),
    page: q.page,
    pageSize: q.pageSize,
    total: countRows[0]?.n ?? 0,
    stats,
    generatedAt: new Date().toISOString(),
  };
}

export async function getAdminSessionDetail(sessionId: string): Promise<AdminSessionDetail> {
  const rows = await baseQuery().where(eq(sessions.id, sessionId)).limit(1);
  if (rows.length === 0) throw new AdminError("not_found");
  const [session] = await decorate(rows);

  const [turns, summary, calls, extra] = await Promise.all([
    db
      .select({
        id: transcriptTurns.id,
        role: transcriptTurns.role,
        text: transcriptTurns.text,
        runs: transcriptTurns.runs,
        phase: transcriptTurns.phase,
        source: transcriptTurns.source,
        latencyMs: transcriptTurns.latencyMs,
        createdAt: transcriptTurns.createdAt,
      })
      .from(transcriptTurns)
      .where(eq(transcriptTurns.sessionId, sessionId))
      .orderBy(asc(transcriptTurns.id)),
    db.select().from(sessionSummaries).where(eq(sessionSummaries.sessionId, sessionId)).limit(1),
    db
      .select({
        id: llmCalls.id,
        purpose: llmCalls.purpose,
        model: llmCalls.model,
        promptVersion: llmCalls.promptVersion,
        inputTokens: llmCalls.inputTokens,
        outputTokens: llmCalls.outputTokens,
        costUsd: llmCalls.costUsd,
        latencyMs: llmCalls.latencyMs,
        createdAt: llmCalls.createdAt,
      })
      .from(llmCalls)
      .where(eq(llmCalls.sessionId, sessionId))
      .orderBy(asc(llmCalls.createdAt)),
    // Yalnız izinli yollar: position + practice.hitTurns + katman id'leri. state'in geri kalanı YOK.
    db
      .select({
        position: sessions.position,
        hitTurns: dsql<unknown>`${sessions.state}->'practice'->'hitTurns'`,
        coreId: sessions.coreId,
        sceneSetId: sessions.sceneSetId,
        localeId: sessions.localeId,
      })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1),
  ]);

  const x = extra[0]!;
  const position = sessionPositionSchema.safeParse(x.position);
  const hits = Array.isArray(x.hitTurns) ? (x.hitTurns as unknown[]).filter((n): n is number => Number.isInteger(n)) : [];
  const s = summary[0];

  const outTurns: AdminTranscriptTurn[] = turns.map((t) => ({
    id: t.id,
    role: t.role === "user" ? "user" : "assistant",
    text: t.text,
    runs: (t.runs as RichText | null) ?? null,
    phase: t.phase,
    source: t.source === "script" ? "script" : "chat",
    latencyMs: t.latencyMs,
    createdAt: t.createdAt.toISOString(),
  }));

  return {
    session: session!,
    position: position.success ? position.data : null,
    practiceHitTurns: hits,
    turns: outTurns,
    summary: s
      ? { summary: s.summary, continuityHook: s.continuityHook, errorsObserved: s.errorsObserved ?? null, createdAt: s.createdAt.toISOString() }
      : null,
    llmCalls: calls.map((c) => ({
      id: c.id,
      purpose: c.purpose,
      model: c.model,
      promptVersion: c.promptVersion,
      inputTokens: c.inputTokens,
      outputTokens: c.outputTokens,
      costUsd: num(c.costUsd),
      latencyMs: c.latencyMs,
      createdAt: c.createdAt.toISOString(),
    })),
    layers: { coreId: x.coreId, sceneSetId: x.sceneSetId, localeId: x.localeId },
  };
}
