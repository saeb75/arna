/**
 * ELLE YAZILAN DERS ÇEKİRDEKLERİ — kompakt yazım dili.
 *
 * İçerik artık LLM'e üretilmiyor (kullanıcı kararı, Ağu 2026): pedagojik hatalar
 * B1 toplu üretiminde yayın engelleyici sayıdaydı. Bu dosya, elle yazılan dersin
 * DAR bir tanımını alıp `LessonCore` + `SceneSet` şemalarına çevirir; sabit
 * yapı (beat sırası, id şeması, intent metinleri) burada tek yerde durur.
 *
 * Yazarın sorumluluğu: iddialar, örnekler, alıştırmalar, sahneler.
 *
 * OYUN BLOĞU YAZIM KURALLARI (dış incelemelerden, 10 Kas 2026 — lint bunları YAKALAYAMAZ):
 *  1. Çeldirici "daha az tipik" değil KESİN yanlış: any+tekil ("isn't any bank"), düz cümle
 *     soru ("There is a…?"), vurgulu sıra ("he always is late") çeldirici OLAMAZ.
 *  2. Hatalı kelimeye dokun: TEK kelime düzeltir — özne–fiil uyumu, yardımcı fiil (is→can) ya
 *     da zarfa dönüşen yardımcı (can→often) ile de düzelen cümle yazılmaz; şüphede `fc`.
 *  3. Sıralamada ikinci doğru dizilim olmaz: çeldirici kart yerine geçerek (under/on), alt
 *     kümeyle ("They wait outside") ya da GEZGİN kelimeyle (usually, very, always başka yere
 *     geçer) ya da ÇIKARILABİLİR kelimeyle (ever, already, yet, please → alt küme de cümle).
 *     Böyle cümle `arr`a konmaz — `la` (ses belirler) ya da `fc`. Çeldirici = yanlış çekim.
 *  4. Öğretmeden sınama yok: alıştırma, rol yapma hedefi ve açılıştaki her kalıp öğretim
 *     maddesinde geçer; sonraki dersin grameri öne alınmaz.
 *  5. `mix` gerçekten ≥2 öğretim maddesini birlikte sınar.
 *  6. Durum maddesi OLGU verir ("hates tea" ≠ never, "in the car" ≠ driving, "today" ≠ now).
 *  7. Açılış sesli: karakterin gördüğü resim/eşya yok — sözle kur ("Choose one thing in your
 *     bag. What is it?"); "Are you ready?" ile bitme; olumsuz dersinde olumluya kaçılmasın.
 *  8. İddia aşırı genelleme yapmaz ("always", "only", "before the person").
 *  9. Eşleştirmede çapraz geçerlilik yok: her sol öğe YALNIZ kendi sağıyla doğru ("a cup of"
 *     ↔ coffee yanında "a cup of water" da olur → yasak; tepki eşleştirmesi de yasak).
 * 10. Dinleme çeldiricisi tek sesle ayrılmaz (rice/ice, coast/coat, can/can't).
 *     Öznel yargıda (fiyat, beğeni) öğrencinin fikri durumda açıkça yazılır.
 * — B1/B2 incelemelerinden (Codex, ~90 bulgu) —
 * 11. Hatalı kelime başka TEK kelimeyle de düzeliyorsa yazılmaz: yardımcı → did/zarf ("I was
 *     walk" → did), zaman ifadesinin ismi ("since ten years" → o'clock), sabit kalıbın başka
 *     kelimesi ("In a meantime" → minute), ana isim ("the friend which" → app), silme.
 *     Biçim hatası ancak yardımcı hiçbir şeye dönüşemiyorsa; yoksa `fc`.
 * 12. Sıralama/dinle-sırala: paralel öğeler yer değiştirir ("refused to X but promised to
 *     Y"), ettirgen ↔ past perfect ("had the kitchen painted" / "had painted the kitchen"),
 *     fazla kart yardımcının yerine geçip başka zaman kurar (would→will). Ses de kurtarmaz → `lc`.
 * 13. Çeldirici bağlamda ya da deyim olarak doğru olabiliyor mu: gerçek deyim ("fill us in"),
 *     virgülle bağlanabilen cümle, yaygın standart dışı biçim, bölgesel varyant ("There
 *     again"), hipotetik -ing ("I'd really like taking"), belirsizlikte must ("I'm not sure"),
 *     örtüşen anlamlı yapı (try doing/to do), bağlamda doğru olumsuz ("don't have plenty").
 *     En güvenli çeldirici biçim hatasıdır (fitting/fitted).
 * 14. Çıkarım ve perfect: must/can't kanıtı mantıksal ZORUNLU ("no internet"); perfect
 *     zamanda açık referans noktası; dolaylı anlatımda backshift bağlamı açık.
 * 15. Eş kalıpların (which/that, may/might) her biri en az bir maddede DOĞRU cevap olur;
 *     söylem işaretleyicisinin işlevi bağlamla örtüşür; iddianın kapsamı maddeyle örtüşür.
 * 16. Açılış: hedef bir soruysa öğrenciye soru SORDURUR ("Ask me how long…"); cevabı ya da
 *     hedefi kendisi söylemez; hedefin zamanında sorar ("What does it sound like?" ≠
 *     "sounded"); sahne/track rolüne uyar; canlı sohbette yazılı formül, yığılmış nezaket
 *     yok; her hedef kalıbı en az bir açılış çağırır.
 * 17. Quiz boşluğu birden çok kabul edilir cevap alıyorsa `qmcq` yazılır; çift kelime ve
 *     çelişkili kök yok. `claimsEn` en fazla 4 madde (Zod reddeder).
 * — C1/C2 incelemelerinden (Codex, ~200 bulgu) —
 * 18. İleri seviyede LEHÇE/ÜSLUP geçerli biçim çeldirici değildir ("And he go", "strong rain",
 *     "between X or Y", İngiliz/Amerikan dilek kipi "It's time we talk"), işaretli ama dilbilgisel
 *     sıra da değildir ("It precisely is…" vurguyla geçerli). Biçim hatası kesin yanlış olmalı.
 * 19. İroni ve ton: şaka/takılma bağlamında çeldirici ironi diye savunulabilir; ses tonu
 *     taşımayan madde ("I'll remember this") kelimeleriyle yanlış olmalı. Durum ironiyi dışlar.
 * 20. Doğru şık dersin kendi iddiasını çiğnemez ("That's a fair question" deyip cevap vermemek
 *     kaçamak dersinde doğru olamaz); konuşma kartı/örnek de iddianın uyardığı şeyi yapmaz.
 *     İçerik vaat eden doğru şık ("Here's what happened") içeriği de verir.
 * 21. Durum ↔ cevap tam örtüşür: cevap durumda verilmemiş olgu uydurmaz (sayı, karar), durumun
 *     kapsamını aşmaz ("in shops" ≠ "everywhere"); soru cevabın tersini varsaymaz ("Who
 *     decided…?" ↔ "Nothing has been decided"); "it follows that" maddesinde her öncül yazılır.
 * 22. Sohbeti tamamla da bağlam ister: önceki satırlar konuşanın niyetini ve olguları kurar —
 *     yalnız soru + boşluk her tavrı geçerli kılar. Çıkarım cevabı kanıt zorunlu değilse "may".
 * 23. Hikâye/senaryo tutarlılığı: öncül sonuçla çelişmez, "it gets better"dan sonra gerçekten
 *     artan ayrıntı gelir, "before we close"dan sonra yeni gündem gelmez; zamir göndergesi tek.
 * 24. Açılış metadilsel olmaz ("How do you…?", "Why does X matter?" açıklama çağırır, kalıp değil):
 *     hocanın açılışı da somut bir durumdur; sınav simülasyonunda rol, rol etiketinde durur ve
 *     açılış kararı/cevabı söylemez. Sıralama kartında özne/nesne yer değiştirebiliyorsa `lc`.
 * Bu dosyanın sorumluluğu: onları şemanın ve lint'in beklediği şekle sokmak.
 */
