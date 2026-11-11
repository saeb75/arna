"use client";

import { useEffect } from "react";

/**
 * Önizleme kliplerini SIRAYLA çalar (ders istemcisiyle aynı zincir) — görünmez bileşen,
 * ekranın tek DOM yan etkisi. `playKey` değişince baştan çalar (aynı sesi ikinci kez
 * dinleme); söküldüğünde ya da yeni klip gelince çalan ses durur.
 * Kullananlar: TTS sağlayıcı önizlemesi, öğretmen ses örneği.
 */
export function ClipPlayer({ clips, playKey }: { clips: { audioBase64: string }[]; playKey: number }) {
  useEffect(() => {
    let current: HTMLAudioElement | null = null;
    let stopped = false;
    let index = 0;
    const playNext = () => {
      if (stopped) return;
      const clip = clips[index++];
      if (!clip) return;
      const audio = new Audio(`data:audio/mpeg;base64,${clip.audioBase64}`);
      current = audio;
      audio.onended = playNext;
      audio.onerror = playNext;
      void audio.play().catch(() => undefined); // otomatik çalma engeli: sonucu çağıran ekran zaten bildirdi
    };
    playNext();
    return () => {
      stopped = true;
      current?.pause();
    };
  }, [clips, playKey]);

  return null;
}
