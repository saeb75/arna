import { useEffect, useMemo, useRef, useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeOut, useAnimatedStyle, useReducedMotion, useSharedValue, type SharedValue } from "react-native-reanimated";
import type { AvatarActivity } from "@glotmate/contracts";
import {
  BLINK_TOTAL_MS,
  DEFAULT_MOUTH_TIMING,
  axisFrames,
  blinkLid,
  bodyPivot,
  bodyPose,
  createLife,
  exprEndsLive,
  exprFrames,
  gridFrames,
  motionGain,
  newEnvelope,
  newMouthParams,
  shapeAt,
  smoothSpans,
  spansFromTimeline,
  stepEnvelope,
  stepMouth,
  type ExprAtlasGeometry,
  type MouthSpan,
  type SpriteRigGeometry,
} from "@glotmate/contracts/avatar";
import type { SpriteAssetSet } from "../../domain/spriteAssets";
import { SpeechClock } from "../../lib/speechClock";
import { Skeleton } from "../ui/Skeleton";
import { SpriteIris } from "./SpriteIris";
import { SpritePatch } from "./SpritePatch";
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
 * İFADE YAMALARI (14 Kas 2026, rig.expr + assets.expr): kaş kaldırma, göz kırpmanın ara
 * kareleri ve kapalı ağız gülümsemesi de ağız gibi ATLAS KARESİYLE gelir — kaş vurguda ve
 * cümle başında kalkar, göz tek karede değil kapak inerek kapanır, hoca dinlerken ve sözü
 * bitince gülümser. Yaması olmayan rig eski davranışta kalır.
 * ŞEKİL IZGARASI (14 Kas 2026, rig.mouth.grid + assets.grid): O/E şekli nötr ağzın üstüne
 * saydam binmez — ağız ızgarada komşu kareler arasında gezer (contracts gridFrames). Saydam
 * bindirmede konuşmanın çoğunda iki ayrı ağız üst üste görünüyordu ("fade'ler göze batıyor").
 * KATMANLI rig'de (rig.layers + assets.layers, 5 Kas 2026) portre arka plan + boyun
 * altlığı + baş + gövde olarak ayrılmıştır; yaka gövde katmanında başın ÜSTÜNDE durduğu
 * için ek yeri giysinin arkasında kalır. Katman dönüşümleri contracts `bodyPose`'tan
 * (14 Kas 2026): gövde nefesle alt-ortadan genişleyip yükselir ve kalçadan salınır (ağırlık
 * aktarma), baş boyun noktasıyla taşınır. BAŞIN BOYUTU DEĞİŞMEZ (ölçekle baş eğimi denendi:
 * "kafası küçülüp büyüyor" — reddedildi). Gövde genliği kutu ölçeğiyle büyür (`motionGain`):
 * ders kartında eski 1 px'lik nefes ekranda yarım pikselin altındaydı ("resim gibi duruyor").
 * Katmansız rig'de portre BÜTÜN olarak küçük salınım + ölçülü eğme/sallama alır.
 *
 * Kare döngüsü JS thread'inde (requestAnimationFrame) saf hesap yapar ve yalnız
 * DEĞİŞEN paylaşımlı değerleri yazar — React render'ı tetiklenmez.
 */