import {
  CORE_FORMAT,
  SCENE_FORMAT,
  TRACKS,
  sentenceTiles,
  type DrillItem,
  type LessonCore,
  type SceneSet,
} from "@glotmate/contracts";

// --- Öğretim noktası ---------------------------------------------------------
export interface Pt {
  /** Öğretilen kalıbın KENDİSİ (tarif değil) — dil paketleri buna adıyla atıfta bulunur */
  form: string;
  /** Dersin İDDİALARI: kısa, doğrulanabilir, seviyeye uygun */
  claims: string[];
  /** İddiaların kanıtı: tam cümleler */
  ex: string[];
}

// --- Alıştırmalar ------------------------------------------------------------
/**
 * `opts` yalnızca DIŞA AKTARIM için var (export-authored.ts): elle yazarken hiçbiri
 * gerekmez, varsayılanlar doğrudur. LLM'e üretilmiş B1 bunlarsız kayıpsız geri
 * yazılamıyordu — beat id'leri farklıydı (ve oturum script'i beat id'siyle
 * anahtarlanıyor), bir derste `exampleAnswer` kabul listesinin ilk maddesi değildi,
 * bir derste kısaltmalar kapalıydı.
 */
export interface ExOpts {
  /** Beat kimliği; verilmezse ex1, ex2… üretilir */
  id?: string;
  /** İpucu olarak gösterilen cevap; verilmezse kabul listesinin ilki kullanılır */
  example?: string;
  /** say_sentence için kısaltma toleransı (varsayılan true) */
  contractions?: boolean;
}

