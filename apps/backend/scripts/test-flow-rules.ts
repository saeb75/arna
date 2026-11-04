/** Faz 7.6 doğrulama: ders akış makinesinin TAM doğruluk tablosu.
 *
 *  LLM ÇAĞRISI YOK, DB YOK — saf fonksiyonlar. Saniyeler içinde koşar.
 *  Aynı bölgede üç kez canlı hata çıktı; her biri burada regresyon vakası olarak duruyor.
 *
 *  Çalıştırma: apps/backend içinde `npx tsx scripts/test-flow-rules.ts` */
import {
  classifyAck,
  decideAfterTutorReply,
  decideInWrapup,
  decideOnStudentInput,
  hasWordContent,
  isAttemptKind,
  isLastExchange,
  isSurrender,
  judgedBeatDone,
  outcomeOfVerdict,
  TURN_KINDS,
  MAX_BEAT_EXCHANGES,
  MAX_QUESTION_INVITES,
  type AckKind,
  type FlowDecision,
  type LectureBeat,
  type WrapupDecision,
} from "@glotmate/contracts";

let pass = 0;
let fail = 0;

function expectTrue(label: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    console.log(`❌ ${label}`);
  }
}

function expect(
  label: string,
  got: FlowDecision | WrapupDecision,
  want: FlowDecision | WrapupDecision,
) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else {
    fail++;
    console.log(`❌ ${label}\n     beklenen ${JSON.stringify(want)}, gelen ${JSON.stringify(got)}`);
  }
}

// --- test beat'leri ---------------------------------------------------------

const readiness: LectureBeat = {
  id: "b1", kind: "ask", purpose: "readiness",
  intent: "greet and ask if ready",
};
const questions: LectureBeat = {
  id: "b3", kind: "ask", purpose: "questions",
  intent: "invite any question before the exercises",
};
const exercise: LectureBeat = {
  id: "b5", kind: "exercise",
  prompt: "Fill in the blank: I ___ it.",
  answers: ["did"], hint: "did",
};
const openResponse: LectureBeat = {
  id: "b7", kind: "open_response",
  prompt: "Tell me about yourself.",
  rubric: { mustUse: ["present perfect"], criteria: "uses the target" },
  hint: "I have...", maxAttempts: 2,
};

const input = (o: Partial<Parameters<typeof decideOnStudentInput>[1]> = {}) => ({
  ack: null as AckKind | null, exchanges: 0, invites: 0, attempt: 0, answerMatched: false, ...o,
});
const reply = (o: Partial<Parameters<typeof decideAfterTutorReply>[1]> = {}) => ({
  exchanges: 1, attempt: 0, beatDone: false, ...o,
});

// ---------------------------------------------------------------------------
// 1) ask · readiness — "Hazır mısın?"
// ---------------------------------------------------------------------------
console.log("— ask · readiness —");

expect("evet → ilerle", decideOnStudentInput(readiness, input({ ack: "yes" })), { kind: "advance" });
expect("tamam → ilerle", decideOnStudentInput(readiness, input({ ack: "proceed" })), { kind: "advance" });
// "Hazır mısın?" → "hayır": ders tek kelime etmeden başlıyordu. Hoca güven verir,
// SONRA ilerler (readiness'te hoca cevabından sonra akış zaten ilerler).
expect("hayır → hoca bir cümle söyler (sessizce başlamaz)", decideOnStudentInput(readiness, input({ ack: "no" })), { kind: "askTutor" });
expect("gerçek soru → hocaya sor", decideOnStudentInput(readiness, input()), { kind: "askTutor" });
// readiness bağlamı hocaya soru sormayı yasaklıyor; script hemen devam eder
expect("cevap sonrası → ilerle", decideAfterTutorReply(readiness, reply()), { kind: "advance" });

// ---------------------------------------------------------------------------
// 2) ask · questions — "Sorun var mı?"  (Faz 7.5 + 7.6 hatalarının yeri)
// ---------------------------------------------------------------------------
console.log("— ask · questions —");

