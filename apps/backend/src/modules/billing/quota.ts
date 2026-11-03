import { decideQuota, type Quota, type QuotaKind } from "@glotmate/contracts";
import { eq, sql as dsql } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { roleplayRevisions, sessions, userProfiles } from "../../db/schema.js";
import { getEntitlement } from "./entitlements.js";

/**
 * GÜNLÜK ÜCRETSİZ KOTA — oturum açan iki uç (`/lessons/:id/sessions`,
 * `/roleplays/:slug/sessions`) öncesinde koşar. Karar saf `decideQuota`'da
 * (contracts); burada yalnız girdileri toplanır.
 *
 * Gün sınırı kullanıcının saat dilimidir (`user_profiles.timezone`). Geçersiz
 * dilim UTC'ye düşer — kota asla hata yüzünden kilitlenmez.
 */

export class QuotaError extends Error {
  constructor(
    public kind: QuotaKind,
    public quota: Quota,
  ) {
    super(`quota_exceeded:${kind}`);
  }
}

export function safeTimezone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

const limitOf = (kind: QuotaKind) => (kind === "lesson" ? env.FREE_DAILY_LESSONS : env.FREE_DAILY_ROLEPLAYS);

/** Bugün (kullanıcının gününde) açılmış FARKLI ders/senaryo kimlikleri */
export async function startedToday(userId: string, kind: QuotaKind, tz: string): Promise<string[]> {
  const dayStart = dsql`(date_trunc('day', now() at time zone ${tz}) at time zone ${tz})`;
  if (kind === "lesson") {
    const rows = await db
      .selectDistinct({ key: sessions.catalogLessonId })
      .from(sessions)
      .where(
        dsql`${sessions.userId} = ${userId} and ${sessions.sessionKind} = 'lesson' and ${sessions.catalogLessonId} is not null and ${sessions.startedAt} >= ${dayStart}`,
      );
    return rows.map((r) => r.key!).filter(Boolean);
  }
  const rows = await db
    .selectDistinct({ key: roleplayRevisions.roleplayId })
    .from(sessions)
    .innerJoin(roleplayRevisions, eq(roleplayRevisions.id, sessions.roleplayRevisionId))
    .where(
      dsql`${sessions.userId} = ${userId} and ${sessions.sessionKind} = 'roleplay' and ${sessions.startedAt} >= ${dayStart}`,
    );
  return rows.map((r) => r.key);
}

async function resetsAt(tz: string): Promise<string> {
  const [row] = await db.execute<{ at: Date }>(
    dsql`select ((date_trunc('day', now() at time zone ${tz}) + interval '1 day') at time zone ${tz}) as at`,
  );
  return new Date(row!.at).toISOString();
}

async function timezoneOf(userId: string): Promise<string> {
  const [p] = await db
    .select({ tz: userProfiles.timezone })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return safeTimezone(p?.tz);
}

/** Gösterge için tam kota görünümü */
export async function getQuota(userId: string, isPro: boolean, tzIn?: string): Promise<Quota> {
  const tz = tzIn ? safeTimezone(tzIn) : await timezoneOf(userId);
  const [lessons, roleplays, resets] = await Promise.all([
    startedToday(userId, "lesson", tz),
    startedToday(userId, "roleplay", tz),
    resetsAt(tz),
  ]);
  return {
    lesson: { used: lessons.length, limit: isPro ? null : limitOf("lesson") },
    roleplay: { used: roleplays.length, limit: isPro ? null : limitOf("roleplay") },
    resetsAt: resets,
  };
}

/**
 * Oturum açmadan önce: izin yoksa QuotaError fırlatır (route 402'ye çevirir).
 * Pro kontrolü önce — Pro kullanıcı için sayım sorgusu bile koşmaz.
 */
export async function assertQuota(userId: string, kind: QuotaKind, key: string): Promise<void> {
  const { entitlement } = await getEntitlement(userId);
  if (entitlement.isPro) return;
  const tz = await timezoneOf(userId);
  const started = await startedToday(userId, kind, tz);
  const decision = decideQuota({ isPro: false, limit: limitOf(kind), startedToday: started, key });
  if (!decision.allowed) throw new QuotaError(kind, await getQuota(userId, false, tz));
}

/** Route yardımcısı: QuotaError → 402 gövdesi */
export function quotaErrorBody(err: QuotaError) {
  return { error: "quota_exceeded" as const, kind: err.kind, quota: err.quota };
}
