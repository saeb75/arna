import type { LayerStatus, LessonKind } from "@glotmate/contracts";
import type { LayerFilter } from "@/stores/useLessonsStore";

/**
 * Operatör arayüzü Türkçe (tek dilli). Ders VERİSİ (title/focus/targetPhrases)
 * kanonik İngilizcedir ve çevrilmez — panel kataloğu olduğu gibi gösterir.
 */
export const KIND_LABEL: Record<LessonKind, string> = {
  phrases: "Kalıplar",
  grammar: "Gramer",
  practice: "Konuşma",
};

export const STATUS_LABEL: Record<LayerStatus, string> = {
  generating: "Üretiliyor",
  ready: "Hazır",
  failed: "Başarısız",
  published: "Yayında",
  retired: "Emekli",
};

export const LAYER_FILTER_LABEL: Record<LayerFilter, string> = {
  all: "Tüm dersler",
  no_core: "Çekirdeği yok",
  unpublished: "Yayınlanmamış",
  no_locale: "Dil paketi yok",
  stale: "Bayat paket var",
};

const ERROR_LABEL: Record<string, string> = {
  invalid_credentials: "E-posta veya şifre hatalı.",
  email_not_confirmed: "E-posta adresi doğrulanmamış.",
  over_request_rate_limit: "Çok fazla deneme — biraz bekleyin.",
  no_session: "Oturum açılamadı.",
  auth_error: "Giriş yapılamadı.",
  forbidden: "Bu hesabın yönetici yetkisi yok.",
  missing_token: "Oturum bulunamadı.",
  invalid_token: "Oturum geçersiz — yeniden giriş yapın.",
  invalid_response: "Sunucu beklenmeyen bir cevap döndü.",
  http_network: "Sunucuya ulaşılamadı.",
};

export function errorLabel(code: string): string {
  return ERROR_LABEL[code] ?? `Bir hata oluştu (${code}).`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}