// FAZ 7.5 REGRESYONU: "evet" burada SORUM VAR demek, ilerlemek soruyu yutuyordu
expect("evet → soruyu davet et (İLERLEME)", decideOnStudentInput(questions, input({ ack: "yes" })), { kind: "invite" });
expect("hayır → ilerle", decideOnStudentInput(questions, input({ ack: "no" })), { kind: "advance" });
expect("tamam → ilerle", decideOnStudentInput(questions, input({ ack: "proceed" })), { kind: "advance" });
expect("gerçek soru → hocaya sor", decideOnStudentInput(questions, input()), { kind: "askTutor" });

// FAZ 7.6 REGRESYONU: karar hocanın cevabının METNİNE bakıyordu ("!" ile bitince ilerliyordu).
// Artık metin fonksiyona GEÇİRİLEMİYOR — aynı sayaçla her zaman aynı karar çıkmalı.
expect("cevap sonrası → BEKLE", decideAfterTutorReply(questions, reply({ exchanges: 1 })), { kind: "wait", awaiting: "ask" });
expect("2. cevap sonrası → BEKLE", decideAfterTutorReply(questions, reply({ exchanges: 2 })), { kind: "wait", awaiting: "ask" });
// SAF ONAY (4 Kas 2026): "Yok, bu kadar yeterli." artık LLM'e gider; pencereyi
// kapatan sunucunun YAPISAL windowDone'udur — hocanın cümlesi değil.
expect("windowDone → ilerle", decideAfterTutorReply(questions, reply({ exchanges: 1, windowDone: true })), { kind: "advance" });
expect("windowDone=false → bekle", decideAfterTutorReply(questions, reply({ exchanges: 1, windowDone: false })), { kind: "wait", awaiting: "ask" });
expect("windowDone readiness'ta etkisiz → zaten ilerle", decideAfterTutorReply(readiness, reply({ exchanges: 1, windowDone: false })), { kind: "advance" });
expect(
  `${MAX_BEAT_EXCHANGES}. turda → ilerle (sonsuz döngü kesilir)`,
  decideAfterTutorReply(questions, reply({ exchanges: MAX_BEAT_EXCHANGES })),
  { kind: "advance" },
);
expect(
  "tavan dolmuşken tekrar 'evet' → ilerle",
  decideOnStudentInput(questions, input({ ack: "yes", exchanges: MAX_BEAT_EXCHANGES })),
  { kind: "advance" },
);
expect(
  "üst üste 'evet' sarmalı kesiliyor",
  decideOnStudentInput(questions, input({ ack: "yes", invites: MAX_QUESTION_INVITES })),
  { kind: "advance" },
);

// CANLI HATA (3. tur): "evet" → davet (LLM YOK) → iki gerçek soru → tavan doldu
// sayılıp ders kaçıyordu. Bedava davet LLM bütçesinden YEMEMELİ.
console.log("— bedava davet bütçe yemez —");
{
  let exchanges = 0;
  let invites = 0;
  const step = (ack: AckKind | null) => {
    const d = decideOnStudentInput(questions, input({ ack, exchanges, invites }));
    if (d.kind === "invite") invites += 1;
    if (d.kind === "askTutor") exchanges += 1;
    return d;
  };
  expect("1) 'evet' → davet", step("yes"), { kind: "invite" });
  expect("2) 1. soru → hocaya", step(null), { kind: "askTutor" });
  expect("   1. cevaptan sonra bekle", decideAfterTutorReply(questions, reply({ exchanges })), { kind: "wait", awaiting: "ask" });
  expect("3) 2. soru → hocaya", step(null), { kind: "askTutor" });
  expect(
    "   2. cevaptan sonra HÂLÂ bekle (davet bütçe yemedi)",
    decideAfterTutorReply(questions, reply({ exchanges })),
    { kind: "wait", awaiting: "ask" },
  );
  expect("4) 3. soru → hocaya", step(null), { kind: "askTutor" });
  expect(
    "   3. cevaptan sonra ilerle (bütçe gerçekten doldu)",
    decideAfterTutorReply(questions, reply({ exchanges })),
    { kind: "advance" },
  );
}

