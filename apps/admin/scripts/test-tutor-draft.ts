/** Öğretmen editörü çekirdeği — LLM'siz, DB'siz.  npx tsx scripts/test-tutor-draft.ts */
import assert from "node:assert/strict";
import { adminTtsSettingsResponseSchema, type AdminTutor, type AvatarId } from "@glotmate/contracts";
import {
  emptyTutorForm,
  formFromTutor,
  formKey,
  slugFromName,
  validateTutorForm,
  visibleIssues,
  withName,
  withProvider,
  type TutorValidationContext,
} from "../src/lib/tutorDraft";

const cap = { multiLanguageClip: false, streaming: false, timestamps: false };
const tts = adminTtsSettingsResponseSchema.parse({
  settings: {
    provider: "elevenlabs",
    elevenlabs: { voiceId: null, modelId: "eleven_flash_v2_5" },
    inworld: { voiceId: null, modelId: "inworld-tts-1" },
    azure: { voiceId: null, modelId: "neural" },
    gemini: { voiceId: "Kore", modelId: "gemini-3.8-flash-tts" },
    streaming: true,
  },
  configured: { elevenlabs: false, inworld: false, azure: true, gemini: true },
  defaultVoiceId: { elevenlabs: "el-voice", inworld: null, azure: "en-US-AvaMultilingualNeural", gemini: null },
  models: {
    elevenlabs: ["eleven_flash_v2_5"],
    inworld: ["inworld-tts-1"],
    azure: ["neural"],
    gemini: ["gemini-3.8-flash-tts", "gemini-2.5-pro-tts"],
  },
  capabilities: { elevenlabs: cap, inworld: cap, azure: cap, gemini: cap },
  voices: { elevenlabs: null, inworld: null, azure: null, gemini: [{ id: "Kore", hint: "firm" }, { id: "Puck", hint: "upbeat" }] },
  updatedAt: null,
});
const avatarIds: AvatarId[] = ["kai", "lena"];

const lena: AdminTutor = {
  id: "lena",
  name: "Lena",
  avatarId: "lena",
  gender: "female",
  voice: { provider: "gemini", voiceId: "Kore", modelId: "gemini-3.8-flash-tts" },
  status: "active",
  sortOrder: 0,
  isDefault: true,
  userCount: 3,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};
const kai: AdminTutor = { ...lena, id: "kai", name: "Kai", avatarId: "kai", gender: "male", isDefault: false, sortOrder: 10 };

const ctx = (over: Partial<TutorValidationContext> = {}): TutorValidationContext => ({
  mode: "create",
  tts,
  tutors: [lena, kai],
  avatarIds,
  originalId: null,
  ...over,
});

// --- slug ---------------------------------------------------------------
assert.equal(slugFromName("Lena Marie"), "lena-marie");
assert.equal(slugFromName("  O'Brien "), "o-brien");
assert.equal(slugFromName("9 Lives"), "lives", "slug harfle başlar");
assert.equal(slugFromName("A".repeat(40)).length, 32);

// --- boş form: anahtarı olan sağlayıcı (global elevenlabs anahtarsız → ilk anahtarlı: azure) ---
const blank = emptyTutorForm([lena, kai], avatarIds, tts);
assert.equal(blank.provider, "azure");
assert.equal(blank.voiceId, "en-US-AvaMultilingualNeural", ".env varsayılan sesi");
assert.equal(blank.modelId, "neural");
assert.equal(blank.sortOrder, "20", "son sıranın 10 fazlası");
assert.equal(blank.isDefault, false);
assert.equal(emptyTutorForm([], avatarIds, tts).isDefault, true, "ilk öğretmen varsayılan");

// --- ad → kimlik türetme; elle yazılınca durur ---------------------------
let f = withName(blank, "Mia", "create");
assert.equal(f.id, "mia");
f = withName({ ...f, id: "mia-x", idAuto: false }, "Mila", "create");
assert.equal(f.id, "mia-x", "elle yazılan kimlik ezilmez");
assert.equal(withName(formFromTutor(lena), "Lenny", "edit").id, "lena", "düzenlemede kimlik sabit");

