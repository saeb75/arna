"use client";

import {
  Component,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useFBX, useGLTF, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import {
  VISEME_INTENSITY,
  VISEME_JAW,
  VISEME_MORPHS,
  VISEME_ROUND,
  indexAt,
  isSpeaking,
  type Timeline,
} from "@/lib/viseme";
import { VISEME_TO_ARKIT } from "@/lib/arkitVisemes";

// Draco decoder yerelden servis edilir (drei'nin varsayılanı gstatic CDN'i);
// tüm useGLTF çağrılarında aynı path kullanılmalı ki loader tutarlı kalsın
const DRACO_PATH = "/draco/";
useGLTF.preload("/fatman.glb", DRACO_PATH);

type SceneProps = {
  avatarUrl: string;
  animationUrl: string;
  animate: boolean;
  timeline: Timeline | null;
  // Oynatma saati: ses çalıyorsa currentTime, sessiz önizlemedeyse geçen süre, yoksa null (idle)
  getTime: () => number | null;
  // Sesin o anki RMS enerjisi; ses çalmıyorsa null
  getLevel: () => number | null;
};

/** Farklı frekansların toplamı — tek sinüs gibi periyodik görünmeyen yumuşak gezinme (±1) */
function wobble(t: number, seed: number): number {
  return (
    Math.sin(t * 0.37 + seed) * 0.5 +
    Math.sin(t * 0.83 + seed * 2.1) * 0.32 +
    Math.sin(t * 1.9 + seed * 0.7) * 0.18
  );
}

function smoothstep(a: number, b: number, x: number): number {
  const p = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return p * p * (3 - 2 * p);
}

// ofs: bu kemiğe geçen karede eklenen idle ofsetleri (x/y/z dönüş + py konum).
// Her kare başında geri alınır — üç.js PropertyMixer değişmeyen değeri yazmayı
// atladığından (sabit tutulan tek karelik pozlar) mixer'a güvenilemez; geri
// almadan eklemeler birikip karakteri bükiyordu.
type BoneState = {
  bone: THREE.Object3D;
  rot: THREE.Euler;
  pos: THREE.Vector3;
  ofs: { x: number; y: number; z: number; py: number };
};

// [kemik, çocuk kemik, hedef dünya yönü] — kolu bu yöne bakacak şekilde döndürür
const REST_AIM: Array<[string, string, [number, number, number]]> = [
  ["LeftArm", "LeftForeArm", [0.22, -1, 0.02]],
  ["LeftForeArm", "LeftHand", [0.1, -1, 0.15]],
  ["RightArm", "RightForeArm", [-0.22, -1, 0.02]],
  ["RightForeArm", "RightHand", [-0.1, -1, 0.15]],
];

/**
 * GLB'ler T-pose'da geliyor ve içlerinde hiç animasyon yok. Sabit açı vermek
 * yerine kemiğin mevcut dünya yönünü ölçüp hedef yöne çeviren dönüşü hesaplar —
 * böylece rig'in eksen düzeninden bağımsız çalışır ve tekrar uygulanabilir.
 */
function applyRestPose(scene: THREE.Object3D) {
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const bonePos = new THREE.Vector3();
  const childPos = new THREE.Vector3();
  const rot = new THREE.Quaternion();
  const parentQ = new THREE.Quaternion();
  const boneQ = new THREE.Quaternion();

  for (const [boneName, childName, dir] of REST_AIM) {
    const bone = scene.getObjectByName(boneName);
    const child = scene.getObjectByName(childName);
    if (!bone || !child || !bone.parent) continue;

    scene.updateMatrixWorld(true);
    bone.getWorldPosition(bonePos);
    child.getWorldPosition(childPos);
    from.copy(childPos).sub(bonePos);
    if (from.lengthSq() < 1e-10) continue;
    from.normalize();
    to.set(dir[0], dir[1], dir[2]).normalize();

    rot.setFromUnitVectors(from, to);
    bone.getWorldQuaternion(boneQ);
    bone.parent.getWorldQuaternion(parentQ);
    bone.quaternion.copy(parentQ.invert().multiply(rot.multiply(boneQ)));
  }
  scene.updateMatrixWorld(true);
  applyFlatArmRest(scene);
}

/**
 * Auto-Rig Pro düz iskeleti (Fat Man T-pose): kol/önkol/el kemikleri ebeveyn
 * zinciri DEĞİL, aynı düğümün kardeşleri — REST_AIM'in ebeveynlik varsayımı
 * çalışmaz. FK elle kurulur: üst kol kendi pivotunda döndürülür, önkol ve el
 * aynı dönüşle pivot etrafında taşınıp döndürülür (parmaklar ile önkol twist
 * kemiği zaten çocuk — kendiliğinden izler). İkinci adımda hafif dirsek
 * kırılımı için el, önkol pivotu etrafında öne alınır.
 */
function applyFlatArmRest(scene: THREE.Object3D) {
  const q = new THREE.Quaternion();
  const parentInv = new THREE.Quaternion();
  const cur = new THREE.Vector3();
  const target = new THREE.Vector3();

  for (const [side, sx] of [
    ["l", 1],
    ["r", -1],
  ] as const) {
    const arm = scene.getObjectByName(`arm_stretch${side}`);
    const forearm = scene.getObjectByName(`forearm_stretch${side}`);
    const hand = scene.getObjectByName(`hand${side}`);
    if (!arm || !forearm || !hand || !arm.parent) continue;
    if (forearm.parent !== arm.parent || hand.parent !== arm.parent) continue;

    scene.updateMatrixWorld(true);
    arm.parent.getWorldQuaternion(parentInv).invert();

    // 1) Tüm kol omuz pivotunda aşağı: hedef hafif dışa açık, yanda
    target.set(sx * 0.22, -1, 0.02).applyQuaternion(parentInv).normalize();
    cur.copy(forearm.position).sub(arm.position).normalize();
    q.setFromUnitVectors(cur, target);
    for (const b of [forearm, hand]) {
      b.position.sub(arm.position).applyQuaternion(q).add(arm.position);
      b.quaternion.premultiply(q);
    }
    arm.quaternion.premultiply(q);

    // 2) Hafif dirsek kırılımı: el önkol pivotunda biraz öne
    target.set(sx * 0.08, -1, 0.18).applyQuaternion(parentInv).normalize();
    cur.copy(hand.position).sub(forearm.position).normalize();
    q.setFromUnitVectors(cur, target);
    hand.position.sub(forearm.position).applyQuaternion(q).add(forearm.position);
    hand.quaternion.premultiply(q);
    forearm.quaternion.premultiply(q);
  }
  scene.updateMatrixWorld(true);
}

const BONE_NAMES = ["Head", "Neck", "Spine", "Spine1", "Spine2", "Hips", "LeftShoulder", "RightShoulder"] as const;
type BoneName = (typeof BONE_NAMES)[number];

// Öğretmenin duruşu: Pose_19 — eller yanda, ayakta, kameraya dönük. Kullanıcı
// poz değiştirmeyi istemedi; tek poz sabit tutulur, canlılığı nefes/salınım/
// bakış katmanları verir. (Birden çok ad verilirse aralarında yumuşak geçişli
// döngü kurulur; ilki bones memo'sundaki bake ile aynı olmalı.)
const TEACHER_POSES = ["Pose_19"];
const POSE_FADE = 0.9; // pozlar arası geçiş süresi (s)

// aimFace scratch'leri — her frame alloc yapmamak için
const _aimV1 = new THREE.Vector3();
const _aimV4 = new THREE.Vector3();
const _aimQ1 = new THREE.Quaternion();
const _aimQ2 = new THREE.Quaternion();
const _aimQ3 = new THREE.Quaternion();
const _aimQ4 = new THREE.Quaternion();

/**
 * Yüzü öne baktırır: pozlar kafayı aşağı/yana çevirebiliyor (Pose_03'te ~12°
 * aşağı + ~23° yana). Kafa kemiğinin bind pose'da +Z'ye (öne) denk gelen yerel
 * ekseni yüz yönü kabul edilir; o anki dünya yönü ölçülüp tam öne doğru k
 * oranında döndürülür. Kemik oryantasyonuna dayandığı için pozdan poza taşınan
 * göz-hedef kontrol kemiklerinden etkilenmez, poz geçişlerinde her karede
 * yeniden ölçüldüğünden hangi poz gelirse gelsin uyum sağlar.
 */
function aimFace(bone: THREE.Object3D, headBone: THREE.Object3D, fwdLocal: THREE.Vector3, k: number) {
  if (!bone.parent) return;
  headBone.getWorldQuaternion(_aimQ3);
  const cur = _aimV1.copy(fwdLocal).applyQuaternion(_aimQ3).normalize();
  const desired = _aimV4.set(0, 0, 1);
  _aimQ1.setFromUnitVectors(cur, desired);
  _aimQ1.slerp(_aimQ2.identity(), 1 - k); // kısmi düzeltme — pozun karakteri biraz kalsın
  bone.getWorldQuaternion(_aimQ3);
  bone.parent.getWorldQuaternion(_aimQ4);
  bone.quaternion.copy(_aimQ4.invert().multiply(_aimQ1.multiply(_aimQ3)));
}

// Aynı mantıksal kemik rig'e göre farklı adla gelir: Mixamo tarzı (mevcut
// avatarlar) ve Auto-Rig Pro (Fat Man). GLTFLoader düğüm adlarındaki noktaları
// siler (PropertyBinding.sanitizeNodeName): "head.x" sahnede "headx" olur.
// İlk bulunan ad kazanır.
const BONE_ALIASES: Record<BoneName, string[]> = {
  Head: ["Head", "headx"],
  Neck: ["Neck", "neckx"],
  Spine: ["Spine", "spine_01x"],
  Spine1: ["Spine1", "spine_02x"],
  Spine2: ["Spine2", "spine_03x"],
  Hips: ["Hips", "rootx"],
  LeftShoulder: ["LeftShoulder", "shoulderl"],
  RightShoulder: ["RightShoulder", "shoulderr"],
};

// FBXLoader iki nokta üst üsteyi sildiği için Mixamo kemikleri "mixamorigHips"
// biçiminde gelir; avatarlarımızda önek yok.
const MIXAMO_PREFIX = /^mixamorig[:_]?/;

/**
 * Mixamo klibini avatarın iskeletine uyarlar:
 * - kemik adlarındaki mixamorig önekini kaldırır
 * - Head/Neck kanallarını atar (bakış yönünü kod kontrol ediyor)
 * - position kanallarını atar (Mixamo santimetre, avatar metre ölçekli)
 * - avatarda karşılığı olmayan kemikleri atar
 */
function prepareClip(source: THREE.AnimationClip, scene: THREE.Object3D): THREE.AnimationClip | null {
  const tracks: THREE.KeyframeTrack[] = [];
  for (const track of source.tracks) {
    const dot = track.name.lastIndexOf(".");
    if (dot < 0) continue;
    const node = track.name.slice(0, dot).replace(MIXAMO_PREFIX, "");
    const prop = track.name.slice(dot + 1);
    if (node === "Head" || node === "Neck") continue;
    if (prop === "position") continue;
    if (!scene.getObjectByName(node)) continue;
    const copy = track.clone();
    copy.name = `${node}.${prop}`;
    tracks.push(copy);
  }
  if (!tracks.length) return null;
  return new THREE.AnimationClip("idle", source.duration, tracks);
}

function Avatar({
  url,
  animationUrl,
  animate,
  timeline,
  getTime,
  getLevel,
  onHead,
}: {
  url: string;
  animationUrl: string;
  animate: boolean;
  timeline: Timeline | null;
  getTime: () => number | null;
  getLevel: () => number | null;
  onHead: (pos: THREE.Vector3) => void;
}) {
  const { scene, animations } = useGLTF(url, DRACO_PATH);
  const fbx = useFBX(animationUrl);
  const gl = useThree((s) => s.gl);

  // Kendi poz klipleri olan model (Fat Man): bind pose T-pose'dur, doğal duruş
  // kliplerden birinde. Mevcut diğer avatarlarda hiç animasyon yok.
  const ownPose = animations.length > 0;

  // Morph adı -> onu barındıran tüm mesh/index çiftleri (yüz birkaç mesh'e bölünmüş olabilir)
  const morphMap = useMemo(() => {
    const map = new Map<string, Array<[THREE.Mesh, number]>>();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      for (const [name, idx] of Object.entries(mesh.morphTargetDictionary)) {
        const list = map.get(name);
        if (list) list.push([mesh, idx]);
        else map.set(name, [[mesh, idx]]);
      }
    });
    // Bazı üreticiler Oculus viseme'lerini önek olmadan adlandırır ("viseme_aa"
    // yerine "aa", I/O/U yerine "ih/oh/ou"). Kanonik ad yoksa takma ada bağla —
    // motorun geri kalanı hiçbir şeyden habersiz çalışmaya devam eder.
    const aliases: Record<string, string[]> = {
      viseme_sil: ["sil"],
      viseme_PP: ["PP"],
      viseme_FF: ["FF"],
      viseme_TH: ["TH"],
      viseme_DD: ["DD"],
      viseme_kk: ["kk"],
      viseme_CH: ["CH"],
      viseme_SS: ["SS"],
      viseme_nn: ["nn"],
      viseme_RR: ["RR"],
      viseme_aa: ["aa"],
      viseme_E: ["E"],
      viseme_I: ["ih", "I"],
      viseme_O: ["oh", "O"],
      viseme_U: ["ou", "U"],
    };
    for (const [canonical, candidates] of Object.entries(aliases)) {
      if (map.has(canonical)) continue;
      for (const alias of candidates) {
        const entries = map.get(alias);
        if (entries) {
          map.set(canonical, entries);
          break;
        }
      }
    }
    return map;
  }, [scene]);

  const setMorph = useCallback(
    (name: string, value: number) => {
      const list = morphMap.get(name);
      if (!list) return;
      const v = Math.min(1, Math.max(0, value));
      for (const [mesh, idx] of list) mesh.morphTargetInfluences![idx] = v;
    },
    [morphMap],
  );

  // Birden çok katman aynı morph'a yazabilir (gülümseme vs viseme genişletmesi,
  // round kanalı vs O/U). Doğrudan yazmak yerine frame boyunca hedefler max
  // semantiğiyle biriktirilir, sonda tek seferde uygulanır. Max doğru seçim:
  // tüm katkılar zaten upstream'de yumuşatılmış, aynı niyetin farklı şiddetleri
  // toplanırsa şekil abartılır, en güçlüsü alınırsa doğal kalır.
  const frameGoals = useRef(new Map<string, number>());
  const touchedMorphs = useRef(new Set<string>());
  const addGoal = useCallback((name: string, value: number) => {
    const goals = frameGoals.current;
    const prev = goals.get(name);
    if (prev === undefined || value > prev) goals.set(name, value);
  }, []);

  // Oculus viseme morph'u olmayan ama ARKit seti taşıyan modellerde (Fat Man)
  // her viseme ARKit kombinasyonuna açılır
  const hasOculusVisemes = useMemo(
    () => morphMap.has("viseme_aa") || morphMap.has("viseme_PP"),
    [morphMap],
  );
  const hasJoy = useMemo(() => morphMap.has("Joy"), [morphMap]);

  // Kalite geçişi: gölgeler, yakın planda morph'lu mesh'in culling'i, doku
  // keskinliği ve ortam haritası şiddeti. doubleSided materyalde gölge acne'si
  // shadowSide=BackSide + ışıktaki normalBias ile çözülür.
  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if ((mesh as unknown as THREE.SkinnedMesh).isSkinnedMesh) mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat?.isMeshStandardMaterial) continue;
        mat.envMapIntensity = 0.9;
        mat.shadowSide = THREE.BackSide;
        for (const tex of [mat.map, mat.normalMap, mat.roughnessMap, mat.metalnessMap, mat.aoMap]) {
          if (tex && tex.anisotropy !== maxAniso) {
            tex.anisotropy = maxAniso;
            tex.needsUpdate = true;
          }
        }
      }
    });
  }, [scene, gl]);

  // Yüz yönü düzeltmesi: kafa kemiğinin bind pose'da dünya +Z'sine (öne) denk
  // gelen yerel ekseni. skeleton.pose() bind'e döndürür — hemen ardından bones
  // memo'su pozu yeniden bake eder (deps'i bunun üst kümesi, sıra garanti).
  const face = useMemo(() => {
    if (!ownPose) return null;
    const headB = scene.getObjectByName("headx");
    if (!headB) return null;
    let skeleton: THREE.Skeleton | null = null;
    scene.traverse((o) => {
      const sm = o as THREE.SkinnedMesh;
      if (sm.isSkinnedMesh && !skeleton) skeleton = sm.skeleton;
    });
    if (!skeleton) return null;
    (skeleton as THREE.Skeleton).pose();
    scene.updateMatrixWorld(true);
    const qBind = headB.getWorldQuaternion(new THREE.Quaternion());
    const fwdLocal = new THREE.Vector3(0, 0, 1).applyQuaternion(qBind.invert());
    return { fwdLocal };
  }, [scene, ownPose]);

  const bones = useMemo(() => {
    // Duruş, idle hareketlerin bindirileceği temel açılar okunmadan önce
    // uygulanır. face memo'su iskeleti bind'e döndürmüş olabilir — buradaki
    // bake her koşulda pozu yeniden kurar.
    void face;
    if (ownPose) {
      // Fat Man paketindeki 22 poz tek tek render edilip incelendi: Pose_19
      // (ayakta, iki kol doğal sarkık — eller yanda) istenen temel duruş; kafa
      // hafif yana/aşağı dönük ama aimFace düzeltmesi bunu her karede çözüyor.
      // Yedek: en uzun klibin sonu. Poz örneklenir, açılar aşağıda "rest"
      // olarak yakalanır. Mixer bilerek durdurulmaz: stop/uncache PropertyMixer
      // üzerinden orijinal T-pose'u geri yükleyebilir; örnekleme mutlak değer
      // yazdığından cache'li sahnede tekrar çalışması güvenlidir.
      const poseClip =
        animations.find((a) => /^pose_19$/i.test(a.name)) ??
        animations.reduce((a, b) => (b.duration > a.duration ? b : a));
      const poser = new THREE.AnimationMixer(scene);
      poser.clipAction(poseClip).play();
      poser.update(poseClip.duration - 1e-3);
    } else {
      applyRestPose(scene);
    }
    scene.updateMatrixWorld(true);
    const found: Partial<Record<BoneName, BoneState>> = {};
    for (const name of BONE_NAMES) {
      for (const alias of BONE_ALIASES[name]) {
        const bone = scene.getObjectByName(alias);
        if (bone) {
          found[name] = {
            bone,
            rot: bone.rotation.clone(),
            pos: bone.position.clone(),
            ofs: { x: 0, y: 0, z: 0, py: 0 },
          };
          break;
        }
      }
    }
    return found;
  }, [scene, animations, ownPose, face]);

  // Klip hazırlanırken duruş uygulanmış olmalı — bones useMemo'su onu yapıyor.
  // Kendi pozu olan modelin iskeleti Mixamo klibiyle uyumsuzdur; atlanır.
  const clip = useMemo(() => {
    void bones;
    if (ownPose) return null;
    const source = fbx.animations[0];
    return source ? prepareClip(source, scene) : null;
  }, [fbx, scene, bones, ownPose]);

  // Animasyon kapatıldığında klibin sürdüğü kemikleri duruş açılarına döndürmek için
  const clipRest = useMemo(() => {
    if (!clip) return [] as BoneState[];
    const out: BoneState[] = [];
    const seen = new Set<string>();
    for (const track of clip.tracks) {
      const node = track.name.slice(0, track.name.lastIndexOf("."));
      if (seen.has(node)) continue;
      seen.add(node);
      const bone = scene.getObjectByName(node);
      if (bone)
        out.push({
          bone,
          rot: bone.rotation.clone(),
          pos: bone.position.clone(),
          ofs: { x: 0, y: 0, z: 0, py: 0 },
        });
    }
    return out;
  }, [clip, scene]);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  useEffect(() => {
    if (!clip) return;
    const action = mixer.clipAction(clip);
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    return () => {
      action.stop();
      mixer.uncacheAction(clip);
    };
  }, [mixer, clip]);

  // Öğretmen aynı pozda donup kalmasın: seçili pozlar mixer üzerinde ağırlık
  // crossfade'iyle dönüşümlü oynar (tek karelik klipler — ağırlık harmanı
  // kemik quaternion'larını doğru slerp'ler). cur/nxt indeks, t geçiş ilerlemesi.
  const poseCycle = useRef<{
    actions: THREE.AnimationAction[];
    cur: number;
    nxt: number;
    t: number;
    next: number; // sıradaki poz değişiminin clock zamanı (-1 = ilk karede kur)
  } | null>(null);

  useEffect(() => {
    if (!ownPose) return;
    const clips = TEACHER_POSES.map((n) => animations.find((a) => a.name === n)).filter(
      (c): c is THREE.AnimationClip => Boolean(c),
    );
    if (!clips.length) return;
    const actions = clips.map((c) => {
      const a = mixer.clipAction(c);
      a.setLoop(THREE.LoopRepeat, Infinity).play();
      a.setEffectiveWeight(0);
      return a;
    });
    actions[0].setEffectiveWeight(1);
    poseCycle.current = { actions, cur: 0, nxt: -1, t: 0, next: -1 };
    return () => {
      poseCycle.current = null;
      for (const a of actions) mixer.uncacheAction(a.getClip());
    };
  }, [mixer, ownPose, animations]);

  // Klibin sürdüğü kemikler — bunlara kendi salınımımı eklemem gerekmez
  const clipDriven = useMemo(
    () => new Set(clipRest.map((b) => b.bone.name)),
    [clipRest],
  );

  // Göz kapanması için hangi morph mevcutsa o kullanılır
  const blinkMorphs = useMemo(
    () =>
      morphMap.has("eyeBlinkLeft")
        ? (["eyeBlinkLeft", "eyeBlinkRight"] as const)
        : (["eyesClosed"] as const),
    [morphMap],
  );

  const weights = useRef(new Float32Array(VISEME_MORPHS.length));
  const goals = useRef(new Float32Array(VISEME_MORPHS.length));
  const mouth = useRef({ jaw: 0, round: 0 });
  const peak = useRef(0.05);
  const nod = useRef({ x: 0, v: 0 });
  // x/y: göz hedefi, hx: kafanın gözü gecikmeli takibi
  const gaze = useRef({ x: 0, y: 0, hx: 0, tx: 0, ty: 0, next: 0, away: false });
  const talk = useRef({ v: 0 }); // konuşma/sessizlik arası sürekli harman
  const env0 = useRef({ v: 0 }); // ses seviyesi zarfı
  const blink = useRef({ start: -1, next: 1.5, left: 1 });
  const listen = useRef({ next: 2.5 });

  // Avatarların boyu/duruşu farklı; kamera kafanın gerçek dünya konumuna göre
  // kadrajlanır (poz kafayı yana/öne kaydırabilir — Fat Man'de kaydırıyor)
  useEffect(() => {
    scene.updateMatrixWorld(true);
    const head = bones.Head?.bone;
    const pos = head ? head.getWorldPosition(new THREE.Vector3()) : null;
    if (pos && Number.isFinite(pos.y) && pos.y > 0) {
      onHead(pos);
      return;
    }
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;
    onHead(new THREE.Vector3(0, box.max.y * 0.92, 0));
  }, [scene, bones, onHead]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const clock = state.clock.elapsedTime;
    const t = getTime();
    const active = t != null;
    const speaking = active && timeline ? isSpeaking(timeline.intervals, t) : false;

    // Geçen karenin idle ofsetleri geri alınır: taban saf poza döner, ofset
    // aşağıda yeniden eklenir. Mixer'ın sabit pozda yazmayı atlaması (three.js
    // PropertyMixer optimizasyonu) bu yüzden birikime yol açamaz.
    for (const name of BONE_NAMES) {
      const b = bones[name];
      if (!b) continue;
      b.bone.rotation.x -= b.ofs.x;
      b.bone.rotation.y -= b.ofs.y;
      b.bone.rotation.z -= b.ofs.z;
      b.bone.position.y -= b.ofs.py;
      b.ofs.x = b.ofs.y = b.ofs.z = b.ofs.py = 0;
    }

    // Gövde animasyonu önce uygulanır; kafa/bakış katmanları bunun üstüne biner
    const clipActive = animate && clip != null;
    const pc = ownPose ? poseCycle.current : null;
    if (pc) {
      // ---- Poz döngüsü: belirli aralıkla rastgele farklı bir poza yumuşak geçiş
      if (pc.next < 0) pc.next = clock + 6 + Math.random() * 6;
      if (pc.nxt < 0 && clock >= pc.next && pc.actions.length > 1) {
        let n = pc.cur;
        while (n === pc.cur) n = Math.floor(Math.random() * pc.actions.length);
        pc.nxt = n;
        pc.t = 0;
      }
      if (pc.nxt >= 0) {
        pc.t = Math.min(1, pc.t + dt / POSE_FADE);
        const w = smoothstep(0, 1, pc.t);
        pc.actions[pc.cur].setEffectiveWeight(1 - w);
        pc.actions[pc.nxt].setEffectiveWeight(w);
        if (pc.t >= 1) {
          pc.cur = pc.nxt;
          pc.nxt = -1;
          pc.next = clock + 9 + Math.random() * 8;
        }
      }
      mixer.update(dt);
      // ---- Yüz öne baksın: düzeltme boyun+kafa arasında paylaştırılır ki
      // büyük açılarda kafa gövdeden kopmuş görünmesin
      const headB = bones.Head?.bone;
      const neckB = bones.Neck?.bone;
      if (face && headB) {
        if (neckB) aimFace(neckB, headB, face.fwdLocal, 0.35);
        aimFace(headB, headB, face.fwdLocal, 0.8);
      }
    } else if (clipActive) {
      mixer.update(dt);
    } else {
      for (const b of clipRest) {
        b.bone.rotation.copy(b.rot);
        b.bone.position.copy(b.pos);
      }
    }

    // Konuşma/sessizlik arasında sert geçiş yapılmaz: tüm hareket genlikleri bu
    // sürekli değere göre harmanlanır, böylece aralık sınırlarında sıçrama olmaz
    const talkRef = talk.current;
    talkRef.v += ((speaking ? 1 : 0) - talkRef.v) * (1 - Math.exp(-7 * dt));
    const talking = talkRef.v;

    // ---- Sesin gerçek enerjisi: ağzın NE KADAR açılacağını bu belirler ----
    // Metinden türetilen zamanlama kayabilir, ses kaymaz. Yavaş uyumlu tepe
    // takibi farklı mp3 seviyelerine otomatik kalibre olur.
    const rms = getLevel();
    let unit = 0.5; // sessiz önizlemede ses yok — orta seviye varsayılır
    if (rms != null) {
      peak.current = Math.max(rms, peak.current * 0.9985);
      const raw = Math.min(1, rms / Math.max(0.03, peak.current * 0.72));
      // Zarf takibi: ham RMS kareden kareye zıplar. Hızlı açılış, yavaş kapanış —
      // ağız hem sese anında tepki verir hem titremez.
      const env = env0.current;
      env.v += (raw - env.v) * (1 - Math.exp(-(raw > env.v ? 30 : 9) * dt));
      unit = env.v;
    }
    const gate = rms != null ? smoothstep(0.05, 0.32, unit) : 1;

    // ---- Ağız: aktif viseme + sonrakine hazırlık (co-articulation) ----
    const g = goals.current;
    g.fill(0);
    let jawGoal = 0;
    let roundGoal = 0;

    if (speaking && timeline && t != null) {
      const i = indexAt(timeline.frames, t);
      if (i >= 0) {
        const cur = timeline.frames[i];
        const next = timeline.frames[i + 1];
        const p = cur.d > 0 ? Math.min(1, (t - cur.t) / cur.d) : 1;

        g[cur.v] = VISEME_INTENSITY[cur.v];
        jawGoal = VISEME_JAW[cur.v];
        roundGoal = VISEME_ROUND[cur.v];

        if (next) {
          // Şekiller birbirine geçer; ağız bir sonraki sese önceden hazırlanır
          const a = smoothstep(0.45, 1, p) * 0.5;
          g[next.v] = Math.max(g[next.v], VISEME_INTENSITY[next.v] * a);
          jawGoal += (VISEME_JAW[next.v] - jawGoal) * a;
          roundGoal += (VISEME_ROUND[next.v] - roundGoal) * a;
        }

      }
    }

    // Ses kısıksa şekiller de sönümlenir: cümle ortasındaki gerçek duraklamada
    // ağız kapanır, zamanlama tahmini kaysa bile boşa oynamaz
    const shape = 0.4 + 0.6 * gate;

    // Kapanışlar açılışlardan hızlıdır — dudak kapanması net olsun
    const w = weights.current;
    for (let i = 0; i < w.length; i++) {
      const goal = g[i] * shape;
      const rate = goal > w[i] ? 24 : 32;
      w[i] += (goal - w[i]) * (1 - Math.exp(-rate * dt));
      if (hasOculusVisemes) {
        addGoal(VISEME_MORPHS[i], w[i]);
      } else if (w[i] > 0.001) {
        const combo = VISEME_TO_ARKIT[i];
        for (const name in combo) addGoal(name, w[i] * combo[name]);
      }
    }

    const m = mouth.current;
    // Çene açıklığı = viseme'in üst sınırı × sesin o anki enerjisi
    m.jaw += (jawGoal * unit - m.jaw) * (1 - Math.exp(-30 * dt));
    m.round += (roundGoal * shape - m.round) * (1 - Math.exp(-20 * dt));
    addGoal("jawOpen", m.jaw);
    addGoal("mouthFunnel", m.round);

    // ---- Onaylama başı sallaması: yalnızca dinlerken. Konuşurken hiç darbe
    // verilmez, çünkü vurgu sallamaları konuşmayı sarsıntılı gösteriyordu.
    if (active && talking < 0.15) {
      if (clock >= listen.current.next) {
        nod.current.v += 0.45 + Math.random() * 0.3;
        listen.current.next = clock + 1.8 + Math.random() * 3;
      }
    } else {
      listen.current.next = Math.max(listen.current.next, clock + 1.5);
    }

    // Sönümlü yay: darbe sonrası kafa yumuşakça yerine döner (yüksek sönüm =
    // salınım yok). Konuşurken kalan hareket ayrıca kısılır.
    const n = nod.current;
    n.v += (-85 * n.x - 17 * n.v) * dt;
    n.x += n.v * dt;
    const nodOut = n.x * (1 - 0.7 * talking);

    // ---- Bakış: konuşurken doğrudan kameraya, yalnızca mikro titreme.
    // Bakış kaçırma sadece dinlerken/boştayken olur.
    const s = gaze.current;
    if (clock >= s.next) {
      const awayChance = talking > 0.3 ? 0 : active ? 0.25 : 0.3;
      s.away = Math.random() < awayChance;
      if (s.away) {
        s.tx = (Math.random() < 0.5 ? -1 : 1) * (0.28 + Math.random() * 0.28);
        // Aşağı bakış dalgın/ilgisiz okunuyor — kaçırma çoğunlukla yatay,
        // dikeyde hafif yukarı eğilimli dar bir bantta kalır
        s.ty = -0.05 + Math.random() * 0.13;
        s.next = clock + 0.4 + Math.random() * 0.6; // kaçırma kısa sürer
      } else {
        s.tx = (Math.random() * 2 - 1) * 0.05; // göz temasında sadece mikro titreme
        s.ty = (Math.random() * 2 - 1) * 0.04;
        s.next = clock + 1.6 + Math.random() * 2;
      }
    }
    // Sakadlar ani hareketlerdir — yumuşak değil hızlı geçiş
    const gazeK = 1 - Math.exp(-22 * dt);
    s.x += (s.tx - s.x) * gazeK;
    s.y += (s.ty - s.y) * gazeK;
    // Kafa gözü çok daha yavaş takip eder; göz sıçrasa da kafa süzülerek gider
    s.hx += (s.x - s.hx) * (1 - Math.exp(-3.5 * dt));

    addGoal("eyeLookOutLeft", Math.max(0, s.x));
    addGoal("eyeLookInRight", Math.max(0, s.x));
    addGoal("eyeLookInLeft", Math.max(0, -s.x));
    addGoal("eyeLookOutRight", Math.max(0, -s.x));
    addGoal("eyeLookUpLeft", Math.max(0, s.y));
    addGoal("eyeLookUpRight", Math.max(0, s.y));
    addGoal("eyeLookDownLeft", Math.max(0, -s.y));
    addGoal("eyeLookDownRight", Math.max(0, -s.y));

    // ---- Göz kırpma: tek ya da (bazen) çift, hızlı kapanıp yavaş açılan ----
    let blinkW = 0;
    const b = blink.current;
    if (b.start < 0 && clock >= b.next) {
      b.start = clock;
      b.left = Math.random() < 0.22 ? 2 : 1;
    }
    if (b.start >= 0) {
      const e = clock - b.start;
      if (e >= 0.2) {
        b.left -= 1;
        if (b.left > 0) b.start = clock + 0.07;
        else {
          b.start = -1;
          b.next = clock + 1.4 + Math.random() * 3.4;
        }
      } else if (e >= 0) {
        blinkW = e < 0.07 ? e / 0.07 : e < 0.1 ? 1 : Math.max(0, 1 - (e - 0.1) / 0.1);
      }
    }
    for (const name of blinkMorphs) addGoal(name, blinkW);

    // ---- Kaşlar: yavaş gezinme + onaylama sallamasına eşlik ----
    const emphasis = Math.min(0.4, Math.abs(nodOut) * 6);
    const brow = 0.05 + 0.09 * Math.max(0, wobble(clock, 3.3));
    addGoal("browInnerUp", brow + emphasis * 0.5);
    addGoal("browOuterUpLeft", brow * 0.7 + emphasis * 0.3);
    addGoal("browOuterUpRight", brow * 0.7 + emphasis * 0.3);
    addGoal("eyeSquintLeft", 0.06 + blinkW * 0.15);
    addGoal("eyeSquintRight", 0.06 + blinkW * 0.15);

    // Hafif kalıcı gülümseme — nötr yüz ölü görünür. Modelde tüm-yüz "Joy"
    // duygu morph'u varsa ana yükü o taşır, ağız-bölgesi morph'ları yarıya iner
    // (Joy ≤ ~0.16 kalmalı, yoksa visemelerle çatışır).
    const smile = 0.09 + 0.03 * Math.max(0, wobble(clock, 5.5));
    const smileOut = hasJoy ? smile * 0.5 : smile;
    if (hasJoy) addGoal("Joy", 0.12 + 0.04 * Math.max(0, wobble(clock, 5.5)));
    addGoal("mouthSmile", smileOut);
    addGoal("mouthSmileLeft", smileOut);
    addGoal("mouthSmileRight", smileOut);
    addGoal("mouthDimpleLeft", smileOut * 0.5);
    addGoal("mouthDimpleRight", smileOut * 0.5);

    // ---- Gövde: nefes + salınım. Genlikler `talking` ile harmanlanır; konuşurken
    // neredeyse yalnızca nefes kalır, avatar karşıya sabit bakar.
    const breath = Math.sin(clock * 1.35);
    const amp = (idle: number, speak: number) => idle + (speak - idle) * talking;

    // ownPose'ta temel, mixer/aimFace'in bu karedeki çıktısıdır: ofset üzerine
    // EKLENİR ve ofs'a kaydedilir (gelecek kare başında geri alınır — birikmez).
    // Diğer modellerde temel, bake'lenmiş rest açısıdır (mutlak yazım).
    const addRot = (b: BoneState, axis: "x" | "y" | "z", off: number) => {
      if (ownPose) {
        b.bone.rotation[axis] += off;
        b.ofs[axis] += off;
      } else {
        b.bone.rotation[axis] = b.rot[axis] + off;
      }
    };

    const head = bones.Head;
    if (head) {
      addRot(head, "x", nodOut + wobble(clock, 1.1) * amp(0.022, 0.008));
      addRot(head, "y", wobble(clock, 4.7) * amp(0.05, 0.006) + s.hx * amp(0.055, 0.012));
      addRot(head, "z", wobble(clock, 7.9) * amp(0.032, 0.009));
    }
    const neck = bones.Neck;
    if (neck) {
      addRot(neck, "x", nodOut * 0.35 + breath * 0.004);
      addRot(neck, "y", wobble(clock, 4.7) * amp(0.026, 0.004) + s.hx * amp(0.018, 0.004));
    }
    // Gövde salınımı ve nefes yalnızca klip o kemiği sürmüyorsa eklenir —
    // aksi halde iki hareket üst üste binip savaşır
    const driven = (name: string) => clipActive && clipDriven.has(name);
    for (const name of ["Spine1", "Spine2"] as const) {
      const sp = bones[name];
      if (!sp || driven(name)) continue;
      addRot(sp, "x", breath * 0.011);
      addRot(sp, "y", wobble(clock, 2.9) * amp(0.014, 0.003));
    }
    const hips = bones.Hips;
    if (hips && !driven("Hips")) {
      const dy = breath * 0.005;
      if (ownPose) {
        hips.bone.position.y += dy;
        hips.ofs.py += dy;
      } else {
        hips.bone.position.y = hips.pos.y + dy;
      }
      addRot(hips, "y", wobble(clock, 2.2) * amp(0.022, 0.004));
      addRot(hips, "z", wobble(clock, 6.4) * amp(0.008, 0.003));
    }
    for (const name of ["LeftShoulder", "RightShoulder"] as const) {
      const sh = bones[name];
      if (!sh || driven(name)) continue;
      addRot(sh, "z", breath * 0.018);
    }

    // ---- Morph flush: bu frame hedefi olmayan ama daha önce yazılmış morph'lar
    // sıfırlanır (yumuşatma upstream'de olduğundan ani sıçrama oluşmaz), sonra
    // biriken hedefler tek seferde uygulanır.
    const goals2 = frameGoals.current;
    for (const name of touchedMorphs.current) {
      if (!goals2.has(name)) setMorph(name, 0);
    }
    for (const [name, v] of goals2) {
      setMorph(name, v);
      touchedMorphs.current.add(name);
    }
    goals2.clear();
  });

  return <primitive object={scene} />;
}

