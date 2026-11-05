/**
 * Geçerli IANA saat dilimi ya da UTC — kullanıcının günü (seri, istatistik) hesaplanırken.
 * Geçersiz dilim hiçbir zaman hata fırlatmaz: UTC'ye düşer.
 */
export function safeTimezone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}
