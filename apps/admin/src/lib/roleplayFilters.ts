import { ROLEPLAY_CATEGORIES, type AdminRoleplayRow } from "@glotmate/contracts";

/**
 * Roleplay listesi süzme/sıralama/özet — saf, React'sız; `scripts/test-roleplay-filters.ts`
 * ile sınanır. Liste sınırlı (onlarca senaryo) ve tek seferde gelir; her şey istemcide.
 */
export type RoleplayStatusFilter = "all" | "active" | "retired";
export type RoleplaySort = "title" | "attempts30d" | "attemptsTotal" | "completion" | "updated";

export interface RoleplayFilters {
  q: string;
  status: RoleplayStatusFilter;
  /** "all" ya da kategori adı (serbest metin — bilinen listeye bağlı değil) */
  category: string;
}

export const DEFAULT_ROLEPLAY_FILTERS: RoleplayFilters = { q: "", status: "all", category: "all" };

export function applyRoleplayFilters(rows: AdminRoleplayRow[], f: RoleplayFilters): AdminRoleplayRow[] {
  const q = f.q.trim().toLowerCase();
  return rows.filter((r) => {
    if (f.status !== "all" && r.status !== f.status) return false;
    if (f.category !== "all" && r.category !== f.category) return false;
    if (q && !`${r.id} ${r.title} ${r.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

/** Sıralama kararlı: eşitlikte başlık A–Z. Tamamlanma oranı düşükten yükseğe (sorunlu senaryo önce), denemesiz en sonda. */
export function sortRoleplays(rows: AdminRoleplayRow[], sort: RoleplaySort): AdminRoleplayRow[] {
  const byTitle = (a: AdminRoleplayRow, b: AdminRoleplayRow) => a.title.localeCompare(b.title, "en");
  const out = [...rows];
  switch (sort) {
    case "title":
      return out.sort(byTitle);
    case "attempts30d":
      return out.sort((a, b) => b.attempts30d - a.attempts30d || byTitle(a, b));
    case "attemptsTotal":
      return out.sort((a, b) => b.attemptsTotal - a.attemptsTotal || byTitle(a, b));
    case "completion":
      return out.sort((a, b) => {
        if (a.avgCompletion === null && b.avgCompletion === null) return byTitle(a, b);
        if (a.avgCompletion === null) return 1;
        if (b.avgCompletion === null) return -1;
        return a.avgCompletion - b.avgCompletion || byTitle(a, b);
      });
    case "updated":
      return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || byTitle(a, b));
  }
}

/** Süzgeç seçenekleri: bilinen raflar kendi sırasıyla, sonra veride görülen diğerleri A–Z */
export function roleplayCategories(rows: AdminRoleplayRow[]): string[] {
  const known: readonly string[] = ROLEPLAY_CATEGORIES;
  const seen = new Set(rows.map((r) => r.category));
  const extra = [...seen].filter((c) => !known.includes(c)).sort((a, b) => a.localeCompare(b, "en"));
  return [...known, ...extra];
}

export interface RoleplaysSummary {
  total: number;
  retired: number;
  published: number;
  drafts: number;
  attempts30d: number;
}

export function summarizeRoleplays(rows: AdminRoleplayRow[]): RoleplaysSummary {
  let retired = 0, published = 0, drafts = 0, attempts30d = 0;
  for (const r of rows) {
    if (r.status === "retired") retired++;
    if (r.publishedRevision !== null) published++;
    if (r.hasDraft) drafts++;
    attempts30d += r.attempts30d;
  }
  return { total: rows.length, retired, published, drafts, attempts30d };
}
