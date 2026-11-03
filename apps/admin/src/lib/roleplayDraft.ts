import {
  CEFR_LEVELS,
  MIN_ACTIVE_OBJECTIVES,
  ROLEPLAY_SPEC_FORMAT,
  activeObjectives,
  atLeastLevel,
  roleplaySpecSchema,
  type CefrLevel,
  type RoleplaySpec,
} from "@glotmate/contracts";

/**
 * Roleplay editörünün saf çekirdeği — React'sız; `scripts/test-roleplay-draft.ts`.
 *
 * Form durumu `RoleplaySpec`in GEVŞEK hâlidir: yazarken alanlar boş olabilir,
 * opsiyonel alanlar ("" = yok) düz string tutulur, liste öğeleri React için
 * kalıcı bir `key` taşır (sıralama değişince odak kaymasın). Sunucuya giden şey
 * `formToCandidate` → `roleplaySpecSchema` çıktısıdır; `key` ASLA gönderilmez.
 *
 * İki kapı: istemcide şema + yapısal kurallar (alan altında, İngilizce), sunucuda
 * `lintRoleplay` (ASCII, sezgisel uyarılar). İstemci kuralları sunucudakilerin
 * BİREBİR aynısı (aynı contracts yardımcıları) — istemci daha katı olamaz.
 */

export interface ObjectiveForm {
  key: string;
  /** Kimlik etiketten türetiliyor mu — yalnız bu oturumda eklenen öğede; elle yazınca ya da kayıtlı öğede false */
  idAuto: boolean;
  id: string;
  label: string;
  activeFrom: CefrLevel;
  openingHint: string;
}

export interface ComplicationForm {
  key: string;
  idAuto: boolean;
  id: string;
  text: string;
  activeFrom: CefrLevel;
}

export interface SpecForm {
  title: string;
  category: string;
  persona: { name: string; role: string; goal: string; mood: string };
  scene: string;
  opening: string;
  objectives: ObjectiveForm[];
  complications: ComplicationForm[];
  supportedFrom: CefrLevel;
  recommendedFrom: CefrLevel;
}

/** Alan sınırları — şemayla aynı; karakter sayaçları buradan okur */
export const LIMITS = {
  title: 80,
  category: 40,
  personaName: 40,
  personaRole: 80,
  personaGoal: 160,
  personaMood: 24,
  scene: 280,
  opening: 200,
  objectiveLabel: 80,
  openingHint: 120,
  complicationText: 200,
  minObjectives: 2,
  maxObjectives: 6,
  maxComplications: 4,
} as const;

let keySeq = 0;
/** Liste öğesi için oturum içi benzersiz React anahtarı */
export function nextKey(): string {
  keySeq += 1;
  return `k${keySeq}`;
}

export function emptyObjective(activeFrom: CefrLevel = "A1"): ObjectiveForm {
  return { key: nextKey(), idAuto: true, id: "", label: "", activeFrom, openingHint: "" };
}

export function emptyComplication(activeFrom: CefrLevel = "B1"): ComplicationForm {
  return { key: nextKey(), idAuto: true, id: "", text: "", activeFrom };
}

/** Yeni senaryo şablonu: şemanın asgarisi (2 hedef), alanlar boş */
export function emptySpecForm(): SpecForm {
  return {
    title: "",
    category: "Eating out",
    persona: { name: "", role: "", goal: "", mood: "" },
    scene: "",
    opening: "",
    objectives: [emptyObjective(), emptyObjective()],
    complications: [],
    supportedFrom: "A1",
    recommendedFrom: "A1",
  };
}

