/** Modelden gelen konuşma parçalarında YAPI SIZINTISI var mı? LLM ÇAĞRISI YOK.
 *
 *  CANLI HATA: selamlama prompt'u modele İngilizce terimi "kendi {"lang":"en"}
 *  parçası olarak cümlenin İÇİNE dokuyarak" yazmasını söylüyordu. Model birebir
 *  uydu ve yapıyı metnin içine yazdı:
 *
 *    "Bugün dersimiz {'lang':'en','text':'am, is and are'} hakkında olacak."
 *
 *  73 oturumun 24'ünde (%33) oldu, 22 farklı varyantla. Şema geçirdi çünkü `text` yalnızca string.
 *  Ekranda çirkin durmakla kalmıyor — TTS onu SESLİ OKUYOR.
 *
 *  Denetim yalnızca `{` ve `}`. Aşağıdaki kabul vakaları bunun yanlış pozitif
 *  vermediğini gösteriyor: kesme işareti, soru işareti, ¿¡, tire, İngilizce
 *  terim içeren L1 cümlesi — hiçbiri parantez taşımıyor.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-richtext-guard.ts` */
import { spokenRunsSchema, type RichText } from "@arna/contracts";
import { getChrome } from "../src/i18n/index.js";
import { templateGreeting } from "../src/modules/session/script.js";
import { sql } from "drizzle-orm";
import { db } from "../src/db/client.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const accepts = (runs: unknown) => spokenRunsSchema.safeParse(runs).success;

console.log("\n=== REDDEDİLMESİ GEREKENLER ===");

// Canlıda görülen GERÇEK dize
check("canlı sızıntı (tek tırnaklı yapı)", !accepts([
  { lang: "l1", text: "Merhaba saeb. Bugün dersimiz {'lang':'en','text':'am, is and are'} hakkında olacak. Hazır mısın?" },
]));

check("çift tırnaklı yapı varyantı", !accepts([
  { lang: "l1", text: 'Bugün {"lang":"en","text":"present simple"} öğreneceğiz.' },
]));

check("yalnız açılış parantezi bile yeter", !accepts([{ lang: "en", text: "Today we learn {lang" }]));

// İKİNCİ hata sınıfı: enterpolasyonu kalmamış şablon
check("enterpole edilmemiş {name} şablonu", !accepts([
  { lang: "l1", text: "Merhaba {name}! Bugün {topic} öğreneceğiz." },
]));

check("temiz parça + sızıntılı parça → tamamı reddedilir", !accepts([
  { lang: "l1", text: "Merhaba saeb." },
  { lang: "l1", text: "Konumuz {'lang':'en','text':'was and were'}." },
]));

check("boş dizi reddedilir", !accepts([]));
check("boş metin reddedilir", !accepts([{ lang: "l1", text: "" }]));

console.log("\n=== KABUL EDİLMESİ GEREKENLER (yanlış pozitif yok) ===");

// Doğru üretilmiş selamlama: L1 cümlesi + ayrı `en` terim parçası
check("doğru bölünmüş tr selamlaması", accepts([
  { lang: "l1", text: "Merhaba saeb. Bugün dersimiz " },
  { lang: "en", text: "am, is and are", emphasis: true },
  { lang: "l1", text: " hakkında olacak. Hazır mısın?" },
]));

check("kesme işareti ve soru işareti", accepts([
  { lang: "l1", text: "Hazır mısın? Geçen ders'ten kaldığımız yerden devam edelim." },
]));

check("İspanyolca ters noktalama (¿ ¡)", accepts([
  { lang: "l1", text: "¡Hola! ¿Empezamos con el presente simple?" },
]));

check("düz İngilizce selamlama", accepts([
  { lang: "en", text: "Hello saeb! Today we're going to learn about the past simple. Ready?" },
]));

check("köşeli/normal parantez yasak DEĞİL", accepts([
  { lang: "en", text: "We use it (mostly) in writing [and in exams]." },
]));

check("emphasis alanı korunuyor", accepts([
  { lang: "en", text: "she works", emphasis: true },
]));

