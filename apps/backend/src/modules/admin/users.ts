import type {
  AdminUser,
  AdminUserDetail,
  AdminUsersResponse,
  CefrLevel,
  LessonKind,
} from "@glotmate/contracts";
import { and, desc, eq, gte, isNotNull, sql as dsql } from "drizzle-orm";
import { db, sql } from "../../db/client.js";
import {
  catalogLessons,
  lessonProgress,
  llmCalls,
  memories,
  sessions,
  sessionSummaries,
  unitCheckpoints,
  userProfiles,
} from "../../db/schema.js";
import { AdminError } from "./queries.js";

/**
 * KULLANICI LİSTESİ / DETAYI — salt okunur.
 *
 * Kaynak `auth.users` (Supabase şeması; Drizzle şemasında yok → ham `sql`).
 * Liste auth'tan yürür: yalnız `sessions`ta izi kalan silinmiş hesaplar
 * görünmez. Profil onboarding'de doğar; `hasProfile:false` = kayıt olmuş ama
 * onboarding bitmemiş. Sayaçlar kullanıcıya özel tablolardan GROUP BY ile
 * toplanır (N+1 yok: liste 5 sorgu).
 *
 * GİZLİLİK: transkript turları ve `sessions.state` (hafıza bloğu + oturum
 * script'i) hiçbir uçtan çıkmaz. `memories.text` öğrencinin kendi sözünden
 * türer ve operatöre gösterilir — panelde "salt okunur, öğrencinin sözünden"
 * notuyla.
 */

interface AuthRow {
  id: string;
  email: string | null;
  created_at: Date;
  last_sign_in_at: Date | null;
  role: string | null;
}

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);
const num = (v: unknown) => Number(v ?? 0);

async function fetchAuthUsers(id?: string): Promise<AuthRow[]> {
  return id
    ? await sql<AuthRow[]>`
        select id, email, created_at, last_sign_in_at, raw_app_meta_data->>'role' as role
        from auth.users where id = ${id}::uuid`
    : await sql<AuthRow[]>`
        select id, email, created_at, last_sign_in_at, raw_app_meta_data->>'role' as role
        from auth.users order by created_at desc`;
}