export function specToForm(spec: RoleplaySpec): SpecForm {
  return {
    title: spec.title,
    category: spec.category,
    persona: {
      name: spec.persona.name,
      role: spec.persona.role,
      goal: spec.persona.goal,
      mood: spec.persona.mood ?? "",
    },
    scene: spec.scene,
    opening: spec.opening,
    objectives: spec.objectives.map((o) => ({
      key: nextKey(),
      // Kayıtlı kimlik KALICIDIR (denemeler ona atıf yapar) — etiket değişse de türetilmez
      idAuto: false,
      id: o.id,
      label: o.label,
      activeFrom: o.activeFrom,
      openingHint: o.openingHint ?? "",
    })),
    complications: spec.complications.map((c) => ({ key: nextKey(), idAuto: false, id: c.id, text: c.text, activeFrom: c.activeFrom })),
    supportedFrom: spec.supportedFrom,
    recommendedFrom: spec.recommendedFrom,
  };
}

/** Formdan şemaya aday: string'ler kırpılır, boş opsiyoneller düşer, `key` atılır */
export function formToCandidate(form: SpecForm) {
  const t = (s: string) => s.trim();
  const mood = t(form.persona.mood);
  return {
    specFormat: ROLEPLAY_SPEC_FORMAT,
    title: t(form.title),
    category: t(form.category),
    persona: {
      name: t(form.persona.name),
      role: t(form.persona.role),
      goal: t(form.persona.goal),
      ...(mood ? { mood } : {}),
    },
    scene: t(form.scene),
    opening: t(form.opening),
    objectives: form.objectives.map((o) => {
      const hint = t(o.openingHint);
      return { id: t(o.id), label: t(o.label), activeFrom: o.activeFrom, ...(hint ? { openingHint: hint } : {}) };
    }),
    complications: form.complications.map((c) => ({ id: t(c.id), text: t(c.text), activeFrom: c.activeFrom })),
    supportedFrom: form.supportedFrom,
    recommendedFrom: form.recommendedFrom,
  };
}

/** Kirli mi / lint bayat mı karşılaştırmasının anahtarı — `key`ler hariç, kırpılmış hâl */
export function candidateKey(form: SpecForm): string {
  return JSON.stringify(formToCandidate(form));
}

export function specKey(spec: RoleplaySpec): string {
  return JSON.stringify(spec);
}

/** Alan yolu ("objectives.0.label") → İngilizce mesajlar */
export type FieldIssues = Record<string, string[]>;

export type SpecParse =
  | { ok: true; spec: RoleplaySpec; issues: FieldIssues }
  | { ok: false; issues: FieldIssues };

type SafeParse = ReturnType<typeof roleplaySpecSchema.safeParse>;
type SchemaIssue = Extract<SafeParse, { success: false }>["error"]["issues"][number];

/**
 * Zod mesajı İngilizceye sabitlenir: contracts'taki regex mesajları Türkçe
 * yazılmış (repo yorum dili) — panel metni İngilizce kuralı onları ekrana taşımaz.
 */
export function issueMessage(issue: SchemaIssue): string {
  const last = issue.path[issue.path.length - 1];
  switch (issue.code) {
    case "too_small":
      if (issue.type === "string") return Number(issue.minimum) <= 1 ? "Required." : `At least ${issue.minimum} characters.`;
      if (issue.type === "array") return last === "objectives" ? `At least ${issue.minimum} objectives.` : `At least ${issue.minimum} items.`;
      return `Must be at least ${issue.minimum}.`;
    case "too_big":
      if (issue.type === "string") return `At most ${issue.maximum} characters.`;
      if (issue.type === "array") {
        if (last === "objectives") return `At most ${issue.maximum} objectives.`;
        if (last === "complications") return `At most ${issue.maximum} complications.`;
        return `At most ${issue.maximum} items.`;
      }
      return `Must be at most ${issue.maximum}.`;
    case "invalid_string":
      if (issue.validation === "regex") return "Lowercase letters, digits and hyphens; 2–49 characters, starting with a letter or digit.";
      return "Invalid text.";
    case "invalid_type":
      return issue.received === "undefined" ? "Required." : `Expected ${issue.expected}.`;
    case "invalid_enum_value":
      return `Pick one of: ${issue.options.join(", ")}.`;
    case "invalid_literal":
      return "Unsupported spec format.";
    default:
      return "Invalid value.";
  }
}

function push(issues: FieldIssues, path: string, message: string): void {
  (issues[path] ??= []).push(message);
}

