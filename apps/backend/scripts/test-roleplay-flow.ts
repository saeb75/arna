/** Roleplay akış kararları — saf fonksiyonların doğruluk tablosu. LLM ÇAĞRISI YOK.
 *
 *  `test-flow-rules.ts` deseninin aynısı: karar KODDA, modelin düzyazısına
 *  bakmıyor, ve kural değişmeden önce buraya vaka eklenir.
 *
 *  Üç inceleme turunda karara bağlanan maddeler burada sınanıyor:
 *    · hedef = iletişim adımı, tik KALICI (iptal vakası)
 *    · her oturumda en az iki aktif hedef ya da `supportedFrom`'a yükseltme
 *    · kanıt öğrencinin son turunda BİREBİR geçmeli (uydurma elenir)
 *    · tekrar İDEMPOTENT (aktarım hatasında istemci aynı turu tekrar gönderiyor)
 *    · v1'de ikili başarı etiketi YOK, yalnız "3/4"
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-roleplay-flow.ts` */
import {
  activeComplications,
  activeObjectives,
  applyObjectiveHits,
  atLeastLevel,
  MIN_ACTIVE_OBJECTIVES,
  objectiveProgress,
  resolvePlayedLevel,
  ROLEPLAY_SPEC_FORMAT,
  roleplaySpecSchema,
  roleplayTurnOutputSchema,
  type RoleplaySpec,
} from "@glotmate/contracts";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

// --- Örnek senaryolar --------------------------------------------------------

const restaurant: RoleplaySpec = roleplaySpecSchema.parse({
  specFormat: ROLEPLAY_SPEC_FORMAT,
  title: "Ordering at a Restaurant",
  category: "Eating out",
  persona: { name: "Marco", role: "a waiter at a small Italian place", goal: "serve you and turn the table", mood: "brisk" },
  scene: "A busy trattoria on a Friday evening. You have just walked in without a booking.",
  opening: "Good evening — do you have a booking?",
  objectives: [
    { id: "ask-for-table", label: "Ask for a table", activeFrom: "A1", openingHint: "Ask how many people" },
    { id: "order-main", label: "Order a main course", activeFrom: "A1", openingHint: "Offer a choice of dishes" },
    { id: "order-drink", label: "Order a drink", activeFrom: "A1", openingHint: "Ask still or sparkling" },
    { id: "ask-for-bill", label: "Ask for the bill", activeFrom: "A1" },
    { id: "negotiate-option", label: "Negotiate another option", activeFrom: "B1" },
  ],
  complications: [
    { id: "dish-unavailable", text: "The dish they order is off tonight.", activeFrom: "B1" },
    { id: "bill-wrong", text: "The bill has an extra item on it.", activeFrom: "C1" },
  ],
  supportedFrom: "A1",
  recommendedFrom: "A1",
});

/** Bütün hedefleri C1'den başlayan senaryo — A1 kullanıcısında liste BOŞ kalırdı */
const boardMeeting: RoleplaySpec = roleplaySpecSchema.parse({
  specFormat: ROLEPLAY_SPEC_FORMAT,
  title: "Defending a Position",
  category: "Work",
  persona: { name: "Ms. Aturu", role: "a board member", goal: "test whether your case holds" },
  scene: "A board meeting where your proposal is being questioned.",
  opening: "Your numbers assume demand holds. Why should we believe that?",
  objectives: [
    { id: "state-position", label: "State your position in one sentence", activeFrom: "C1" },
    { id: "answer-objection", label: "Answer the objection directly", activeFrom: "C1" },
    { id: "concede-point", label: "Concede one point without losing the argument", activeFrom: "C1" },
  ],
  complications: [],
  supportedFrom: "C1",
  recommendedFrom: "C1",
});

// --- Seviye karşılaştırması --------------------------------------------------

console.log("\n=== SEVİYE SIRASI ===");
check("A1 < B1", !atLeastLevel("A1", "B1"));
check("B1 ≥ B1", atLeastLevel("B1", "B1"));
check("C2 ≥ A1", atLeastLevel("C2", "A1"));

// --- Aktif hedefler ---------------------------------------------------------

console.log("\n=== AKTİF HEDEFLER ===");
const a1 = activeObjectives(restaurant, "A1").map((o) => o.id);
check("A1'de 4 hedef aktif (B1 hedefi hariç)", a1.length === 4, a1.join(", "));
check("A1'de B1 hedefi kapalı", !a1.includes("negotiate-option"));
const b1 = activeObjectives(restaurant, "B1").map((o) => o.id);
check("B1'de 5 hedef aktif", b1.length === 5, b1.join(", "));
check("sıra spec'teki sırayı koruyor", a1[0] === "ask-for-table" && a1[3] === "ask-for-bill");

