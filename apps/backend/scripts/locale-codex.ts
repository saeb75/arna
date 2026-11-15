/**
 * DİL PAKETLERİNİ ÖNCEDEN ÜRET — OpenAI API'siz, Mac'teki Codex CLI ile.
 *
 * Sebep (11 Kas 2026, kullanıcı kararı): paketler ders açılışında lazy üretiliyordu
 * (400 dersin 4'ü hazırdı) — her ilk açılış 4–14 sn bekletiyor, takılan üretim
 * dersi kalıcı kilitliyordu ve API pahalı. Paket artık önceden üretilip yayınlanır.
 *
 * Üç adım, her biri ayrı ve yeniden çalıştırılabilir:
 *
 *   set -a; source .env; set +a
 *   npx tsx scripts/locale-codex.ts dump   --dir <klasör> --lang tr [--level B1] [--only id1,id2]
 *   npx tsx scripts/locale-codex.ts run    --dir <klasör> [--concurrency 4]
 *   npx tsx scripts/locale-codex.ts import --dir <klasör>
 *
 * dump   YALNIZ OKUR: paketi eksik (anahtarı güncel hazır paket olmayan) yayınlı her
 *        ders için canlı yolla BİREBİR aynı prompt'u (`buildLocalePrompt`, saklanan
 *        çekirdek) ve anahtarı (`localeSourceHash` dahil) `<id>.job.json`'a yazar.
 * run    her iş için `codex exec` (salt okunur sandbox) → JSON → contracts şeması +
 *        `lintLocale`; geçmezse hatalarla BİR kez daha. Sonuç `<id>.pack.json` ya da
 *        `<id>.error.txt`. DB'ye dokunmaz; var olan pack atlanır.
 * import geçen paketleri anahtarlarıyla `ready` olarak yazar (aynı anahtarda takılı/
 *        hatalı satır varsa üzerine). Canlı yol bunları bulur ve üretmez.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, asc, eq, like, not } from "drizzle-orm";
import { L10N_FORMAT, lessonLocalePackSchema, SCENE_FORMAT, type LessonCore, type SceneSet } from "@glotmate/contracts";
import { db, sql } from "../src/db/client.js";
import { catalogLessons, lessonLocales } from "../src/db/schema.js";
import { normalizeNativeLanguage } from "../src/lib/language.js";
import { getPublishedCore, getPublishedSceneSet, localeSourceHash } from "../src/modules/lesson/layers.js";
import { lintLocale } from "../src/modules/lesson/lintLayers.js";
import { extractJson } from "../src/modules/llm/generate.js";
import { buildLocalePrompt, LESSON_LOCALE_VERSION } from "../src/modules/llm/prompts/lesson-locale.v1.js";

const CODEX_MODEL = "gpt-5.6-sol";
const MODEL_TAG = `codex:${CODEX_MODEL}`;

const [cmd, ...args] = process.argv.slice(2);
const valueOf = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const dir = valueOf("--dir");
if (!cmd || !dir) {
  console.error("kullanım: locale-codex.ts <dump|run|import> --dir <klasör> …");
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

interface Job {
  lessonId: string;
  level: string;
  key: {
    coreId: string;
    sceneSetId: string;
    language: string;
    l10nFormat: number;
    promptVersion: string;
    sourceHash: string;
  };
  system: string;
  user: string;
  /** lintLocale için saklanan çekirdek */
  core: LessonCore;
}

const jobPath = (id: string) => join(dir, `${id}.job.json`);
const packPath = (id: string) => join(dir, `${id}.pack.json`);
const errorPath = (id: string) => join(dir, `${id}.error.txt`);
const jobIds = () =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".job.json"))
    .map((f) => f.slice(0, -".job.json".length))
    .sort();

// ---------------------------------------------------------------------------