export type Ex =
  | ({ t: "fill"; item: string; accept: string[] } & ExOpts)
  | ({ t: "mcq"; item: string; options: string[]; correct: number } & ExOpts)
  | ({ t: "say"; item: string; accept: string[] } & ExOpts);

/** Boşluk doldurma — item TAM BİR ___ içermeli; kabul listesi geniş tutulur */
export const fill = (item: string, accept: string[], o: ExOpts = {}): Ex => ({ t: "fill", item, accept, ...o });
/** Çoktan seçmeli — çeldiriciler TARTIŞMASIZ yanlış olmalı (B1 incelemesi dersi) */
export const mcq = (item: string, options: string[], correct: number, o: ExOpts = {}): Ex => ({ t: "mcq", item, options, correct, ...o });
/** Cümle kurma — kabul listesi kısaltmalı/kısaltmasız tüm doğal biçimleri içerir */
export const say = (item: string, accept: string[], o: ExOpts = {}): Ex => ({ t: "say", item, accept, ...o });

// --- Oyun bloğu (drills) ----------------------------------------------------
/**
 * Bir drill maddesi — kimlik opsiyonel (verilmezse d1, d2… üretilir).
 * YAZIM KURALLARI (lint'in yakalayamadıkları):
 *  - Her madde bağlamla TEK doğru cevaba kilitlenir; çeldirici "o da olur" olamaz.
 *  - Şıklı türlerde DOĞRU ŞIK İLK yazılır; servis anında seed'li karıştırılır.
 *  - Konuşma kartı cümlesinde özel isim yok (STT "Ana"yı "Anna" yazar → haksız ret).
 *  - Quiz maddeleri (ünite testi havuzu) burada TEKRAR EDİLMEZ.
 */
export type Dr = DistributiveOmit<DrillItem, "id"> & { id?: string };
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** Boşluğu doldur — `sentence` TAM bir ___ içerir; ilk şık doğru */
export const fc = (ref: string, sentence: string, options: string[]): Dr => ({
  type: "fill_choice", pointRef: ref, sentence, options, correctIndex: 0,
});
/** Kelimeleri sırala — kartlar cümleden türer; `extra` çeldirici kartlar */
export const arr = (ref: string, answer: string, extra: string[] = []): Dr => ({
  type: "arrange", pointRef: ref, answer, extraTiles: extra, alsoAccept: [],
});
/** Durumu oku, doğru kalıbı seç — ilk şık doğru */
export const sit = (ref: string, context: string, options: string[]): Dr => ({
  type: "situation", pointRef: ref, context, options, correctIndex: 0,
});
/**
 * Hatayı bul — `wrong` cümlede TEK kez geçen yanlış kelime, `fix` doğrusu.
 * KURAL (dış inceleme, 10 Kas 2026): yalnız TEK kelimeyle düzelebilen hatalar
 * ("Im", "amn't", "ours", "a artist"). Özne–fiil uyumu hatası YAZILMAZ: "We is…"
 * cümlesi "We→He" ile de düzelir, iki doğru dokunuş olur — onun yerine `fc` ile
 * özne sabit, fiil boşlukta ("We ___ in the same class.").
 */
