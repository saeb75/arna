/**
 * ROLEPLAY UÇTAN UCA — servis katmanı üzerinden, tarayıcısız. GERÇEK LLM çağrıları
 * (~3-4 sohbet turu + 1 debrief ≈ birkaç sent). İsteğe bağlı koşulur, CI'da değil.
 *
 *   npx tsx scripts/e2e-roleplay.ts
 *
 * Sınadığı sözleşme maddeleri:
 *   · oturum açılışı LLM'siz, CHECK kısıtına uygun şekil, deneme satırı bire bir
 *   · chatTurn roleplay dalına delege ediyor; segmentDone HER ZAMAN false
 *   · İPTAL VAKASI: sipariş tiki iptalden sonra DURUYOR
 *   · lesson_progress'e SIFIR yazma
 *   · debrief: hedef özeti + koçluk; hafıza çıkarımı roleplay'i tanıyor
 *   · denetim izi: objective_hits'te turnIndex/evidence/detectorVersion dolu
 */
import { and, eq } from "drizzle-orm";
import { db } from "../src/db/client.js";
import { lessonProgress, roleplayAttempts, sessions } from "../src/db/schema.js";
import { extractSessionMemory } from "../src/modules/memory/extract.js";
import { chatTurn, endSession } from "../src/modules/session/service.js";
import { openRoleplaySession } from "../src/modules/roleplay/service.js";
import { cleanupTestUser, seedTestProfile } from "./_fixture.js";

const USER = "00000000-0000-4000-8000-0000000000c1";
const SLUG = "rp-restaurant-order";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

await seedTestProfile({ userId: USER, displayName: "Deniz", cefrLevel: "A1", tutorLanguage: "english" });

console.log("\n=== AÇILIŞ ===");
const brief = await openRoleplaySession(USER, SLUG);
check("brief döndü, açılış spec'ten", brief.opening.endsWith("?"), brief.opening);
check("A1'de 4 aktif hedef", brief.objectives.length === 4, `${brief.objectives.length}`);
check("A1'de yükseltme yok", !brief.raised && brief.playedLevel === "A1");

const [sessRow] = await db.select().from(sessions).where(eq(sessions.id, brief.sessionId));
check("session_kind='roleplay' + katalog NULL (CHECK şekli)",
  sessRow?.sessionKind === "roleplay" && sessRow.catalogLessonId === null && sessRow.roleplayRevisionId !== null);

console.log("\n=== SOHBET (gerçek LLM) ===");
const t1 = await chatTurn(USER, brief.sessionId, "Good evening. A table for two, please.");
check("tur 1: segmentDone false", t1.segmentDone === false);
check("tur 1: progress alanı dolu", !!t1.progress, JSON.stringify(t1.progress));
const t1Table = t1.newHits?.some((h) => h.objectiveId === "ask-for-table") ?? false;
check("tur 1: masa isteme tiklendi", t1Table, JSON.stringify(t1.newHits));

const t2 = await chatTurn(USER, brief.sessionId, "I'll have the pasta, please.");
const t2Main = t2.newHits?.some((h) => h.objectiveId === "order-main") ?? false;
check("tur 2: sipariş tiklendi", t2Main, JSON.stringify(t2.newHits));

// --- İPTAL VAKASI — sözleşmenin en tartışmalı maddesi ------------------------
const t3 = await chatTurn(USER, brief.sessionId, "Actually, cancel that. I don't want any food.");
check("tur 3: segmentDone hâlâ false", t3.segmentDone === false);
const doneAfterCancel = t3.progress?.done ?? -1;
check("İPTAL: sipariş tiki DURUYOR (progress geri düşmedi)",
  doneAfterCancel >= (t2.progress?.done ?? 99), `iptal sonrası ${doneAfterCancel}`);

console.log("\n=== DENETİM İZİ ===");
const [attempt] = await db.select().from(roleplayAttempts).where(eq(roleplayAttempts.sessionId, brief.sessionId));
const hits = (attempt?.objectiveHits as Array<Record<string, unknown>>) ?? [];
check("objective_hits dolu", hits.length >= 1, `${hits.length} tik`);
check("her tik turnIndex + evidence + detectorVersion taşıyor",
  hits.every((h) => typeof h.turnIndex === "number" && typeof h.evidence === "string" && typeof h.detectorVersion === "string"));

console.log("\n=== KAPANIŞ + DEBRIEF ===");
const end = await endSession(USER, brief.sessionId);
check("debrief döndü", !!end.debrief);
check("debrief hedef özeti tam liste", (end.debrief?.objectives.length ?? 0) === 4);
check("koçluk ≤ 3 madde", (end.debrief?.coaching.length ?? 0) <= 3, `${end.debrief?.coaching.length}`);

const progressRows = await db.select().from(lessonProgress).where(eq(lessonProgress.userId, USER));
check("lesson_progress'e SIFIR yazma", progressRows.length === 0, `${progressRows.length} satır`);

console.log("\n=== HAFIZA ===");
const mem = await extractSessionMemory(brief.sessionId);
check("hafıza çıkarımı roleplay'i tanıyor (no_lesson DEĞİL)", mem.status !== "no_lesson", mem.status);

await cleanupTestUser(USER);
console.log(`\n${fail === 0 ? "✅ hepsi geçti" : `❌ ${fail} başarısız`}`);
process.exit(fail === 0 ? 0 : 1);
