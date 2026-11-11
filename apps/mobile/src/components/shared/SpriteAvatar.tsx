import { useEffect, useMemo, useRef, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeOut, useAnimatedStyle, useReducedMotion, useSharedValue, type SharedValue } from "react-native-reanimated";
import type { AvatarActivity } from "@glotmate/contracts";
import {
  DEFAULT_MOUTH_TIMING,
  axisFrames,
  createLife,
  newEnvelope,
  newMouthParams,
  shapeAt,
  smoothSpans,
  spansFromTimeline,
  stepEnvelope,
  stepMouth,
  type MouthSpan,
  type SpriteRigGeometry,
} from "@glotmate/contracts/avatar";
import type { SpriteAssetSet } from "../../domain/spriteAssets";
import { SpeechClock } from "../../lib/speechClock";
import { Skeleton } from "../ui/Skeleton";
import { SpriteIris } from "./SpriteIris";
import { SpriteTile } from "./SpriteTile";

/**
 * NATIVE 2.5D AVATAR — web'in /embed/avatar SpriteAvatar'ının WebView'sız karşılığı
 * (5 Kas 2026). Zamanlama, ağız ve davranış AYNI kod: @glotmate/contracts/avatar
 * (stepMouth, createLife, viseme). Ses + saat VoiceService'in expo-audio
 * oynatıcısından (SpeechClock) — WebView'daki Web Audio'nun ses oturumu
 * kesintisinde sesi yutması bu yolda yok.
 *
 * Katmanlar (tuval pikseli, kutuyu kaplayacak şekilde ölçeklenir): portre (gözler
 * kapalı) → göz beyazı → kayan irisler → açıklığı oyulmuş göz çerçeveleri → kapak
 * gölgeleri → ağız atlası yığını (nötr eksen + O/E/F/M karışımları).
 *
 * Web'den FARK: yüz ağı esnetmesi (kaş, ağ bükmesi) WebGL ister; native'de yok.
 * KATMANLI rig'de (rig.layers + assets.layers, 5 Kas 2026) portre arka plan + boyun
 * altlığı + baş + gövde olarak ayrılmıştır: arka plan uzakta (az kayar), gövde nefesle
 * kalkar, baş boyundan TAM genlikle döner; yaka gövde katmanında başın ÜSTÜNDE durduğu
 * için ek yeri giysinin arkasında kalır. Sebep: tek parça salınımda baş, omuz ve arka
 * plan birlikte kaydığı için yalnız ağız ve göz canlı görünüyordu ("robotik").
 * Katmansız rig'de portre BÜTÜN olarak küçük salınım + ölçülü eğme/sallama alır.
 *
 * Kare döngüsü JS thread'inde (requestAnimationFrame) saf hesap yapar ve yalnız
 * DEĞİŞEN paylaşımlı değerleri yazar — React render'ı tetiklenmez.
 */

const BLINK_MS = 145;
const timing = DEFAULT_MOUTH_TIMING;

type Tile = { col: SharedValue<number>; row: SharedValue<number>; opacity: SharedValue<number> };

function useTile(): Tile {
  return { col: useSharedValue(0), row: useSharedValue(0), opacity: useSharedValue(0) };
}

/** Katman kutusu [x, y, w, h] (tuval pikseli) → mutlak konum — rig verisi, çalışma zamanı değeri */
function rectStyle(r: number[]) {
  return { position: "absolute" as const, left: r[0], top: r[1], width: r[2], height: r[3] };
}

/** Değişmişse yaz — UI thread'e gereksiz köprü trafiği gitmesin */
function put(sv: SharedValue<number>, v: number) {
  if (sv.value !== v) sv.value = v;
}