async function dump() {
  const lang = normalizeNativeLanguage(valueOf("--lang") ?? "");
  if (!lang || lang === "en") throw new Error("--lang zorunlu (ör. tr); İngilizce paket gerekmez");
  const level = valueOf("--level");
  const only = valueOf("--only")?.split(",").filter(Boolean);

  const lessons = await db
    .select()
    .from(catalogLessons)
    .where(
      and(
        eq(catalogLessons.status, "active"),
        not(like(catalogLessons.id, "zz-%")), // test fixture'ları
        ...(level ? [eq(catalogLessons.level, level)] : []),
      ),
    )
    .orderBy(asc(catalogLessons.level), asc(catalogLessons.position));

  let written = 0, ready = 0, unpublished = 0;
  for (const lesson of lessons) {
    if (only && !only.includes(lesson.id)) continue;
    const coreRow = await getPublishedCore(lesson.id, lesson.specHash);
    const sceneRow = coreRow ? await getPublishedSceneSet(coreRow.id) : null;
    if (!coreRow?.core || !sceneRow?.scenes) {
      unpublished++;
      continue;
    }
    const core = coreRow.core as LessonCore;
    const sceneSet = { sceneFormat: SCENE_FORMAT, scenes: sceneRow.scenes } as SceneSet;
    const key = {
      coreId: coreRow.id,
      sceneSetId: sceneRow.id,
      language: lang,
      l10nFormat: L10N_FORMAT,
      promptVersion: LESSON_LOCALE_VERSION,
      // resolveLesson ile AYNI formül — yoksa canlı yol paketi bulamaz
      sourceHash: localeSourceHash(lesson.title, coreRow.core, sceneSet),
    };
    const [existing] = await db
      .select({ status: lessonLocales.status })
      .from(lessonLocales)
      .where(
        and(
          eq(lessonLocales.coreId, key.coreId),
          eq(lessonLocales.sceneSetId, key.sceneSetId),
          eq(lessonLocales.language, key.language),
          eq(lessonLocales.l10nFormat, key.l10nFormat),
          eq(lessonLocales.promptVersion, key.promptVersion),
          eq(lessonLocales.sourceHash, key.sourceHash),
        ),
      )
      .limit(1);
    if (existing?.status === "ready") {
      ready++;
      continue;
    }
    const { system, user } = buildLocalePrompt({
      language: lang,
      cefrLevel: lesson.level,
      titleEn: lesson.title,
      themeHint: lesson.themeHint,
      core,
      sceneSet,
    });
    const job: Job = { lessonId: lesson.id, level: lesson.level, key, system, user, core };
    writeFileSync(jobPath(lesson.id), JSON.stringify(job, null, 2));
    written++;
  }
  console.log(`${written} iş yazıldı · ${ready} zaten hazır · ${unpublished} yayınsız → ${dir}`);
}

// ---------------------------------------------------------------------------

function runCodex(prompt: string, outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      [
        "exec",
        "-m", CODEX_MODEL,
        "-c", 'model_reasoning_effort="medium"',
        "-s", "read-only",
        "--skip-git-repo-check",
        "-C", dir!,
        "-o", outFile,
        "Follow the SYSTEM and USER instructions given on stdin. Output ONLY the JSON object — no prose, no code fences. Do not run any commands.",
      ],
      { stdio: ["pipe", "ignore", "pipe"] },
    );
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += String(d)));
    const timer = setTimeout(() => child.kill("SIGTERM"), 6 * 60_000);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 && existsSync(outFile)) resolve();
      else reject(new Error(`codex çıkış kodu ${code}: ${stderr.slice(-300)}`));
    });
    child.stdin.end(prompt);
  });
}

/**
 * Codex iki core_ref arasına yalnız boşluk olan l1 parçası koyuyor ({"text":" "}).
 * Şema l1 metnini kırpıp boşu reddeder; ayraç zaten istemcide kuruluyor (kırpılmış
 * metinler bitişik yazılmaz) — parçayı atmak anlamı değiştirmez.
 */
function dropBlankRuns(raw: unknown): unknown {
  const pack = raw as { teachPoints?: Record<string, { runs?: { kind?: string; text?: string }[] }> };
  for (const point of Object.values(pack?.teachPoints ?? {})) {
    if (Array.isArray(point?.runs)) {
      point.runs = point.runs.filter((r) => !(r?.kind === "l1" && typeof r.text === "string" && r.text.trim() === ""));
    }
  }
  return raw;
}

