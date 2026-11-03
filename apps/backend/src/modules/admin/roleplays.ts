import { createHash } from "node:crypto";
import {
  roleplaySpecSchema,
  type AdminPageQuery,
  type AdminRoleplayAttemptsPage,
  type AdminRoleplayDetail,
  type AdminRoleplayLint,
  type AdminRoleplayRevision,
  type AdminRoleplayRow,
  type AdminRoleplaysResponse,
  type CefrLevel,
  type RoleplaySpec,
} from "@glotmate/contracts";
import { and, desc, eq, sql as dsql } from "drizzle-orm";
import { db, sql } from "../../db/client.js";
import { roleplayRevisions, roleplays } from "../../db/schema.js";
import { lintRoleplay } from "../roleplay/lintRoleplay.js";
import { AdminError } from "./queries.js";

/**
 * ROLEPLAY YÖNETİMİ — panelin "Roleplays" ekranı.
 *
 * DB-KAYNAKLI içerik (müfredatın tersine; `seed-roleplays.ts` yalnız ilk
 * tohumlamayı yapar). Kurallar seed script'iyle AYNI ve tek yerde:
 *  - Kapı `lintRoleplay` KAYITTA koşar: hata varken taslak bile yazılmaz
 *    (panel önce `lint` kuru koşusuyla satır içi gösterir).
 *  - Yayınlı revizyon DEĞİŞMEZ. Düzenleme senaryo başına TEK açık taslakta;
 *    yayınlanınca önceki yayın `retired` olur, SİLİNMEZ — oturumlar kesin
 *    revizyona pinli, "bozuk içeriği kim gördü" cevaplanabilir kalır.
 *  - Taslak hiç servis edilmediği için (queries.ts yalnız `published` okur)
 *    taslağı atmak güvenlidir; yayınlı/emekli satır asla silinmez.
 */

export class RoleplayAdminError extends Error {
  constructor(
    public code: "lint_failed" | "exists" | "no_draft" | "draft_exists" | "not_found",
    public report?: AdminRoleplayLint,
  ) {
    super(code);
  }
}

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);

/** Seed script'iyle aynı parmak izi — iki yol aynı revizyonu aynı hash'le tanır */
export function specHash(spec: RoleplaySpec): string {
  return createHash("sha256").update(JSON.stringify(spec)).digest("hex").slice(0, 16);
}

export function lintSpec(spec: RoleplaySpec): AdminRoleplayLint {
  const r = lintRoleplay(spec);
  return { errors: r.errors, warnings: r.warnings };
}

interface StatRow {
  roleplay_id: string;
  attempts_total: number;
  attempts_30d: number;
  avg_completion: string | null;
}

/** Senaryo başına deneme sayaçları — yalnız öğrencinin en az bir turu olan oturumlar */
async function attemptStats(): Promise<Map<string, StatRow>> {
  const rows = await sql<StatRow[]>`
    with a as (
      select r.roleplay_id, s.started_at, s.ended_at,
        jsonb_array_length(ra.active_objective_ids) as total,
        (select count(distinct h->>'objectiveId') from jsonb_array_elements(ra.objective_hits) h
          where ra.active_objective_ids ? (h->>'objectiveId')) as done
      from sessions s
      join roleplay_revisions r on r.id = s.roleplay_revision_id
      join roleplay_attempts ra on ra.session_id = s.id
      where s.session_kind = 'roleplay'
        and exists (select 1 from transcript_turns t where t.session_id = s.id and t.role = 'user')
    )
    select roleplay_id,
      count(*)::int as attempts_total,
      count(*) filter (where started_at > now() - interval '30 days')::int as attempts_30d,
      avg(case when ended_at is not null and total > 0 then done::float / total end) as avg_completion
    from a group by roleplay_id`;
  return new Map(rows.map((r) => [r.roleplay_id, r]));
}

