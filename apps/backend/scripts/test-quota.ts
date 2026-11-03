/** Günlük ücretsiz kota — saf `decideQuota` doğruluk tablosu. LLM ÇAĞRISI YOK, DB YOK.
 *
 *  Kilitlenen model (12 Eki 2026): ücretsiz kullanıcı günde 1 ders + 1 rol
 *  yapma AÇAR; Pro sınırsız. Sayılan şey oturum değil, gün içinde açılan FARKLI
 *  kimlik — devam ve "Baştan başla" hak yakmaz. Kural değişmeden önce buraya
 *  vaka eklenir.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-quota.ts` */
import { decideQuota, quotaRemaining } from "@glotmate/contracts";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const d = (isPro: boolean, limit: number, startedToday: string[], key: string) =>
  decideQuota({ isPro, limit, startedToday, key });

// --- Pro ---------------------------------------------------------------------
check("Pro: sınır aşılmış olsa da serbest", d(true, 1, ["a", "b", "c"], "d").allowed);
check("Pro: gerekçe 'pro'", d(true, 0, [], "a").reason === "pro");

// --- Ücretsiz: ilk hak -------------------------------------------------------
check("Ücretsiz: bugün hiç açılmadı → izin", d(false, 1, [], "a").allowed);
check("Ücretsiz: gerekçe 'within_limit'", d(false, 1, [], "a").reason === "within_limit");

// --- Aynı kimliği yeniden açmak hak yakmaz --------------------------------------
check("Baştan başla: aynı ders bugün yeniden → izin", d(false, 1, ["a"], "a").allowed);
check("Baştan başla: gerekçe 'repeat'", d(false, 1, ["a"], "a").reason === "repeat");
check("Sınır 0 iken bile bugün açılmış ders yeniden açılır", d(false, 0, ["a"], "a").allowed);

// --- Sınır ---------------------------------------------------------------------
check("Ücretsiz: ikinci FARKLI ders → ret", !d(false, 1, ["a"], "b").allowed);
check("Ücretsiz: ret gerekçesi 'exceeded'", d(false, 1, ["a"], "b").reason === "exceeded");
check("Sınır 2: ikinci farklı ders → izin", d(false, 2, ["a"], "b").allowed);
check("Sınır 2: üçüncü farklı ders → ret", !d(false, 2, ["a", "b"], "c").allowed);
check("Sınır 0: hiç ücretsiz hak yok → ret", !d(false, 0, [], "a").allowed);
check("Yinelenen kimlikler tek sayılır", d(false, 2, ["a", "a"], "b").allowed);

// --- Kalan hak göstergesi ------------------------------------------------------
check("Kalan: 1 hakta 0 kullanım → 1", quotaRemaining({ used: 0, limit: 1 }) === 1);
check("Kalan: aşım negatif olmaz", quotaRemaining({ used: 3, limit: 1 }) === 0);
check("Kalan: sınırsız → null", quotaRemaining({ used: 5, limit: null }) === null);

console.log(fail ? `\n${fail} vaka başarısız` : "\nTüm vakalar geçti");
process.exit(fail ? 1 : 0);
