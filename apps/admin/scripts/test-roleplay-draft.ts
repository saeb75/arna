/** Roleplay editörü form ↔ spec çevrimi + istemci kapısı — LLM'siz, DB'siz.  npx tsx scripts/test-roleplay-draft.ts */
import assert from "node:assert/strict";
import { ROLEPLAY_SPEC_FORMAT, roleplaySpecSchema, type RoleplaySpec } from "@glotmate/contracts";
import {
  candidateKey,
  emptySpecForm,
  formToCandidate,
  idFromLabel,
  levelCoverage,
  moveItem,
  parseSpecForm,
  slugFromTitle,
  specKey,
  specToForm,
  ROLEPLAY_SLUG_RE,
} from "../src/lib/roleplayDraft";

const spec: RoleplaySpec = roleplaySpecSchema.parse({
  specFormat: ROLEPLAY_SPEC_FORMAT,
  title: "Ordering at a cafe",
  category: "Eating out",
  persona: { name: "Sam", role: "Barista", goal: "Take the order quickly" },
  scene: "A busy cafe at 8 am.",
  opening: "Hi there, what can I get you?",
  objectives: [
    { id: "order-drink", label: "Order a drink", activeFrom: "A1", openingHint: "Ask what they want" },
    { id: "ask-size", label: "Ask about sizes", activeFrom: "A1" },
    { id: "pay", label: "Ask to pay by card", activeFrom: "B1" },
  ],
  complications: [{ id: "no-oat", text: "You are out of oat milk.", activeFrom: "B2" }],
  supportedFrom: "A1",
  recommendedFrom: "A2",
});

// Gidiş-dönüş: form → aday → şema aynı spec'i verir (opsiyoneller yoksa yok kalır)
const form = specToForm(spec);
assert.equal(form.persona.mood, "", "olmayan mood boş string");
assert.equal(form.objectives[1]!.openingHint, "");
const round = parseSpecForm(form);
assert.ok(round.ok, "geçerli spec formdan geçer");
assert.deepEqual(round.ok && round.spec, spec, "gidiş-dönüş kayıpsız");
assert.equal(candidateKey(form), specKey(spec), "kirli karşılaştırma anahtarı spec ile aynı");
assert.ok(!("openingHint" in formToCandidate(form).objectives[1]!), "boş openingHint gönderilmez");
assert.ok(!("mood" in formToCandidate(form).persona), "boş mood gönderilmez");
assert.ok(!("key" in formToCandidate(form).objectives[0]!), "React anahtarı sunucuya gitmez");
assert.ok(!("idAuto" in formToCandidate(form).objectives[0]!), "form bayrağı sunucuya gitmez");
assert.equal(form.objectives[0]!.idAuto, false, "kayıtlı kimlik türetilmez");
assert.equal(emptySpecForm().objectives[0]!.idAuto, true, "yeni öğenin kimliği etiketten türetilir");

// Kırpma kirli saymaz
assert.equal(candidateKey({ ...form, title: "  Ordering at a cafe " }), candidateKey(form));

// Boş şablon: alanlar zorunlu, mesajlar İngilizce
const empty = parseSpecForm(emptySpecForm());
assert.equal(empty.ok, false);
assert.deepEqual(empty.issues["title"], ["Required."]);
assert.deepEqual(empty.issues["objectives.0.id"], ["Lowercase letters, digits and hyphens; 2–49 characters, starting with a letter or digit."], "Türkçe regex mesajı ekrana çıkmaz");
for (const msgs of Object.values(empty.issues)) for (const m of msgs) assert.ok(!/[çğıöşüÇĞİÖŞÜ]/.test(m), `Türkçe mesaj sızdı: ${m}`);

// Yapısal kurallar (sunucu lint'inin kesin kurallarıyla aynı)
const noQ = parseSpecForm({ ...form, opening: "Hi there." });
assert.equal(noQ.ok, false);
assert.match(noQ.issues["opening"]![0]!, /question mark/);

const dup = parseSpecForm({ ...form, objectives: form.objectives.map((o, i) => (i === 2 ? { ...o, id: "order-drink" } : o)) });
assert.equal(dup.ok, false);
assert.ok(dup.issues["objectives.0.id"] && dup.issues["objectives.2.id"], "tekrar eden kimliklerin ikisi de işaretlenir");

const lowRec = parseSpecForm({ ...form, supportedFrom: "A2", recommendedFrom: "A1" });
assert.ok(lowRec.issues["recommendedFrom"], "önerilen seviye tabanın altında olamaz");

const thin = parseSpecForm({ ...form, objectives: form.objectives.map((o) => ({ ...o, activeFrom: "C1" as const })) });
assert.match(thin.issues["supportedFrom"]![0]!, /Only 0 objectives are active at A1/);

const tooMany = parseSpecForm({ ...form, objectives: Array.from({ length: 7 }, (_, i) => ({ ...form.objectives[0]!, key: `x${i}`, id: `o-${i}` })) });
assert.deepEqual(tooMany.issues["objectives"], ["At most 6 objectives."]);

const long = parseSpecForm({ ...form, scene: "x".repeat(281) });
assert.deepEqual(long.issues["scene"], ["At most 280 characters."]);

// Slug ve kimlik önerileri
assert.equal(slugFromTitle("Ordering at a Café!"), "rp-ordering-at-a-cafe");
assert.equal(slugFromTitle("   "), "rp-");
assert.ok(ROLEPLAY_SLUG_RE.test(slugFromTitle("Hotel check-in")));
assert.ok(!ROLEPLAY_SLUG_RE.test("rp-"), "gövdesiz slug geçersiz");
assert.ok(!ROLEPLAY_SLUG_RE.test("hotel"), "rp- öneki zorunlu");
assert.equal(idFromLabel("Ask for a table by the window"), "ask-for-a-table");

assert.deepEqual(moveItem([1, 2, 3], 0, 1), [2, 1, 3]);
assert.deepEqual(moveItem([1, 2, 3], 2, 3), [1, 2, 3], "sınır dışı hareket yok sayılır");

assert.deepEqual(levelCoverage(spec).map((c) => c.active), [2, 2, 3, 3, 3, 3]);
console.log("✅ roleplayDraft: tüm vakalar geçti");
