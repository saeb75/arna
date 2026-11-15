// KATMANLI BEDEN DURUŞU — LifePose → katman dönüşümleri (saf; web/mobil çizimden bağımsız).
//
// Yüz ağı olmayan (native) çizicide beden üç katmandır: arka plan, gövde (+ boyun altlığı), baş.
// Eskiden gövde yalnız ±1,6 px kayıp 1 px kalkıyordu — derste avatar kartı küçük olduğu için bu
// ekranda yarım pikselin altındaydı ("dümdüz duruyor, resim gibi", 14 Kas 2026) ve baş sallama
// kafanın BÜTÜN olarak aşağı kaymasıydı (çene yakanın içine girip çıkıyordu: "öne girip arkaya").
// Şimdi:
//   - NEFES: gövde alt-ortadan genişleyip yükselir (omuz + göğüs); baş bunun bir kısmıyla binerek
//     kalkar → yaka boyunda hafifçe kayar (nefesi asıl okutan bu göreli hareket).
//   - AĞIRLIK AKTARMA / SALINIM: gövde kadrajın ALTINDAKİ bir pivottan (kalça) eğilir; baş boyun
//     noktasıyla birlikte taşınır ve eğimin yarısını alır (baş dik kalma eğilimi).
//   - BAŞIN BOYUTU ASLA DEĞİŞMEZ. Baş sallamayı boyundan dikey ölçekle (eğim) ve dinlerken
//     yakınlaşmayı ölçekle yapmak denendi, reddedildi: "kafası küçülüp büyüyor, eskisinden kötü"
//     (14 Kas 2026). Baş yalnız ötelenir ve döner; sallama eski kaymanın kısılmış hâlidir, vurgunun
//     bir kısmını gövde taşır (`bodyBob`) — baş yakaya göre daha az girip çıkar.
//   - ÖLÇEK KAZANCI: hareket tuval pikseliyle tanımlı; küçük kutuda görünmez kalmasın diye kutu
//     ölçeği düştükçe büyütülür (`motionGain`).
import type { LifePose } from "./life.js";

export interface LayerPose {
  /** öteleme (tuval pikseli) */
  x: number;
  y: number;
  /** dönme (rad, + = saat yönü), katmanın pivotu etrafında */
  rot: number;
  /** ölçek, katmanın pivotu etrafında */
  sx: number;
  sy: number;
}

export interface BodyPose {
  bg: { x: number; y: number };
  /** gövde + boyun altlığı — pivot: tuvalin alt-ortası (`bodyPivot`) */
  body: LayerPose;
  /** baş — pivot: boyun (`rig.motion.neck`) */
  head: LayerPose;
}

export interface BodyRig {
  width: number;
  height: number;
  motion: { neck: [number, number] };
}

/** Gövde katmanının pivotu: tuvalin alt-ortası (nefes buradan yukarı genişler) */
export const bodyPivot = (rig: { width: number; height: number }): [number, number] => [rig.width / 2, rig.height];

/** Kalça pivotu tuvalin bu kadar altında (px): gövde eğilince omuzlar bele göre daha çok kayar */
const HIP_DEPTH = 420;
/** Nefesin gövde ölçeğine etkisi (pose.breath = 1 için) */
const BREATH_SY = 0.0075;
const BREATH_SX = 0.004;
/** Baş, yakanın nefesle kalkışının bu kadarını alır (kalan fark = yaka boyunda kayar) */
const HEAD_RIDE = 0.6;
/** Baş sallamanın başa düşen payı (tuval pikseli / life.ts nod birimi) — eskiden 0,8 */
const HEAD_NOD = 0.5;

/**
 * Kutu ölçeği (ekran noktası / tuval pikseli) → hareket çarpanı. Tuval pikseliyle tanımlı
 * genlikler ders kartında (ölçek ≈ 0,18) ekranın yarım pikselinin altına düşüyordu; büyük
 * sahnede (≥ 0,36) genlik olduğu gibi kalır.
 */
export function motionGain(displayScale: number): number {
  if (!(displayScale > 0)) return 1;
  return Math.max(1, Math.min(2.2, 0.36 / displayScale));
}

export function bodyPose(pose: LifePose, rig: BodyRig, gain = 1): BodyPose {
  const g = gain;
  // derin nefes olayı + kazanç birlikte yakayı fazla kaldırmasın
  const breath = Math.min(2.8, g * pose.breath);

  const body: LayerPose = {
    sx: 1 + BREATH_SX * breath,
    sy: 1 + BREATH_SY * breath,
    rot: g * pose.bodyLean,
    // kalça pivotundan dönme = alt-ortadan dönme + yatay öteleme (küçük açı)
    x: g * (pose.bodyShift + pose.bodyLean * HIP_DEPTH),
    y: g * pose.bodyBob,
  };

  // boyun noktası gövdeyle nereye gidiyor (gövde pivotuna göre `up` kadar yukarıda)
  const [neckX, neckY] = rig.motion.neck;
  const up = rig.height - neckY;
  const head: LayerPose = {
    x: body.x + body.rot * up + 0.6 * pose.yaw + (neckX - rig.width / 2) * (body.sx - 1),
    y: body.y - HEAD_RIDE * up * BREATH_SY * breath + HEAD_NOD * pose.nod,
    // açı her ölçekte aynı okunur: baş eğimine kazanç UYGULANMAZ (yalnız piksel altına düşen ötelemelere)
    rot: pose.roll + 0.5 * body.rot,
    sx: 1,
    sy: 1,
  };

  // arka plan: bedenin tersine çok hafif (derinlik payı)
  return { bg: { x: -0.12 * body.x, y: 0 }, body, head };
}

/** Katman dönüşümü → 2×3 afin matris [a, b, c, d, tx, ty] (x' = a·x + c·y + tx; y' = b·x + d·y + ty) */
export function layerMatrix(p: LayerPose, pivot: readonly [number, number]): [number, number, number, number, number, number] {
  const c = Math.cos(p.rot);
  const s = Math.sin(p.rot);
  const a = c * p.sx;
  const b = s * p.sx;
  const cc = -s * p.sy;
  const d = c * p.sy;
  const [px, py] = pivot;
  return [a, b, cc, d, px + p.x - a * px - cc * py, py + p.y - b * px - d * py];
}
