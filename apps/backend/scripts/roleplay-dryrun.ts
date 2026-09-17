/**
 * ROLEPLAY KAPSAMA RAPORU — persona her hedefe gerçekten kapı açıyor mu?
 *
 *   npx tsx scripts/roleplay-dryrun.ts --slug rp-restaurant-order --level A1 [--turns N]
 *
 * Öğrenciyi ucuz bir LLM oynar (işbirlikçi, seviyeye uygun); persona GERÇEK
 * hattan geçer: aynı prompt kurucusu, aynı çıktı şeması, aynı tik doğrulaması.
 * DB'ye HİÇBİR ŞEY yazılmaz — oturum yok, deneme yok; ölçüm verisi kirlenmez.
 *
 * Koşu her hedefe kapı açılana kadar sürer, üst sınır max(6, hedef×2) tur
 * (onaylı mimarinin ifadesi — üç tur 3-6 hedefin ulaşılabilirliğini kanıtlayamaz).
 *
 * RAPOR OTOMATİK YEŞİL IŞIK DEĞİL: her hedef için personanın hangi cümlesinin
 * kapı açtığını gösterir; yayınlayan İNSAN bunu onaylar. "Kapı" = tiklenen
 * turdan hemen önceki persona cümlesi — kanıta dayalı, sezgiye değil.
 */
import { z } from "zod";
import {
  activeComplications,
  applyObjectiveHits,
  resolvePlayedLevel,
  roleplayTurnOutputSchema,
  type CefrLevel,
  type ObjectiveHit,
} from "@glotmate/contracts";
import { completeJson } from "../src/modules/llm/index.js";
import { buildPersonaPrompt, ROLEPLAY_TURN_VERSION } from "../src/modules/roleplay/personaPrompt.js";
import { detectObjectiveHits, ROLEPLAY_DETECT_VERSION } from "../src/modules/roleplay/service.js";
import { getPublishedRoleplay } from "../src/modules/roleplay/queries.js";

const args = process.argv.slice(2);
const valueOf = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : undefined;
};
const slug = valueOf("--slug");
const level = valueOf("--level") as CefrLevel | undefined;
if (!slug || !level) {
  console.error("--slug ve --level zorunlu (ör. --slug rp-restaurant-order --level A1)");
  process.exit(1);
}

const rp = await getPublishedRoleplay(slug);
if (!rp) {
  console.error(`"${slug}" yayında değil`);
  process.exit(1);
}

const decision = resolvePlayedLevel(rp.spec, level);
const activeIds = decision.objectives.map((o) => o.id);
const maxTurns = Number(valueOf("--turns") ?? Math.max(6, activeIds.length * 2));
// Canlıyla aynı kural: oynanan seviyede aktif olanların spec sırasındaki İLKİ
const complication = activeComplications(rp.spec, decision.level)[0] ?? null;

console.log(`\n${rp.spec.title} · istenen ${level} → oynanan ${decision.level}${decision.raised ? " (yükseltildi)" : ""}`);
console.log(`${activeIds.length} aktif hedef · en fazla ${maxTurns} tur · komplikasyon: ${complication?.id ?? "yok"}\n`);

const studentSchema = z.object({ say: z.string().trim().min(1).max(500) });

const history: Array<{ role: "assistant" | "user"; text: string }> = [];
const hits: ObjectiveHit[] = [];
/** hedef → tiklenen turdan hemen önceki persona cümlesi (KAPI) */
const doorByObjective = new Map<string, { door: string; evidence: string; turn: number }>();

// Açılış spec'ten — canlıdaki gibi
history.push({ role: "assistant", text: rp.spec.opening });
console.log(`  ${rp.spec.persona.name}: ${rp.spec.opening}`);

