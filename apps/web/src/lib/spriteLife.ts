// 2.5D AVATAR DAVRANIŞI — "robot gibi dümdüz bakma"yı kıran küçük hareketler.
// Her karede saf bir beden durumu üretir; SpriteAvatar bunu yüz ağı esnetmesine
// (baş/kaş/nefes) ve iris kaydırmasına çevirir. Girdi yalnız zaman, konuşuyor mu,
// sesin enerjisi (spriteMouth zarfı) ve uygulamanın bildirdiği etkinlik
// (dinliyor/düşünüyor — avatarProtocol "activity"). Model metni yok, ağ yok.
//
// Katmanlar: (1) sürekli gezinme + nefes, (2) etkinliğe göre duruş (dinlerken
// öne eğik + baş sallama, düşünürken bakış yukarı-yana), (3) boşta seyrek
// olaylar (merakla eğilip bakma, derin nefes, yavaş onay), (4) konuşma vuruşları.
// Duruş değişimleri yumuşak yaklaşır — durumlar arası sıçrama yok.
//
// Ölçüler tuval pikseli ve radyandır; bakış sınırları göz katmanlarının
// doğrulandığı aralıkla aynı (x ±5, y -2.5..+2; rig gazeScale ile ayrıca küçülür).
import type { AvatarActivity } from "@glotmate/contracts";

export interface LifePose {
  /** baş eğimi (rad, + = saat yönü), boyun pivotu etrafında */
  roll: number;
  /** baş aşağı (px) */
  nod: number;
  /** yüz içinin dış hatlara göre yatay kayması (px) — dönüş hissi */
  yaw: number;
  /** kaş kalkması (px) */
  brow: number;
  /** göğüs kalkması (px) */
  breath: number;
  /** iris kayması (px) */
  gazeX: number;
  gazeY: number;
  /** büyük bakış sıçramasına eşlik eden göz kırpma isteği (tek kare) */
  blink: boolean;
}

export interface Life {
  step(dtSec: number, speaking: boolean, energy: number, activity?: AvatarActivity): LifePose;
}

/** Periyodik görünmeyen yumuşak gezinme (±1) — AvatarScene wobble'ının aynısı */
function wobble(t: number, seed: number): number {
  return (
    Math.sin(t * 0.37 + seed) * 0.5 +
    Math.sin(t * 0.83 + seed * 2.1) * 0.3 +
    Math.sin(t * 1.71 + seed * 3.7) * 0.2
  );
}

/** Vuruş eğrisi: 0'dan τ'da tepeye (1), sonra sönüm — baş sallama ve kaş darbesi */
const pulse = (age: number, tau: number) => (age <= 0 ? 0 : (age / tau) * Math.exp(1 - age / tau));

/** Tut-bırak zarfı: [0,in] yükseliş, [in, in+hold] tepe, sonra [out] iniş (smoothstep) */
function envelope(age: number, rise: number, hold: number, fall: number): number {
  if (age <= 0) return 0;
  const ss = (x: number) => x * x * (3 - 2 * x);
  if (age < rise) return ss(age / rise);
  if (age < rise + hold) return 1;
  const k = (age - rise - hold) / fall;
  return k >= 1 ? 0 : 1 - ss(k);
}

const GAZE_X = 5;
const GAZE_UP = -2.5;
const GAZE_DOWN = 2;

type Pulse = { at: number; amp: number; roll: number; tau: number };
type Episode = { at: number; rise: number; hold: number; fall: number; roll: number; nod: number; yaw: number; brow: number; breath: number; gx: number; gy: number };

