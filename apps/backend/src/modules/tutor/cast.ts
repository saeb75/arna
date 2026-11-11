/**
 * ÖĞRETMEN ROLÜ OYNAR — rol yapma sahnesinin karakterini ekrandaki öğretmen canlandırır,
 * bu yüzden karakter öğretmenin ADINI taşır (Kai'nin yüzü ve sesi "Hi! I'm Marta" demesin).
 *
 * İçerik paylaşımlıdır ve persona adını taşır ("Marta", "Priya"); burada servis anında,
 * deterministik olarak öğretmenin adıyla değiştirilir — içerik satırına dokunulmaz.
 * Rolün kendisi (barista, resepsiyonist), sahne ve hedefler aynen kalır. Değişim yalnız
 * BÜYÜK HARFLE başlayan TAM kelime eşleşmesidir ("Marta'ya" eşleşir, "Martha" eşleşmez).
 *
 * Saf: DB yok. Ad öğretmen kaydı yokken "Emma"dır — o durumda persona adı korunur
 * (eski davranış: öğretmen Emma, karakter başka biri).
 */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `from` adını `to` ile değiştirir — Unicode harf sınırına saygılı tam kelime */
export function swapName(text: string, from: string, to: string): string {
  const a = from.trim();
  if (!a || a === to) return text;
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(a)}(?![\\p{L}\\p{N}])`, "gu");
  return text.replace(re, to);
}

/** Nesnedeki TÜM metinlerde adı değiştirir (yapı ve anahtarlar aynı kalır) */
export function swapNameDeep<T>(value: T, from: string, to: string): T {
  if (!from.trim() || from === to) return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return swapName(v, from, to);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(value) as T;
}

/**
 * Karakteri öğretmene oynatır: `persona.name` → öğretmenin adı, metinlerdeki anmalar da.
 * `castAs` null → değişiklik yok (öğretmen kaydı yok / eski oturum).
 */
export function castPersona<T extends { persona: { name: string } }>(value: T, castAs: string | null): T {
  if (!castAs) return value;
  return swapNameDeep(value, value.persona.name, castAs);
}

/** Ders içeriğinin rol yapma bölümü (`practice.persona`) — istemciye giden nesne */
export function castLessonContent<
  T extends { practice: { persona: { name: string; role: string }; scenario: string; userGoal: string; avatarOpening: string } },
>(content: T, castAs: string | null): T {
  if (!castAs) return content;
  const p = content.practice;
  const from = p.persona.name;
  // Yalnız sahne metinleri — `mustUse` (ölçülen hedef kalıplar) ASLA değişmez
  const sw = (t: string) => swapName(t, from, castAs);
  return {
    ...content,
    practice: {
      ...p,
      persona: { ...p.persona, name: castAs, role: sw(p.persona.role) },
      scenario: sw(p.scenario),
      userGoal: sw(p.userGoal),
      avatarOpening: sw(p.avatarOpening),
    },
  };
}

/** Öğretmen kaydı varsa karakteri o oynar; yoksa (ad = Emma, eski davranış) persona korunur */
export function castNameFor(tutor: { id: string | null; name: string } | undefined | null): string | null {
  return tutor && tutor.id !== null ? tutor.name : null;
}
