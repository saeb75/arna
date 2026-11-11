import type { LayerStatus, LessonKind, TtsProvider } from "@glotmate/contracts";
import type { LayerFilter } from "@/stores/useLessonsStore";

/**
 * Operatör arayüzü İNGİLİZCE (kesin kural, CLAUDE.md). Ders VERİSİ
 * (title/focus/targetPhrases) zaten kanonik İngilizcedir ve olduğu gibi gösterilir.
 * Dil adları sabitlenmez — `Intl.DisplayNames` çözer (kök dil bağımsızlık ilkesi).
 */
export const KIND_LABEL: Record<LessonKind, string> = {
  phrases: "Phrases",
  grammar: "Grammar",
  practice: "Speaking",
};

export const STATUS_LABEL: Record<LayerStatus, string> = {
  generating: "Generating",
  ready: "Ready",
  failed: "Failed",
  published: "Published",
  retired: "Retired",
};

export const LAYER_FILTER_LABEL: Record<LayerFilter, string> = {
  all: "All lessons",
  no_core: "Missing core",
  unpublished: "Unpublished",
  no_locale: "No language pack",
  stale: "Has stale pack",
};

/** Sağlayıcı adları ürün adıdır, çevrilmez */
export const PROVIDER_LABEL: Record<TtsProvider, string> = {
  elevenlabs: "ElevenLabs",
  inworld: "Inworld AI",
  azure: "Azure Speech",
  gemini: "Google Gemini",
};

export const TRACK_LABEL: Record<string, string> = {
  everyday: "Everyday",
  work: "Work",
  travel: "Travel",
  academic: "Academic",
  exam: "Exam",
};

export const TUTOR_LANGUAGE_LABEL: Record<string, string> = {
  native: "Native language",
  english: "English only",
};

export const PHASE_LABEL: Record<string, string> = {
  lecture: "Lecture",
  practice: "Practice",
  wrapup: "Wrap-up",
  roleplay: "Role-play",
};

export const SESSION_KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  roleplay: "Role-play",
};

export const PROGRESS_LABEL: Record<string, string> = {
  in_progress: "In progress",
  completed: "Completed",
};

/** Senaryo kimlik satırının durumu — keşifte görünür mü */
export const ROLEPLAY_STATUS_LABEL: Record<"active" | "retired", string> = {
  active: "Active",
  retired: "Retired",
};

/** Revizyon durumu: tek açık taslak → yayın → emekli (silinmez) */
export const REVISION_STATUS_LABEL: Record<"draft" | "published" | "retired", string> = {
  draft: "Draft",
  published: "Published",
  retired: "Retired",
};

/** Pro kaynağı — mağaza aboneliği ya da admin tanıması */
export const PRO_SOURCE_LABEL: Record<"revenuecat" | "admin", string> = {
  revenuecat: "Store subscription",
  admin: "Granted by admin",
};

/** Öğretmen görünürlüğü — gizli öğretmeni seçmiş kullanıcılar varsayılana düşer */
export const TUTOR_STATUS_LABEL: Record<"active" | "hidden", string> = {
  active: "Active",
  hidden: "Hidden",
};

export const TUTOR_GENDER_LABEL: Record<"female" | "male", string> = {
  female: "Female",
  male: "Male",
};

/** Serbest metin ses kimliği alanlarının örnek değeri (.env varsayılanı yoksa) */
export const VOICE_PLACEHOLDER: Record<TtsProvider, string> = {
  elevenlabs: "21m00Tcm4TlvDq8ikWAM",
  inworld: "Ashley",
  azure: "en-US-AvaMultilingualNeural",
  gemini: "Kore",
};

/**
 * Öğretmen uçlarının hata kodları — `exists`/`invalid_input` gibi genel kodlar burada
 * öğretmene özgü okunur; geri kalanı `errorLabel`a düşer. Sunucunun `message`ı
 * Türkçedir, ekrana taşınmaz.
 */
const TUTOR_ERROR_LABEL: Record<string, string> = {
  invalid_input: "The tutor data does not match the schema — check the fields.",
  voice_invalid: "This voice can't be used — the provider has no API key in .env or the model isn't supported.",
  default_required: "To remove the default flag, make another tutor the default first.",
  default_hidden: "The default tutor can't be hidden.",
  exists: "A tutor with this id already exists — pick another id.",
  not_found: "This tutor no longer exists — refresh the list.",
  http_404: "This tutor no longer exists — refresh the list.",
};

export function tutorErrorLabel(code: string): string {
  return TUTOR_ERROR_LABEL[code] ?? errorLabel(code);
}

const ERROR_LABEL: Record<string, string> = {
  provider_not_configured: "The selected provider is not configured — API key or voice ID missing in .env.",
  tts_unavailable: "The provider could not synthesize speech — check key, voice ID or model.",
  voice_missing: "Enter a voice ID for this provider (no .env default).",
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Email address not confirmed.",
  over_request_rate_limit: "Too many attempts — wait a moment.",
  no_session: "Could not open a session.",
  auth_error: "Sign-in failed.",
  forbidden: "This account has no admin access.",
  missing_token: "No session found.",
  invalid_token: "Session is invalid — sign in again.",
  invalid_response: "The server returned an unexpected response.",
  http_network: "Could not reach the server.",
  invalid_input: "The submitted data does not match the schema.",
  invalid_params: "Invalid identifier.",
  not_found: "Not found.",
  lint_failed: "Lint failed — see the report.",
  exists: "A role-play with this id already exists — pick another slug.",
  no_draft: "There is no open draft.",
  draft_exists: "An open draft already exists — publish or discard it first.",
  invalid_slug: "The id must start with rp- and use lowercase letters, digits and hyphens.",
  invalid_form: "Fix the highlighted fields first.",
  http_400: "The server rejected the request.",
  http_404: "Not found.",
  http_409: "Conflict — the data changed in the meantime. Refresh and retry.",
  layer_not_ready: "Layer not ready: core and scene set must be ready or published first.",
  locale_in_progress: "This pack is being generated by another request — try again shortly.",
  locale_failed: "Language pack generation failed (lint failed on both attempts).",
  generation_failed: "Generation failed — see the layer card for the report.",
  http_429: "Too many requests — wait a minute.",
  http_502: "The generation service returned an error.",
};

export function errorLabel(code: string): string {
  return ERROR_LABEL[code] ?? `Something went wrong (${code}).`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
}

/**
 * Takvim günü ("2026-10-12") — sunucunun UTC gün kovaları. Yerel saat diliminde
 * biçimlenirse batı dilimlerinde bir gün kayar; o yüzden UTC'de okunur.
 */
export function formatDay(day: string, withYear = false): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

/** 0..1 oranı → "42%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** "3 days ago" — son giriş / son oturum gibi alanlar için */
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const min = 60_000, hour = 3_600_000, day = 86_400_000;
  if (abs < hour) return rtf.format(Math.round(diff / min), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  return formatDate(iso);
}

export function formatUsd(v: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: v < 1 ? 4 : 2 }).format(v);
}

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });

/** BCP-47 → İngilizce dil adı ("tr" → "Turkish"); çözülemezse kodu döner */
export function languageName(code: string): string {
  try {
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** 0 → "0s", 754 → "12m 34s", 4000 → "1h 6m" */
export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60), mm = m % 60;
  return mm ? `${h}h ${mm}m` : `${h}h`;
}

export function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
}
