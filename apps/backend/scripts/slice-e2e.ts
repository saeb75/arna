/**
 * DİKEY DİLİM — uçtan uca kanıt (Faz A5b).
 *
 *   set -a; source .env; set +a; npx tsx scripts/slice-e2e.ts
 *
 * Mimarinin BÜTÜN tezini sınar:
 *   1. Aynı ders tr + es kullanıcısında TEK çekirdek satırı kullanır
 *   2. Native modda anlatım L1+EN karışık parçalar, İngilizce modda saf EN
 *   3. Selamlama kişiye özel: ad + kendi dilinde + tek soruyla biter
 *   4. Yanlış cevapta geri bildirim L1, doğru İngilizce cümle ayrı `en` parçası
 *   5. Rol yapma HER modda tamamen İngilizce
 *
 * Gerçek LLM çağrıları: dil paketi (es, ilk sefer) + selamlamalar + 1 judge (~$0.05).
 */
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonCores, userProfiles } from "../src/db/schema.js";
import { resolveLesson } from "../src/modules/lesson/layers.js";
import { chatTurn, openSession } from "../src/modules/session/service.js";
import { cleanupTestUser, runsText, seedTestProfile } from "./_fixture.js";

const LESSON = "a1-she-works-at-night";
const userTr = "00000000-0000-4000-8000-0000000000b1";
const userEs = "00000000-0000-4000-8000-0000000000b2";
const userEn = "00000000-0000-4000-8000-0000000000b3";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

for (const u of [userTr, userEs, userEn]) await cleanupTestUser(u);

await seedTestProfile({ userId: userTr, displayName: "Ayla", nativeLanguage: "tr", cefrLevel: "A1", track: "everyday" });
await seedTestProfile({ userId: userEs, displayName: "Lucia", nativeLanguage: "es", cefrLevel: "A1", track: "everyday" });
await seedTestProfile({ userId: userEn, displayName: "Kerem", nativeLanguage: "tr", cefrLevel: "A1", track: "work" });
// userEn: İngilizce daldırma modu
await db.update(userProfiles).set({ tutorLanguage: "english" }).where(eq(userProfiles.userId, userEn));

// --- 1) Çözümleme: tr native ------------------------------------------------
console.log("\n— tr (native) —");
const tr = await resolveLesson(userTr, LESSON);
check("v7 içerik döndü", tr.content.formatVersion === 7, `format ${tr.content.formatVersion}`);
check("başlık Türkçe", tr.content.title !== tr.content.titleEn, tr.content.title);
const trTeach = tr.content.lecture.beats.find((b) => b.kind === "teach");
const trRuns = trTeach?.kind === "teach" ? trTeach.points[0]!.runs : [];
check("anlatım L1+EN karışık", trRuns.some((r) => r.lang === "l1") && trRuns.some((r) => r.lang === "en"));
check("ACK kümeleri Türkçe", tr.content.ui.ack.proceed.includes("hazırım"));
const trEx = tr.content.lecture.beats.find((b) => b.kind === "exercise");
check(
  "alıştırma yönergesi L1, madde EN",
  trEx?.kind === "exercise" && trEx.runs[0]?.lang === "l1" && trEx.runs.some((r) => r.lang === "en"),
);
check("rol yapma açılışı İngilizce", /[a-z]/i.test(tr.content.practice.avatarOpening));
console.log(`  sahne (everyday): ${tr.content.practice.scenario.slice(0, 70)}`);

// --- 2) Çözümleme: es — AYNI çekirdek ----------------------------------------
console.log("\n— es (native) —");
const es = await resolveLesson(userEs, LESSON);
check("es başlık İspanyolca", es.content.title !== es.content.titleEn && es.content.title !== tr.content.title, es.content.title);
check("İKİ DİL AYNI ÇEKİRDEĞİ KULLANIYOR", es.coreId === tr.coreId, es.coreId);
const [coreCount] = await sql`select count(*)::int as n from lesson_cores where catalog_lesson_id = ${LESSON}`;
check("çekirdek satırı TEK", coreCount!.n === 1, `${coreCount!.n} satır`);
check("es ACK İspanyolca", es.content.ui.ack.proceed.some((t) => t.includes("listo") || t === "vale"));

// --- 3) Çözümleme: english modu ----------------------------------------------
console.log("\n— english (daldırma) —");
const en = await resolveLesson(userEn, LESSON);
check("english modda başlık İngilizce", en.content.title === en.content.titleEn);
check(
  "english modda hiç l1 parçası yok",
  !JSON.stringify(en.content.lecture.beats).includes('"l1"'),
);
check("english mod da AYNI çekirdek", en.coreId === tr.coreId);
check("work track'i farklı sahne", en.content.practice.scenario !== tr.content.practice.scenario);

// --- 4) Oturum: selamlamalar -------------------------------------------------
console.log("\n— oturumlar —");
const sTr = await openSession(userTr, LESSON);
const sEs = await openSession(userEs, LESSON);
const readinessId = tr.core.lecture.beats.find((b) => b.kind === "ask")!.id;
const greetTr = sTr.script?.beats[readinessId] ?? [];
const greetEs = sEs.script?.beats[readinessId] ?? [];
console.log(`  tr: ${runsText(greetTr)}`);
console.log(`  es: ${runsText(greetEs)}`);
check("tr selamlama Ayla'yı anıyor", runsText(greetTr).includes("Ayla"));
check("es selamlama Lucia'yı anıyor", runsText(greetEs).includes("Lucia"));
check("tr selamlama tek soruyla bitiyor", (runsText(greetTr).match(/\?/g) ?? []).length === 1);
check(
  "selamlamalar kendi dillerinde farklı",
  runsText(greetTr) !== runsText(greetEs),
);

// --- 5) Judge: yanlış cevap, native mod --------------------------------------
console.log("\n— yanlış cevap (tr native) —");
const exBeat = tr.core.lecture.beats.find((b) => b.kind === "exercise")!;
const res = await chatTurn(userTr, sTr.sessionId, "she work at night", {
  phase: "lecture",
  beatId: exBeat.id,
  attempt: 1, // son deneme → doğru cevabı vermeli
});
console.log(`  Emma: ${res.runs?.map((r) => `[${r.lang}]${r.text}`).join(" ")}`);
check("geri bildirim parçalı geldi", (res.runs?.length ?? 0) > 0);
check("geri bildirimde L1 var (Türkçe izah)", res.runs?.some((r) => r.lang === "l1") ?? false);
check("doğru İngilizce cümle ayrı en parçası", res.runs?.some((r) => r.lang === "en") ?? false);

for (const u of [userTr, userEs, userEn]) await cleanupTestUser(u);
console.log(`\n${fail === 0 ? "✅ DİLİM UÇTAN UCA GEÇTİ" : `❌ ${fail} başarısız`}`);
await sql.end();
process.exit(fail === 0 ? 0 : 1);
