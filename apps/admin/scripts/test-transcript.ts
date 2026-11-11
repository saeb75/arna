/** Transkript işaretleri (faz ayırıcı + isabet) — LLM'siz, DB'siz.  npx tsx scripts/test-transcript.ts */
import assert from "node:assert/strict";
import type { AdminTranscriptTurn } from "@glotmate/contracts";
import { formatDrillTurn, parseDrillTurn } from "@glotmate/contracts";
import { annotateTranscript, drillSummary } from "../src/lib/transcript";

let id = 0;
const T = (role: "user" | "assistant", phase: string | null): AdminTranscriptTurn =>
  ({ id: ++id, role, phase, text: `${role}-${id}`, source: "chat", runs: null, latencyMs: null, createdAt: "2026-10-12T00:00:00Z" });

// Ders: lecture'daki öğrenci turu practice sayacını İLERLETMEZ
const lesson = [T("assistant", "lecture"), T("user", "lecture"), T("assistant", "practice"), T("user", "practice"), T("user", "practice"), T("assistant", "wrapup")];
const a = annotateTranscript(lesson, [1], null);
assert.deepEqual(a.map((x) => x.phaseChanged), [true, false, true, false, false, true], "faz ayırıcıları");
assert.deepEqual(a.map((x) => x.hit), [null, null, null, null, "target used", null], "practice turu 0 tabanlı, yalnız practice öğrenci turları");

// Roleplay: yalnız roleplay fazındaki öğrenci turları sayılır; bir turda iki hedef birleşir
const rp = [T("assistant", "roleplay"), T("user", "roleplay"), T("assistant", "roleplay"), T("user", "roleplay"), T("user", "roleplay")];
const b = annotateTranscript(rp, [], {
  objectives: [
    { id: "ask-table", label: "Ask for a table", done: true },
    { id: "order", label: "Order a drink", done: true },
  ],
  hits: [
    { objectiveId: "ask-table", turnIndex: 0, evidence: "a table", detectorVersion: "v1" },
    { objectiveId: "order", turnIndex: 2, evidence: "a coffee", detectorVersion: "v1" },
    { objectiveId: "ghost", turnIndex: 2, evidence: "x", detectorVersion: "v1" },
  ],
});
assert.deepEqual(b.map((x) => x.hit), [null, "objective: Ask for a table", null, null, "objective: Order a drink · ghost"], "etiketi olmayan hedef kimliğiyle görünür");
assert.equal(annotateTranscript([], [], null).length, 0);

// Oyun bloğu satırları: biçim ↔ çözümleme gidiş-dönüş, eski biçim, özet
const wrong = formatDrillTurn({ ok: false, type: "fill_choice", prompt: "I ___ a student.", answer: "is", expected: "I am a student." });
assert.deepEqual(parseDrillTurn(wrong), { ok: false, type: "fill_choice", prompt: "I ___ a student.", answer: "is", expected: "I am a student." });
const right = formatDrillTurn({ ok: true, type: "match", prompt: "I · she", answer: "0 mistake(s)", expected: "ignored" });
assert.deepEqual(parseDrillTurn(right), { ok: true, type: "match", prompt: "I · she", answer: "0 mistake(s)", expected: null }, "doğruda beklenen yazılmaz");
assert.deepEqual(parseDrillTurn("✗ [speak] she my sister"), { ok: false, type: "speak", prompt: null, answer: "she my sister", expected: null }, "eski tek satırlık biçim");
assert.equal(parseDrillTurn("✓ [nonsense] x"), null, "bilinmeyen tür");
assert.equal(parseDrillTurn("Hello"), null);
const D = (text: string): AdminTranscriptTurn => ({ ...T("user", "lecture"), text, source: "drill" });
assert.deepEqual(drillSummary([D(wrong), D(right), D(right), T("user", "lecture")]), { answers: 3, correct: 2 });
assert.equal(drillSummary([T("user", "lecture")]), null);
console.log("✅ transcript: tüm vakalar geçti");