/**
 * Yapısal kurallar — sunucu `lintRoleplay`ın KESİN (engelleyen) kurallarının
 * aynısı, alan altında İngilizce gösterilsin diye. Sezgisel uyarılar sunucuda kalır.
 */
function structuralIssues(form: SpecForm, issues: FieldIssues): void {
  const opening = form.opening.trim();
  if (opening && !opening.endsWith("?")) {
    push(issues, "opening", "Must end with a question mark — the opening hands the turn to the student.");
  }
  const dupes = (ids: string[]) => {
    const seen = new Map<string, number>();
    for (const id of ids) if (id) seen.set(id, (seen.get(id) ?? 0) + 1);
    return new Set([...seen].filter(([, n]) => n > 1).map(([id]) => id));
  };
  const oDupes = dupes(form.objectives.map((o) => o.id.trim()));
  form.objectives.forEach((o, i) => {
    if (oDupes.has(o.id.trim())) push(issues, `objectives.${i}.id`, "Objective ids must be unique.");
  });
  const cDupes = dupes(form.complications.map((c) => c.id.trim()));
  form.complications.forEach((c, i) => {
    if (cDupes.has(c.id.trim())) push(issues, `complications.${i}.id`, "Complication ids must be unique.");
  });
  if (!atLeastLevel(form.recommendedFrom, form.supportedFrom)) {
    push(issues, "recommendedFrom", `Cannot be below “supported from” (${form.supportedFrom}).`);
  }
  const atSupported = form.objectives.filter((o) => atLeastLevel(form.supportedFrom, o.activeFrom)).length;
  if (form.objectives.length >= MIN_ACTIVE_OBJECTIVES && atSupported < MIN_ACTIVE_OBJECTIVES) {
    push(
      issues,
      "supportedFrom",
      `Only ${atSupported} objective${atSupported === 1 ? " is" : "s are"} active at ${form.supportedFrom} — at least ${MIN_ACTIVE_OBJECTIVES} are needed.`,
    );
  }
}

export function parseSpecForm(form: SpecForm): SpecParse {
  const issues: FieldIssues = {};
  const parsed = roleplaySpecSchema.safeParse(formToCandidate(form));
  if (!parsed.success) {
    for (const i of parsed.error.issues) push(issues, i.path.join(".") || "(root)", issueMessage(i));
  }
  structuralIssues(form, issues);
  if (!parsed.success || Object.keys(issues).length > 0) return { ok: false, issues };
  return { ok: true, spec: parsed.data, issues };
}

/** Kaç alan hatalı — editör başlığı "3 fields need attention" der */
export function issueCount(issues: FieldIssues): number {
  return Object.keys(issues).length;
}

// ---------------------------------------------------------------------------
// Slug
// ---------------------------------------------------------------------------

/** Sunucu `adminRoleplayCreateBodySchema` ile aynı kalıp — kalıcı kimlik, sonradan değişmez */
export const ROLEPLAY_SLUG_RE = /^rp-[a-z0-9][a-z0-9-]{1,60}$/;

/** Başlıktan slug önerisi: "Ordering at a café!" → "rp-ordering-at-a-cafe" */
export function slugFromTitle(title: string): string {
  const body = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 58)
    .replace(/-+$/g, "");
  return body ? `rp-${body}` : "rp-";
}

/** Hedef/komplikasyon kimliği önerisi: etiketten ilk birkaç kelime (şema: 2–49 karakter) */
export function idFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 4)
    .join("-")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

// ---------------------------------------------------------------------------
// Liste düzenleme
// ---------------------------------------------------------------------------

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const out = [...items];
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it!);
  return out;
}

export const LEVELS: readonly CefrLevel[] = CEFR_LEVELS;

/** Önizleme: tüm seviyeler için oynanacak seviye + aktif hedef sayısı (kapsama özeti) */
export function levelCoverage(spec: RoleplaySpec): { level: CefrLevel; active: number }[] {
  return CEFR_LEVELS.map((level) => ({ level, active: activeObjectives(spec, level).length }));
}