/** Kaş ekseninin tam ucu: life.ts'in kaş darbesi (tuval pikseli) bu değerde tam kalkık sayılır */
const BROW_FULL_PX = 3.4;
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
  // ifade yamaları: alt + üst kare (contracts exprFrames)
  const browA = useTile();
  const browB = useTile();
  const lidA = useTile();
  const lidB = useTile();
  const grinA = useTile();
  const grinB = useTile();
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
  const bodySx = useSharedValue(1);
  const bodySy = useSharedValue(1);
  /** Hareket çarpanı (kutu ölçeğinden) — kare döngüsü okur; kutu değişince döngü yeniden kurulmaz */
  const gainRef = useRef(1);
  const layered = !!(rig.layers && assets.layers);
  const grid = assets.grid ? rig.mouth.grid : undefined;
  const gridSize = useMemo(() => {
    const cells = Object.values(grid?.slots ?? {});
    return cells.length
      ? { w: (Math.max(...cells.map((c) => c[0]!)) + 1) * tw, h: (Math.max(...cells.map((c) => c[1]!)) + 1) * th }
      : { w: tw, h: th };
  }, [grid, tw, th]);
  const browGeo = assets.expr?.brow ? rig.expr?.brow : undefined;
  const lidGeo = assets.expr?.lids ? rig.expr?.lids : undefined;
  const grinGeo = assets.expr?.smile ? rig.expr?.smile : undefined;

  useEffect(() => {
    const slots = rig.mouth.slots;
    const axes = rig.mouth.axes;
    const setSlot = (tile: Tile, from: Record<string, number[]>, key: string | null, opacity: number) => {
      const loc = key ? from[key] : undefined;
      if (!loc || opacity <= 0.005) {
        put(tile.opacity, 0);
        return;
      }
      put(tile.col, loc[0]!);
      put(tile.row, loc[1]!);
      put(tile.opacity, Math.round(opacity * 100) / 100);
    };
    /** Uçları canlı ifade ekseni: konum 0'da yama yok, aradaki kareler alt opak + üst karışım */
    const setExpr = (a: Tile, b: Tile, geo: ExprAtlasGeometry | undefined, pos: number, closedEnd = false) => {
      if (!geo) return;
      const pick = exprFrames(geo.axis, pos, closedEnd);
      setSlot(a, geo.slots, pick.a, pick.aOpacity);
      setSlot(b, geo.slots, pick.b, pick.bOpacity);
    };
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
    let blinkStart = 0; // 0 = kırpma yok
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

      if (grid) {
        // ŞEKİL IZGARASI: O/E ağırlığı saydamlık değil KONUM — nötr → ara kare → şekil.
        // Tahmini şekilde (zaman damgası yok) F/V de yayvana katılır: yarı saydam F pozu çift ağızdı.
        const fvAsSpread = !axes.fv || SpeechClock.isEstimated();
        const shape = Math.min(1, mouth.spread + (fvAsSpread ? mouth.fv : 0)) - mouth.round;
        const pick = gridFrames(grid.rows, grid.levels, mouth.open, shape);
        setSlot(nA, grid.slots, pick.baseA, 1);
        setSlot(nB, grid.slots, pick.baseB, pick.rowMix);
        setSlot(rA, grid.slots, pick.overA, 1);
        setSlot(rB, grid.slots, pick.overB, pick.rowMix);
        put(roundW, Math.round(pick.overMix * 100) / 100);
        setSlot(fv, grid.slots, !fvAsSpread && axes.fv ? axes.fv : null, mouth.fv);
        setSlot(press, grid.slots, axes.press, mouth.press);
      } else {
        setAxis(nA, nB, axes.neutral, mouth.open);
        if (mouth.round > 0.01) setAxis(rA, rB, axes.round, Math.min(rig.roundMax ?? 0.8, mouth.open / 0.7));
        put(roundW, mouth.round > 0.01 ? Math.round(mouth.round * 100) / 100 : 0);
        // F/V pozu olmayan atlasta f/v yayvan ağza düşer (web ile aynı)
        const spread = axes.fv ? mouth.spread : Math.min(1, mouth.spread + mouth.fv);
        if (spread > 0.01) setAxis(sA, sB, axes.spread, Math.min(1, mouth.open / 0.7) * 0.8);
        put(spreadW, spread > 0.01 ? Math.round(spread * 100) / 100 : 0);
        if (axes.fv) setTile(fv, axes.fv, mouth.fv > 0.01 ? mouth.fv : 0);
        setTile(press, axes.press, mouth.press > 0.01 ? mouth.press : 0);
      }

      // beden: baş, bakış, göz kırpma (+ dinleme/düşünme duruşu)
      const pose = life.step(dt, t !== null, rms === null ? 0 : energy, activityRef.current);
      if (pose.blink && !blinkStart) nextBlink = now;
      if (blinkStart && now - blinkStart >= BLINK_TOTAL_MS) {
        blinkStart = 0;
        if (!chained && Math.random() < 0.15) {
          chained = true;
          nextBlink = now + 110;
        } else {
          chained = false;
          nextBlink = now + 2600 + Math.random() * 3400;
        }
      } else if (!blinkStart && now >= nextBlink) {
        blinkStart = now;
      }
      // Kapak konumu 0 açık … 1 kapalı: kapanış hızlı, açılış yavaş. Ara kareli rig'de kapak
      // İNEREK kapanır; yoksa göz eşiği geçince tek karede kapanır (eski davranış).
      const lid = blinkStart ? blinkLid(now - blinkStart) : 0;
      put(eyesOpen, lidGeo ? (exprEndsLive(lidGeo.axis, lid) ? 0 : 1) : lid > 0.5 ? 0 : 1);
      setExpr(lidA, lidB, lidGeo, lid, true);
      const k = reduced ? 0 : 1;
      // kaş: vurgu, cümle başı, dinleme/düşünme duruşu (life.ts darbeleri, tuval pikseli → eksen)
      setExpr(browA, browB, browGeo, k * Math.min(1, Math.max(0, pose.brow / BROW_FULL_PX)) * (rig.browMax ?? 0.85));
      // gülümseme yalnız ağız kapalıyken: açılmaya başlayan ağzın üstünü örtmesin
      setExpr(grinA, grinB, grinGeo, k * pose.smile * Math.max(0, 1 - mouth.open * 10));
      put(gazeX, k * Math.round(pose.gazeX * rig.gazeScale * 8) / 8);
      put(gazeY, k * Math.round(pose.gazeY * rig.gazeScale * 8) / 8);

      const s = now / 1000;
      if (layered) {
        // Gövde nefesle genişleyip yükselir ve kalçadan salınır; baş boyunla taşınır, sallama eğimdir.
        // Değerler yuvarlanır: gereksiz köprü trafiği olmasın (1/16 px, 1e-4 rad, 1e-4 ölçek).
        const bp = bodyPose(pose, rig, gainRef.current);
        const px = (v: number) => (k ? Math.round(v * 16) / 16 : 0);
        const fine = (v: number, rest: number) => (k ? Math.round(v * 10000) / 10000 : rest);
        put(bgX, px(bp.bg.x));
        put(bgY, px(bp.bg.y));
        put(bodyX, px(bp.body.x));
        put(bodyY, px(bp.body.y));
        put(bodyRoll, fine(bp.body.rot, 0));
        put(bodySx, fine(bp.body.sx, 1));
        put(bodySy, fine(bp.body.sy, 1));
        put(shiftX, px(bp.head.x));
        put(shiftY, px(bp.head.y));
        put(roll, fine(bp.head.rot, 0));

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
  }, [rig, reduced, layered, grid, browGeo, lidGeo, grinGeo]);

  const head = useAnimatedStyle(() => ({
    transform: [
      { translateX: shiftX.value },
      { translateY: shiftY.value },
      { rotate: `${roll.value}rad` },
    ],
  }));
  const body = useAnimatedStyle(() => ({
    transform: [
      { translateX: bodyX.value },
      { translateY: bodyY.value },
      { rotate: `${bodyRoll.value}rad` },
      { scaleX: bodySx.value },
      { scaleY: bodySy.value },
    ],
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

  // Izgaralı rig'de ağız yığınının TAMAMI ızgara atlasından çizilir (eski atlas hiç yüklenmez)
  useEffect(() => {
    gainRef.current = layout ? motionGain(layout.s) : 1;
  }, [layout]);
  // gövde katmanlarının pivotu: tuvalin alt-ortası (nefes buradan yukarı genişler) — contracts bodyPivot
  const [bodyPx, bodyPy] = bodyPivot(rig);

  const tileProps =
    grid && assets.grid
      ? { source: assets.grid, tileW: tw, tileH: th, atlasW: gridSize.w, atlasH: gridSize.h }
      : { source: assets.atlas, tileW: tw, tileH: th, atlasW: atlasSize.w, atlasH: atlasSize.h };
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
              <Animated.View className="absolute inset-0" style={[{ transformOrigin: [bodyPx, bodyPy, 0] }, body]} pointerEvents="none">
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
            {/* kapak göz katmanının ÜSTÜNDE, kaş kapağın üstünde: kaş kalkıkken kırpma kaşın alt kenarını örtmez */}
            {lidGeo && assets.expr?.lids ? <SpritePatch geometry={lidGeo} source={assets.expr.lids} a={lidA} b={lidB} /> : null}
            {browGeo && assets.expr?.brow ? <SpritePatch geometry={browGeo} source={assets.expr.brow} a={browA} b={browB} /> : null}

            <View className="absolute overflow-hidden" style={{ left: mx, top: my, width: tw, height: th }} pointerEvents="none">
              <SpriteTile {...tileProps} {...nA} />
              <SpriteTile {...tileProps} {...nB} />
              {/* Grup opaklığı: kare çifti ÖNCE birleşir, sonra ağırlıkla karışır (web'in overlay'i) */}
              <Animated.View className="absolute inset-0" style={roundGroup} needsOffscreenAlphaCompositing>
                <SpriteTile {...tileProps} {...rA} />
                <SpriteTile {...tileProps} {...rB} />
              </Animated.View>
              {grid ? null : (
                <Animated.View className="absolute inset-0" style={spreadGroup} needsOffscreenAlphaCompositing>
                  <SpriteTile {...tileProps} {...sA} />
                  <SpriteTile {...tileProps} {...sB} />
                </Animated.View>
              )}
              {rig.mouth.axes.fv ? <SpriteTile {...tileProps} {...fv} /> : null}
              <SpriteTile {...tileProps} {...press} />
            </View>
            {grinGeo && assets.expr?.smile ? <SpritePatch geometry={grinGeo} source={assets.expr.smile} a={grinA} b={grinB} /> : null}
          </Animated.View>
          {layered && rig.layers && assets.layers ? (
            // gövde EN ÜSTTE: yaka ve tişört yakası boynun önünde — baş/ağız yamasının alt kenarını örter
            <Animated.View className="absolute inset-0" style={[{ transformOrigin: [bodyPx, bodyPy, 0] }, body]} pointerEvents="none">
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
