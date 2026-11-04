/**
 * TABAN ÇİZGİSİ TARAMASI — gerçek ders transkriptlerinde: hoca öğrencinin sözüne
 * cevap verdi mi, dersin ipini tuttu mu, bağlamı korudu mu, dil politikasına uydu mu?
 *
 *   cd apps/backend && set -a && source .env && set +a && npx tsx scripts/grade-transcripts.ts
 *   seçenekler: --min-user=2 --since=2026-09-01 --split=2026-11-03 --grader=gpt-6.1-sol
 *               --concurrency=4 --limit=200 --out=<dizin>
 *
 * NEDEN (3 Kas 2026 ders motoru denetimi): hataların hangi sınıfta ve hangi
 * KAYNAKTAN çıktığını gerçek veriyle görmek. Değerlendirici yalnız SEMPTOMU
 * işaretler; sorunlu hoca satırının kaynağını (transcript_turns.source:
 * script = istemcinin oynattığı şablon/içerik satırı, chat = canlı LLM) KOD sayar.
 *
 * SINIR: DB'deki ders oturumları çoğunlukla kısa geliştirici testleridir ve büyük
 * kısmı 3 Kas yeniden yazımından öncedir — oranlar kesin değildir, sınıflar ve
 * örnekler kanıttır. Söz kesmede (barge-in) sessiz geçen satırlar transkriptte
 * normal satır gibi görünür; ayırt edilemez.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { sql } from "../src/db/client.js";
import { languageName } from "../src/lib/language.js";
import { generateJson } from "../src/modules/llm/generate.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
) as Record<string, string>;

const MIN_USER = Number(args["min-user"] ?? 2);
const SINCE = args.since ?? "1970-01-01";
const SPLIT = args.split ?? "2026-11-03";
const GRADER = args.grader ?? "gpt-6.1-sol";
const CONCURRENCY = Number(args.concurrency ?? 4);
const LIMIT = Number(args.limit ?? 200);
const STAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = args.out ?? join(tmpdir(), "glotmate-transcript-grades");

interface SessionRow {
  id: string;
  started_at: Date;
  catalog_lesson_id: string | null;
  tutor_language: string | null;
  title: string | null;
  focus: string | null;
  level: string | null;
  native_language: string | null;
}

interface Turn {
  n: number;
  role: "user" | "assistant";
  text: string;
  phase: string | null;
  source: string;
}

const verdictSchema = z.object({
  exchanges: z.array(
    z.object({
      student: z.number().int(),
      addressed: z.boolean(),
      onTrack: z.boolean(),
      contextOk: z.boolean(),
      languageOk: z.boolean(),
      culprit: z.number().int().nullable(),
      issue: z.string().max(300).default(""),
    }),
  ),
  note: z.string().max(500).default(""),
});
type Verdict = z.infer<typeof verdictSchema>;

function graderSystem(s: SessionRow): string {
  const l1 = s.native_language ? languageName(s.native_language) : "unknown (infer it from the transcript)";
  const mode =
    s.tutor_language === "english"
      ? `english — the tutor speaks simple English throughout`
      : `native — the tutor explains and gives feedback in the student's language (${l1}); taught English material (examples, corrected sentences) stays English; role play is always English`;
  return [
    `You audit transcripts of a VOICE English lesson app. TUTOR is "Emma", an AI English teacher; STUDENT is a learner speaking through speech recognition (so recognition errors are possible).`,
    `Tutor lines tagged [script] are fixed lines the app played on its own (greeting, explanations, exercise prompts, praise, transitions, closing). Lines tagged [chat] were generated live by an AI right after the student's message.`,
    ``,
    `Lesson: ${s.title ?? s.catalog_lesson_id ?? "?"} — ${s.focus ?? "?"} (${s.level ?? "?"}).`,
    `Tutor language mode: ${mode}.`,
    ``,
    `For EVERY student line (#n), judge the tutor's REACTION = the tutor lines after it, up to the next student line.`,
    `- addressed: false if the reaction ignores what the student actually said, or answers as if they had said something else (a question that is never answered, an answer that is never reacted to, a remark the tutor talks past). A brief acknowledgement before moving on counts only if it fits what they said. If no tutor line follows, addressed=false and issue "no reply".`,
    `- onTrack: false if the tutor loses the lesson thread: jumps to unrelated content, invents a different task, restarts or re-introduces the lesson, or fails to steer an off-topic student back.`,
    `- contextOk: false if the tutor contradicts or forgets what happened earlier in this transcript: greets again, asks something already answered, praises right after the student failed, says the student did great when they did not, repeats the same fixed line awkwardly.`,
    `- languageOk: false if the reaction breaks the language mode above.`,
    `- culprit: the # of the first tutor line that causes a problem (null if none or if there is no reply).`,
    `- issue: one short sentence naming the problem ("" if none).`,
    `Judge only what a real user would notice. Never penalize the student. Do not grade teaching quality beyond these four checks.`,
    ``,
    `Return STRICT JSON: {"exchanges":[{"student":n,"addressed":true,"onTrack":true,"contextOk":true,"languageOk":true,"culprit":null,"issue":""}],"note":"one sentence on the session overall"}`,
  ].join("\n");
}

function renderTranscript(turns: Turn[]): string {
  return turns
    .map((t) =>
      t.role === "user"
        ? `#${t.n} STUDENT [${t.phase ?? "-"}]: ${JSON.stringify(t.text.slice(0, 400))}`
        : `#${t.n} TUTOR [${t.source} · ${t.phase ?? "-"}]: ${JSON.stringify(t.text.slice(0, 400))}`,
    )
    .join("\n");
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]!);
      }
    }),
  );
  return out;
}

const pct = (k: number, n: number) => (n ? `${((100 * k) / n).toFixed(0)}% (${k}/${n})` : "—");

async function main() {
  const sessions = (await sql`
    select s.id, s.started_at, s.catalog_lesson_id, s.state->>'tutorLanguage' as tutor_language,
           c.title, c.focus, c.level, up.native_language
    from sessions s
    left join catalog_lessons c on c.id = s.catalog_lesson_id
    left join user_profiles up on up.user_id = s.user_id
    where s.session_kind = 'lesson'
      and s.started_at >= ${SINCE}::timestamptz
      and (select count(*) from transcript_turns t where t.session_id = s.id and t.role = 'user') >= ${MIN_USER}
    order by s.started_at desc
    limit ${LIMIT}
  `) as unknown as SessionRow[];
  // Sürücü ayarına göre timestamptz metin gelebilir — tek tipe çek
  for (const s of sessions) s.started_at = new Date(s.started_at);
  console.log(`oturum: ${sessions.length} (öğrenci sözü ≥ ${MIN_USER}, ${SINCE} sonrası) · değerlendirici: ${GRADER}`);

  const results = await pool(sessions, CONCURRENCY, async (s) => {
    const rows = (await sql`
      select role, text, phase, source from transcript_turns
      where session_id = ${s.id} order by created_at, id
    `) as unknown as Array<Omit<Turn, "n">>;
    const turns: Turn[] = rows.map((r, i) => ({ ...r, n: i + 1 }));
    try {
      const verdict: Verdict = await generateJson({
        model: GRADER,
        system: graderSystem(s),
        user: `TRANSCRIPT:\n${renderTranscript(turns)}`,
        schema: verdictSchema,
        maxTokens: 6000,
        temperature: 0,
      });
      process.stdout.write(".");
      return { session: s, turns, verdict, error: null as string | null };
    } catch (err) {
      process.stdout.write("x");
      return { session: s, turns, verdict: null, error: err instanceof Error ? err.message : String(err) };
    }
  });
  process.stdout.write("\n");
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) console.warn(`ilk değerlendirici hatası: ${firstError.slice(0, 400)}`);

  // --- toplama ---
  type Ex = Verdict["exchanges"][number] & { session: SessionRow; turns: Turn[]; era: "önce" | "sonra" };
  const exchanges: Ex[] = [];
  let structuralNoReply = 0;
  let trailing = 0;
  let studentLines = 0;
  for (const r of results) {
    const era = r.session.started_at.toISOString().slice(0, 10) < SPLIT ? "önce" : "sonra";
    r.turns.forEach((t, i) => {
      if (t.role !== "user") return;
      studentLines++;
      const next = r.turns[i + 1];
      if (!next) trailing++;
      else if (next.role === "user") structuralNoReply++;
    });
    if (!r.verdict) continue;
    const studentNs = new Set(r.turns.filter((t) => t.role === "user").map((t) => t.n));
    for (const e of r.verdict.exchanges) {
      if (!studentNs.has(e.student)) continue; // uydurma satır numarası sayılmaz
      exchanges.push({ ...e, session: r.session, turns: r.turns, era });
    }
  }

  const problem = (e: Ex) => !e.addressed || !e.onTrack || !e.contextOk || !e.languageOk;
  const metric = (label: string, f: (e: Ex) => boolean) => {
    const cell = (xs: Ex[]) => pct(xs.filter(f).length, xs.length);
    return `| ${label} | ${cell(exchanges)} | ${cell(exchanges.filter((e) => e.era === "önce"))} | ${cell(exchanges.filter((e) => e.era === "sonra"))} |`;
  };

  const problems = exchanges.filter(problem);
  const sourceCount = new Map<string, number>();
  const phaseCount = new Map<string, number>();
  for (const e of problems) {
    const culprit = e.culprit != null ? e.turns.find((t) => t.n === e.culprit && t.role === "assistant") : undefined;
    const key = culprit ? culprit.source : e.issue.toLowerCase().includes("no reply") ? "cevap yok" : "belirsiz";
    sourceCount.set(key, (sourceCount.get(key) ?? 0) + 1);
    const ph = e.turns.find((t) => t.n === e.student)?.phase ?? "-";
    phaseCount.set(ph, (phaseCount.get(ph) ?? 0) + 1);
  }

  const examples = problems.slice(0, 18).map((e) => {
    const st = e.turns.find((t) => t.n === e.student)!;
    const prevTutor = [...e.turns].filter((t) => t.n < e.student && t.role === "assistant").pop();
    const culprit = e.culprit != null ? e.turns.find((t) => t.n === e.culprit) : undefined;
    return [
      `- **${e.session.started_at.toISOString().slice(0, 10)} · ${e.session.catalog_lesson_id} · #${e.student}** — ${e.issue}`,
      prevTutor ? `  - önceki hoca satırı (#${prevTutor.n}, ${prevTutor.source}): "${prevTutor.text.slice(0, 160)}"` : null,
      `  - öğrenci: "${st.text.slice(0, 160)}"`,
      culprit ? `  - sorunlu hoca satırı (#${culprit.n}, ${culprit.source}): "${culprit.text.slice(0, 200)}"` : `  - (hoca satırı yok)`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const failed = results.filter((r) => r.error);
  const md = [
    `# Taban çizgisi — gerçek ders transkriptleri (${STAMP})`,
    ``,
    `- Değerlendirici: \`${GRADER}\` · oturum: ${results.length} (değerlendirilemeyen: ${failed.length}) · öğrenci sözü: ${studentLines} · değerlendirilen tepki: ${exchanges.length}`,
    `- Dönem ayrımı: \`${SPLIT}\` öncesi / sonrası (konuşma motoru 3 Kas 2026'da yeniden yazıldı)`,
    `- **Sınır:** çoğu oturum kısa geliştirici testi; oranlar kesin değil, sınıflar ve örnekler kanıttır.`,
    ``,
    `## Oranlar (öğrenci sözü başına)`,
    `| Ölçüt | Tümü | ${SPLIT} öncesi | ${SPLIT} ve sonrası |`,
    `|---|---|---|---|`,
    metric("Söze cevap verilmedi", (e) => !e.addressed),
    metric("Dersin ipi koptu", (e) => !e.onTrack),
    metric("Bağlam hatası (tekrar selam, unutma, yersiz övgü…)", (e) => !e.contextOk),
    metric("Dil politikası ihlali", (e) => !e.languageOk),
    metric("**En az bir sorun**", problem),
    ``,
    `Yapısal (değerlendiricisiz): öğrenci sözünden hemen sonra yine öğrenci sözü (arada hoca satırı yok): ${pct(structuralNoReply, studentLines)} · oturumu bitiren cevapsız öğrenci sözü: ${pct(trailing, studentLines)}.`,
    ``,
    `## Sorunlu hoca satırının kaynağı`,
    `| Kaynak | Sorun | Pay |`,
    `|---|---|---|`,
    ...[...sourceCount.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k === "script" ? "script — istemcinin oynattığı şablon/içerik satırı" : k === "chat" ? "chat — canlı LLM cevabı" : k} | ${v} | ${pct(v, problems.length)} |`),
    ``,
    `## Sorunların fazı`,
    ...[...phaseCount.entries()].map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Örnekler`,
    ...examples,
    ``,
    `## Oturum notları`,
    ...results.filter((r) => r.verdict?.note).map((r) => `- ${r.session.started_at.toISOString().slice(0, 10)} · ${r.session.catalog_lesson_id}: ${r.verdict!.note}`),
    ...(failed.length ? [``, `## Değerlendirilemeyen oturumlar`, ...failed.map((r) => `- ${r.session.id}: ${r.error?.slice(0, 200)}`)] : []),
  ].join("\n");

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${STAMP}.json`), JSON.stringify(results.map((r) => ({ session: r.session, turns: r.turns, verdict: r.verdict, error: r.error })), null, 2));
  writeFileSync(join(OUT, `${STAMP}.md`), md);
  console.log(md.split("\n## Örnekler")[0]);
  console.log(`\nrapor: ${join(OUT, `${STAMP}.md`)}`);
}

try {
  await main();
} finally {
  await sql.end();
}