class LoadBoundary extends Component<{ resetKey: string; children: ReactNode }, { error: string | null }> {
  state: { error: string | null } = { error: null };

  static getDerivedStateFromError(err: unknown) {
    return { error: err instanceof Error ? err.message : "Bilinmeyen hata" };
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-red-300">
          <p>{"Avatar yüklenemedi — .glb yolunu/URL'sini kontrol et (varsayılan: /avatar.glb)."}</p>
          <p className="text-xs text-red-400/70">({this.state.error})</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// PNG fon: kamera sabit olduğundan düzlem her karede kameranın tam karşısına
// oturtulur ve görüntü "cover" mantığıyla ortadan kırpılır — en-boy oranı
// bozulmaz, kenar görünmez. toneMapped kapalı: PNG kendi renkleriyle kalır.
function PhotoBackdrop({ url }: { url: string }) {
  const tex = useTexture(url);
  const mesh = useRef<THREE.Mesh>(null);
  const DIST = 3; // karakterin arkasında, gölge kamerasının dışında

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);

  useFrame(({ camera }) => {
    const m = mesh.current;
    const cam = camera as THREE.PerspectiveCamera;
    if (!m || !cam.isPerspectiveCamera) return;
    m.position.copy(cam.position);
    m.quaternion.copy(cam.quaternion);
    m.translateZ(-DIST);
    const h = 2 * DIST * Math.tan((cam.fov * Math.PI) / 360);
    const w = h * cam.aspect;
    m.scale.set(w, h, 1);

    const img = tex.image as { width?: number; height?: number } | undefined;
    if (img?.width && img?.height) {
      const imgAspect = img.width / img.height;
      const planeAspect = w / h;
      if (imgAspect > planeAspect) {
        tex.repeat.set(planeAspect / imgAspect, 1);
        tex.offset.set((1 - tex.repeat.x) / 2, 0);
      } else {
        tex.repeat.set(1, imgAspect / planeAspect);
        tex.offset.set(0, (1 - tex.repeat.y) / 2);
      }
    }
  });

  return (
    <mesh ref={mesh} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

// Stüdyo aydınlatması: ağdan HDRI çekmek yerine Lightformer'larla yerelde
// üretilen ortam haritası (frames=1 → küp harita bir kez pişirilir)
function StudioEnvironment() {
  return (
    <Environment resolution={512} frames={1}>
      {/* Key softbox — sağ üst ön, sıcak beyaz */}
      <Lightformer form="rect" intensity={2.4} color="#fff2e2" position={[2, 2.5, 2.5]} scale={[3, 3, 1]} target={[0, 1.45, 0]} />
      {/* Dolgu — sol ön, soğuk ve zayıf */}
      <Lightformer form="rect" intensity={0.7} color="#c3d3ff" position={[-2.5, 1.4, 2]} scale={[4, 4, 1]} target={[0, 1.35, 0]} />
      {/* Kontur — arka üst, sayfa paletiyle uyumlu indigo */}
      <Lightformer form="rect" intensity={1.8} color="#8ea2ff" position={[0, 2.4, -2.5]} scale={[5, 2, 1]} target={[0, 1.5, 0]} />
      {/* Zemin sekmesi — alt taraf tamamen kararmasın */}
      <Lightformer form="rect" intensity={0.4} color="#39406b" position={[0, -2, 2]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
    </Environment>
  );
}

// Yüklenen avatarın kafa konumuna göre kamerayı kadrajlar. Kamera SABİTTİR:
// kullanıcı döndüremez/yakınlaştıramaz (orbit kontrolleri bilerek yok).
// Kafa ile kamera arası mesafe (m). Küçült → yakınlaş, büyüt → uzaklaş.
const FRAMING_DISTANCE = 1.15;

function HeadFraming({ head }: { head: THREE.Vector3 | null }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (head == null) return;
    // Kadraj mesafesi. fov 28° ile görünen dikey yükseklik ≈ 0.499 × mesafe:
    //   1.70m → ~0.85m (göğüs/omuz planı)
    //   1.15m → ~0.57m (baş/omuz planı — konuşan yüz için tercih edilen)
    // Aşağı ofsetler mesafeyle birlikte küçülür, yoksa yakın planda saçın üstü
    // kadrajdan taşar.
    camera.position.set(head.x, head.y - 0.03, head.z + FRAMING_DISTANCE);
    camera.lookAt(head.x, head.y - 0.05, head.z);
  }, [head, camera]);
  return null;
}

export default function AvatarScene({
  avatarUrl,
  animationUrl,
  animate,
  timeline,
  getTime,
  getLevel,
}: SceneProps) {
  const [head, setHead] = useState<THREE.Vector3 | null>(null);

  // Avatar değiştiğinde eski kadraj değerini bırak, yenisi ölçülene kadar bekle
  useEffect(() => setHead(null), [avatarUrl]);

  return (
    <LoadBoundary resetKey={avatarUrl}>
      <Canvas
        camera={{ position: [0, 1.58, 0.85], fov: 28 }}
        dpr={2}
        shadows
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PhotoBackdrop url="/bg.png" />
        </Suspense>
        <StudioEnvironment />
        {/* Key: IBL key softbox'ıyla aynı yönden, gölge kaynağı olarak */}
        <directionalLight
          position={[1.8, 2.6, 2.2]}
          intensity={2.0}
          color="#fff1e0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-normalBias={0.035}
          shadow-camera-left={-1.3}
          shadow-camera-right={1.3}
          shadow-camera-top={2.3}
          shadow-camera-bottom={-0.2}
          shadow-camera-near={0.5}
          shadow-camera-far={8}
        />
        <directionalLight position={[-2, 1.5, 1]} intensity={0.45} color="#a8c4ff" />
        <ambientLight intensity={0.3} />
        <Suspense fallback={null}>
          <Avatar
            key={avatarUrl}
            url={avatarUrl}
            animationUrl={animationUrl}
            animate={animate}
            timeline={timeline}
            getTime={getTime}
            getLevel={getLevel}
            onHead={setHead}
          />
        </Suspense>
        <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={3} blur={2.6} far={1.5} resolution={1024} color="#06060f" />
        <HeadFraming head={head} />
        <EffectComposer multisampling={8}>
          <N8AO aoRadius={0.18} intensity={1.2} distanceFalloff={0.6} quality="high" halfRes={false} color="black" />
          <Bloom mipmapBlur intensity={0.18} luminanceThreshold={0.9} luminanceSmoothing={0.2} />
          <Vignette offset={0.22} darkness={0.3} />
          {/* Composer renderer tone mapping'ini kapatır — zincirin SONUNDA
              ACES şart, yoksa çıktı linear/soluk olur */}
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </LoadBoundary>
  );
}
