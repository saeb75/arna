import type { Transition, Variants } from "motion/react";

/**
 * Hafif animasyon sözlüğü — tüm ekranlar aynı süre/eğriyi kullanır ki panel
 * "tek elden çıkmış" hissettirsin. Süreler kısa (≤250ms), hareket küçük (≤8px):
 * animasyon dikkat çekmez, geçişi yumuşatır.
 */
export const ease: Transition = { duration: 0.22, ease: [0.22, 1, 0.36, 1] };

/** Sayfa / kart girişi */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: ease },
};

/** Liste satırları: stagger, ilk N satırla sınırlı — 400 satırlık tabloda gecikme birikmesin */
export const STAGGER_MS = 22;
export const STAGGER_CAP = 18;
export const rowDelay = (index: number) => Math.min(index, STAGGER_CAP) * (STAGGER_MS / 1000);
