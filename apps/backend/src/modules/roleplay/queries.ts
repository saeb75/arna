import { and, asc, eq } from "drizzle-orm";
import { roleplaySpecSchema, type RoleplaySpec } from "@glotmate/contracts";
import { db, sql } from "../../db/client.js";
import { roleplayAttempts, roleplayRevisions, roleplays } from "../../db/schema.js";

/**
 * Roleplay sorguları. Tek görünmez kural: dışarıya YALNIZ `published` revizyon
 * çıkar — `draft` hiç servis edilmez (çekirdeklerdeki yayın kapısının aynısı;
 * ilk kullanıcı asla yayın öncesi içeriğin deneği olmaz).
 */

export interface PublishedRoleplay {
  slug: string;
  category: string;
  recommendedFrom: string;
  supportedFrom: string;
  revisionId: string;
  revision: number;
  spec: RoleplaySpec;
}

function parseRow(row: {
  slug: string;
  category: string;
  recommendedFrom: string;
  supportedFrom: string;
  revisionId: string;
  revision: number;
  spec: unknown;
}): PublishedRoleplay | null {
  // Saklı spec şemadan geçmezse satır SERVİS EDİLMEZ — bozuk içerik sessizce
  // istemciye akmaz. (Kayıt anındaki kapı bunu zaten engelliyor; bu son savunma.)
  const parsed = roleplaySpecSchema.safeParse(row.spec);
  if (!parsed.success) {
    console.error(`[roleplay] "${row.slug}" r${row.revision}: saklı spec şemadan geçmiyor — satır atlandı`);
    return null;
  }
  return { ...row, spec: parsed.data };
}

/** Yayınlı liste — sekmenin ana ekranı. Kategoriye ve slug'a göre sıralı. */
export async function listPublishedRoleplays(): Promise<PublishedRoleplay[]> {
  const rows = await db
    .select({
      slug: roleplays.id,
      category: roleplays.category,
      recommendedFrom: roleplays.recommendedFrom,
      supportedFrom: roleplays.supportedFrom,
      revisionId: roleplayRevisions.id,
      revision: roleplayRevisions.revision,
      spec: roleplayRevisions.spec,
    })
    .from(roleplays)
    .innerJoin(
      roleplayRevisions,
      and(eq(roleplayRevisions.roleplayId, roleplays.id), eq(roleplayRevisions.status, "published")),
    )
    .where(eq(roleplays.status, "active"))
    .orderBy(asc(roleplays.category), asc(roleplays.id));

  return rows.map(parseRow).filter((r): r is PublishedRoleplay => r !== null);
}

/** Slug'dan yayınlı revizyon — brief ve oturum açma bunun üstünde. */
export async function getPublishedRoleplay(slug: string): Promise<PublishedRoleplay | null> {
  const [row] = await db
    .select({
      slug: roleplays.id,
      category: roleplays.category,
      recommendedFrom: roleplays.recommendedFrom,
      supportedFrom: roleplays.supportedFrom,
      revisionId: roleplayRevisions.id,
      revision: roleplayRevisions.revision,
      spec: roleplayRevisions.spec,
    })
    .from(roleplays)
    .innerJoin(
      roleplayRevisions,
      and(eq(roleplayRevisions.roleplayId, roleplays.id), eq(roleplayRevisions.status, "published")),
    )
    .where(and(eq(roleplays.id, slug), eq(roleplays.status, "active")))
    .limit(1);

  return row ? parseRow(row) : null;
}

/** Deneme satırı — `sessions` ile bire bir (session_id hem PK hem FK). */
export async function getAttempt(sessionId: string) {
  const [row] = await db
    .select()
    .from(roleplayAttempts)
    .where(eq(roleplayAttempts.sessionId, sessionId))
    .limit(1);
  return row ?? null;
}

/**
 * Kullanıcının senaryo başına EN SON bitmiş denemesi — liste kartındaki "3/4".
 * Yalnız öğrencinin en az bir turu olan biten oturumlar sayılır (açıp çıkmak
 * "0/4" diye görünmesin).
 */
export async function lastAttemptsByRoleplay(
  userId: string,
): Promise<Map<string, { done: number; total: number; at: string }>> {
  const rows = await sql<{ roleplay_id: string; ids: string[]; hits: Array<{ objectiveId: string }>; at: Date }[]>`
    select distinct on (r.roleplay_id)
      r.roleplay_id, a.active_objective_ids as ids, a.objective_hits as hits, s.ended_at as at
    from sessions s
    join roleplay_revisions r on r.id = s.roleplay_revision_id
    join roleplay_attempts a on a.session_id = s.id
    where s.user_id = ${userId}::uuid and s.session_kind = 'roleplay' and s.ended_at is not null
      and (s.state->>'abandoned') is null
      and exists (select 1 from transcript_turns t where t.session_id = s.id and t.role = 'user')
    order by r.roleplay_id, s.ended_at desc`;
  const out = new Map<string, { done: number; total: number; at: string }>();
  for (const r of rows) {
    const active = new Set(r.ids ?? []);
    const done = new Set((r.hits ?? []).map((h) => h.objectiveId).filter((id) => active.has(id))).size;
    out.set(r.roleplay_id, { done, total: active.size, at: new Date(r.at).toISOString() });
  }
  return out;
}
