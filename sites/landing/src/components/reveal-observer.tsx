"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals `[data-reveal]` elements as they scroll in (fade in, rising — globals.css). Elements already on screen are
 * left alone, so nothing above the fold blinks; the rest are armed (hidden) and shown once, the first time they
 * enter. Reduced motion: nothing is armed.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const fold = window.innerHeight;
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal) return;
      if (el.getBoundingClientRect().top < fold) return;
      el.dataset.reveal = "armed";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