// Akış ilerleyeceği turda hoca "başka sorun var mı?" DEMEMELİ (tutarlılık)
console.log("— son tur bayrağı —");
expect(
  "son turda ilerleniyor",
  decideAfterTutorReply(questions, reply({ exchanges: MAX_BEAT_EXCHANGES })),
  { kind: "advance" },
);
const lastFlags = [0, 1, 2, 3].map((e) => isLastExchange(questions, e));
expect(
  `bayrak yalnızca son turda açık (${lastFlags.join(",")})`,
  { kind: lastFlags.join(",") === "false,false,true,true" ? "advance" : "askTutor" },
  { kind: "advance" },
);
expect(
  "readiness beat'inde bayrak hiç açılmaz",
  { kind: isLastExchange(readiness, 9) ? "askTutor" : "advance" },
  { kind: "advance" },
);
// CANLI HATA: üç anlamsız cevaptan sonra beat tavana takılıp kapandı ve doğru cevap
// HİÇ söylenmedi. Bayrak artık alıştırmada da açılır; sunucu son turda cevabı verir.
expect(
  "exercise beat'inde bayrak SON turda açılır",
  { kind: isLastExchange(exercise, MAX_BEAT_EXCHANGES - 1) ? "askTutor" : "advance" },
  { kind: "askTutor" },
);
expect(
  "exercise beat'inde bayrak erken turda KAPALI",
  { kind: isLastExchange(exercise, 0) ? "askTutor" : "advance" },
  { kind: "advance" },
);
expect(
  "open_response beat'inde de bayrak son turda açılır",
  { kind: isLastExchange(openResponse, MAX_BEAT_EXCHANGES - 1) ? "askTutor" : "advance" },
  { kind: "askTutor" },
);

// ---------------------------------------------------------------------------
// 3) exercise
// ---------------------------------------------------------------------------
console.log("— exercise —");

expect("doğru cevap → övgü (LLM yok)", decideOnStudentInput(exercise, input({ answerMatched: true })), { kind: "praise" });
expect("yanlış cevap → hocaya sor", decideOnStudentInput(exercise, input({ answerMatched: false })), { kind: "askTutor" });
expect("1. yanlıştan sonra → BEKLE (hoca yeniden sordu)", decideAfterTutorReply(exercise, reply({ attempt: 0 })), { kind: "wait", awaiting: "exercise" });
expect("2. yanlıştan sonra → ilerle (hoca cevabı verdi)", decideAfterTutorReply(exercise, reply({ attempt: 1 })), { kind: "advance" });

// LLM EMNİYET AĞI: deterministik eşleyicinin ıskaladığı doğru cevabı (yazım
// sürçmesi, listede olmayan geçerli varyant) judge yapısal `ok` ile kabul eder →
// sunucu beatDone=true döner. Hak yakılmadan ilerlenir; övgü zaten yanıtın içinde.
expect(
  "judge kabul etti (1. denemede) → ilerle, hak yanmaz",
  decideAfterTutorReply(exercise, reply({ attempt: 0, beatDone: true })),
  { kind: "advance" },
);
expect(
  "judge kabul etti (2. denemede) → yine ilerle",
  decideAfterTutorReply(exercise, reply({ attempt: 1, beatDone: true })),
  { kind: "advance" },
);
// Savunma: sunucu guard'ı ok && isAttempt zaten garanti eder ama makine de
// tutarlı olmalı — deneme değilse beatDone ne olursa olsun konu-dışı yolu kazanır.
expect(
  "deneme DEĞİLSE beatDone=true bile ilerletmez (konu dışı önceliği)",
  decideAfterTutorReply(exercise, reply({ attempt: 0, exchanges: 1, beatDone: true, isAttempt: false })),
  { kind: "wait", awaiting: "exercise" },
);