// --- sağlayıcı değişimi ses/modeli sıfırlar ------------------------------
const g = withProvider(blank, tts, "gemini");
assert.equal(g.voiceId, "Kore", "global ayardaki ses");
assert.equal(g.modelId, "gemini-3.8-flash-tts");

// --- geçerli oluşturma ----------------------------------------------------
const ok = validateTutorForm(withName(g, "Mia", "create"), ctx());
assert.deepEqual(ok.issues, {});
assert.equal(ok.body?.name, "Mia");
assert.equal(ok.body?.sortOrder, 20);
assert.equal(ok.body?.isDefault, false);

// --- alan hataları ---------------------------------------------------------
const bad = validateTutorForm(
  { ...g, id: "Lena!", name: "L3na", avatarId: "", sortOrder: "-1", provider: "elevenlabs", voiceId: "x" },
  ctx(),
);
assert.ok(bad.body === null);
assert.ok(bad.issues.id && bad.issues.name && bad.issues.avatarId && bad.issues.sortOrder && bad.issues.voice);
assert.match(bad.issues.voice![0], /API key/, "anahtarsız sağlayıcı");
assert.match(validateTutorForm({ ...g, id: "lena", name: "Lena" }, ctx()).issues.id![0], /already exists/);
assert.match(validateTutorForm({ ...g, id: "mia", name: "Mia", voiceId: " " }, ctx()).issues.voice![0], /Enter a voice/);
assert.match(validateTutorForm({ ...g, id: "mia", name: "Mia", modelId: "nope" }, ctx()).issues.voice![0], /model/);
assert.ok(validateTutorForm({ ...g, id: "mia", name: "Mia", avatarId: "raven3d" }, ctx()).issues.avatarId, "3D rig bağlanamaz");
assert.ok(validateTutorForm({ ...g, id: "mia", name: "M" }, ctx()).issues.name);
assert.ok(validateTutorForm({ ...g, id: "mia", name: "Mia", sortOrder: "10000" }, ctx()).issues.sortOrder);
assert.ok(validateTutorForm({ ...g, id: "mia", name: "Mia", sortOrder: "1.5" }, ctx()).issues.sortOrder);

// --- varsayılan kuralları (sunucuyla aynı) ------------------------------
assert.ok(validateTutorForm({ ...g, id: "mia", name: "Mia", isDefault: true, status: "hidden" }, ctx()).issues.status, "varsayılan gizlenemez");
assert.ok(
  validateTutorForm({ ...g, id: "mia", name: "Mia", status: "hidden" }, ctx({ tutors: [] })).issues.status,
  "ilk öğretmen varsayılan olacağı için gizli oluşturulamaz",
);
assert.equal(validateTutorForm({ ...g, id: "mia", name: "Mia" }, ctx({ tutors: [] })).body?.isDefault, true);
const editLena = ctx({ mode: "edit", originalId: "lena" });
assert.ok(validateTutorForm({ ...formFromTutor(lena), isDefault: false }, editLena).issues.isDefault, "varsayılan bayrağı doğrudan kalkmaz");
assert.ok(validateTutorForm({ ...formFromTutor(kai), status: "hidden" }, ctx({ mode: "edit", originalId: "kai" })).body, "varsayılan olmayan gizlenebilir");
assert.equal(validateTutorForm({ ...formFromTutor(lena), id: "whatever!" }, editLena).issues.id, undefined, "düzenlemede kimlik denetlenmez");

// --- kirli + görünür hatalar ----------------------------------------------
const base = formKey(blank);
assert.equal(formKey({ ...blank, idAuto: false }), base, "idAuto kirlilik sayılmaz");
const empty = validateTutorForm(blank, ctx());
assert.equal(visibleIssues(blank, base, empty.issues, false).name, undefined, "dokunulmamış boş ad bağırmaz");
assert.ok(visibleIssues(blank, base, empty.issues, true).name, "kaydet denendiyse görünür");
const typed = { ...blank, name: "1" };
assert.ok(visibleIssues(typed, base, validateTutorForm(typed, ctx()).issues, false).name, "değişen alan hemen görünür");

console.log("✅ tutor-draft: tüm vakalar geçti");
