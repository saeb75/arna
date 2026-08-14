/** Ünite sonu testi — derleme + değerlendirme doğruluğu. LLM ÇAĞRISI YOK.
 *
 *  Testin tamamı deterministik olmalı: maddelerin hepsi tek doğru cevaplı,
 *  değerlendirme kodda. Bu script derleyicinin o sözü tuttuğunu sınar.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-checkpoint.ts` */
import {
  CHECKPOINT_ITEM_COUNT,
  ORDER_MAX_WORDS,
  ORDER_MIN_WORDS,
  checkpointSchema,
  gradeCheckpointItem,
  type CheckpointItem,
} from "@arna/contracts";
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons } from "../src/db/schema.js";
import { buildCheckpoint, CheckpointError } from "../src/modules/curriculum/checkpoint.js";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

console.log("\n=== A1 ÜNİTE 1 DERLEMESİ ===");
const cp = await buildCheckpoint({ level: "A1", unitIndex: 1, nativeLanguage: "tr", tutorLanguage: "native" });

// Şema, sözleşmenin tamamını doğrular (şık aralığı, kelime sayısı sınırları vb.)
const parsed = checkpointSchema.safeParse(cp);
check("şemadan geçiyor", parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues[0]));
check(`${CHECKPOINT_ITEM_COUNT} madde geliyor`, cp.items.length === CHECKPOINT_ITEM_COUNT, `${cp.items.length}`);
check("ünite başlığı ve hedefi dolu", cp.unitTitle.length > 0 && cp.unitGoal.length > 0, cp.unitTitle);
check("yönergeler ana dilde", cp.labels.order === "Kelimeleri sırala", cp.labels.order);

const kinds = new Set(cp.items.map((i) => i.kind));
check("en az iki madde tipi temsil ediliyor", kinds.size >= 2, [...kinds].join(","));

// Maddeler YALNIZCA bu ünitenin derslerinden gelmeli (yayınsız ders sızmamalı)
const unitLessons = await db
  .select({ id: catalogLessons.id })
  .from(catalogLessons)
  .where(and(eq(catalogLessons.level, "A1"), eq(catalogLessons.unitIndex, 1)));
const allowed = new Set(unitLessons.map((l) => l.id));
check("tüm maddeler bu ünitenin derslerinden", cp.items.every((i) => allowed.has(i.lessonId)),
  cp.items.map((i) => i.lessonId).join(", "));