function revisionView(r: typeof roleplayRevisions.$inferSelect): AdminRoleplayRevision | null {
  const spec = roleplaySpecSchema.safeParse(r.spec);
  if (!spec.success) return null;
  return {
    id: r.id,
    revision: r.revision,
    status: r.status as AdminRoleplayRevision["status"],
    specHash: r.specHash,
    spec: spec.data,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function rowView(
  rp: typeof roleplays.$inferSelect,
  revs: Array<typeof roleplayRevisions.$inferSelect>,
  stat: StatRow | undefined,
): AdminRoleplayRow {
  const published = revs.find((r) => r.status === "published");
  const draft = revs.find((r) => r.status === "draft");
  // Başlık: yayındaki, yoksa taslaktaki, yoksa en yeni revizyondaki
  const display = published ?? draft ?? revs[0];
  const spec = display ? roleplaySpecSchema.safeParse(display.spec) : null;
  const latest = [rp.updatedAt, ...revs.map((r) => r.updatedAt)].reduce((a, b) => (a > b ? a : b));
  return {
    id: rp.id,
    title: spec?.success ? spec.data.title : rp.id,
    category: rp.category,
    status: rp.status === "retired" ? "retired" : "active",
    supportedFrom: rp.supportedFrom as CefrLevel,
    recommendedFrom: rp.recommendedFrom as CefrLevel,
    publishedRevision: published?.revision ?? null,
    hasDraft: !!draft,
    objectiveCount: spec?.success ? spec.data.objectives.length : 0,
    attempts30d: stat?.attempts_30d ?? 0,
    attemptsTotal: stat?.attempts_total ?? 0,
    avgCompletion: stat?.avg_completion == null ? null : Number(stat.avg_completion),
    updatedAt: latest.toISOString(),
  };
}

export async function listAdminRoleplays(): Promise<AdminRoleplaysResponse> {
  const [rps, revs, stats] = await Promise.all([
    db.select().from(roleplays).orderBy(roleplays.category, roleplays.id),
    db.select().from(roleplayRevisions).orderBy(desc(roleplayRevisions.revision)),
    attemptStats(),
  ]);
  const revsBy = new Map<string, Array<typeof roleplayRevisions.$inferSelect>>();
  for (const r of revs) revsBy.set(r.roleplayId, [...(revsBy.get(r.roleplayId) ?? []), r]);
  return {
    roleplays: rps.map((rp) => rowView(rp, revsBy.get(rp.id) ?? [], stats.get(rp.id))),
    generatedAt: new Date().toISOString(),
  };
}

/** Hedef başına isabet oranı — biten denemeler üzerinden (gösterilen / tiklenen) */
async function objectiveStats(roleplayId: string, labels: Map<string, string>) {
  const rows = await sql<{ objective_id: string; shown: number; hit: number }[]>`
    with a as (
      select ra.active_objective_ids as ids, ra.objective_hits as hits
      from sessions s
      join roleplay_revisions r on r.id = s.roleplay_revision_id
      join roleplay_attempts ra on ra.session_id = s.id
      where r.roleplay_id = ${roleplayId} and s.ended_at is not null
        and exists (select 1 from transcript_turns t where t.session_id = s.id and t.role = 'user')
    ), shown as (
      select jsonb_array_elements_text(ids) as objective_id, hits from a
    )
    select objective_id,
      count(*)::int as shown,
      count(*) filter (where exists (
        select 1 from jsonb_array_elements(hits) h where h->>'objectiveId' = shown.objective_id
      ))::int as hit
    from shown group by objective_id`;
  const byId = new Map(rows.map((r) => [r.objective_id, r]));
  // Etiketli hedefler önce (güncel spec sırası), sonra yalnız eski denemelerde kalanlar
  const ids = [...labels.keys(), ...rows.map((r) => r.objective_id).filter((id) => !labels.has(id))];
  return ids.map((id) => ({
    objectiveId: id,
    label: labels.get(id) ?? id,
    shown: byId.get(id)?.shown ?? 0,
    hit: byId.get(id)?.hit ?? 0,
  }));
}

export async function getAdminRoleplayDetail(id: string): Promise<AdminRoleplayDetail> {
  const [rp] = await db.select().from(roleplays).where(eq(roleplays.id, id)).limit(1);
  if (!rp) throw new AdminError("not_found");
  const revs = await db
    .select()
    .from(roleplayRevisions)
    .where(eq(roleplayRevisions.roleplayId, id))
    .orderBy(desc(roleplayRevisions.revision));
  const stats = await attemptStats();
  const views = revs.map(revisionView).filter((r): r is AdminRoleplayRevision => r !== null);
  const draft = views.find((r) => r.status === "draft") ?? null;
  const labelSource = views.find((r) => r.status === "published") ?? draft ?? views[0];
  const labels = new Map((labelSource?.spec.objectives ?? []).map((o) => [o.id, o.label]));
  return {
    roleplay: rowView(rp, revs, stats.get(id)),
    revisions: views,
    draft,
    draftLint: draft ? lintSpec(draft.spec) : null,
    objectiveStats: await objectiveStats(id, labels),
  };
}

function assertLintClean(spec: RoleplaySpec): void {
  const report = lintSpec(spec);
  if (report.errors.length) throw new RoleplayAdminError("lint_failed", report);
}

/** Yeni senaryo → kimlik satırı + revizyon 1 (taslak) */
export async function createRoleplay(id: string, spec: RoleplaySpec): Promise<AdminRoleplayDetail> {
  assertLintClean(spec);
  const [exists] = await db.select({ id: roleplays.id }).from(roleplays).where(eq(roleplays.id, id)).limit(1);
  if (exists) throw new RoleplayAdminError("exists");
  await db.transaction(async (tx) => {
    await tx.insert(roleplays).values({
      id,
      category: spec.category,
      recommendedFrom: spec.recommendedFrom,
      supportedFrom: spec.supportedFrom,
      status: "active",
    });
    await tx.insert(roleplayRevisions).values({
      roleplayId: id,
      revision: 1,
      specFormat: spec.specFormat,
      specHash: specHash(spec),
      status: "draft",
      spec,
    });
  });
  return await getAdminRoleplayDetail(id);
}

/** Taslağı kaydet: açık taslak varsa günceller, yoksa yeni revizyon doğurur */
export async function saveDraft(id: string, spec: RoleplaySpec): Promise<AdminRoleplayDetail> {
  assertLintClean(spec);
  const [rp] = await db.select({ id: roleplays.id }).from(roleplays).where(eq(roleplays.id, id)).limit(1);
  if (!rp) throw new AdminError("not_found");
  const [draft] = await db
    .select()
    .from(roleplayRevisions)
    .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.status, "draft")))
    .limit(1);
  if (draft) {
    await db
      .update(roleplayRevisions)
      .set({ spec, specHash: specHash(spec), specFormat: spec.specFormat, updatedAt: new Date() })
      .where(eq(roleplayRevisions.id, draft.id));
  } else {
    const [max] = await db
      .select({ n: dsql<number>`coalesce(max(${roleplayRevisions.revision}), 0)::int` })
      .from(roleplayRevisions)
      .where(eq(roleplayRevisions.roleplayId, id));
    await db.insert(roleplayRevisions).values({
      roleplayId: id,
      revision: (max?.n ?? 0) + 1,
      specFormat: spec.specFormat,
      specHash: specHash(spec),
      status: "draft",
      spec,
    });
  }
  return await getAdminRoleplayDetail(id);
}

