// 2.5D SPRITE AVATAR — katmanlı portre (bkz. lib/spriteRigs). AvatarScene ile
// AYNI sürüş girdileri: viseme timeline + oynatma saati + ses seviyesi.
//
// Çizim: taban portre bir kez dokuya yüklenir; her karede yalnız iki küçük bölge
// (gözler: göz beyazı + kayan iris + kapak gölgesi; ağız: morf atlası) 2D
// canvas'ta kurulup dokunun o kısmına yazılır. Doku bir ızgara ağına gerilir ve
// ağ vertex shader'da esnetilir: baş eğme/sallama/dönüş hissi (boyun pivotu,
// omuzlar sabit), kaş kalkması, nefes. Hareketi lib/spriteLife üretir. Ağız
// kademesizdir (lib/spriteMouth stepMouth): atlasın ara kareleri bir açıklık
// ekseni olarak okunur, açıklığı ses enerjisi sürer, timeline yalnız şekil
// ailesini (O/E/M) verir; ağız bölgesi shader'da hafifçe yumuşatılır.
// WebGL yoksa aynı görüntü esnetmesiz 2D canvas'a çizilir.
//
// Kare döngüsü React render'ı tetiklemez — her şey ref'le sürülür.
"use client";

import { useEffect, useRef } from "react";
import type { AvatarActivity } from "@glotmate/contracts";
import { createLife } from "@/lib/spriteLife";
import {
  DEFAULT_MOUTH_TIMING,
  axisFrames,
  newEnvelope,
  newMouthParams,
  shapeAt,
  smoothSpans,
  spansFromTimeline,
  stepEnvelope,
  stepMouth,
  type MouthParams,
  type MouthSpan,
} from "@/lib/spriteMouth";
import type { SpriteRig } from "@/lib/spriteRigs";
import type { Timeline } from "@/lib/viseme";

type Props = {
  rig: SpriteRig;
  timeline: Timeline | null;
  // Oynatma saati (sn): ses çalıyorsa currentTime, yoksa null (idle)
  getTime: () => number | null;
  // Sesin anlık RMS enerjisi; ses çalmıyorsa null (AvatarScene ile aynı kaynak)
  getLevel: () => number | null;
  /** Bütün katmanlar indiğinde bir kez (embed → sceneReady, RN yükleme örtüsünü kaldırır) */
  onReady?: () => void;
  /** Öğrenci konuşuyor (dinler) / yanıt hazırlanıyor (düşünür) — her karede yoklanır */
  getActivity?: () => AvatarActivity;
};

const BLINK_MS = 145;
/** Ağız bölgesi yumuşatması (doku pikseli): karışımdaki çift dudak izini gizler, Praktika tarzı yumuşak ağız */
const MOUTH_SOFT_PX = 0.9;
/** Esnetme ızgarası (hücre) — 48×48 yüz için yeterince pürüzsüz, mobilde ucuz */
const GRID = 48;
const timing = DEFAULT_MOUTH_TIMING;

const VERT = `
attribute vec2 aPos;
uniform vec2 uRig; uniform float uScale; uniform vec2 uOffset; uniform vec2 uView;
uniform float uRoll, uNod, uYaw, uBrow, uBreath; uniform vec3 uSway;
uniform vec2 uNeck, uHeadFade, uHeadHalf, uFace, uFaceSig, uBrowL, uBrowR, uBrowSig, uChest, uSwayPiv;
varying vec2 vUv;
float ss(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float gauss(vec2 p, vec2 c, vec2 s) { vec2 d = (p - c) / s; return exp(-0.5 * dot(d, d)); }
void main() {
  vec2 p = aPos;
  vUv = aPos / uRig;
  // baş ağırlığı: çene→boyunluk ve başın yanlarında söner (omuzlar, arka plan sabit)
  float wH = (1.0 - ss(uHeadFade.x, uHeadFade.y, p.y)) * (1.0 - ss(uHeadHalf.x, uHeadHalf.y, abs(p.x - uFace.x)));
  float wF = gauss(p, uFace, uFaceSig);
  float wB = min(1.0, gauss(p, uBrowL, uBrowSig) + gauss(p, uBrowR, uBrowSig));
  p.y -= uBrow * wB;
  p.x += uYaw * wF * wH;
  p.y += uNod * wH * (0.6 + 0.4 * wF);
  float a = uRoll * wH; vec2 q = p - uNeck;
  p = uNeck + vec2(q.x * cos(a) - q.y * sin(a), q.x * sin(a) + q.y * cos(a));
  float wC = ss(uChest.x, uChest.y, aPos.y);
  p.y -= uBreath * wC; p.x += (aPos.x - uFace.x) * 0.004 * uBreath * wC;
  vec2 r = p - uSwayPiv; float c = cos(uSway.x), s = sin(uSway.x);
  p = uSwayPiv + vec2(r.x * c - r.y * s, r.x * s + r.y * c) + uSway.yz;
  vec2 css = p * uScale + uOffset;
  vec2 clip = css / uView * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}`;