// ---------------------------------------------------------------------------
// 4) open_response — yapısal karar (şemayla doğrulanmış boolean)
// ---------------------------------------------------------------------------
console.log("— open_response —");

expect("hep hocaya gider", decideOnStudentInput(openResponse, input()), { kind: "askTutor" });
expect("kabul edildi → ilerle", decideAfterTutorReply(openResponse, reply({ beatDone: true })), { kind: "advance" });
expect("reddedildi → BEKLE", decideAfterTutorReply(openResponse, reply({ beatDone: false })), { kind: "wait", awaiting: "open_response" });

// ---------------------------------------------------------------------------
// 5) ASIL GÜVENCE: karar hocanın cevabından BAĞIMSIZ.
//    Aynı durumu üç farklı cevap metniyle "canlandırıp" tek bir karar bekliyoruz.
//    Metin fonksiyona geçirilemediği için bu testi geçmek zorunlu — ama niyeti
//    belgelemek ve gelecekte imzaya metin eklenmesini fark etmek için duruyor.
// ---------------------------------------------------------------------------
console.log("— düzyazıdan bağımsızlık —");

const repliesThatUsedToBreakIt = [
  "Please ask your specific question. I'm here to help!", // ← canlı hata: "!" ile bitti, ilerledi
  "Sure, what would you like to know?",
  "You put 'always' after 'be'.",
];
const decisions = repliesThatUsedToBreakIt.map(() =>
  JSON.stringify(decideAfterTutorReply(questions, reply({ exchanges: 1 }))),
);
expect(
  "üç farklı cevap metni → tek ve aynı karar",
  { kind: new Set(decisions).size === 1 ? "wait" : "advance", awaiting: "ask" } as FlowDecision,
  { kind: "wait", awaiting: "ask" },
);

// İmza denetimi: karar fonksiyonları model metnini parametre olarak ALMAMALI.
const sigOk =
  decideOnStudentInput.length === 2 && decideAfterTutorReply.length === 2;
expect(
  "karar fonksiyonları yalnızca (beat, sayaçlar) alıyor",
  { kind: sigOk ? "advance" : "askTutor" },
  { kind: "advance" },
);

// ---------------------------------------------------------------------------
// 5b) CEVAP DENEMESİ DEĞİLSE hak yanmaz (canlı hata: "Hey!" + konu dışı bir
//     cümle iki denemeyi de yakıp soruyu atlatmıştı)
// ---------------------------------------------------------------------------
console.log("— konu dışı girdi hak yemez —");

expect(
  "alıştırma · konu dışı, 1. tur → BEKLE (hak yanmadı)",
  decideAfterTutorReply(exercise, reply({ attempt: 0, exchanges: 1, isAttempt: false })),
  { kind: "wait", awaiting: "exercise" },
);
expect(
  "alıştırma · konu dışı, deneme sayacı ilerlemiş olsa bile BEKLE",
  decideAfterTutorReply(exercise, reply({ attempt: 1, exchanges: 2, isAttempt: false })),
  { kind: "wait", awaiting: "exercise" },
);
expect(
  "alıştırma · konu dışı ısrar → tavanda ilerle (kilitlenme yok)",
  decideAfterTutorReply(exercise, reply({ attempt: 0, exchanges: MAX_BEAT_EXCHANGES, isAttempt: false })),
  { kind: "advance" },
);
expect(
  "alıştırma · GERÇEK deneme, 2. yanlış → ilerle (eski davranış korunuyor)",
  decideAfterTutorReply(exercise, reply({ attempt: 1, exchanges: 2, isAttempt: true })),
  { kind: "advance" },
);
expect(
  "alıştırma · isAttempt verilmemişse deneme sayılır (geriye uyum)",
  decideAfterTutorReply(exercise, reply({ attempt: 1, exchanges: 2 })),
  { kind: "advance" },
);
expect(
  "açık uçlu · konu dışı → BEKLE, hak yanmaz",
  decideAfterTutorReply(openResponse, reply({ beatDone: false, exchanges: 1, isAttempt: false })),
  { kind: "wait", awaiting: "open_response" },
);
expect(
  "açık uçlu · konu dışı ısrar → tavanda ilerle",
  decideAfterTutorReply(openResponse, reply({ beatDone: false, exchanges: MAX_BEAT_EXCHANGES, isAttempt: false })),
  { kind: "advance" },
);