/** Eski bir revizyonu taslak olarak çoğalt — açık taslak varsa reddedilir */
export async function duplicateAsDraft(id: string, revisionId: string): Promise<AdminRoleplayDetail> {
  const [src] = await db
    .select()
    .from(roleplayRevisions)
    .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.id, revisionId)))
    .limit(1);
  if (!src) throw new AdminError("not_found");
  const [draft] = await db
    .select({ id: roleplayRevisions.id })
    .from(roleplayRevisions)
    .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.status, "draft")))
    .limit(1);
  if (draft) throw new RoleplayAdminError("draft_exists");
  const spec = roleplaySpecSchema.parse(src.spec);
  return await saveDraft(id, spec);
}

export async function discardDraft(id: string): Promise<AdminRoleplayDetail> {
  const deleted = await db
    .delete(roleplayRevisions)
    .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.status, "draft")))
    .returning({ id: roleplayRevisions.id });
  if (deleted.length === 0) throw new RoleplayAdminError("no_draft");
  return await getAdminRoleplayDetail(id);
}

/**
 * Taslağı yayınla: önceki yayın `retired`, taslak `published`, kimlik satırının
 * keşif alanları (kategori/seviyeler) yayındaki spec'ten güncellenir. Yayından
 * önce kapı BİR KEZ DAHA koşar (lint kuralı taslak kaydından sonra değişmiş olabilir).
 */