console.log("\n=== AKTİF KOMPLİKASYONLAR ===");
check("A1'de komplikasyon yok", activeComplications(restaurant, "A1").length === 0);
check("B1'de bir komplikasyon", activeComplications(restaurant, "B1").length === 1);
check("C1'de iki komplikasyon", activeComplications(restaurant, "C1").length === 2);

// --- Oynanacak seviye (sözleşme md. 4) --------------------------------------

console.log("\n=== OYNANACAK SEVİYE ===");
const normal = resolvePlayedLevel(restaurant, "A2");
check("yeterli hedef varsa kullanıcının seviyesi korunur", normal.level === "A2" && !normal.raised);
check("korunan seviyede hedefler dolu", normal.objectives.length === 4, `${normal.objectives.length}`);

// CANLI AÇIK: bütün hedefleri C1 olan senaryoya A1 kullanıcısı girince liste boştu
const raised = resolvePlayedLevel(boardMeeting, "A1");
check("iki hedeften azsa supportedFrom'a yükseltilir", raised.level === "C1" && raised.raised);
check("yükseltilince hedef listesi BOŞ DEĞİL",
  raised.objectives.length >= MIN_ACTIVE_OBJECTIVES, `${raised.objectives.length} hedef`);

const already = resolvePlayedLevel(boardMeeting, "C1");
check("kullanıcı zaten supportedFrom'daysa 'yükseltildi' denmez", already.level === "C1" && !already.raised);

const above = resolvePlayedLevel(boardMeeting, "C2");
check("üst seviyede kullanıcının seviyesi korunur", above.level === "C2" && !above.raised);

// --- Tik doğrulaması --------------------------------------------------------

console.log("\n=== TİK DOĞRULAMASI ===");
const ACTIVE = a1;

const ok = applyObjectiveHits(
  [{ objectiveId: "order-main", evidence: "I'll have the chicken" }],
  "Right, I'll have the chicken please.",
  ACTIVE,
  [],
);
check("kanıt son turda birebir → kabul", ok.accepted.length === 1 && ok.rejected.length === 0);

const notActive = applyObjectiveHits(
  [{ objectiveId: "negotiate-option", evidence: "I'll have the chicken" }],
  "I'll have the chicken",
  ACTIVE,
  [],
);
check("aktif olmayan hedef → red",
  notActive.accepted.length === 0 && notActive.rejected[0]?.reason === "not_active");

const madeUp = applyObjectiveHits(
  [{ objectiveId: "order-main", evidence: "I would like the salmon" }],
  "I'll have the chicken",
  ACTIVE,
  [],
);
check("uydurma kanıt (öğrenci öyle demedi) → red",
  madeUp.accepted.length === 0 && madeUp.rejected[0]?.reason === "evidence_not_verbatim");

const unknownId = applyObjectiveHits(
  [{ objectiveId: "order-dessert", evidence: "I'll have the chicken" }],
  "I'll have the chicken",
  ACTIVE,
  [],
);
check("uydurma KİMLİK → red", unknownId.rejected[0]?.reason === "not_active");

// Aktarım hatasında istemci aynı turu tekrar gönderiyor
const repeat = applyObjectiveHits(
  [{ objectiveId: "order-main", evidence: "I'll have the chicken" }],
  "I'll have the chicken",
  ACTIVE,
  ["order-main"],
);
check("zaten tiklenmiş hedef → İDEMPOTENT",
  repeat.accepted.length === 0 && repeat.rejected[0]?.reason === "already_hit");

const twiceSameTurn = applyObjectiveHits(
  [
    { objectiveId: "order-main", evidence: "I'll have the chicken" },
    { objectiveId: "order-main", evidence: "the chicken" },
  ],
  "I'll have the chicken",
  ACTIVE,
  [],
);
check("aynı turda iki kez önerilirse biri kabul", twiceSameTurn.accepted.length === 1);

check("noktalama ve büyük harf farkı kanıtı bozmuyor",
  applyObjectiveHits(
    [{ objectiveId: "ask-for-bill", evidence: "Could we have the bill" }],
    "Could we have the bill, please?",
    ACTIVE,
    [],
  ).accepted.length === 1);

check("kesme işareti korunuyor (I'll ≠ Ill)",
  applyObjectiveHits(
    [{ objectiveId: "order-main", evidence: "I'll have the soup" }],
    "I'll have the soup.",
    ACTIVE,
    [],
  ).accepted.length === 1);