/** Kullanıcı başına sayaçlar — liste ve detay aynı derleyiciyi kullanır */
async function buildUsers(auth: AuthRow[]): Promise<AdminUser[]> {
  if (auth.length === 0) return [];
  const ids = auth.map((a) => a.id);
  const inIds = dsql`${dsql.join(ids.map((i) => dsql`${i}::uuid`), dsql`, `)}`;

  const [profiles, progress, sess, cost] = await Promise.all([
    db.select().from(userProfiles).where(dsql`${userProfiles.userId} in (${inIds})`),
    db
      .select({ userId: lessonProgress.userId, status: lessonProgress.status, n: dsql<number>`count(*)::int` })
      .from(lessonProgress)
      .where(dsql`${lessonProgress.userId} in (${inIds})`)
      .groupBy(lessonProgress.userId, lessonProgress.status),
    db
      .select({ userId: sessions.userId, n: dsql<number>`count(*)::int`, last: dsql<Date | null>`max(${sessions.startedAt})` })
      .from(sessions)
      .where(dsql`${sessions.userId} in (${inIds})`)
      .groupBy(sessions.userId),
    db
      .select({ userId: llmCalls.userId, usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)` })
      .from(llmCalls)
      .where(and(isNotNull(llmCalls.userId), dsql`${llmCalls.userId} in (${inIds})`))
      .groupBy(llmCalls.userId),
  ]);

  const profileBy = new Map(profiles.map((p) => [p.userId, p]));
  const progressBy = new Map<string, { completed: number; inProgress: number }>();
  for (const r of progress) {
    const cur = progressBy.get(r.userId) ?? { completed: 0, inProgress: 0 };
    if (r.status === "completed") cur.completed += r.n;
    else cur.inProgress += r.n;
    progressBy.set(r.userId, cur);
  }
  const sessBy = new Map(sess.map((s) => [s.userId, s]));
  const costBy = new Map(cost.map((c) => [c.userId!, num(c.usd)]));

  return auth.map((a) => {
    const p = profileBy.get(a.id);
    const pr = progressBy.get(a.id);
    const s = sessBy.get(a.id);
    return {
      id: a.id,
      email: a.email,
      isAdmin: a.role === "admin",
      createdAt: iso(a.created_at)!,
      lastSignInAt: iso(a.last_sign_in_at),
      hasProfile: !!p,
      displayName: p?.displayName ?? null,
      nativeLanguage: p?.nativeLanguage ?? null,
      cefrLevel: (p?.cefrLevel as CefrLevel | undefined) ?? null,
      track: p?.track ?? null,
      tutorLanguage: p?.tutorLanguage ?? null,
      lessonsCompleted: pr?.completed ?? 0,
      lessonsInProgress: pr?.inProgress ?? 0,
      sessionCount: s?.n ?? 0,
      lastSessionAt: iso(s?.last ?? null),
      llmCostUsd: costBy.get(a.id) ?? 0,
    };
  });
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  const users = await buildUsers(await fetchAuthUsers());
  return { users, generatedAt: new Date().toISOString() };
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const auth = await fetchAuthUsers(userId);
  if (auth.length === 0) throw new AdminError("not_found");
  const [user] = await buildUsers(auth);

  const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [profile, progress, sess, mems, checkpoints, costTotal, cost30, costByPurpose] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1),
    db
      .select({
        catalogLessonId: lessonProgress.catalogLessonId,
        title: catalogLessons.title,
        level: catalogLessons.level,
        kind: catalogLessons.kind,
        status: lessonProgress.status,
        sessionCount: lessonProgress.sessionCount,
        firstStartedAt: lessonProgress.firstStartedAt,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessonProgress)
      .innerJoin(catalogLessons, eq(catalogLessons.id, lessonProgress.catalogLessonId))
      .where(eq(lessonProgress.userId, userId))
      .orderBy(desc(lessonProgress.updatedAt)),
    // Yalnız özet alanları: `state`/`position` SEÇİLMEZ
    db
      .select({
        id: sessions.id,
        kind: sessions.sessionKind,
        catalogLessonId: sessions.catalogLessonId,
        lessonTitle: catalogLessons.title,
        startedAt: sessions.startedAt,
        endedAt: sessions.endedAt,
        summary: sessionSummaries.summary,
        continuityHook: sessionSummaries.continuityHook,
        errorsObserved: sessionSummaries.errorsObserved,
      })
      .from(sessions)
      .leftJoin(sessionSummaries, eq(sessionSummaries.sessionId, sessions.id))
      .leftJoin(catalogLessons, eq(catalogLessons.id, sessions.catalogLessonId))
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.startedAt))
      .limit(20),
    // embedding SEÇİLMEZ (1536 float — istemciye gitmesinin anlamı yok)
    db
      .select({ id: memories.id, kind: memories.kind, text: memories.text, createdAt: memories.createdAt })
      .from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt))
      .limit(30),
    db
      .select({
        level: unitCheckpoints.level,
        unitIndex: unitCheckpoints.unitIndex,
        score: unitCheckpoints.score,
        total: unitCheckpoints.total,
        createdAt: unitCheckpoints.createdAt,
      })
      .from(unitCheckpoints)
      .where(eq(unitCheckpoints.userId, userId))
      .orderBy(desc(unitCheckpoints.createdAt)),
    db
      .select({ usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)` })
      .from(llmCalls)
      .where(eq(llmCalls.userId, userId)),
    db
      .select({ usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)` })
      .from(llmCalls)
      .where(and(eq(llmCalls.userId, userId), gte(llmCalls.createdAt, since30d))),
    db
      .select({ purpose: llmCalls.purpose, calls: dsql<number>`count(*)::int`, usd: dsql<string>`coalesce(sum(${llmCalls.costUsd}), 0)` })
      .from(llmCalls)
      .where(eq(llmCalls.userId, userId))
      .groupBy(llmCalls.purpose)
      .orderBy(desc(dsql`sum(${llmCalls.costUsd})`)),
  ]);

  const p = profile[0];
  return {
    user: user!,
    profile: p
      ? { occupation: p.occupation ?? null, interests: (p.interests as string[]) ?? [], dailyGoalMinutes: p.dailyGoalMinutes }
      : null,
    progress: progress.map((r) => ({
      catalogLessonId: r.catalogLessonId,
      title: r.title,
      level: r.level as CefrLevel,
      kind: r.kind as LessonKind,
      status: r.status === "completed" ? "completed" : "in_progress",
      sessionCount: r.sessionCount,
      firstStartedAt: r.firstStartedAt.toISOString(),
      completedAt: iso(r.completedAt),
    })),
    sessions: sess.map((s) => ({
      id: s.id,
      kind: s.kind,
      catalogLessonId: s.catalogLessonId,
      lessonTitle: s.lessonTitle,
      startedAt: s.startedAt.toISOString(),
      endedAt: iso(s.endedAt),
      summary: s.summary ?? null,
      continuityHook: s.continuityHook ?? null,
      errorsObserved: s.errorsObserved ?? null,
    })),
    memories: mems.map((m) => ({ id: m.id, kind: m.kind, text: m.text, createdAt: m.createdAt.toISOString() })),
    checkpoints: checkpoints.map((c) => ({
      level: c.level as CefrLevel,
      unitIndex: c.unitIndex,
      score: c.score,
      total: c.total,
      createdAt: c.createdAt.toISOString(),
    })),
    cost: {
      totalUsd: num(costTotal[0]?.usd),
      last30dUsd: num(cost30[0]?.usd),
      byPurpose: costByPurpose.map((r) => ({ purpose: r.purpose, calls: r.calls, usd: num(r.usd) })),
    },
  };
}