export function SpriteAvatar({
  rig,
  assets,
  activity,
}: {
  rig: SpriteRigGeometry;
  assets: SpriteAssetSet;
  activity: AvatarActivity;
}) {
  const reduced = useReducedMotion();
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [loaded, setLoaded] = useState(0); // taban + atlas
  const activityRef = useRef(activity);
  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  const [mx, my] = rig.mouth.roi as [number, number];
  const [tw, th] = rig.mouth.tileSize as [number, number];
  const atlasSize = useMemo(() => {
    const cells = Object.values(rig.mouth.slots);
    return {
      w: (Math.max(...cells.map((c) => c[0]!)) + 1) * tw,
      h: (Math.max(...cells.map((c) => c[1]!)) + 1) * th,
    };
  }, [rig, tw, th]);

  // ---- paylaşımlı değerler (sabit sayıda — kanca kuralı)
  const nA = useTile();
  const nB = useTile();
  const rA = useTile();
  const rB = useTile();
  const sA = useTile();
  const sB = useTile();
  const fv = useTile();
  const press = useTile();
  const roundW = useSharedValue(0);
  const spreadW = useSharedValue(0);
  const eyesOpen = useSharedValue(1);
  const gazeX = useSharedValue(0);
  const gazeY = useSharedValue(0);
  const roll = useSharedValue(0);
  const shiftX = useSharedValue(0);
  const shiftY = useSharedValue(0);
  const bgX = useSharedValue(0);
  const bgY = useSharedValue(0);
  const bodyX = useSharedValue(0);
  const bodyY = useSharedValue(0);
  const bodyRoll = useSharedValue(0);
  const layered = !!(rig.layers && assets.layers);

  useEffect(() => {
    const slots = rig.mouth.slots;
    const axes = rig.mouth.axes;
    const setTile = (tile: Tile, key: string, opacity: number) => {
      const loc = slots[key];
      if (!loc) {
        put(tile.opacity, 0);
        return;
      }
      put(tile.col, loc[0]!);
      put(tile.row, loc[1]!);
      put(tile.opacity, Math.round(opacity * 100) / 100);
    };
    const setAxis = (a: Tile, b: Tile, axis: readonly string[], pos: number) => {
      const [ka, kb, f] = axisFrames(axis, pos);
      setTile(a, ka, 1);
      setTile(b, kb, f > 0.005 ? f : 0);
    };

    const life = createLife();
    const envelope = newEnvelope();
    const mouth = newMouthParams();
    let spans: MouthSpan[] = [];
    let spansVersion = -1;
    let nextBlink = performance.now() + 1200 + Math.random() * 2000;
    let blinkEnd = 0;
    let chained = false;
    let last = performance.now();
    let raf = 0;
    // Yapay hece ritmi: ses enerjisi okunamadığında (bazı akışlarda örnekleme gelmiyor)
    // ağız sabit açıklıkta DONMASIN — 140–260 ms hecelerle açılıp kapanır, ara sıra kısa
    // kelime arası. Enerji zarfına gerçek seviye gibi verilir; gerçek seviye gelince devre dışı.
    let syllableEnd = 0;
    let syllableLevel = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;

      // ağız: açıklığı ses enerjisi, şekli timeline ailesi sürer (web ile aynı kod)
      const v = SpeechClock.getVersion();
      if (v !== spansVersion) {
        spansVersion = v;
        const tl = SpeechClock.getTimeline();
        spans = tl ? smoothSpans(spansFromTimeline(tl), timing) : [];
      }
      const t = SpeechClock.getTime();
      let rms = SpeechClock.getLevel();
      if (t !== null && rms === null) {
        if (now >= syllableEnd) {
          const gap = Math.random() < 0.18; // kelime arası
          syllableLevel = gap ? 0.01 : 0.05 + Math.random() * 0.12;
          syllableEnd = now + (gap ? 90 + Math.random() * 120 : 140 + Math.random() * 120);
        }
        rms = syllableLevel;
      }
      // Zaman damgası olmayan sesde (Gemini, akış) şekil ailesi "konuşma" — açıklığı enerji sürer
      const family = t === null ? "REST" : spans.length ? shapeAt(spans, t * 1000) : "talk";
      const energy = stepEnvelope(envelope, rms ?? 0, dt);
      // Şekil metin tahmininden (Gemini) ise geçişler kısık ve yavaş — sert "resim değişimi" olmasın
      stepMouth(mouth, family, rms === null ? null : energy, t !== null, dt, rig.mouthAmplitude, SpeechClock.isEstimated());

      setAxis(nA, nB, axes.neutral, mouth.open);
      if (mouth.round > 0.01) setAxis(rA, rB, axes.round, Math.min(rig.roundMax ?? 0.8, mouth.open / 0.7));
      put(roundW, mouth.round > 0.01 ? Math.round(mouth.round * 100) / 100 : 0);
      // F/V pozu olmayan atlasta f/v yayvan ağza düşer (web ile aynı)
      const spread = axes.fv ? mouth.spread : Math.min(1, mouth.spread + mouth.fv);
      if (spread > 0.01) setAxis(sA, sB, axes.spread, Math.min(1, mouth.open / 0.7) * 0.8);
      put(spreadW, spread > 0.01 ? Math.round(spread * 100) / 100 : 0);
      if (axes.fv) setTile(fv, axes.fv, mouth.fv > 0.01 ? mouth.fv : 0);
      setTile(press, axes.press, mouth.press > 0.01 ? mouth.press : 0);

      // beden: baş, bakış, göz kırpma (+ dinleme/düşünme duruşu)
      const pose = life.step(dt, t !== null, rms === null ? 0 : energy, activityRef.current);
      if (pose.blink && !blinkEnd) nextBlink = now;
      if (blinkEnd && now >= blinkEnd) {
        blinkEnd = 0;
        if (!chained && Math.random() < 0.15) {
          chained = true;
          nextBlink = now + 160;
        } else {
          chained = false;
          nextBlink = now + 2600 + Math.random() * 3400;
        }
      } else if (!blinkEnd && now >= nextBlink) {
        blinkEnd = now + BLINK_MS;
      }
      put(eyesOpen, blinkEnd ? 0 : 1);
      const k = reduced ? 0 : 1;
      put(gazeX, k * Math.round(pose.gazeX * rig.gazeScale * 8) / 8);
      put(gazeY, k * Math.round(pose.gazeY * rig.gazeScale * 8) / 8);

      const s = now / 1000;
      if (layered) {
        // Elde tutulan kamera gibi çok yavaş kayma; derinlik payı: arka plan %30, beden tam.
        // Nefes gövdeyi kaldırır, baş gövdenin üstünde biner; eğme/dönme/baş sallama yalnız başta.
        const cx = 1.1 * Math.sin(s * 0.31) + 0.5 * Math.sin(s * 0.73 + 1.7);
        const cy = 0.7 * Math.sin(s * 0.43 + 0.9);
        const lift = 1.1 * pose.breath;
        put(bgX, k * 0.3 * cx);
        put(bgY, k * 0.3 * cy);
        put(bodyX, k * cx);
        put(bodyY, k * (cy - lift));
        put(bodyRoll, k * 0.15 * pose.roll);
        put(roll, k * pose.roll);
        put(shiftX, k * (cx + 0.6 * pose.yaw));
        put(shiftY, k * (cy - lift + 0.8 * pose.nod));
      } else {
        // Portre BÜTÜN hareket eder: web'in 2D yedeğindeki salınım + eğme/sallamanın
        // ölçülü payı — arka plan da kıpırdadığı için tam genlik fazla
        put(roll, k * (0.35 * pose.roll + 0.0025 * Math.sin(s * 0.79)));
        put(shiftX, k * (0.3 * pose.yaw + 1.5 * Math.sin(s * 0.57)));
        put(shiftY, k * (0.6 * pose.nod - 0.4 * pose.breath + 1.2 * Math.sin(s * 1.37)));
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // Paylaşımlı değerler kararlı referanslar; döngü yalnız rig/hareket tercihiyle yeniden kurulur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rig, reduced, layered]);

  const head = useAnimatedStyle(() => ({
    transform: [{ translateX: shiftX.value }, { translateY: shiftY.value }, { rotate: `${roll.value}rad` }],
  }));
  const body = useAnimatedStyle(() => ({
    transform: [{ translateX: bodyX.value }, { translateY: bodyY.value }, { rotate: `${bodyRoll.value}rad` }],
  }));
  const backdrop = useAnimatedStyle(() => ({ transform: [{ translateX: bgX.value }, { translateY: bgY.value }] }));
  const eyes = useAnimatedStyle(() => ({ opacity: eyesOpen.value }));
  const roundGroup = useAnimatedStyle(() => ({ opacity: roundW.value }));
  const spreadGroup = useAnimatedStyle(() => ({ opacity: spreadW.value }));

  // Kutuyu kapla (cover), odak noktası ortada; salınım kenarı açmasın diye %3 pay
  const layout = useMemo(() => {
    if (!box) return null;
    const s = Math.max(box.w / rig.width, box.h / rig.height) * 1.03;
    const w = rig.width * s;
    const h = rig.height * s;
    return {
      s,
      ox: Math.min(0, Math.max(box.w - w, box.w / 2 - w * rig.focus.x)),
      oy: Math.min(0, Math.max(box.h - h, box.h / 2 - h * rig.focus.y)),
    };
  }, [box, rig]);

  const tileProps = { source: assets.atlas, tileW: tw, tileH: th, atlasW: atlasSize.w, atlasH: atlasSize.h };
  const [sx, sy, sw, sh] = rig.scleraRect as [number, number, number, number];
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  return (
    <View className="flex-1 overflow-hidden bg-card" onLayout={onLayout}>
      {layout ? (
        // Ölçek/konum kutu ölçüsünden ve rig verisinden — ÇALIŞMA ZAMANI değeri, gerekçeli inline stil
        <View
          className="absolute"
          style={{
            left: layout.ox,
            top: layout.oy,
            width: rig.width,
            height: rig.height,
            transform: [{ scale: layout.s }],
            transformOrigin: "left top",
          }}
        >
          {layered && rig.layers && assets.layers ? (
            <>
              <Animated.View className="absolute inset-0" style={backdrop} pointerEvents="none">
                <Image source={assets.layers.bg} style={{ width: rig.width, height: rig.height }} contentFit="fill" cachePolicy="memory" transition={0} />
              </Animated.View>
              {/* boyun altlığı gövdeyle oynar: baş kayınca yaka ile boyun arasında arka plan görünmesin */}
              <Animated.View className="absolute inset-0" style={[{ transformOrigin: [rig.motion.sway[0], rig.motion.sway[1], 0] }, body]} pointerEvents="none">
                <Image source={assets.layers.neck} style={rectStyle(rig.layers.neck)} transition={0} />
              </Animated.View>
            </>
          ) : null}
          <Animated.View
            className="absolute"
            style={[{ width: rig.width, height: rig.height, transformOrigin: [rig.motion.neck[0], rig.motion.neck[1], 0] }, head]}
          >
            {layered && rig.layers && assets.layers ? (
              <Image source={assets.layers.head} style={rectStyle(rig.layers.head)} cachePolicy="memory" transition={0} onLoad={() => setLoaded((n) => n + 1)} />
            ) : (
              <Image
                source={assets.base}
                style={{ width: rig.width, height: rig.height }}
                contentFit="fill"
                cachePolicy="memory"
                transition={0}
                onLoad={() => setLoaded((n) => n + 1)}
              />
            )}

            <Animated.View className="absolute inset-0" style={eyes} pointerEvents="none">
              <Image source={assets.eyesOpen} style={{ position: "absolute", left: sx, top: sy, width: sw, height: sh }} transition={0} />
              {rig.eyes.map((e) => (
                <SpriteIris key={`iris-${e.side}`} source={assets.eyes[e.side].iris} rect={e.irisRect} gazeX={gazeX} gazeY={gazeY} />
              ))}
              {rig.eyes.map((e) => {
                const [fx, fy, fw, fh] = assets.eyes[e.side].frameRect;
                const [ax, ay, aw, ah] = e.apertureRect as [number, number, number, number];
                return (
                  <View key={`lid-${e.side}`} className="absolute inset-0">
                    <Image source={assets.eyes[e.side].frame} style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh }} transition={0} />
                    <Image source={assets.eyes[e.side].shadow} style={{ position: "absolute", left: ax, top: ay, width: aw, height: ah }} transition={0} />
                  </View>
                );
              })}
            </Animated.View>

            <View className="absolute overflow-hidden" style={{ left: mx, top: my, width: tw, height: th }} pointerEvents="none">
              <SpriteTile {...tileProps} {...nA} />
              <SpriteTile {...tileProps} {...nB} />
              {/* Grup opaklığı: kare çifti ÖNCE birleşir, sonra ağırlıkla karışır (web'in overlay'i) */}
              <Animated.View className="absolute inset-0" style={roundGroup} needsOffscreenAlphaCompositing>
                <SpriteTile {...tileProps} {...rA} />
                <SpriteTile {...tileProps} {...rB} />
              </Animated.View>
              <Animated.View className="absolute inset-0" style={spreadGroup} needsOffscreenAlphaCompositing>
                <SpriteTile {...tileProps} {...sA} />
                <SpriteTile {...tileProps} {...sB} />
              </Animated.View>
              {rig.mouth.axes.fv ? <SpriteTile {...tileProps} {...fv} /> : null}
              <SpriteTile {...tileProps} {...press} />
            </View>
          </Animated.View>
          {layered && rig.layers && assets.layers ? (
            // gövde EN ÜSTTE: yaka ve tişört yakası boynun önünde — baş/ağız yamasının alt kenarını örter
            <Animated.View className="absolute inset-0" style={[{ transformOrigin: [rig.motion.sway[0], rig.motion.sway[1], 0] }, body]} pointerEvents="none">
              <Image source={assets.layers.body} style={rectStyle(rig.layers.body)} transition={0} />
            </Animated.View>
          ) : null}
        </View>
      ) : null}

      {loaded < 1 && (
        <Animated.View exiting={FadeOut.duration(300)} className="absolute inset-0 items-center justify-center bg-card">
          <Skeleton className="size-24 rounded-full" />
        </Animated.View>
      )}
    </View>
  );
}
