/**
 * Admin `saveCore` / `publishLesson` doğruluk tablosu — fixture (`zz-`) dersinde,
 * LLM'siz. Gerçek DB'ye yazar ama yalnız test satırlarına.
 *   set -a; source .env; set +a; npx tsx scripts/test-admin-save-core.ts
 */
import assert from "node:assert/strict";
import { lessonCoreSchema, type LessonCore } from "@glotmate/contracts";
import { and, eq } from "drizzle-orm";
import { db, sql } from "../src/db/client.js";
import { lessonCores, lessonLocales } from "../src/db/schema.js";
import { getAdminLessonDetail } from "../src/modules/admin/queries.js";
import { AdminActionError, publishLesson, saveCore } from "../src/modules/admin/service.js";
import { seedTestCatalogLesson } from "./_fixture.js";

const cat = await seedTestCatalogLesson({ level: "A2", kind: "grammar" });
const id = cat.id;

// Elle yazılmış geçerli bir çekirdek — mustUse KASTEN yanlış: kod katalogdan dayatmalı
const core: LessonCore = lessonCoreSchema.parse({
  coreFormat: 1,
  topic: "Talking about what you did yesterday",
  focus: "Past simple: I did it",
  objectives: ["Say what you did yesterday.", "Ask a friend what they did."],
  communicationGoal: "Tell a friend about your day using the past simple.",
  estMinutes: 6,
  tutorNotes: { target: "past simple with did", correctionStyle: "recast gently" },
  summary: "Use did for finished actions in the past.",
  lecture: {
    beats: [
      { id: "b1", kind: "ask", purpose: "readiness", intent: "greet, name the topic, ask if ready to start" },
      {
        id: "b2",
        kind: "teach",
        introIntent: "announce that the explanation follows",
        points: [
          {
            id: "p1",
            formEn: "I did it",
            claimsEn: ["Use did for finished actions in the past."],
            examples: [{ id: "e1", textEn: "Yesterday I did my homework." }],
          },
        ],
      },
      { id: "b3", kind: "ask", purpose: "questions", intent: "invite any question before the exercises" },
      { id: "b4", kind: "say", intent: "acknowledge and announce that a few questions follow" },
      {
        id: "b5",
        kind: "exercise",
        format: "fill_blank",
        item: "Yesterday I ___ it.",
        answerSpec: { kind: "token", accepted: ["did"] },
        exampleAnswer: "did",
      },
      {
        id: "b6",
        kind: "exercise",
        format: "mcq",
        item: "Which sentence is correct?",
        options: ["I did it yesterday.", "I do it yesterday."],
        answerSpec: { kind: "choice", correctIndex: 0 },
        exampleAnswer: "I did it yesterday.",
      },
    ],
  },
  practice: { mustUse: ["WRONG PHRASE"], minTargetUses: 2, successCriteria: "Uses the past simple twice.", maxTurns: 6 },
});

// (a) kuru koşu yazmaz
const before = await db.select({ id: lessonCores.id }).from(lessonCores).where(eq(lessonCores.catalogLessonId, id));
const dry = await saveCore(id, core, { dry: true });
assert.equal(dry.detail, null, "dry detail yok");
const afterDry = await db.select({ id: lessonCores.id }).from(lessonCores).where(eq(lessonCores.catalogLessonId, id));
assert.equal(afterDry.length, before.length, "dry koşu satır yazmadı");

// (b) lint hatası → 422 kodu + rapor (iddia Türkçe karakter → ASCII lint düşer)
const bad = { ...core, summary: "Geçmiş zaman özeti" };
await assert.rejects(
  () => saveCore(id, bad, { dry: true }),
  (e: unknown) => e instanceof AdminActionError && e.code === "lint_failed" && (e.report?.errors.length ?? 0) > 0,
  "lint_failed bekleniyordu",
);

// (c) gerçek kayıt → ready, model authored/admin, mustUse katalogdan
const saved = await saveCore(id, core, { dry: false });
assert.equal(saved.detail?.core?.status, "ready");
assert.equal(saved.detail?.core?.model, "authored/admin");
assert.deepEqual(saved.detail?.core?.core?.practice.mustUse, cat.targetPhrases, "mustUse katalogdan dayatıldı");

// (d) yayın: sahne seti yoksa layer_not_ready
await assert.rejects(
  () => publishLesson(id),
  (e: unknown) => e instanceof AdminActionError && e.code === "layer_not_ready",
  "sahne yokken yayın reddedilmeli",
);

// (e) detay ucu fixture dersini açar
const detail = await getAdminLessonDetail(id);
assert.equal(detail.lesson.id, id);
assert.equal(detail.core?.core?.topic, core.topic);

// temizlik: test çekirdeğinin dil paketleri (varsa) ve çekirdek
const coreId = saved.detail!.core!.id;
await db.delete(lessonLocales).where(eq(lessonLocales.coreId, coreId));
await db.delete(lessonCores).where(and(eq(lessonCores.id, coreId), eq(lessonCores.model, "authored/admin")));

console.log("✅ admin saveCore/publish: tüm vakalar geçti");
await sql.end();