// --- Selamlama kompozisyonu -------------------------------------------------
// İKİNCİ CANLI HATA: yapı sızıntısını düzeltirken parça SIRASINI reçete ettim
// ("Türkçe, sonra terim, sonra Türkçe'nin GERİ KALANI"). Cümle zaten bitmişti,
// model üçüncü parçayı doldurmak için saçmalık üretti:
//   "Bugün am, is and are konusunu işleyeceğiz. am, is and are ile ilgiliyiz."
// Artık konu cümlesini ŞABLON kuruyor; iki denetim de burada.
console.log("\n=== SELAMLAMA KOMPOZİSYONU ===");

const chrome = getChrome("tr");
const plain = (runs: RichText) => runs.map((r) => r.text).join("");
const TOPIC = "am, is and are";

const noMem = templateGreeting({ chrome, tutorLanguage: "native", topic: TOPIC, displayName: "saeb" });
const noMemText = plain(noMem);
check("hafıza yoksa şablon tek başına doğru cümle kuruyor",
  noMemText === "Merhaba saeb! Bugün seninle am, is and are konusunu öğreneceğiz. Başlamaya hazır mısın?", noMemText);
check("konu TAM OLARAK bir kez anılıyor",
  noMemText.split(TOPIC).length - 1 === 1, `${noMemText.split(TOPIC).length - 1} kez`);
check("konu ayrı `en` parçası (TTS doğru okur)",
  noMem.some((r) => r.lang === "en" && r.text === TOPIC && r.emphasis === true));
check("çekim eki Türkçe kelimede, terimde değil", noMemText.includes(`${TOPIC} konusunu`), noMemText);

const withMem = templateGreeting({
  chrome, tutorLanguage: "native", topic: TOPIC, displayName: "saeb",
  callback: "Geçen hafta yeni işine başladığını söylemiştin.",
});
const withMemText = plain(withMem);
check("hafıza cümlesi araya doğal giriyor",
  withMemText === "Merhaba saeb! Geçen hafta yeni işine başladığını söylemiştin. Bugün seninle am, is and are konusunu öğreneceğiz. Başlamaya hazır mısın?",
  withMemText);
check("hafıza cümlesiyle de konu bir kez anılıyor",
  withMemText.split(TOPIC).length - 1 === 1, `${withMemText.split(TOPIC).length - 1} kez`);
check("boş callback fazladan boşluk bırakmıyor",
  !plain(templateGreeting({ chrome, tutorLanguage: "native", topic: TOPIC, displayName: "saeb", callback: "   " })).includes("!  "));

console.log("\n=== SAKLI OTURUM SCRIPT'LERİ ===");
// DİKKAT: `state::text like '%{"lang"%'` İŞE YARAMAZ — state'in kendisi JSON,
// yani her sağlam oturumda o dize geçer. Sızıntı `text` DEĞERİNİN içinde, o
// yüzden parçalar tek tek yürünüyor.
// KAPSAM: yalnız SERVİS EDİLEBİLİR oturumlar. Hiçbir derse bağlı olmayan 28
// eski dev oturumu (core/content/lesson hepsi null) açılamaz, yani sızıntısı
// öğrenciye ulaşamaz. Fixture korumasının servis tarafında olmasıyla aynı
// mantık — iddia, ulaşılabilir olanın üzerinde kurulur.
const rows = await db.execute(sql`
  select id, state->${"script"} as script from sessions
  where state is not null
    and (core_id is not null or content_id is not null or lesson_id is not null
         or catalog_lesson_id is not null)`);
const sessionRows = ((rows as any).rows ?? rows) as Array<{ id: string; script: unknown }>;

const leakedIds: string[] = [];
for (const row of sessionRows) {
  const script = row.script as Record<string, unknown> | null;
  if (!script) continue;
  let dirty = false;
  const walk = (v: unknown): void => {
    if (dirty || v === null || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const o = v as Record<string, unknown>;
    if (typeof o.text === "string" && /[{}]/.test(o.text)) { dirty = true; return; }
    Object.values(o).forEach(walk);
  };
  walk(script);
  if (dirty) leakedIds.push(row.id);
}
check("saklı script'lerde yapı sızıntısı yok", leakedIds.length === 0,
  `${leakedIds.length} / ${sessionRows.length} oturum${leakedIds.length ? `: ${leakedIds.slice(0, 3).join(", ")}` : ""}`);

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