export async function publishDraft(id: string): Promise<AdminRoleplayDetail> {
  const [draft] = await db
    .select()
    .from(roleplayRevisions)
    .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.status, "draft")))
    .limit(1);
  if (!draft) throw new RoleplayAdminError("no_draft");
  const spec = roleplaySpecSchema.parse(draft.spec);
  assertLintClean(spec);
  await db.transaction(async (tx) => {
    await tx
      .update(roleplayRevisions)
      .set({ status: "retired", updatedAt: new Date() })
      .where(and(eq(roleplayRevisions.roleplayId, id), eq(roleplayRevisions.status, "published")));
    await tx
      .update(roleplayRevisions)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(roleplayRevisions.id, draft.id));
    await tx
      .update(roleplays)
      .set({
        category: spec.category,
        recommendedFrom: spec.recommendedFrom,
        supportedFrom: spec.supportedFrom,
        updatedAt: new Date(),
      })
      .where(eq(roleplays.id, id));
  });
  return await getAdminRoleplayDetail(id);
}

/** Senaryoyu keşiften çek / geri getir — revizyonlara dokunmaz */
export async function setRoleplayStatus(id: string, status: "active" | "retired"): Promise<AdminRoleplayDetail> {
  const updated = await db
    .update(roleplays)
    .set({ status, updatedAt: new Date() })
    .where(eq(roleplays.id, id))
    .returning({ id: roleplays.id });
  if (updated.length === 0) throw new AdminError("not_found");
  return await getAdminRoleplayDetail(id);
}

export async function getRoleplayAttempts(id: string, q: AdminPageQuery): Promise<AdminRoleplayAttemptsPage> {
  const offset = (q.page - 1) * q.pageSize;
  const rows = await sql<
    {
      session_id: string;
      user_id: string;
      email: string | null;
      name: string | null;
      revision: number;
      played_level: string;
      ids: string[];
      hits: Array<{ objectiveId: string }>;
      turns: number;
      started_at: Date;
      ended_at: Date | null;
    }[]
  >`
    select s.id as session_id, s.user_id, u.email, p.display_name as name, r.revision,
      ra.played_level, ra.active_objective_ids as ids, ra.objective_hits as hits,
      (select count(*)::int from transcript_turns t where t.session_id = s.id and t.role = 'user') as turns,
      s.started_at, s.ended_at
    from sessions s
    join roleplay_revisions r on r.id = s.roleplay_revision_id
    join roleplay_attempts ra on ra.session_id = s.id
    left join auth.users u on u.id = s.user_id
    left join user_profiles p on p.user_id = s.user_id
    where r.roleplay_id = ${id}
    order by s.started_at desc
    limit ${q.pageSize} offset ${offset}`;
  // Sayım satırlarla AYNI birleşimden: deneme satırı olmayan oturum sayfayı boş bırakmasın
  const [count] = await sql<{ n: number }[]>`
    select count(*)::int as n from sessions s
    join roleplay_revisions r on r.id = s.roleplay_revision_id
    join roleplay_attempts ra on ra.session_id = s.id
    where r.roleplay_id = ${id}`;
  return {
    items: rows.map((r) => {
      const active = new Set(r.ids ?? []);
      const done = new Set((r.hits ?? []).map((h) => h.objectiveId).filter((x) => active.has(x))).size;
      return {
        sessionId: r.session_id,
        userId: r.user_id,
        userEmail: r.email,
        userName: r.name,
        revision: r.revision,
        playedLevel: r.played_level as CefrLevel,
        done,
        total: active.size,
        turns: r.turns,
        startedAt: iso(r.started_at)!,
        endedAt: iso(r.ended_at),
      };
    }),
    page: q.page,
    pageSize: q.pageSize,
    total: count?.n ?? 0,
  };
}
