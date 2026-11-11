import { createContext, useContext } from "react";
import type { DrillAnswer } from "@glotmate/contracts";

/**
 * OYUN MADDESİNİN EV SAHİBİ — oyun bileşenleri iki ekranda oynanır (dersin oyun bloğu
 * ve ünite testi) ve G/Ç'yi bilmez: ses, kontrol, ilerleme, çeviri ve konuşma kartı
 * buradan gelir. Ders ekranı LessonDrillController'a, test ekranı kendi puanlamasına
 * bağlar. Opsiyonel alanlar yoksa bileşen o özelliği göstermez (testte dokun-çevir,
 * "Konuyu hatırla" ve konuşma kartı yok).
 */
export interface DrillHostValue {
  /** İngilizce cümleyi seslendir (dinleme maddesi, konuşma kartı örneği) */
  play: (text: string) => void;
  speaking: boolean;
  /** "Kontrol et" — ya da eşleştirmenin bitişi */
  check: (answer: DrillAnswer) => void;
  /** Panel sonrası "Devam" */
  next: () => void;
  continueLabel: string;
  /** Dokun-çevir (yalnız derste) */
  translate?: (text: string) => void;
  translation?: { source: string; text: string | null } | null;
  /** "Konuyu hatırla" (yalnız derste) */
  recall?: () => void;
  /** Konuşma kartı (yalnız derste) */
  speech?: {
    recording: boolean;
    busy: boolean;
    heard: string | null;
    attempts: number;
    press: () => void;
    release: () => void;
    cantSpeak: () => void;
  };
  /** Yanlış cevapta seçilen şıkka ek açıklama (testte quiz geri bildirimi) */
  feedbackFor?: (choice: number | null) => string | null;
}

const DrillHostContext = createContext<DrillHostValue | null>(null);

export const DrillHostProvider = DrillHostContext.Provider;

export function useDrillHost(): DrillHostValue {
  const host = useContext(DrillHostContext);
  if (!host) throw new Error("useDrillHost: DrillHostProvider yok");
  return host;
}
