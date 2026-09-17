import { and, asc, eq } from "drizzle-orm";
import { roleplaySpecSchema, type RoleplaySpec } from "@glotmate/contracts";
import { db } from "../../db/client.js";
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
