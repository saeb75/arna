import { useEffect, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

/**
 * Sahne döngüsü: `count` adımı `ms` arayla sayar, sonra başa döner. Hareketi
 * Azalt açıkken son adımda DURUR (sahne tam hâliyle, hareketsiz görünür).
 */
export function useLoopStep(count: number, ms: number, startDelay = 600): number {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? count - 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (n: number) => {
      timer = setTimeout(() => {
        const next = (n + 1) % count;
        setStep(next);
        tick(next);
      }, n === count - 1 ? ms * 2.2 : ms);
    };
    timer = setTimeout(() => tick(0), startDelay);
    return () => clearTimeout(timer);
  }, [count, ms, startDelay, reduceMotion]);
  return step;
}
