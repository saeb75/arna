/**
 * DERS DEVAM (RESUME) UÇTAN UCA — servis katmanı üzerinden, LLM'SİZ ve bedava:
 * İngilizce tutor modu + hafızasız taze kullanıcı → openSession selamlamayı
 * şablondan kurar, dil paketi gerekmez, chat turu hiç atılmaz (sync yeter).
 *
 *   npx tsx scripts/e2e-resume.ts
 *
 * Sınadığı sözleşme maddeleri:
 *   · openSession: sessionKind='lesson', önceki açık oturumu OTOMATİK terk eder
 *   · pozisyon yokken resume=null (karttan öteye geçilmemiş oturum sürdürülmez)
 *   · sync: pozisyon ayrı kolonda; turns source='script' + runs ile yazılır
 *   · resume: pozisyon + script + pinli içerik + transkript (id sıralı) döner
 *   · end{abandoned}: lesson_progress İN_PROGRESS KALIR (ders tamamlanmaz)
 *   · end (default): completed — mevcut davranış birebir
 */
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../src/db/client.js";
import { catalogLessons, lessonProgress, sessions, transcriptTurns } from "../src/db/schema.js";
import { endSession, openSession, resumeLesson, syncSession } from "../src/modules/session/service.js";
import { cleanupTestUser, seedTestProfile } from "./_fixture.js";

const USER = "00000000-0000-4000-8000-0000000000d7";

let fail = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fail++;
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
};

// Gerçek yayınlı bir A1 dersi (fixture içerik değil — resolveLesson yayın kapısından geçmeli)
const [lessonRow] = await db
  .select({ id: catalogLessons.id, level: catalogLessons.level })
  .from(catalogLessons)
  .where(eq(catalogLessons.level, "A1"))
  .orderBy(asc(catalogLessons.position))
  .limit(1);
if (!lessonRow) throw new Error("A1 katalog dersi yok — seed koşulmamış");
const LESSON = lessonRow.id;

try {
  await seedTestProfile({ userId: USER, displayName: "Deniz", cefrLevel: "A1", tutorLanguage: "english" });

  console.log(`\n=== AÇILIŞ (${LESSON}) ===`);
  const s1 = await openSession(USER, LESSON);
  const [row1] = await db.select().from(sessions).where(eq(sessions.id, s1.sessionId));
  check("sessionKind='lesson'", row1?.sessionKind === "lesson");
  const [prog1] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, USER), eq(lessonProgress.catalogLessonId, LESSON)));
  check("progress in_progress, sessionCount=1", prog1?.status === "in_progress" && prog1.sessionCount === 1);

  const r0 = await resumeLesson(USER, LESSON);
  check("pozisyon yokken resume=null", r0.resume === null);

  console.log("\n=== SYNC (pozisyon + script satırları) ===");
  const beat2 = s1.lesson.lecture.beats[1];
  await syncSession(USER, s1.sessionId, {
    position: {
      phase: "lecture",
      beatId: beat2?.id ?? null,
      beatIndex: 1,
      awaiting: "exercise",
      beatExchanges: 1,
      invites: 0,
      attempt: 1,
      practiceTurn: 0,
      praiseIndex: 2,
    },
    turns: [
      { role: "assistant", text: "Hello! Are you ready to start?", runs: [{ lang: "en", text: "Hello! Are you ready to start?" }], phase: "lecture" },
      { role: "user", text: "yes I am ready", phase: "lecture" },
    ],
  });

  const r1 = await resumeLesson(USER, LESSON);
  check("resume dolu", r1.resume !== null);
  check("pozisyon birebir (attempt=1, beatIndex=1, awaiting=exercise)",
    r1.resume?.position.attempt === 1 && r1.resume?.position.beatIndex === 1 && r1.resume?.position.awaiting === "exercise");
  check("script resume'da", (r1.resume?.script.praise.length ?? 0) >= 2);
  check("pinli içerik derlendi", (r1.resume?.lesson.lecture.beats.length ?? 0) > 0);
  const tr = r1.resume?.transcript ?? [];
  check("transkript 2 satır, source='script', runs dolu",
    tr.length === 2 && tr.every((t) => t.source === "script") && tr[0]?.runs !== null && tr[1]?.runs === null,
    JSON.stringify(tr.map((t) => [t.role, t.source])));

  console.log("\n=== YENİDEN AÇMA — eski açık oturum otomatik terk edilir ===");
  const s2 = await openSession(USER, LESSON);
  const [row1After] = await db.select().from(sessions).where(eq(sessions.id, s1.sessionId));
  check("eski oturum kapandı (endedAt dolu)", row1After?.endedAt !== null);
  const openRows = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(and(eq(sessions.userId, USER), eq(sessions.catalogLessonId, LESSON), isNull(sessions.endedAt)));
  check("tek açık oturum var", openRows.length === 1 && openRows[0]?.id === s2.sessionId);
  const [prog2] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, USER), eq(lessonProgress.catalogLessonId, LESSON)));
  check("progress hâlâ in_progress, sessionCount=2", prog2?.status === "in_progress" && prog2.sessionCount === 2);

  console.log("\n=== TERK ETME (Baştan başla yolu) ===");
  await endSession(USER, s2.sessionId, "abandoned");
  const [prog3] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, USER), eq(lessonProgress.catalogLessonId, LESSON)));
  check("abandoned: progress İN_PROGRESS KALDI", prog3?.status === "in_progress");
  const r2 = await resumeLesson(USER, LESSON);
  check("açık oturum kalmadı → resume=null", r2.resume === null);

  console.log("\n=== NORMAL BİTİRME (mevcut davranış) ===");
  const s3 = await openSession(USER, LESSON);
  await endSession(USER, s3.sessionId);
  const [prog4] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, USER), eq(lessonProgress.catalogLessonId, LESSON)));
  check("default end: completed", prog4?.status === "completed");

  console.log(fail === 0 ? "\n✅ e2e-resume: tümü geçti" : `\n❌ e2e-resume: ${fail} başarısız`);
} finally {
  // transcript_turns sessions cascade'iyle gider; profil+oturum+ilerleme temizliği:
  await cleanupTestUser(USER);
}
if (fail > 0) process.exit(1);
process.exit(0);