// --- İPTAL VAKASI: sözleşmenin en tartışmalı maddesi ------------------------

console.log("\n=== İPTAL VAKASI (tik KALIR) ===");
// 1. tur: sipariş verildi
const turn1 = applyObjectiveHits(
  [{ objectiveId: "order-main", evidence: "I'll have the chicken" }],
  "I'll have the chicken.",
  ACTIVE,
  [],
);
const hitsAfter1 = turn1.accepted.map((h) => h.objectiveId);
check("1. tur: sipariş tiklendi", hitsAfter1.includes("order-main"));

// 2. tur: iptal. ÖLÇÜLEN ŞEY İLETİŞİM ADIMI — sipariş verme GERÇEKTEN OLDU.
const turn2 = applyObjectiveHits([], "Actually, cancel that. I don't want any food.", ACTIVE, hitsAfter1);
check("2. tur: iptal tiki GERİ ALMIYOR", turn2.accepted.length === 0 && turn2.rejected.length === 0);
check("iptalden sonra sipariş tiki DURUYOR",
  objectiveProgress(ACTIVE, hitsAfter1.map((id) => ({ objectiveId: id }))).done === 1);

// Negasyon zor negatifi: kanıt gerçek ama hedef tamamlanmadı.
// Bu fonksiyon onu ELEMEZ — kanıt birebir geçiyor. Semantik ayrımı DEDEKTÖR
// yapacak ve ölçülmüş precision kapısıyla denetlenecek. Kapının niye gerektiği
// tam olarak bu vaka.
const negation = applyObjectiveHits(
  [{ objectiveId: "order-main", evidence: "I don't want the fish" }],
  "I don't want the fish.",
  ACTIVE,
  [],
);
check("NEGASYON: kanıt birebir olduğu için bu kapı geçiriyor (dedektörün işi)",
  negation.accepted.length === 1,
  "precision kapısının varlık sebebi — kanıt kuralı yanlış atfetmeyi engellemez");

// --- İlerleme özeti ---------------------------------------------------------

console.log("\n=== İLERLEME ÖZETİ ===");
const p = objectiveProgress(ACTIVE, [{ objectiveId: "order-main" }, { objectiveId: "order-drink" }]);
check("2/4 doğru sayılıyor", p.done === 2 && p.total === 4, `${p.done}/${p.total}`);
check("aktif olmayan tik sayıya girmiyor",
  objectiveProgress(ACTIVE, [{ objectiveId: "negotiate-option" }]).done === 0);
check("aynı hedef iki kez sayılmıyor",
  objectiveProgress(ACTIVE, [{ objectiveId: "order-main" }, { objectiveId: "order-main" }]).done === 1);

// --- Model çıktı şeması -----------------------------------------------------

console.log("\n=== ÇIKTI ŞEMASI (lang: en ZORUNLU) ===");
const accepts = (v: unknown) => roleplayTurnOutputSchema.safeParse(v).success;
check("İngilizce parça kabul",
  accepts({ reply: [{ lang: "en", text: "Of course, a table for two." }], objectiveHits: [] }));
check("l1 parça REDDEDİLİR (rol yapma her zaman İngilizce)",
  !accepts({ reply: [{ lang: "l1", text: "Tabii, iki kişilik masa." }], objectiveHits: [] }));
check("süslü parantezli metin REDDEDİLİR (yapı sızıntısı)",
  !accepts({ reply: [{ lang: "en", text: 'Sure {"lang":"en"} sir.' }], objectiveHits: [] }));
check("objectiveHits opsiyonel (varsayılan boş)",
  accepts({ reply: [{ lang: "en", text: "Certainly." }] }));

// --- Spec şeması ------------------------------------------------------------

console.log("\n=== SPEC ŞEMASI ===");
const specAccepts = (over: Record<string, unknown>) =>
  roleplaySpecSchema.safeParse({ ...restaurant, ...over }).success;
check("iki hedeften az REDDEDİLİR",
  !specAccepts({ objectives: [restaurant.objectives[0]] }));
check("altı hedeften fazla REDDEDİLİR",
  !specAccepts({ objectives: Array.from({ length: 7 }, (_, i) => ({ ...restaurant.objectives[0]!, id: `o${i + 1}` })) }));
check("büyük harfli kimlik REDDEDİLİR",
  !specAccepts({ objectives: [{ ...restaurant.objectives[0]!, id: "AskForTable" }, restaurant.objectives[1]!] }));

console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
