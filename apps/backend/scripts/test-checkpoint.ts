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
import { and, eq, inArray, like, not } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonCores, lessonLocales, lessonSceneSets } from "../src/db/schema.js";
import { seedTestCatalogLesson } from "./_fixture.js";
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

// --- HER YAYINLI SEVİYENİN HER ÜNİTESİ -------------------------------------
// Test SAKLANMAZ, yayınlı çekirdeklerden TÜRETİLİR — yani checkpoint kararından
// ÖNCE yazılmış seviyeler için de kendiliğinden çalışması gerekir. B1 tam olarak
// böyle bir seviye: karar A1 yazılırken alındı, B1 zaten üretilmişti. Bu bölüm
// o sözün her ünitede tutulduğunu sınar; tek üniteye bakmak yanıltıcıydı.
console.log("\n=== TÜM SEVİYELER, TÜM ÜNİTELER ===");
const levels = await sql<{ level: string }[]>`
  select distinct cl.level from lesson_cores lc
  join catalog_lessons cl on cl.id = lc.catalog_lesson_id
  where lc.status = 'published' and cl.id not like 'zz-%' order by 1`;

for (const { level } of levels) {
  const units = await sql<{ u: number }[]>`
    select distinct unit_index u from catalog_lessons
    where level = ${level} and status = 'active' and id not like 'zz-%' order by 1`;
  const problems: string[] = [];
  let seen = 0;
  for (const { u } of units) {
    const ids = await sql<{ id: string; published: number }[]>`
      select cl.id, (select count(*)::int from lesson_cores lc
                     where lc.catalog_lesson_id = cl.id and lc.status = 'published') published
      from catalog_lessons cl
      where cl.level = ${level} and cl.unit_index = ${u} and cl.status = 'active'`;
    // YARIM ÜNİTE ATLANIR. Testi 8 maddeye doldurmak için ünitenin dersleri
    // yayında olmalı; henüz yazılmamış bir seviyede bu bir hata değil, rotanın
    // 409 dönmesi ve ekranın "henüz hazır değil" demesi doğru davranıştır.
    if (ids.some((r) => r.published === 0)) continue;
    const own = new Set(ids.map((r) => r.id));
    let built: Awaited<ReturnType<typeof buildCheckpoint>>;
    try {
      built = await buildCheckpoint({ level: level as never, unitIndex: u, nativeLanguage: "tr", tutorLanguage: "native" });
    } catch (err) {
      problems.push(`Ü${u} derlenemedi (${String(err)})`);
      continue;
    }
    if (built.items.length !== CHECKPOINT_ITEM_COUNT) problems.push(`Ü${u} ${built.items.length} madde`);
    for (const it of built.items) {
      seen++;
      if (!own.has(it.lessonId)) problems.push(`Ü${u} başka ünitenin dersi: ${it.lessonId}`);
      if (it.kind === "order") {
        if (it.answer.length < ORDER_MIN_WORDS || it.answer.length > ORDER_MAX_WORDS) {
          problems.push(`Ü${u} order ${it.answer.length} kelime`);
        }
        if (/[.!?]["']?$/.test(it.answer.slice(0, -1).join(" "))) problems.push(`Ü${u} order iki cümle`);
      } else if (new Set(it.options.map((o) => o.trim().toLowerCase())).size !== it.options.length) {
        problems.push(`Ü${u} ${it.kind} tekrar eden şık`);
      }
    }
  }
  check(`${level}: ${units.length} ünitenin hepsi geçerli test derliyor`, problems.length === 0,
    problems.length ? [...new Set(problems)].slice(0, 3).join(" | ") : `${seen} madde`);
}

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

// --- Yayın kapısı ------------------------------------------------------------
// ESKİ HÂLİ BAYATLADI: kapı "C2 yayınsızdır" varsayımına sabitlenmişti ve C2
// yayınlanınca yanlış alarm verdi. Külliyat tamamlandığı için artık yayınsız
// seviye YOK — o yüzden kapı gerçek bir ünitenin çekirdeklerini GEÇİCİ olarak
// yayından düşürerek sınanıyor. Bu, `status = 'published'` süzgecini doğrudan
// ölçer: süzgeç düşseydi ikinci adım da geçerdi. `finally` her hâlde geri yazar.
console.log("\n=== YAYIN KAPISI ===");
const GATE_LEVEL = "C2";
const GATE_UNIT = 1;
const gateRows = await db
  .select({ id: lessonCores.id })
  .from(lessonCores)
  .innerJoin(
    catalogLessons,
    and(eq(catalogLessons.id, lessonCores.catalogLessonId), eq(catalogLessons.specHash, lessonCores.specHash)),
  )
  .where(
    and(
      eq(catalogLessons.level, GATE_LEVEL),
      eq(catalogLessons.unitIndex, GATE_UNIT),
      eq(catalogLessons.status, "active"),
      eq(lessonCores.status, "published"),
      not(like(catalogLessons.id, "zz-%")),
    ),
  );
const gateIds = gateRows.map((r) => r.id);
check("kapı sınaması için yayınlı çekirdek bulundu", gateIds.length > 0, `${gateIds.length} çekirdek`);

try {
  await db.update(lessonCores).set({ status: "ready" }).where(inArray(lessonCores.id, gateIds));
  try {
    await buildCheckpoint({ level: GATE_LEVEL, unitIndex: GATE_UNIT, nativeLanguage: "tr", tutorLanguage: "native" });
    check("yayından düşen ünite test derlemiyor", false, "hata bekleniyordu");
  } catch (err) {
    check("yayından düşen ünite test derlemiyor",
      err instanceof CheckpointError && err.code === "not_enough_items", String(err));
  }
} finally {
  await db.update(lessonCores).set({ status: "published" }).where(inArray(lessonCores.id, gateIds));
}

// Geri yazıldıktan sonra YİNE derlemeli — aksi hâlde ilk adım "satır yok"u
// ölçmüş olurdu, "yayınsız"ı değil.
try {
  const back = await buildCheckpoint({ level: GATE_LEVEL, unitIndex: GATE_UNIT, nativeLanguage: "tr", tutorLanguage: "native" });
  check("yayına dönünce yine derliyor", back.items.length > 0, `${back.items.length} madde`);
} catch (err) {
  check("yayına dönünce yine derliyor", false, String(err));
}

// Fixture birimi servis edilmemeli: rota unitIndex'i 99'a kadar kabul ediyor ve
// fixture tam 99'da duruyor (koruma checkpoint.ts'e bu turda eklendi).
const fixture = await seedTestCatalogLesson({ level: GATE_LEVEL });
try {
  await buildCheckpoint({ level: GATE_LEVEL, unitIndex: 99, nativeLanguage: "tr", tutorLanguage: "native" });
  check("fixture ünitesi servis edilmiyor", false, "hata bekleniyordu");
} catch (err) {
  check("fixture ünitesi servis edilmiyor",
    err instanceof CheckpointError && err.code === "unit_not_found", String(err));
} finally {
  // FIXTURE ARDINDA BIRAKILMAZ. İlk sürüm bırakıyordu ve `warm-locales` onu
  // gerçek ders sanıp iki PARALI dil paketi üretti (C2'de 130 yerine 132).
  // Tüketicilere koruma eklendi, ama asıl düzeltme çöpü hiç bırakmamak.
  await db.delete(lessonLocales).where(
    inArray(lessonLocales.coreId,
      db.select({ id: lessonCores.id }).from(lessonCores).where(eq(lessonCores.catalogLessonId, fixture.id))),
  );
  await db.delete(lessonSceneSets).where(
    inArray(lessonSceneSets.coreId,
      db.select({ id: lessonCores.id }).from(lessonCores).where(eq(lessonCores.catalogLessonId, fixture.id))),
  );
  await db.delete(lessonCores).where(eq(lessonCores.catalogLessonId, fixture.id));
  await db.delete(catalogLessons).where(eq(catalogLessons.id, fixture.id));
}

await sql.end();
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
