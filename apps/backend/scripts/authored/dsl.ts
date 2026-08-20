/**
 * ELLE YAZILAN DERS ÇEKİRDEKLERİ — kompakt yazım dili.
 *
 * İçerik artık LLM'e üretilmiyor (kullanıcı kararı, Ağu 2026): pedagojik hatalar
 * B1 toplu üretiminde yayın engelleyici sayıdaydı. Bu dosya, elle yazılan dersin
 * DAR bir tanımını alıp `LessonCore` + `SceneSet` şemalarına çevirir; sabit
 * yapı (beat sırası, id şeması, intent metinleri) burada tek yerde durur.
 *
 * Yazarın sorumluluğu: iddialar, örnekler, alıştırmalar, sahneler.
 * Bu dosyanın sorumluluğu: onları şemanın ve lint'in beklediği şekle sokmak.
 */
import { CORE_FORMAT, SCENE_FORMAT, TRACKS, type LessonCore, type SceneSet } from "@arna/contracts";

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
  ex: Ex[];
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