export function createLife(rand: () => number = Math.random): Life {
  let t = 0;
  const pick = (lo: number, hi: number) => lo + (hi - lo) * rand();
  const side = () => (rand() < 0.5 ? -1 : 1);
  const approach = (cur: number, tgt: number, rate: number, dt: number) => cur + (tgt - cur) * (1 - Math.exp(-rate * dt));

  // konuşma
  let wasSpeaking = false;
  let lowFor = 0; // enerji düşük süre (sn) — vuruş ve duraklama algısı
  let sinceBeat = 10;
  const nods: Pulse[] = [];
  const brows: Array<{ at: number; amp: number }> = [];
  let talk = 0; // konuşma karışımı 0..1 (sert geçiş yok)
  // etkinlik duruşu (yumuşak yaklaşan sapmalar)
  let activity: AvatarActivity = "idle";
  let lean = 0; // öne eğilme (nod sapması)
  let tilt = 0; // kalıcı baş eğimi
  let turn = 0; // düşünürken başın bakış yönüne dönmesi (yaw, px) — iris sınırlı rig'lerde de okunsun
  let browHold = 0;
  let homeX = 0; // bakışın dinlenme noktası (etkinliğe göre)
  let homeY = 0;
  let tiltSide = 1;
  let nextAck = 1.2; // dinlerken bir sonraki onay sallaması
  let thinkSwap = 0;
  // bildirilen durum ve geç bırakma: kayıt bitti → yazıya dökme → sohbet → TTS
  // arasındaki kısa boşluklarda duruş boşa düşüp geri gelmesin
  let reported: AvatarActivity = "idle";
  let lingerUntil = -1;
  // boşta seyrek olaylar
  const episodes: Episode[] = [];
  let nextEpisode = pick(5, 9);
  // bakış
  let gx = 0;
  let gy = 0;
  let tx = 0;
  let ty = 0;
  let nextSaccade = 0.8 + rand() * 1.5;
  let asideUntil = -1;

  const startEpisode = (blinkOut: { v: boolean }) => {
    const r = rand();
    const s = side();
    if (r < 0.45) {
      // merakla eğilip yana bakma, sonra geri dönme
      episodes.push({ at: t, rise: 0.55, hold: pick(0.9, 1.6), fall: 0.7, roll: 0.022 * s, nod: -0.8, yaw: 2.2 * s, brow: 1.4, breath: 0, gx: 3.6 * s, gy: pick(-1.6, 0.4) });
      if (rand() < 0.4) blinkOut.v = true;
    } else if (r < 0.75) {
      // derin nefes: göğüs ve omuzlar kalkar, baş hafif geriye
      episodes.push({ at: t, rise: 1.3, hold: 0.4, fall: 1.6, roll: 0, nod: -1.2, yaw: 0, brow: 0.6, breath: 2.4, gx: 0, gy: -0.6 });
    } else {
      // yavaş onay: iki sakin baş sallama
      nods.push({ at: t, amp: 2.4, roll: 0, tau: 0.22 }, { at: t + 0.55, amp: 1.8, roll: 0, tau: 0.22 });
    }
    nextEpisode = t + pick(7, 14);
  };

  return {
    step(dt, speaking, energy, rep = "idle") {
      t += dt;
      talk = approach(talk, speaking ? 1 : 0, 4, dt);
      const blinkOut = { v: false };

      // dinleme bitince yanıt gelene dek düşünür; düşünme bitince ses başlayana dek bekler
      if (rep !== reported) {
        lingerUntil = rep === "idle" && reported !== "idle" ? t + (reported === "listening" ? 2.5 : 1.5) : -1;
        reported = rep;
      }
      if (speaking) lingerUntil = -1;
      const act: AvatarActivity = rep === "idle" && lingerUntil > t ? "thinking" : rep;

      // ---- etkinlik değişimi: duruş hedefleri
      if (act !== activity) {
        activity = act;
        if (act === "listening") {
          tiltSide = side();
          nextAck = pick(0.9, 1.6);
          brows.push({ at: t, amp: 2.0 }); // ilgiyle dinlemeye başlama
          tx = pick(-0.4, 0.4);
          ty = pick(-0.3, 0.2);
          asideUntil = -1;
        } else if (act === "thinking") {
          tiltSide = side();
          thinkSwap = pick(1.2, 2.2);
          if (rand() < 0.5) blinkOut.v = true;
        } else {
          tx = pick(-0.6, 0.6);
          ty = pick(-0.3, 0.3);
        }
      }
      const listening = activity === "listening" && !speaking;
      const thinking = activity === "thinking" && !speaking;
      lean = approach(lean, listening ? 1.6 : thinking ? -1.2 : 0, 3, dt);
      turn = approach(turn, thinking ? 3.0 * tiltSide : 0, 2.5, dt);
      tilt = approach(tilt, listening ? 0.016 * tiltSide : thinking ? 0.012 * tiltSide : 0, 2.5, dt);
      browHold = approach(browHold, thinking ? 1.4 : listening ? 0.6 : 0, 3, dt);
      homeX = approach(homeX, thinking ? 3.4 * tiltSide : 0, 6, dt);
      homeY = approach(homeY, thinking ? -2.0 : 0, 6, dt);

      // dinlerken düzenli onay sallamaları (bazen çift)
      if (listening) {
        nextAck -= dt;
        if (nextAck <= 0) {
          const amp = pick(2.2, 3.4);
          nods.push({ at: t, amp, roll: pick(-0.004, 0.004), tau: 0.16 });
          if (rand() < 0.35) nods.push({ at: t + 0.42, amp: amp * 0.7, roll: 0, tau: 0.15 });
          nextAck = pick(1.6, 3.2);
        }
      }
      // düşünürken bakış ara sıra öbür yana geçer
      if (thinking) {
        thinkSwap -= dt;
        if (thinkSwap <= 0) {
          tiltSide = -tiltSide;
          thinkSwap = pick(1.6, 2.8);
          if (rand() < 0.3) blinkOut.v = true;
        }
      }

      // ---- cümle başı: kaş + hafif baş kaldırma
      if (speaking && !wasSpeaking) {
        brows.push({ at: t, amp: 3.2 });
        nods.push({ at: t, amp: -1.6, roll: 0, tau: 0.13 });
        tx = pick(-0.8, 0.8); // konuşmaya başlarken kameraya dön
        ty = pick(-0.4, 0.2);
        asideUntil = -1;
      }
      wasSpeaking = speaking;

      // ---- ses vurgusu → baş sallama (+ ara sıra kaş)
      sinceBeat += dt;
      if (speaking && energy < 0.3) lowFor += dt;
      else if (energy > 0.55) {
        if (lowFor > 0.06 && sinceBeat > 0.32) {
          nods.push({ at: t, amp: pick(1.6, 3.0), roll: pick(-0.006, 0.006), tau: 0.13 });
          if (rand() < 0.22) brows.push({ at: t, amp: pick(1.8, 3.0) });
          sinceBeat = 0;
        }
        lowFor = 0;
      }
      // cümle sonu duraklaması: yumuşak bir yerleşme (hafif eğik baş sallaması)
      if (speaking && lowFor > 0.22 && lowFor - dt <= 0.22 && rand() < 0.45) {
        nods.push({ at: t, amp: pick(1.2, 2.0), roll: 0.008 * side(), tau: 0.2 });
      }

      // ---- duraklamada düşünür gibi kenara bakış; konuşma sürünce geri dön
      if (speaking && lowFor > 0.35 && asideUntil < t && rand() < dt * 1.2) {
        tx = pick(2.5, 4.5) * side();
        ty = pick(-2.2, -0.8);
        asideUntil = t + pick(0.5, 1.0);
        if (rand() < 0.35) blinkOut.v = true;
      }
      if (asideUntil > 0 && t > asideUntil && (energy > 0.4 || !speaking)) {
        tx = pick(-0.8, 0.8);
        ty = pick(-0.4, 0.3);
        asideUntil = -1;
      }

      // ---- boşta seyrek olaylar (konuşmuyor, dinlemiyor, düşünmüyor)
      const idle = !speaking && activity === "idle";
      if (idle && t >= nextEpisode && episodes.length === 0) startEpisode(blinkOut);
      if (!idle && t >= nextEpisode) nextEpisode = t + pick(4, 8); // meşgulken ertele

      // ---- bakış sıçramaları: çoğu dinlenme noktasına yakın, boştayken ara sıra kenara
      nextSaccade -= dt;
      if (nextSaccade <= 0 && asideUntil < 0) {
        const aside = idle && rand() < 0.15;
        const spread = listening ? 0.6 : thinking ? 0.9 : 1.3;
        const nx = aside ? pick(2.8, 4.8) * side() : pick(-spread, spread);
        const ny = aside ? pick(-2.2, 1.2) : pick(-spread * 0.5, spread * 0.4);
        if (Math.abs(nx - tx) > 2.5 && rand() < 0.35) blinkOut.v = true;
        tx = nx;
        ty = ny;
        if (aside) asideUntil = t + pick(0.6, 1.4);
        nextSaccade = listening ? pick(1.4, 3.0) : thinking ? pick(0.5, 1.2) : speaking ? pick(1.0, 2.8) : pick(0.9, 2.6);
      }

      // ---- olay zarfları
      let epRoll = 0, epNod = 0, epYaw = 0, epBrow = 0, epBreath = 0, epGx = 0, epGy = 0;
      for (let i = episodes.length - 1; i >= 0; i--) {
        const e = episodes[i]!;
        const age = t - e.at;
        if (age > e.rise + e.hold + e.fall) {
          episodes.splice(i, 1);
          continue;
        }
        const w = envelope(age, e.rise, e.hold, e.fall);
        epRoll += e.roll * w; epNod += e.nod * w; epYaw += e.yaw * w; epBrow += e.brow * w;
        epBreath += e.breath * w; epGx += e.gx * w; epGy += e.gy * w;
      }

      // sıçrama hızlı (≈40 ms), ama ani değil
      const k = 1 - Math.exp(-26 * dt);
      gx += (tx + homeX + epGx - gx) * k;
      gy += (ty + homeY + epGy - gy) * k;

      // ---- vuruş ve kaş eğrileri
      let beatNod = 0;
      let beatRoll = 0;
      for (let i = nods.length - 1; i >= 0; i--) {
        const n = nods[i]!;
        const age = t - n.at;
        if (age > 1.5) {
          nods.splice(i, 1);
          continue;
        }
        const p = pulse(age, n.tau);
        beatNod += n.amp * p;
        beatRoll += n.roll * p;
      }
      let brow = 0;
      for (let i = brows.length - 1; i >= 0; i--) {
        const age = t - brows[i]!.at;
        if (age > 1.6) {
          brows.splice(i, 1);
          continue;
        }
        brow = Math.max(brow, brows[i]!.amp * pulse(age, 0.22));
      }

      // ---- birleşim (boşta gezinme konuşurken biraz daha canlı)
      const live = 1 + 0.5 * talk;
      const roll = 0.011 * live * wobble(t * 0.55, 1.3) + beatRoll + tilt + epRoll;
      const nod = 1.0 * live * wobble(t * 0.7, 4.1) + beatNod + lean + epNod;
      const yaw = 2.6 * wobble(t * 0.42, 7.7) + 0.6 * gx + epYaw + turn;
      const breath = 0.9 * (0.5 - 0.5 * Math.cos((t * 2 * Math.PI) / 4.4)) + epBreath;

      return {
        roll,
        nod,
        yaw,
        brow: brow + browHold + epBrow,
        breath,
        gazeX: Math.max(-GAZE_X, Math.min(GAZE_X, gx)),
        gazeY: Math.max(GAZE_UP, Math.min(GAZE_DOWN, gy)),
        blink: blinkOut.v,
      };
    },
  };
}
