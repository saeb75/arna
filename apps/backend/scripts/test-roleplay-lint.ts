/** Roleplay kapısı — kaydetmeye izin veren/vermeyen denetimler. LLM ÇAĞRISI YOK.
 *
 *  Kapı KAYIT ANINDA koşuyor, inceleme aşamasında değil: külliyatta kaliteyi üç
 *  inceleme turu korudu, panelden eklenen senaryolar için o lüks yok.
 *
 *  HATA / UYARI ayrımı burada da sınanıyor: sezgisel olan hiçbir kural
 *  ENGELLEMEZ. Yanlış pozitif veren bir kural güvenilirliğini yitirir — bu
 *  külliyatta iki kez yaşandı (dolgu iddia sezgisi, mutlak kelime taraması).
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-roleplay-lint.ts` */
import { roleplaySpecSchema, type RoleplaySpec } from "@arna/contracts";
import { lintRoleplay } from "../src/modules/roleplay/lintRoleplay.js";
import { COMPLAINT_REFUND } from "./roleplays/complaint-refund.js";
import { RESTAURANT_ORDER } from "./roleplays/restaurant-order.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const base = RESTAURANT_ORDER.spec;
const withSpec = (over: Partial<RoleplaySpec>): RoleplaySpec =>
  roleplaySpecSchema.parse({ ...base, ...over });

const errorsOf = (s: RoleplaySpec, forbidden: string[] = []) => lintRoleplay(s, { forbidden }).errors;
const warningsOf = (s: RoleplaySpec) => lintRoleplay(s).warnings;

console.log("\n=== İKİ PİLOT TEMİZ Mİ ===");
for (const rp of [RESTAURANT_ORDER, COMPLAINT_REFUND]) {
  const spec = roleplaySpecSchema.parse(rp.spec);
  const r = lintRoleplay(spec);
  check(`${rp.slug}: hata yok`, r.errors.length === 0, r.errors.join(" | "));
  check(`${rp.slug}: uyarı yok`, r.warnings.length === 0, r.warnings.join(" | "));
}

console.log("\n=== ENGELLEYEN DENETİMLER ===");

// C1 yazımında SEKİZ kez yakalanan sınıf: soruyla bitmeyen açılış oturumu kilitler
const noQuestion = errorsOf(withSpec({ opening: "Good evening, welcome in." }));
check("açılış soruyla bitmiyor → HATA",
  noQuestion.some((e) => e.startsWith("opening:")), noQuestion[0] ?? "yok");

const nonAscii = errorsOf(withSpec({ scene: "Yoğun bir trattoria, cuma akşamı." }));
check("ASCII dışı İngilizce alan → HATA", nonAscii.some((e) => e.includes("ASCII")));

const dupIds = errorsOf(
  withSpec({
    objectives: [
      { ...base.objectives[0]!, id: "same-id" },
      { ...base.objectives[1]!, id: "same-id" },
    ],
  }),
);
check("tekrar eden hedef kimliği → HATA", dupIds.some((e) => e.includes("benzersiz")));

// Onaylanan sözleşmenin 4. maddesinin yayın-zamanı yarısı
const thinSupported = errorsOf(
  withSpec({
    supportedFrom: "A1",
    objectives: [
      { ...base.objectives[0]!, activeFrom: "A1" },
      { ...base.objectives[1]!, activeFrom: "C1" },
      { ...base.objectives[2]!, activeFrom: "C1" },
    ],
  }),
);
check("supportedFrom iki aktif hedef vermiyor → HATA",
  thinSupported.some((e) => e.includes("aktif hedef veriyor")), thinSupported[0] ?? "yok");

const inconsistent = errorsOf(withSpec({ supportedFrom: "B2", recommendedFrom: "A1" }));
check("recommendedFrom supportedFrom'un altında → HATA",
  inconsistent.some((e) => e.includes("altında olamaz")));

// Sızan bir değer senaryoyu açan HERKESE servis edilir — gizlilik denetimi
const leak = errorsOf(withSpec({ scene: "A trattoria where Saeb eats every Friday." }), ["Saeb"]);
check("kullanıcıya özel değer sızmış → HATA", leak.some((e) => e.includes("paylaşımlı")));

console.log("\n=== UYARAN AMA ENGELLEMEYEN ===");

// Hedef = iletişim adımı, dünya durumu DEĞİL. Fiil listesi bu ayrımı güvenilir
// yapamaz, o yüzden UYARIR: asıl kapı kapsama raporu ve insan onayı.
const worldState = withSpec({
  objectives: [
    { ...base.objectives[0]!, id: "get-table", label: "Get a table" },
    base.objectives[1]!,
  ],
});
check("dünya durumu hedefi → UYARI (hata değil)",
  warningsOf(worldState).some((w) => w.includes("sonuç fiili")) && errorsOf(worldState).length === 0);

const noHint = withSpec({
  objectives: [{ ...base.objectives[0]!, openingHint: undefined }, base.objectives[1]!],
});
check("openingHint eksik → UYARI",
  warningsOf(noHint).some((w) => w.includes("openingHint")) && errorsOf(noHint).length === 0);

const noComp = withSpec({ complications: [] });
check("komplikasyon yok → UYARI",
  warningsOf(noComp).some((w) => w.includes("complications")) && errorsOf(noComp).length === 0);

console.log("\n=== YANLIŞ POZİTİF YOK ===");

// "Get the point across" meşru bir iletişim adımı — fiil listesi bunu da yakalar
// ve bu KABUL EDİLEBİLİR, çünkü uyarı engellemiyor. Ama hedef başka bir fiille
// başlıyorsa hiç uyarmamalı.
const legit = withSpec({
  objectives: [
    { ...base.objectives[0]!, id: "explain-need", label: "Explain what you need" },
    { ...base.objectives[1]!, id: "confirm-detail", label: "Confirm one detail before you leave" },
  ],
});
check("meşru iletişim adımları uyarı üretmiyor",
  !warningsOf(legit).some((w) => w.includes("sonuç fiili")), warningsOf(legit).join(" | "));

check("soru işaretinden sonra boşluk açılışı bozmuyor",
  !errorsOf(withSpec({ opening: "Good evening — do you have a booking?  " }))
    .some((e) => e.startsWith("opening:")));

check("tire ve kesme işareti ASCII sayılır",
  !errorsOf(withSpec({ scene: "A waiter's station - busy, noisy, full." }))
    .some((e) => e.includes("ASCII")));

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
