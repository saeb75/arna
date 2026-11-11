import { create } from "zustand";
import type {
  DrillState,
  LessonContentV7,
  LessonPhase,
  RichText,
  SessionPosition,
  SessionScript,
  TranscriptTurn,
} from "@glotmate/contracts";
import { DEFAULT_AVATAR_ID } from "@glotmate/contracts";
import { FALLBACK_TUTOR_NAME } from "../domain/tutors";

/**
 * Ders oturumu durumu — web sayfasındaki useState+useRef yığınının store karşılığı.
 * Store'a YALNIZ LessonSessionController yazar (mobil CLAUDE.md sözleşmesi).
 *
 * Web'de ref olan sayaçlar burada düz alan: tepkisel olmaları zararsız, ve
 * "aktarım hatası hak yemez" kuralı için geri alınabilir olmaları yeterli.
 */
export type Awaiting = "ask" | "exercise" | "open_response" | "drills" | "practice" | "wrapup" | null;

/** Oyun bloğunda kontrol edilmiş maddenin sonucu — geri bildirim paneli bunu okur */
export interface DrillVerdict {
  /** Hangi maddenin sonucu — madde değişince panel kendiliğinden düşer */
  itemKey: string;
  ok: boolean;
}

export interface LessonMessage {
  id: string;
  role: "teacher" | "user";
  text: string;
  runs?: RichText;
  /** teach beat'inin maddeleri — balonda satır satır gösterilir */
  points?: RichText[];
}

export type SessionPhase = LessonPhase | "done";

/** GET /v1/lessons/:id/resume yanıtındaki sürdürülebilir oturum paketi */
export interface LessonResume {
  sessionId: string;
  startedAt: string;
  position: SessionPosition;
  script: SessionScript;
  lesson: LessonContentV7;
  transcript: TranscriptTurn[];
  /** Oturuma pinli öğretmen (eski sunucuda yok) — devamda yüz + ad bundan, ses de sunucuda bu öğretmende */
  tutor?: { avatarId: string; name: string };
}

interface LessonSessionState {
  sessionId: string | null;
  /** Ekranın açtığı katalog dersi — start() oturumu bununla kurar */
  catalogLessonId: string | null;
  lesson: LessonContentV7 | null;
  script: SessionScript | null;
  loadError: string | null;
  /** Açık oturum varsa devam paketi — kart "Devam et / Baştan başla" gösterir */
  resume: LessonResume | null;
  /** Öğrencinin öğretmeninin yüzü (GET /v1/avatar `activeId`) — AvatarStage çizer */
  avatarId: string;
  /** Öğretmenin adı (aynı cevabın `tutorName`'i) — sahne, durum ve yer tutucu metinleri */
  tutorName: string;

  started: boolean;
  phase: SessionPhase;
  beatIndex: number;
  awaiting: Awaiting;
  messages: LessonMessage[];
  /**
   * Şu anki alıştırmayı/açık uçlu soruyu SORAN balonun kimliği — YALNIZ sunum:
   * ekran görev kartında soruyu ayrı, sonraki hoca sözlerini (geri bildirim)
   * ayrı gösterir. Akış kararı DEĞİLDİR.
   */
  promptMessageId: string | null;
  hint: RichText | null;
  /**
   * Kısa sistem uyarısı (NoticeBar): STT düştü, cevap alınamadı, ses çalınamadı.
   * Eskiden bu anlar sessizdi. Yalnız sunum — akış kararı DEĞİLDİR.
   */
  notice: string | null;

  speaking: boolean;
  recording: boolean;
  /** Sunucu düşünürken girişler kilitli — TEK kilit sebebi bu */
  busy: boolean;
  /**
   * İLERİ SARMA (web'deki `fastForward`): söz kesildi — hoca metni akmaya devam
   * eder ama TTS'e HİÇ gidilmez. Akış bir bekleme noktasına varınca kapanır;
   * tek sahibi `arrive()`.
   */
  fastForward: boolean;
  /**
   * Hoca konuşurken gelen öğrenci sözü: akış `awaiting`'e varana kadar burada
   * bekler, sonra normal yoluna teslim edilir.
   */
  pendingInput: string | null;
  /**
   * Yeni hoca balonu düştükten sonraki kısa kilit (INPUT_GRACE_MS): kullanıcı
   * okumaya fırsat bulmadan yanlışlıkla sözü kesmesin. Kilit YALNIZCA bu aralıkta.
   */
  grace: boolean;
  /**
   * Ekrandan çıkıldı: yürüyen zincir buradan sonra hiçbir şey yazmaz. İleri sarma
   * ağ beklemediği için saniyeler süren bir hayalet zincir bırakabilirdi.
   */
  stopped: boolean;

  /**
   * OYUN BLOĞU (drills) — blok içindeyken dolu, dışında null. Kuyruk/puan kararı
   * contracts `drillGrade`'de; burada yalnız durum. Pozisyona aynen yazılır (devam).
   */
  drill: DrillState | null;
  /** Kontrol edilmiş maddenin sonucu (Kontrol et → panel → Devam) */
  drillVerdict: DrillVerdict | null;
  /** Konuşma kartında o maddedeki deneme sayısı + son duyulan söz */
  drillSpeakAttempts: number;
  drillHeard: string | null;
  /** Blok bitti: özet kartı (rol yapmaya geçiş butonu) */
  drillSummary: { ok: number; total: number } | null;
  /** Dokun-çevir: hangi metnin çevirisi gösteriliyor */
  drillTranslation: { source: string; text: string | null } | null;

  /**
   * Rol yapmada ekrandaki hedef çiplerinin tiki: `practice.mustUse` içinden öğrencinin
   * BİREBİR söyledikleri (contracts `usedTargetPhrases`). Yalnız gösterim — ölçüm sunucuda.
   */
  practiceUsed: string[];

  // sayaçlar — web'deki ref'lerin karşılığı
  beatExchanges: number;
  invites: number;
  /** Kapanışta script vedası kaç kez söylendi — aynı veda iki kez okunmaz */
  farewells: number;
  attempt: number;
  praiseIndex: number;
  practiceTurn: number;

  set: (p: Partial<LessonSessionState>) => void;
  pushMessage: (m: LessonMessage) => void;
  reset: () => void;
}

const initial = {
  sessionId: null,
  catalogLessonId: null as string | null,
  lesson: null,
  script: null,
  loadError: null,
  resume: null as LessonResume | null,
  avatarId: DEFAULT_AVATAR_ID,
  tutorName: FALLBACK_TUTOR_NAME,
  started: false,
  phase: "lecture" as SessionPhase,
  beatIndex: 0,
  awaiting: null as Awaiting,
  messages: [] as LessonMessage[],
  promptMessageId: null as string | null,
  hint: null as RichText | null,
  notice: null as string | null,
  speaking: false,
  recording: false,
  busy: false,
  fastForward: false,
  pendingInput: null as string | null,
  grace: false,
  stopped: false,
  drill: null as DrillState | null,
  drillVerdict: null as DrillVerdict | null,
  drillSpeakAttempts: 0,
  drillHeard: null as string | null,
  drillSummary: null as { ok: number; total: number } | null,
  drillTranslation: null as { source: string; text: string | null } | null,
  practiceUsed: [] as string[],
  beatExchanges: 0,
  invites: 0,
  farewells: 0,
  attempt: 0,
  praiseIndex: 0,
  practiceTurn: 0,
};

export const useLessonSessionStore = create<LessonSessionState>((set) => ({
  ...initial,
  set: (p) => set(p),
  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  reset: () => set(initial),
}));