// Tek doğru cevap sözü: her maddenin tam olarak bir doğrusu olmalı
for (const item of cp.items) {
  if (item.kind === "order") {
    check(`order maddesi ${ORDER_MIN_WORDS}-${ORDER_MAX_WORDS} kelime`,
      item.answer.length >= ORDER_MIN_WORDS && item.answer.length <= ORDER_MAX_WORDS, `${item.answer.length}`);
    check("order: karıştırılmış dizi özgün sırayla AYNI değil",
      item.tokens.some((t, i) => t !== item.answer[i]), item.tokens.join(" "));
    check("order: kutucuklar cevabın kelimeleriyle aynı çokluk",
      [...item.tokens].sort().join("|") === [...item.answer].sort().join("|"));
    // İki cümlelik örnek kutucuklara bölününce tek doğru cevap kalmaz
    check("order: TEK cümle (araya cümle sonu noktalaması girmiyor)",
      !/[.!?]["']?$/.test(item.answer.slice(0, -1).join(" ")), item.answer.join(" "));
  } else {
    check(`${item.kind}: correctIndex şık aralığında`,
      item.correctIndex >= 0 && item.correctIndex < item.options.length, `${item.correctIndex}/${item.options.length}`);
    const norm = (s: string) => s.trim().toLowerCase();
    check(`${item.kind}: şıklar benzersiz (çeldirici doğruyla çakışmıyor)`,
      new Set(item.options.map(norm)).size === item.options.length, item.options.join(" | "));
    if (item.kind === "gap") {
      // Harf deseni ipucu vermemeli: hepsi büyük ya da hepsi küçük başlamalı
      const caps = item.options.map((o) => /^[A-Z]/.test(o));
      check("gap: şıkların harf deseni aynı (büyük harf ipucu yok)",
        caps.every((c) => c === caps[0]), item.options.join(" | "));
    }
  }
}

// --- Değerlendirme doğruluk tablosu ----------------------------------------
console.log("\n=== DEĞERLENDİRME (saf fonksiyon) ===");
const mcq: CheckpointItem = {
  kind: "mcq", id: "t1", lessonId: "x", prompt: "Which is correct?",
  options: ["I am a student.", "I is a student."], correctIndex: 0,
};
check("mcq doğru şık → true", gradeCheckpointItem(mcq, { kind: "choice", index: 0 }));
check("mcq yanlış şık → false", !gradeCheckpointItem(mcq, { kind: "choice", index: 1 }));
check("mcq'ya order cevabı → false", !gradeCheckpointItem(mcq, { kind: "order", tokens: ["I", "am"] }));

const order: CheckpointItem = {
  kind: "order", id: "t2", lessonId: "x",
  tokens: ["hospital", "She", "a", "works", "in"],
  answer: ["She", "works", "in", "a", "hospital"],
};
check("order doğru sıra → true",
  gradeCheckpointItem(order, { kind: "order", tokens: ["She", "works", "in", "a", "hospital"] }));
check("order büyük/küçük harf ve noktalama esnek",
  gradeCheckpointItem(order, { kind: "order", tokens: ["she", "works,", "in", "a", "HOSPITAL."] }));
check("order yanlış sıra → false",
  !gradeCheckpointItem(order, { kind: "order", tokens: ["She", "in", "works", "a", "hospital"] }));
check("order eksik kelime → false",
  !gradeCheckpointItem(order, { kind: "order", tokens: ["She", "works", "in", "a"] }));

// --- Örneklem her girişte değişmeli ----------------------------------------
console.log("\n=== TEKRAR GİRİŞ ===");
const cp2 = await buildCheckpoint({ level: "A1", unitIndex: 1, nativeLanguage: "tr", tutorLanguage: "native" });
const ids1 = cp.items.map((i) => i.id).join(",");
const ids2 = cp2.items.map((i) => i.id).join(",");
check("ikinci girişte madde kümesi/sırası farklı", ids1 !== ids2);

// --- Doğru şık ilk sırada toplanmamalı --------------------------------------
// Yazılan içerikte doğru şık neredeyse her zaman index 0'daydı; testin şıkları
// karıştırdığını burada doğruluyoruz, yoksa "hep ilkini seç" tam puan verirdi.
console.log("\n=== ŞIK DAĞILIMI ===");
const dist: Record<number, number> = {};
let mcqSeen = 0;
for (let i = 0; i < 12; i++) {
  const c = await buildCheckpoint({ level: "A1", unitIndex: (i % 8) + 1, nativeLanguage: "tr", tutorLanguage: "native" });
  for (const it of c.items) {
    if (it.kind === "order") continue;
    mcqSeen++;
    dist[it.correctIndex] = (dist[it.correctIndex] ?? 0) + 1;
    // Şık geri bildirimi ŞIK HİZASINDA taşınmalı — kayarsa yanlış şıkkın
    // açıklaması gösterilir ve öğrenci doğru cevabı yanlış öğrenir.
    if (it.kind === "mcq" && it.optionFeedback) {
      check("mcq: optionFeedback şıklarla aynı uzunlukta",
        it.optionFeedback.length === it.options.length, `${it.optionFeedback.length}/${it.options.length}`);
    }
  }
}
const topShare = Math.max(...Object.values(dist)) / mcqSeen;
check("doğru şık tek konumda toplanmıyor", topShare < 0.6,
  `${mcqSeen} madde, dağılım ${JSON.stringify(dist)}`);

// --- Yayınlanmamış ünite testi olmamalı -------------------------------------
console.log("\n=== YAYIN KAPISI ===");
try {
  await buildCheckpoint({ level: "C2", unitIndex: 1, nativeLanguage: "tr", tutorLanguage: "native" });
  check("yayınsız seviyede test derlenmemeli", false, "hata bekleniyordu");
} catch (err) {
  check("yayınsız seviyede test derlenmiyor", err instanceof CheckpointError && err.code === "not_enough_items",
    String(err));
}

await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