export const err = (ref: string, sentence: string, wrong: string, fix: string): Dr => {
  const words = sentence.split(" ");
  const hits = words.flatMap((w, i) => (sentenceTiles(w)[0] === wrong ? [i] : []));
  if (hits.length !== 1) throw new Error(`err(): "${wrong}" cümlede tam bir kez geçmeli: ${sentence}`);
  return { type: "find_error", pointRef: ref, sentence, wrongIndex: hits[0]!, fix };
};
/**
 * Sohbeti tamamla — satırlar `them`/`you` diye SIRAYLA (them başlar); öğrencinin
 * satırı `null`. İlk şık doğru.
 */
export const chat = (ref: string, lines: Array<string | null>, options: string[]): Dr => ({
  type: "complete_chat",
  pointRef: ref,
  lines: lines.map((text, i) => ({ who: i % 2 === 0 ? ("them" as const) : ("you" as const), text })),
  options,
  correctIndex: 0,
});
/** Eşleştir — İngilizce↔İngilizce çiftler */
export const pairs = (ref: string, ps: Array<[string, string]>): Dr => ({
  type: "match", pointRef: ref, pairs: ps.map(([left, right]) => ({ left, right })),
});
/** Duyduğunu seç — `audio` doğru şıktır; `distractors` sesçe/biçimce yakın yanlışlar */
export const lc = (ref: string, audio: string, distractors: string[]): Dr => ({
  type: "listen_choose", pointRef: ref, audio, options: [audio, ...distractors], correctIndex: 0,
});
/** Duyduğuna dokun — cümle sesle çalar, kartlarla kurulur */
export const la = (ref: string, audio: string, extra: string[] = []): Dr => ({
  type: "listen_arrange", pointRef: ref, audio, extraTiles: extra,
});
/** Bu cümleyi söyle — `accepted` boşsa yalnız cümlenin kendisi */
export const spk = (ref: string, sentence: string, accepted: string[] = []): Dr => ({
  type: "speak", pointRef: ref, sentence, accepted, contractionsAllowed: true,
});

// --- Mini test ---------------------------------------------------------------
export type Q =
  | { t: "qmcq"; stem: string; options: string[]; correct: number }
  | { t: "qfill"; text: string; answers: string[] };

export const qmcq = (stem: string, options: string[], correct: number): Q => ({ t: "qmcq", stem, options, correct });
export const qfill = (text: string, answers: string[]): Q => ({ t: "qfill", text, answers });

// --- Sahne -------------------------------------------------------------------
export interface Sc {
  name: string;
  role: string;
  goal: string;
  scene: string;
  objective: string;
  /** Soruyla BİTMELİ (lint) ve hedef kalıbı ÖĞRENCİYE söyletmeli, avatar söylememeli */
  opening: string;
  mood?: string;
}
export const sc = (
  name: string,
  role: string,
  goal: string,
  scene: string,
  objective: string,
  opening: string,
  mood?: string,
): Sc => ({ name, role, goal, scene, objective, opening, mood });

// --- Ders --------------------------------------------------------------------
export interface Authored {
  /** Katalog ders kimliği (a1-hello-im gibi) */
  id: string;
  /** Kısa İngilizce konu etiketi */
  topic: string;
  objectives: string[];
  /** communicationGoal */
  goal: string;
  target: string;
  correction: string;
  summary: string;
  points: Pt[];
  /** Eski biçim alıştırmalar — `drills` varsa BOŞ olmalı */
  ex: Ex[];
  /**
   * Oyunlaştırılmış alıştırma bloğu (10 Kas 2026). Varsa `ex` ve `open` yazılmaz:
   * anlatım → duyuru → oyun bloğu → rol yapma.
   */
  drills?: Dr[];
  open?: { q: string; must: string[]; criteria: string; example: string };
  success: string;
  minutes?: number;
  minUses?: number;
  maxTurns?: number;
  /**
   * Hocanın o beat'te NE YAPACAĞI (cümlesi değil). Elle yazımda gerekmez —
   * aşağıdaki kanonik metinler kullanılır. Yalnızca dışa aktarımda doldurulur:
   * B1'in 55 dersinde derse özel, daha zengin intent metinleri vardı ve onları
   * kanoniğe indirgemek gerçek bir içerik kaybı olurdu.
   */
  intents?: Partial<Record<"readiness" | "teach" | "questions" | "say", string>>;
  quiz?: Q[];
  /** SIRA: everyday, work, travel, academic, exam */
  scenes: [Sc, Sc, Sc, Sc, Sc];
}