for (let turn = 0; turn < maxTurns; turn++) {
  const remaining = decision.objectives.filter((o) => !doorByObjective.has(o.id));
  if (remaining.length === 0) break;

  // --- Simüle öğrenci: işbirlikçi, seviyeye uygun, kalan hedefleri kovalar ----
  const student = await completeJson({
    purpose: "chat",
    system: [
      `You simulate an English learner at ${decision.level} level in a role-play.`,
      `Speak the way a real ${decision.level} learner speaks: ${
        decision.level === "A1" || decision.level === "A2"
          ? "very short sentences, sometimes single words, simple vocabulary, occasional small mistakes."
          : "natural sentences appropriate to the level."
      }`,
      `You are cooperative: respond to what the other person just said, and when a natural`,
      `opening appears, work toward ONE of your remaining goals: ${remaining.map((o) => o.label).join(" | ")}.`,
      `Never mention goals or levels out loud. One reply of AT MOST two short sentences.`,
      `Output STRICT JSON: {"say":"..."}`,
    ].join("\n"),
    user: history.map((h) => `${h.role === "user" ? "YOU" : "THEM"}: ${h.text}`).join("\n"),
    schema: studentSchema,
    promptVersion: "roleplay-dryrun-student.v1",
    maxTokens: 120,
    temperature: 0.8,
  });
  history.push({ role: "user", text: student.say });
  console.log(`  ÖĞRENCİ: ${student.say}`);

  // --- Persona: GERÇEK hat ---------------------------------------------------
  const system = buildPersonaPrompt({
    spec: rp.spec,
    playedLevel: decision.level,
    activeObjectives: decision.objectives,
    complication,
    alreadyHitIds: hits.map((h) => h.objectiveId),
  });
  const out = await completeJson({
    purpose: "chat",
    system,
    user: history.map((h) => `${h.role === "user" ? "STUDENT" : "YOU"}: ${h.text}`).join("\n"),
    schema: roleplayTurnOutputSchema,
    promptVersion: ROLEPLAY_TURN_VERSION,
    maxTokens: 300,
    temperature: 0.6,
  });

  // Tespit + doğrulama — sunucudakiyle AYNI hat (dedektör ayrı, temp 0)
  const personaLast = [...history].reverse().find((h) => h.role === "assistant")?.text ?? rp.spec.opening;
  const proposed = await detectObjectiveHits({
    openObjectives: remaining.map((o) => ({ id: o.id, label: o.label })),
    personaLastLine: personaLast,
    studentTurn: student.say,
  });
  const verdict = applyObjectiveHits(proposed, student.say, activeIds, hits.map((h) => h.objectiveId));
  for (const a of verdict.accepted) {
    // KAPI = tiklenen turdan hemen önceki persona cümlesi
    const door = [...history].reverse().find((h) => h.role === "assistant")?.text ?? "(açılış)";
    doorByObjective.set(a.objectiveId, { door, evidence: a.evidence, turn });
    hits.push({ objectiveId: a.objectiveId, turnIndex: turn, evidence: a.evidence, detectorVersion: ROLEPLAY_DETECT_VERSION });
  }
  for (const r of verdict.rejected) console.log(`    ⚠ tik reddedildi: ${r.objectiveId} (${r.reason})`);

  const reply = out.reply.map((r) => r.text).join(" ");
  history.push({ role: "assistant", text: reply });
  console.log(`  ${rp.spec.persona.name}: ${reply}`);
  if (verdict.accepted.length) {
    console.log(`    ✓ ${verdict.accepted.map((a) => a.objectiveId).join(", ")}`);
  }
}

// --- Kapsama raporu — insana sunulan delil -----------------------------------
console.log(`\n=== KAPSAMA RAPORU (${doorByObjective.size}/${activeIds.length}) ===`);
let missing = 0;
for (const o of decision.objectives) {
  const d = doorByObjective.get(o.id);
  if (d) {
    console.log(`✅ ${o.id} — tur ${d.turn}`);
    console.log(`     kapı  : "${d.door.slice(0, 100)}"`);
    console.log(`     kanıt : "${d.evidence}"`);
  } else {
    missing++;
    console.log(`❌ ${o.id} — ${maxTurns} turda kapı açılmadı${o.openingHint ? "" : " (openingHint de yok)"}`);
  }
}
console.log(
  missing === 0
    ? `\n✅ her aktif hedefe kapı açıldı — yayınlayan insan yukarıdaki delili onaylamalı`
    : `\n❌ ${missing} hedef ulaşılamadı — persona ya da openingHint gözden geçirilmeli`,
);
process.exit(missing === 0 ? 0 : 1);
