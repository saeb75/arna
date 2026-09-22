import { lessonCoreSchema, type LessonCore } from "@glotmate/contracts";

/**
 * Çekirdek editörü taslağını çözümler — saf, React'sız. İstemci tarafı ilk kapı:
 * JSON bozuksa ya da şemaya uymuyorsa sunucuya hiç gidilmez; operatör hatayı
 * yazarken görür. Pedagojik lint (ASCII, alıştırma sayısı, mustUse…) sunucuda.
 */
export type DraftIssue = { path: string; message: string };

export type DraftParse =
  | { ok: true; core: LessonCore }
  | { ok: false; kind: "json"; message: string }
  | { ok: false; kind: "schema"; issues: DraftIssue[] };

export function parseDraft(text: string): DraftParse {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    return { ok: false, kind: "json", message: err instanceof Error ? err.message : "Invalid JSON" };
  }
  const parsed = lessonCoreSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      kind: "schema",
      issues: parsed.error.issues.map((i) => ({ path: i.path.join(".") || "(root)", message: i.message })),
    };
  }
  return { ok: true, core: parsed.data };
}

export function formatCore(core: unknown): string {
  return JSON.stringify(core, null, 2);
}