async function runOne(id: string): Promise<"ok" | "fail"> {
  const job = JSON.parse(readFileSync(jobPath(id), "utf8")) as Job;
  let feedback = "";
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = `=== SYSTEM ===\n${job.system}\n\n=== USER ===\n${job.user}${feedback}\n`;
    const out = join(dir!, `${id}.out${attempt}.txt`);
    try {
      await runCodex(prompt, out);
      const parsed = lessonLocalePackSchema.safeParse(dropBlankRuns(JSON.parse(extractJson(readFileSync(out, "utf8")))));
      if (!parsed.success) {
        lastErr = `şema: ${JSON.stringify(parsed.error.issues.slice(0, 8))}`;
      } else {
        const report = lintLocale(parsed.data, job.core, { forbidden: [], language: job.key.language });
        if (report.errors.length === 0) {
          writeFileSync(packPath(id), JSON.stringify({ pack: parsed.data, report }, null, 2));
          return "ok";
        }
        lastErr = `lint: ${report.errors.join("; ")}`;
      }
    } catch (err) {
      lastErr = String(err);
    }
    feedback = `\n\nPREVIOUS ATTEMPT FAILED VALIDATION, FIX THESE:\n${lastErr.slice(0, 1500)}`;
  }
  writeFileSync(errorPath(id), lastErr);
  return "fail";
}

async function run() {
  const concurrency = Number(valueOf("--concurrency") ?? 4);
  const queue = jobIds().filter((id) => !existsSync(packPath(id)));
  const total = queue.length;
  let ok = 0, fail = 0;
  const t0 = Date.now();
  console.log(`${total} iş · ${concurrency} paralel · model ${CODEX_MODEL}`);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      for (;;) {
        const id = queue.shift();
        if (!id) return;
        const r = await runOne(id);
        if (r === "ok") ok++;
        else {
          fail++;
          console.log(`  ❌ ${id} — ${readFileSync(errorPath(id), "utf8").slice(0, 160)}`);
        }
        if ((ok + fail) % 10 === 0) console.log(`  ${ok + fail}/${total} · ${((Date.now() - t0) / 60000).toFixed(1)} dk`);
      }
    }),
  );
  console.log(`${ok} geçti · ${fail} hata · ${((Date.now() - t0) / 60000).toFixed(1)} dk`);
}

// ---------------------------------------------------------------------------

async function importPacks() {
  let n = 0;
  for (const id of jobIds()) {
    if (!existsSync(packPath(id))) continue;
    const job = JSON.parse(readFileSync(jobPath(id), "utf8")) as Job;
    const { pack, report } = JSON.parse(readFileSync(packPath(id), "utf8"));
    // Yazmadan önce bir daha doğrula — dosya elle düzenlenmiş olabilir
    const valid = lessonLocalePackSchema.parse(pack);
    const lint = lintLocale(valid, job.core, { forbidden: [], language: job.key.language });
    if (lint.errors.length) {
      console.log(`  ❌ ${id} — lint: ${lint.errors.join("; ").slice(0, 160)}`);
      continue;
    }
    await db
      .insert(lessonLocales)
      .values({ ...job.key, status: "ready", pack: valid, validationReport: report, model: MODEL_TAG })
      .onConflictDoUpdate({
        target: [
          lessonLocales.coreId,
          lessonLocales.sceneSetId,
          lessonLocales.language,
          lessonLocales.l10nFormat,
          lessonLocales.promptVersion,
          lessonLocales.sourceHash,
        ],
        set: { status: "ready", pack: valid, validationReport: report, model: MODEL_TAG, updatedAt: new Date() },
      });
    n++;
  }
  console.log(`${n} paket yazıldı (ready)`);
}

try {
  if (cmd === "dump") await dump();
  else if (cmd === "run") await run();
  else if (cmd === "import") await importPacks();
  else throw new Error(`bilinmeyen komut: ${cmd}`);
} finally {
  await sql.end();
}