const FRAG = `
precision mediump float;
uniform sampler2D uTex; uniform vec4 uMouth; uniform vec2 uTexel; uniform float uSoft;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTex, vUv);
  // ağız bölgesinde hafif bulanıklaştırma; kenarda 12 px'de söner (yama sınırı görünmesin)
  vec2 f = min(vUv - uMouth.xy, uMouth.zw - vUv) / (uTexel * 12.0);
  float m = clamp(min(f.x, f.y), 0.0, 1.0);
  if (m > 0.0 && uSoft > 0.0) {
    vec2 d = uTexel * uSoft;
    vec4 b = texture2D(uTex, vUv + vec2(d.x, 0.0)) + texture2D(uTex, vUv - vec2(d.x, 0.0))
           + texture2D(uTex, vUv + vec2(0.0, d.y)) + texture2D(uTex, vUv - vec2(0.0, d.y));
    c = mix(c, (c + b) / 5.0, m);
  }
  gl_FragColor = c;
}`;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null); // eksik katman çizilmez; yükleme örtüsü takılı kalmaz
    im.src = src;
  });
}

function canvas2d(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

export default function SpriteAvatar({ rig, timeline, getTime, getLevel, onReady, getActivity }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Kare döngüsü güncel değerlere ref'ten ulaşır (effect her render'da yeniden kurulmasın)
  const spansRef = useRef<MouthSpan[]>([]);
  const getTimeRef = useRef(getTime);
  const getLevelRef = useRef(getLevel);
  const onReadyRef = useRef(onReady);
  const getActivityRef = useRef(getActivity);
  useEffect(() => {
    getTimeRef.current = getTime;
    getLevelRef.current = getLevel;
    onReadyRef.current = onReady;
    getActivityRef.current = getActivity;
  });
  useEffect(() => {
    spansRef.current = timeline ? smoothSpans(spansFromTimeline(timeline), timing) : [];
  }, [timeline]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    let disposed = false;
    let raf = 0;
    let ro: ResizeObserver | null = null;
    let gl: WebGLRenderingContext | null = null;

    void (async () => {
      const [base, sclera, atlas, ...eyeImgs] = await Promise.all([
        loadImage(rig.base),
        loadImage(rig.sclera),
        loadImage(rig.mouth.src),
        ...rig.eyes.flatMap((e) => [loadImage(e.iris), loadImage(e.aperture), loadImage(e.shadow)]),
      ]);
      if (disposed) return;
      if (!base) {
        onReadyRef.current?.();
        return;
      }
      const eyes = rig.eyes.map((e, i) => ({
        ...e,
        irisImg: eyeImgs[i * 3],
        apImg: eyeImgs[i * 3 + 1],
        shImg: eyeImgs[i * 3 + 2],
      }));

      // ---- dinamik bölgeler
      const [ex, ey, ew, eh] = rig.scleraRect;
      const [eyeCanvas, ectx] = canvas2d(ew, eh);
      const apW = Math.max(...rig.eyes.map((e) => e.apertureRect[2]!));
      const apH = Math.max(...rig.eyes.map((e) => e.apertureRect[3]!));
      const [irisCanvas, ictx] = canvas2d(apW, apH);
      const [mx, my] = rig.mouth.roi;
      const [tw, th] = rig.mouth.tileSize;
      const [mouthCanvas, mctx] = canvas2d(tw, th);
      const slots = rig.mouth.slots;

      const drawEyes = (open: boolean, gx: number, gy: number) => {
        ectx.globalCompositeOperation = "source-over";
        ectx.drawImage(base, ex, ey, ew, eh, 0, 0, ew, eh);
        if (!open || !sclera) return;
        ectx.drawImage(sclera, ex, ey, ew, eh, 0, 0, ew, eh);
        for (const e of eyes) {
          const [ax, ay, aw, ah] = e.apertureRect as [number, number, number, number];
          const [ix, iy] = e.irisRect as [number, number];
          if (e.irisImg && e.apImg) {
            ictx.globalCompositeOperation = "source-over";
            ictx.clearRect(0, 0, apW, apH);
            ictx.drawImage(e.irisImg, ix - ax + gx, iy - ay + gy);
            ictx.globalCompositeOperation = "destination-in";
            ictx.drawImage(e.apImg, 0, 0);
            ictx.globalCompositeOperation = "source-over";
            ectx.drawImage(irisCanvas, 0, 0, aw, ah, ax - ex, ay - ey, aw, ah);
          }
          if (e.shImg) ectx.drawImage(e.shImg, ax - ex, ay - ey);
        }
      };

      const [layerCanvas, lctx] = canvas2d(tw!, th!);
      const drawSlot = (ctx: CanvasRenderingContext2D, key: string, alpha: number) => {
        const loc = slots[key];
        if (!loc || !atlas) return;
        ctx.globalAlpha = alpha;
        ctx.drawImage(atlas, loc[0]! * tw!, loc[1]! * th!, tw!, th!, 0, 0, tw!, th!);
        ctx.globalAlpha = 1;
      };
      // Eksende konum: temiz taban + komşu iki kare (önce A opak, sonra B oranıyla —
      // kareler opak olduğundan sonuç doğrusal karışım, tabana doğru solma yok)
      const drawAxis = (ctx: CanvasRenderingContext2D, axis: readonly string[], pos: number) => {
        ctx.drawImage(base, mx!, my!, tw!, th!, 0, 0, tw!, th!);
        const [ka, kb, f] = axisFrames(axis, pos);
        drawSlot(ctx, ka, 1);
        if (f > 0.005) drawSlot(ctx, kb, f);
      };
      const overlay = (w: number) => {
        mctx.globalAlpha = w;
        mctx.drawImage(layerCanvas, 0, 0);
        mctx.globalAlpha = 1;
      };
      const axes = rig.mouth.axes;
      const drawMouth = (p: MouthParams) => {
        drawAxis(mctx, axes.neutral, p.open);
        if (p.round > 0.01) {
          // metinden gelen "o/u" harflerinin çoğu yuvarlak okunmuyor (today, favourite):
          // büzülme ölçülü — eksende en çok %80, tamamı ancak yüksek seste
          drawAxis(lctx, axes.round, Math.min(rig.roundMax ?? 0.8, p.open / 0.7));
          overlay(p.round);
        }
        // F/V pozu olmayan atlasta f/v yayvan ağza düşer (rig v0.3 eşlemesi)
        const spread = axes.fv ? p.spread : Math.min(1, p.spread + p.fv);
        if (spread > 0.01) {
          // E (iki sıra dişli geniş sırıtma) çok güçlü: eksende en çok %80 — ağırlık TAM
          // (kısmi ağırlık kalıcı yarı saydam ikinci ağız, yani çift dudak izi bırakıyordu)
          drawAxis(lctx, axes.spread, Math.min(1, p.open / 0.7) * 0.8);
          overlay(spread);
        }
        const single = (key: string, w: number) => {
          if (w <= 0.01) return;
          lctx.drawImage(base, mx!, my!, tw!, th!, 0, 0, tw!, th!);
          drawSlot(lctx, key, 1);
          overlay(w);
        };
        if (axes.fv) single(axes.fv, p.fv);
        single(axes.press, p.press);
      };

      // ---- çizici: WebGL ağ esnetme, yoksa 2D
      gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
      let upload: (src: HTMLCanvasElement, x: number, y: number) => void;
      let present: (pose: { roll: number; nod: number; yaw: number; brow: number; breath: number; sway: [number, number, number] }) => void;
      let layout = { scale: 1, ox: 0, oy: 0, W: 1, H: 1, dpr: 1 };

      if (gl) {
        const g = gl;
        const sh = (type: number, src: string) => {
          const s = g.createShader(type)!;
          g.shaderSource(s, src);
          g.compileShader(s);
          return s;
        };
        const prog = g.createProgram()!;
        g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
        g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
        g.linkProgram(prog);
        g.useProgram(prog);
        const pos = new Float32Array((GRID + 1) * (GRID + 1) * 2);
        for (let j = 0, k = 0; j <= GRID; j++)
          for (let i = 0; i <= GRID; i++) {
            pos[k++] = (i / GRID) * rig.width;
            pos[k++] = (j / GRID) * rig.height;
          }
        const idx = new Uint16Array(GRID * GRID * 6);
        for (let j = 0, k = 0; j < GRID; j++)
          for (let i = 0; i < GRID; i++) {
            const a = j * (GRID + 1) + i;
            const b = a + 1;
            const c = a + GRID + 1;
            const d = c + 1;
            idx.set([a, c, b, b, c, d], k);
            k += 6;
          }
        g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
        g.bufferData(g.ARRAY_BUFFER, pos, g.STATIC_DRAW);
        g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, g.createBuffer());
        g.bufferData(g.ELEMENT_ARRAY_BUFFER, idx, g.STATIC_DRAW);
        const loc = g.getAttribLocation(prog, "aPos");
        g.enableVertexAttribArray(loc);
        g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        const tex = g.createTexture();
        g.bindTexture(g.TEXTURE_2D, tex);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, base);
        const U = (n: string) => g.getUniformLocation(prog, n);
        const m = rig.motion;
        g.uniform2f(U("uRig"), rig.width, rig.height);
        for (const [n, v] of Object.entries({
          uNeck: m.neck,
          uHeadFade: m.headFade,
          uHeadHalf: m.headHalfWidth,
          uFace: m.face,
          uFaceSig: m.faceSigma,
          uBrowL: m.browL,
          uBrowR: m.browR,
          uBrowSig: m.browSigma,
          uChest: m.chest,
          uSwayPiv: m.sway,
        }))
          g.uniform2f(U(n), v[0], v[1]);
        const [rx0, ry0, rx1, ry1] = rig.mouth.roi as [number, number, number, number];
        g.uniform4f(U("uMouth"), rx0 / rig.width, ry0 / rig.height, rx1 / rig.width, ry1 / rig.height);
        g.uniform2f(U("uTexel"), 1 / rig.width, 1 / rig.height);
        g.uniform1f(U("uSoft"), MOUTH_SOFT_PX);
        const uScale = U("uScale"), uOffset = U("uOffset"), uView = U("uView");
        const uRoll = U("uRoll"), uNod = U("uNod"), uYaw = U("uYaw"), uBrow = U("uBrow"), uBreath = U("uBreath"), uSway = U("uSway");
        upload = (src, x, y) => {
          g.bindTexture(g.TEXTURE_2D, tex);
          g.texSubImage2D(g.TEXTURE_2D, 0, x, y, g.RGBA, g.UNSIGNED_BYTE, src);
        };
        present = (p) => {
          g.viewport(0, 0, canvas.width, canvas.height);
          g.uniform1f(uScale, layout.scale);
          g.uniform2f(uOffset, layout.ox, layout.oy);
          g.uniform2f(uView, layout.W, layout.H);
          g.uniform1f(uRoll, p.roll);
          g.uniform1f(uNod, p.nod);
          g.uniform1f(uYaw, p.yaw);
          g.uniform1f(uBrow, p.brow);
          g.uniform1f(uBreath, p.breath);
          g.uniform3f(uSway, p.sway[0], p.sway[1], p.sway[2]);
          g.drawElements(g.TRIANGLES, idx.length, g.UNSIGNED_SHORT, 0);
        };
      } else {
        // Yedek: esnetme yok, yalnız katmanlar + bütün portre salınımı
        const [face, fctx] = canvas2d(rig.width, rig.height);
        fctx.drawImage(base, 0, 0);
        const c2 = canvas.getContext("2d")!;
        upload = (src, x, y) => fctx.drawImage(src, x, y);
        present = (p) => {
          const d = layout.dpr;
          c2.setTransform(1, 0, 0, 1, 0, 0);
          c2.clearRect(0, 0, canvas.width, canvas.height);
          const [px, py] = rig.motion.sway;
          c2.setTransform(d, 0, 0, d, 0, 0);
          c2.translate(layout.ox + (px + p.sway[1]) * layout.scale, layout.oy + (py + p.sway[2]) * layout.scale);
          c2.rotate(p.sway[0]);
          c2.translate(-px * layout.scale, -py * layout.scale);
          c2.drawImage(face, 0, 0, rig.width * layout.scale, rig.height * layout.scale);
        };
      }

      // Kutuyu tamamen kapla (cover), odak noktasını ortada tut, kenar boşluğu açma
      const resize = () => {
        const W = box.clientWidth;
        const H = box.clientHeight;
        if (!W || !H) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        const s = Math.max(W / rig.width, H / rig.height) * 1.012; // salınım kenarı açmasın
        const w = rig.width * s;
        const h = rig.height * s;
        layout = {
          scale: s,
          ox: Math.min(0, Math.max(W - w, W / 2 - w * rig.focus.x)),
          oy: Math.min(0, Math.max(H - h, H / 2 - h * rig.focus.y)),
          W,
          H,
          dpr,
        };
      };
      resize();
      ro = new ResizeObserver(resize);
      ro.observe(box);

      // ---- durum
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const life = createLife();
      const envelope = newEnvelope();
      const mouth = newMouthParams();
      let mouthKey = "";
      let nextBlink = performance.now() + 1200 + Math.random() * 2000;
      let blinkEnd = 0;
      let chained = false;
      let eyeKey = "";
      let last = performance.now();
      const frame = (now: number) => {
        if (disposed) return;
        const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
        last = now;

        // ağız: açıklığı ses enerjisi, şekli timeline ailesi sürer (kademesiz)
        const t = getTimeRef.current();
        const rms = getLevelRef.current();
        // Zaman damgası olmayan sesde (Gemini) şekil ailesi "konuşma" — açıklığı enerji sürer
        const family = t === null ? "REST" : spansRef.current.length ? shapeAt(spansRef.current, t * 1000) : "talk";
        const energy = stepEnvelope(envelope, rms ?? 0, dt);
        stepMouth(mouth, family, rms === null ? null : energy, t !== null, dt, rig.mouthAmplitude);
        const q = (x: number) => Math.round(x * 100);
        const mk = `${q(mouth.open)}|${q(mouth.round)}|${q(mouth.spread)}|${q(mouth.press)}|${q(mouth.fv)}`;
        if (mk !== mouthKey) {
          drawMouth(mouth);
          upload(mouthCanvas, mx!, my!);
          mouthKey = mk;
        }

        // beden: baş, kaş, nefes, bakış (+ dinleme/düşünme duruşu)
        const pose = life.step(dt, t !== null, rms === null ? 0 : energy, getActivityRef.current?.() ?? "idle");
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
        const open = !blinkEnd;
        const gx = reduced ? 0 : Math.round(pose.gazeX * rig.gazeScale * 8) / 8;
        const gy = reduced ? 0 : Math.round(pose.gazeY * rig.gazeScale * 8) / 8;
        const key = `${open ? 1 : 0}|${gx}|${gy}`;
        if (key !== eyeKey) {
          drawEyes(open, gx, gy);
          upload(eyeCanvas, ex, ey);
          eyeKey = key;
        }

        const s = now / 1000;
        const k = reduced ? 0 : 1;
        present({
          roll: k * pose.roll,
          nod: k * pose.nod,
          yaw: k * pose.yaw,
          brow: k * pose.brow,
          breath: k * pose.breath,
          sway: [k * 0.0025 * Math.sin(s * 0.79), k * 1.5 * Math.sin(s * 0.57), k * 1.2 * Math.sin(s * 1.37)],
        });
        raf = requestAnimationFrame(frame);
      };

      drawMouth(mouth);
      upload(mouthCanvas, mx!, my!);
      raf = requestAnimationFrame(frame);
      onReadyRef.current?.();
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      gl?.getExtension("WEBGL_lose_context")?.loseContext(); // WebView'da GPU belleğini hemen bırak
    };
  }, [rig]);

  return (
    <div ref={boxRef} className="relative h-full w-full overflow-hidden bg-neutral-900">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}