const INTENTS = {
  readiness: "greet, name today's topic, ask if ready",
  teach: "announce the explanation",
  questions: "invite any question before the exercises",
  say: "acknowledge and announce a few practice questions",
} as const;

export function buildCore(a: Authored, catalog: { focus: string; mustUse: string[] }): LessonCore {
  const it = { ...INTENTS, ...a.intents };
  const beats: LessonCore["lecture"]["beats"] = [
    { id: "b1", kind: "ask", purpose: "readiness", intent: it.readiness },
    {
      id: "b2",
      kind: "teach",
      introIntent: it.teach,
      points: a.points.map((p, i) => ({
        id: `p${i + 1}`,
        formEn: p.form,
        claimsEn: p.claims,
        examples: p.ex.map((textEn, j) => ({ id: `p${i + 1}e${j + 1}`, textEn })),
      })),
    },
    { id: "b3", kind: "ask", purpose: "questions", intent: it.questions },
    { id: "b4", kind: "say", intent: it.say },
  ];

  a.ex.forEach((e, i) => {
    const id = e.id ?? `ex${i + 1}`;
    if (e.t === "fill") {
      beats.push({
        id, kind: "exercise", format: "fill_blank", item: e.item,
        answerSpec: { kind: "token", accepted: e.accept },
        exampleAnswer: e.example ?? e.accept[0]!,
      });
    } else if (e.t === "mcq") {
      beats.push({
        id, kind: "exercise", format: "mcq", item: e.item, options: e.options,
        answerSpec: { kind: "choice", correctIndex: e.correct },
        // MCQ'da ipucu DOĞRU ŞIKKIN birebir kopyası olmalı (lint kuralı)
        exampleAnswer: e.options[e.correct]!,
      });
    } else {
      beats.push({
        id, kind: "exercise", format: "say_sentence", item: e.item,
        answerSpec: { kind: "utterance", accepted: e.accept, contractionsAllowed: e.contractions ?? true },
        exampleAnswer: e.example ?? e.accept[0]!,
      });
    }
  });

  if (a.drills?.length) {
    if (a.ex.length || a.open) throw new Error(`${a.id}: drills varken ex/open yazılmaz`);
    beats.push({
      id: "b5",
      kind: "drills",
      items: a.drills.map((d, i) => ({ ...d, id: d.id ?? `d${i + 1}` }) as DrillItem),
    });
  }

  if (a.open) {
    beats.push({
      id: "b8", kind: "open_response", question: a.open.q,
      rubric: { mustUse: a.open.must, criteria: a.open.criteria },
      exampleAnswer: a.open.example, maxAttempts: 2,
    });
  }

  return {
    coreFormat: CORE_FORMAT,
    topic: a.topic,
    focus: catalog.focus,
    objectives: a.objectives,
    communicationGoal: a.goal,
    estMinutes: a.minutes ?? 6,
    tutorNotes: { target: a.target, correctionStyle: a.correction },
    summary: a.summary,
    lecture: { beats },
    practice: {
      // KATALOGDAN — yazar bu alanı dolduramaz (kural: ölçümü besleyen alan tek kaynaktan)
      mustUse: catalog.mustUse,
      minTargetUses: a.minUses ?? 2,
      successCriteria: a.success,
      maxTurns: a.maxTurns ?? 8,
    },
    quiz: a.quiz?.map((q, i) =>
      q.t === "qmcq"
        ? { id: `q${i + 1}`, type: "mcq" as const, stem: q.stem, options: q.options, correctIndex: q.correct }
        : { id: `q${i + 1}`, type: "fill_blank" as const, text: q.text, answers: [q.answers] },
    ),
  };
}

export function buildScenes(a: Authored): SceneSet {
  const scenes = Object.fromEntries(
    TRACKS.map((t, i) => {
      const s = a.scenes[i]!;
      return [
        t,
        {
          persona: { name: s.name, role: s.role, goal: s.goal, ...(s.mood ? { mood: s.mood } : {}) },
          scene: s.scene,
          objective: s.objective,
          avatarOpening: s.opening,
        },
      ];
    }),
  ) as SceneSet["scenes"];
  return { sceneFormat: SCENE_FORMAT, scenes };
}