// "Bilmiyorum" DENEMEDİR — model bunu konu dışı sayıp hakkı yakmıyordu ve
// öğrenci doğru cevabı hiç duyamadan döngüde kalıyordu. Deterministik belirlenir.
// İngilizce çekirdek küme parametresizdir; ANA DİL ifadeleri chrome paketinden
// `extraTokens` olarak gelir (dil ilkesi: çekirdekte sabit dil referansı yok).
const TR_SURRENDER = ["bilmiyorum", "bilmem", "fikrim yok"]; // src/i18n/tr.ts örneği
for (const s of ["I don't know", "no idea", "not sure", "pass"]) {
  expectTrue(`"${s}" pes etmedir → deneme sayılır`, isSurrender(s));
}
for (const s of ["bilmiyorum", "fikrim yok"]) {
  expectTrue(`"${s}" chrome extraTokens ile pes etmedir`, isSurrender(s, TR_SURRENDER));
  expectTrue(`"${s}" extraTokens OLMADAN pes sayılmaz (çekirdek dil-bağımsız)`, !isSurrender(s));
}
for (const s of ["Hey!", "merhaba", "how are you", "İlişkiler çoğulduğu anlarda genellikle"]) {
  expectTrue(`"${s}" pes etme DEĞİL`, !isSurrender(s));
}

// CANLI HATA (3 Kas 2026): alıştırmada ",," judge'a gitti, hoca "Merhaba!" dedi.
// Yalnız noktalama/boşluk/emoji boş girdidir; her yazı sisteminin harfi ve
// rakam ise sözdür (dil ilkesi: Latin'e özgü test yok).
console.log("— hasWordContent (boş girdi kapısı) —");
for (const s of [",,", "..", ".", "...", "?!", " , . ", "''", "—", "", "   ", "👍"]) {
  expectTrue(`${JSON.stringify(s)} söz DEĞİL → gönderilmez`, !hasWordContent(s));
}
for (const s of ["a", "5", "Hello, my name is Ana.", "merhaba", "привет", "你好", "مرحبا", "नमस्ते", "..ok"]) {
  expectTrue(`${JSON.stringify(s)} sözdür`, hasWordContent(s));
}

// TAVAN TUTARLILIĞI (3 Kas 2026 denetimi): iki konu dışı turdan sonra gelen yanlış
// cevap tavan turudur. Prompt "son tur, cevabı söyle" diyordu, akış BEKLİYORDU —
// hoca cevabı verip soruyu yeniden sordu. Artık tavan her denemede kapatır.
console.log("— tavan tutarlılığı —");
expect(
  "alıştırma · konu dışı ×2 sonra İLK yanlış → ilerle (cevap söylendi)",
  decideAfterTutorReply(exercise, reply({ exchanges: MAX_BEAT_EXCHANGES, attempt: 0, isAttempt: true })),
  { kind: "advance" },
);
expect(
  "açık uçlu · tavanda yanlış deneme → ilerle",
  decideAfterTutorReply(openResponse, reply({ exchanges: MAX_BEAT_EXCHANGES, attempt: 0, isAttempt: true })),
  { kind: "advance" },
);

