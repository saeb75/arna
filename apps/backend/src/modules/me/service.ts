import type { MeProfile, MeStats } from "@glotmate/contracts";
import { and, eq, sql as dsql } from "drizzle-orm";
import { db, sql } from "../../db/client.js";
import {
  answerReviews,
  lessonCores,
  savedWords,
  lessonLocales,
  lessonProgress,
  lessonSceneSets,
  lessonContents,
  lessons,
  llmCalls,
  memories,
  programs,
  sessions,
  sessionSummaries,
  unitCheckpoints,
  userEntitlements,
  userProfiles,
} from "../../db/schema.js";
import { safeTimezone } from "../../lib/timezone.js";

export async function getProfile(userId: string): Promise<MeProfile | null> {
  const [p] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (!p) return null;
  return {
    displayName: p.displayName,
    nativeLanguage: p.nativeLanguage,
    cefrLevel: p.cefrLevel as MeProfile["cefrLevel"],
    track: p.track as MeProfile["track"],
    tutorLanguage: p.tutorLanguage as MeProfile["tutorLanguage"],
    dailyGoalMinutes: p.dailyGoalMinutes,
    interests: (p.interests as string[]) ?? [],
    occupation: p.occupation,
    timezone: p.timezone,
    tutorId: p.tutorId,
  };
}

/** YYYY-MM-DD — verilen dilimde */
function dayKey(d: Date, tz: string): string {
  // en-CA biçimi ISO tarih sırasını verir (2026-10-12)
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function shiftDay(key: string, delta: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Oturum başına sayılan en uzun süre — açık unutulan oturum istatistiği şişirmesin */
const SESSION_CAP_MIN = 60;

/**
 * İSTATİSTİK — seri, bugünkü dakika, son 7 gün.
 *
 * Süre = oturumun ilk anından SON transkript satırına kadar (açık bırakılmış
 * oturum `ended_at` olmadan da doğru ölçülür), oturum başına 60 dk tavanlı.
 * Aktif gün = o gün öğrencinin en az bir turu var (yalnız açıp çıkmak sayılmaz).
 */
export async function getStats(userId: string, tzIn: string | undefined): Promise<MeStats> {
  const profile = await getProfile(userId);
  const tz = safeTimezone(tzIn ?? profile?.timezone);

  const rows = await sql<{ day: string; minutes: string; active: boolean }[]>`
    with s as (
      select
        to_char((s.started_at at time zone ${tz})::date, 'YYYY-MM-DD') as day,
        s.started_at,
        (select max(t.created_at) from transcript_turns t where t.session_id = s.id) as last_at,
        exists (select 1 from transcript_turns t where t.session_id = s.id and t.role = 'user') as has_user
      from sessions s
      where s.user_id = ${userId}::uuid
    )
    select day,
      sum(least(greatest(extract(epoch from (coalesce(last_at, started_at) - started_at)), 0) / 60.0, ${SESSION_CAP_MIN})) as minutes,
      bool_or(has_user) as active
    from s
    group by day
    order by day`;

  const byDay = new Map(rows.map((r) => [r.day, { minutes: Number(r.minutes), active: r.active }]));
  const today = dayKey(new Date(), tz);

  // Seri: bugün aktifse bugünden, değilse dünden geriye (gün henüz bitmedi)
  let streak = 0;
  let cursor = byDay.get(today)?.active ? today : shiftDay(today, -1);
  while (byDay.get(cursor)?.active) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const r of rows) {
    if (!r.active) continue;
    run = prev && shiftDay(prev, 1) === r.day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = r.day;
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDay(today, i - 6);
    const d = byDay.get(date);
    return { date, minutes: Math.round((d?.minutes ?? 0) * 10) / 10, active: !!d?.active };
  });

  const [completed] = await db
    .select({ n: dsql<number>`count(*)::int` })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.status, "completed")));

  const [roleplays] = await sql<{ n: number }[]>`
    select count(*)::int as n from sessions s
    where s.user_id = ${userId}::uuid and s.session_kind = 'roleplay' and s.ended_at is not null
      and (s.state->>'abandoned') is null
      and exists (select 1 from transcript_turns t where t.session_id = s.id and t.role = 'user')`;

  const totalMinutes = rows.reduce((n, r) => n + Number(r.minutes), 0);

  return {
    streak,
    bestStreak: Math.max(best, streak),
    todayMinutes: Math.round((byDay.get(today)?.minutes ?? 0) * 10) / 10,
    dailyGoalMinutes: profile?.dailyGoalMinutes ?? 10,
    last7Days,
    lessonsCompleted: completed?.n ?? 0,
    roleplaysCompleted: roleplays?.n ?? 0,
    totalMinutes: Math.round(totalMinutes),
  };
}

/**
 * HESAP SİLME (App Store 5.1.1(v) zorunluluğu).
 *
 * FK auth şemasına kurulmadığı için (schema.ts başı) silme TABLO TABLO yapılır.
 * Paylaşımlı içerik (`*_cores`, `lesson_locales`…) SİLİNMEZ — yalnız üreten
 * kullanıcı izi boşaltılır; başkaları aynı satırı oynuyor. `llm_calls` maliyet
 * muhasebesi için kalır ama kullanıcıdan koparılır (içerik taşımaz).
 * Son adım `auth.users` satırı: kimlikler/oturumlar Supabase'de cascade düşer.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // sessions → transcript_turns, roleplay_attempts, session_summaries cascade
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx.delete(answerReviews).where(eq(answerReviews.userId, userId));
    await tx.delete(savedWords).where(eq(savedWords.userId, userId));
    await tx.delete(sessionSummaries).where(eq(sessionSummaries.userId, userId));
    await tx.delete(memories).where(eq(memories.userId, userId));
    await tx.delete(lessonProgress).where(eq(lessonProgress.userId, userId));
    await tx.delete(unitCheckpoints).where(eq(unitCheckpoints.userId, userId));
    await tx.delete(programs).where(eq(programs.userId, userId)); // program_lessons cascade
    await tx.delete(lessons).where(eq(lessons.userId, userId));
    await tx.delete(userEntitlements).where(eq(userEntitlements.userId, userId));
    await tx.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await tx.update(llmCalls).set({ userId: null }).where(eq(llmCalls.userId, userId));
    await tx.update(lessonContents).set({ generatedForUserId: null }).where(eq(lessonContents.generatedForUserId, userId));
    await tx.update(lessonCores).set({ generatedForUserId: null }).where(eq(lessonCores.generatedForUserId, userId));
    await tx.update(lessonSceneSets).set({ generatedForUserId: null }).where(eq(lessonSceneSets.generatedForUserId, userId));
    await tx.update(lessonLocales).set({ generatedForUserId: null }).where(eq(lessonLocales.generatedForUserId, userId));
  });
  await sql`delete from auth.users where id = ${userId}::uuid`;
}