// SÖZ ↔ AKIŞ: outcomeOfVerdict, istemcinin decideAfterTutorReply'ıyla HER durumda
// aynı sonucu vermeli — sunucu modele bu sonuca göre konuşmasını söylüyor.
console.log("— söz ↔ akış bağı —");
{
  let mismatches = 0;
  let cases = 0;
  for (const beat of [exercise, openResponse]) {
    for (let exchanges = 0; exchanges < MAX_BEAT_EXCHANGES; exchanges++) {
      for (let attempt = 0; attempt <= 1; attempt++) {
        for (const kind of TURN_KINDS) {
          for (const ok of [true, false]) {
            const surrendered = kind === "give_up";
            const v = { isAttempt: isAttemptKind(kind), ok: kind === "answer" && ok, surrendered };
            const said = outcomeOfVerdict(beat, { exchanges, attempt }, v);
            const flow = decideAfterTutorReply(beat, {
              exchanges: exchanges + 1,
              attempt,
              beatDone: judgedBeatDone(beat, attempt, v),
              isAttempt: v.isAttempt,
            }).kind;
            cases++;
            if ((said === "advance") !== (flow === "advance")) mismatches++;
          }
        }
      }
    }
  }
  expectTrue(`söz ile akış ${cases} durumda da aynı (${mismatches} ayrışma)`, mismatches === 0);
}
expectTrue("selam/rica deneme DEĞİL", !isAttemptKind("other") && !isAttemptKind("ask_help") && !isAttemptKind("repeat"));
expectTrue("cevap ve pes DENEMEDİR", isAttemptKind("answer") && isAttemptKind("give_up"));
expectTrue(
  "pes eden doğru SAYILMAZ (model ok=true dese bile)",
  !judgedBeatDone(exercise, 0, { isAttempt: true, ok: true, surrendered: true }),
);
expectTrue(
  "açık uçlu · son hakta yanlış → adım kapanır",
  judgedBeatDone(openResponse, 1, { isAttempt: true, ok: false, surrendered: false }),
);
expectTrue(
  "konu dışı söz adımı ASLA kapatmaz",
  !judgedBeatDone(openResponse, 5, { isAttempt: false, ok: true, surrendered: false }),
);
expect(
  "alıştırma · 1. yanlış, tavan uzak → aynı soruda bekle",
  { kind: outcomeOfVerdict(exercise, { exchanges: 0, attempt: 0 }, { isAttempt: true, ok: false, surrendered: false }) === "wait" ? "advance" : "invite" },
  { kind: "advance" },
);

// CANLI HATA 1: "Yok, bu kadar yeterli." tam-dize eşleşmesine takılıp LLM'e gitti,
// hoca soru penceresinde boş turlar döndü. classifyAck ≤4 kelimede kelime-sınırlı
// İÇERME de yapar.
// CANLI HATA 2 (25 Ağu 2026): "Merhaba, evet, hazırım." — "evet"(yes) +
// "hazırım"(proceed) iki sınıfa birden düşünce eski kural null diyordu; cevap
// LLM'e gitti, hoca DERSİ BAŞTAN TANITTI (çifte selamlama). yes+proceed çelişki
// DEĞİL, en doğal onaydır → proceed kazanır. "no" içeren çoklu eşleşme
// belirsiz kalır (LLM karar verir).
// SAF ONAY KURALI (4 Kas 2026, CANLI HATA 3): "tamam ama yoruldum" proceed sayıldı,
// "yoruldum" hiç duyulmadı. Artık sözün HER kelimesi bir onay ifadesine ait olmalı;
// fazladan söz anlam taşır → null → LLM. CANLI HATA 1'in ("Yok, bu kadar yeterli.")
// karşılığı artık yapısal windowDone (yukarıda); CANLI HATA 2'nin ("Merhaba, evet,
// hazırım.") karşılığı konuşma motorunun hazır-mısın satırları + GREETING_RULE
// (konuşma taramasında "merhaba"/"hello" vakaları) — çifte selam motorda kapalı.
console.log("— classifyAck (saf onay + çelişki koruması) —");
{
  const sets = {
    yes: ["evet", "var", "sorum var", "yes", "i have a question"],
    no: ["hayır", "yok", "sorum yok", "no"],
    proceed: ["tamam", "hazırım", "devam", "ok", "ready", "i'm ready"],
  };
  const cases: Array<[string, ReturnType<typeof classifyAck>]> = [
    ["tamam ama yoruldum", null], // CANLI HATA 3 — "yoruldum" yutulmamalı
    ["Yok, bu kadar yeterli.", null], // LLM + windowDone kapatır
    ["Yok, başka sorum yok.", null],
    ["no thanks that's all", null],
    ["Evet, bir sorum var!", null], // "bir" onay değil → hoca soruyu sormaya davet eder
    ["Merhaba, evet, hazırım.", null], // selam + onay → hoca kısa karşılık verir, ders ilerler
    ["yes", "yes"],
    ["evet sorum var", "yes"], // her kelime onay ifadesine ait
    ["yok yok", "no"],
    ["Tamam, hazırım!", "proceed"],
    ["yes, I'm ready", "proceed"], // yes+proceed = olumlu onay, çelişki değil
    ["evet tamam", "proceed"],
    ["yok tamam", null], // no+proceed GERÇEK çelişki → LLM karar versin
    ["Bu konuyu hiç anlamadım açıkçası ve tekrar ister misin", null], // >4 kelime
  ];
  for (const [text, want] of cases) {
    const got = classifyAck(text, sets);
    expectTrue(`classifyAck("${text}") → ${JSON.stringify(want)}`, got === want);
  }
}

// ---------------------------------------------------------------------------
// 6) KAPANIŞ — ders KENDİLİĞİNDEN bitmez, tek çıkış "Dersi Bitir" butonu
// ---------------------------------------------------------------------------
console.log("— kapanış (wrapup) —");

expect("'evet' → soruyu davet et", decideInWrapup("yes"), { kind: "invite" });
expect("'hayır' → veda (ders BİTMEZ)", decideInWrapup("no"), { kind: "farewell" });
expect("'tamam' → veda (ders BİTMEZ)", decideInWrapup("proceed"), { kind: "farewell" });
expect("gerçek soru → hocaya sor", decideInWrapup(null), { kind: "askTutor" });

// EN KRİTİK GÜVENCE: hiçbir girdi dersi bitiremez. Kullanıcının açık kararı buydu —
// practice fazında sayaç konuşmanın ortasında kapattığı için kondu.
const everyAck: (AckKind | null)[] = ["yes", "no", "proceed", null];
// AYNI ŞABLON İKİ KEZ OKUNMAZ: ikinci "tamam"/"evet" hocaya (LLM, geçmişi görür) gider.
expect("2. 'tamam' → aynı veda TEKRAR okunmaz", decideInWrapup("proceed", { farewells: 1 }), { kind: "askTutor" });
expect("2. 'evet' → aynı davet TEKRAR okunmaz", decideInWrapup("yes", { invites: 1 }), { kind: "askTutor" });
expect("veda sonrası 'evet' → davet hâlâ ilk kez", decideInWrapup("yes", { farewells: 1 }), { kind: "invite" });

const kinds = everyAck.flatMap((a) =>
  [{}, { invites: 3, farewells: 3 }].map((c) => decideInWrapup(a, c).kind),
);
expect(
  `hiçbir kapanış dalı dersi bitirmiyor (${kinds.join(", ")})`,
  { kind: kinds.some((k) => (k as string) === "finish") ? "askTutor" : "advance" },
  { kind: "advance" },
);

console.log(`\n${fail === 0 ? "✅" : "❌"} ${pass} geçti, ${fail} başarısız`);
process.exit(fail === 0 ? 0 : 1);
