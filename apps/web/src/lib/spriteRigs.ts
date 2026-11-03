// 2.5D SPRITE RIG'LERİ — katmanlı portre avatarlar (SpriteAvatar çizer).
//
// Taban görsel opak tek portredir: gözler KAPALI (göz kırpma = göz katmanını
// çizmemek), ağız bölgesi temizlenmiş. Üstüne iki küçük dinamik bölge çizilir:
//   - gözler: göz beyazı katmanı + kayan irisler (göz açıklığı maskesiyle
//     kırpılır) + kapağa sabit üst kapak gölgesi → bakış hareketi
//   - ağız: MORF ATLASI (7 poz + her poz çifti için optik akış ara kareleri)
// Sonuç bir yüz ağı üzerinde esnetilir (baş eğme/sallama/dönüş hissi, kaş,
// nefes) — çapalar `motion`da, davranış lib/spriteLife.
// Kaynak: AI_Tutor rig v0.3 (WebView sprite prototip, Live2D DEĞİL). İris
// katmanları göz görselinden türetildi: ~/Desktop/imtiyaz/raven-avatar/scripts.
import type { AvatarId } from "@glotmate/contracts";
import ravenEyes from "./rigs/ravenEyes.json";
import kaiEyes from "./rigs/kaiEyes.json";
import kaiMouthAtlas from "./rigs/kaiMouthAtlas.json";
import lenaEyes from "./rigs/lenaEyes.json";
import lenaMouthAtlas from "./rigs/lenaMouthAtlas.json";
import ravenMouthAtlas from "./rigs/ravenMouthAtlas.json";

/** Timeline şekil ailesi — "F" (f/v: üst dişler alt dudakta) atlasında FV pozu olmayan rig'de yayvana düşer */
export type MouthShape = "REST" | "M" | "A" | "E" | "O" | "talk" | "smile" | "F";

/** Atlas yerleşimi: kareler tuvalin `roi` dikdörtgenine birebir oturur */
export interface MouthAtlas {
  src: string;
  /** [x0, y0, x1, y1] tuval pikseli */
  roi: number[];
  tileSize: number[];
  /** anahtar → [sütun, satır] */
  slots: Record<string, number[]>;
  /**
   * Kademesiz ağız eksenleri (atlas anahtarları, kapalıdan açığa): ağız `neutral`
   * ekseninde ses enerjisiyle kayar; `round`/`spread` şekil ailesi ağırlığıyla
   * üstüne karışır; `press` (M/B/P) ve varsa `fv` (F/V) tek kare.
   */
  axes: { neutral: string[]; round: string[]; spread: string[]; press: string; fv?: string };
}

export interface SpriteEye {
  /** tam iris diski ve tuvaldeki kutusu [x, y, w, h] */
  iris: string;
  irisRect: number[];
  /** göz açıklığı maskesi (alfa) ve kapak gölgesi — ikisi de aynı kutuda */
  aperture: string;
  shadow: string;
  apertureRect: number[];
}

export interface SpriteRig {
  id: AvatarId;
  width: number;
  height: number;
  base: string;
  /** açık göz katmanı, iris yerine göz beyazı (kapak/kirpik aynen) */
  sclera: string;
  /** göz katmanının saydam olmayan kutusu [x, y, w, h] — her karede yalnız bu bölge yeniden çizilir */
  scleraRect: number[];
  eyes: SpriteEye[];
  mouth: MouthAtlas;
  /** Kadraj odağı (tuval oranı): kutu kırparken bu nokta merkezde tutulur */
  focus: { x: number; y: number };
  /** Ağzın ulaşabileceği en büyük açıklık (0..1, neutral ekseni üzerinde) */
  mouthAmplitude: number;
  /** İris kayma genliği çarpanı — göz katmanı büyük kaymada iz bırakıyorsa küçültülür */
  gazeScale: number;
  /** Yuvarlak (O) ekseninde en uzak konum (0..1, vars. 0.8) — pozu güçlü büzülen rig'de kısılır */
  roundMax?: number;
  /** Yüz ağı çapaları (tuval pikseli) */
  motion: {
    /** baş eğiminin dönme noktası (boyun) */
    neck: [number, number];
    /** baş ağırlığı bu y aralığında 1→0 söner (çene → boyunluk) */
    headFade: [number, number];
    /** yatayda başın yarı genişliği: bu |x-merkez| aralığında söner (arka plan sabit) */
    headHalfWidth: [number, number];
    /** dönüş hissi için yüz içi merkezi ve yayılımı (σx, σy) */
    face: [number, number];
    faceSigma: [number, number];
    browL: [number, number];
    browR: [number, number];
    browSigma: [number, number];
    /** göğüs bu y aralığında nefesle kalkar */
    chest: [number, number];
    /** bütün portre salınımının pivotu (omuz) */
    sway: [number, number];
  };
}

/**
 * Oculus viseme (viseme.ts sırası) → ağız katmanı. FF/TH ayrı çizim yok, E'ye
 * yaklaşık (rig belgesindeki eşlemeyle aynı); CH/SH yatay dudak → E. Buradaki
 * poz yalnız ŞEKİL AİLESİDİR — açıklığı sesin enerjisi kademesiz sürer
 * (spriteMouth stepMouth).
 */
export const VISEME_TO_MOUTH: readonly MouthShape[] = [
  /*  0 sil */ "REST",
  /*  1 PP  */ "M",
  /*  2 FF  */ "F",
  /*  3 TH  */ "E",
  /*  4 DD  */ "talk",
  /*  5 kk  */ "talk",
  /*  6 CH  */ "E",
  /*  7 SS  */ "E",
  /*  8 nn  */ "talk",
  /*  9 RR  */ "talk", // R'nin dudak yuvarlaması hafif; büzük O pozu fazla güçlü (ağız %30 O'da kalıyordu)
  /* 10 aa  */ "A",
  /* 11 E   */ "E",
  /* 12 I   */ "E",
  /* 13 O   */ "O",
  /* 14 U   */ "O",
];

const RAVEN_DIR = "/avatars/raven";

const RAVEN: SpriteRig = {
  id: "raven",
  width: 885,
  height: 887,
  base: `${RAVEN_DIR}/portrait_base.jpg`,
  sclera: `${RAVEN_DIR}/eyes_sclera.png`,
  scleraRect: [265, 258, 373, 157],
  eyes: (["L", "R"] as const).map((k) => ({
    iris: `${RAVEN_DIR}/iris_${k}.png`,
    irisRect: ravenEyes[k].iris,
    aperture: `${RAVEN_DIR}/aperture_${k}.png`,
    shadow: `${RAVEN_DIR}/lidshadow_${k}.png`,
    apertureRect: ravenEyes[k].aperture,
  })),
  mouth: {
    src: `${RAVEN_DIR}/mouth_morph_atlas.webp`,
    roi: ravenMouthAtlas.roi,
    tileSize: ravenMouthAtlas.tileSize,
    slots: ravenMouthAtlas.slots,
    // v0.3 atlasının optik akış ara kareleri eksen olarak okunur; F/V pozu yok
    axes: {
      neutral: ["REST", "REST>talk:0", "REST>talk:1", "REST>talk:2", "REST>talk:3", "talk", "talk>A:0", "talk>A:1", "talk>A:2", "talk>A:3", "A"],
      round: ["REST", "REST>O:0", "REST>O:1", "REST>O:2", "REST>O:3", "O"],
      spread: ["REST", "REST>E:0", "REST>E:1", "REST>E:2", "REST>E:3", "E"],
      press: "M",
    },
  },
  mouthAmplitude: 0.7,
  gazeScale: 1,
  // 4:3 kutuda saç tepesinden choker'a kadar görünsün (yüz merkezi y≈0.43)
  focus: { x: 0.5, y: 0.4 },
  // portre ızgarayla ölçüldü: çene y≈555, saç uçları ≈590, boyunluk 605–660, kaşlar y≈255–280
  motion: {
    neck: [450, 600],
    headFade: [560, 640],
    headHalfWidth: [330, 430],
    face: [452, 380],
    faceSigma: [110, 150],
    browL: [360, 268],
    browR: [538, 265],
    browSigma: [75, 20],
    chest: [640, 887],
    sway: [442, 648],
  },
};

// Kai: Gemini ile üretilmiş poz seti (taban + kapalı göz + 10 ağız: açıklık serisi o15–o75,
// O/E ikişer açıklıkta, M, F/V) — hepsi aynı tabandan düzenlendiği için dudak tutarlı.
// Hat: ~/Desktop/imtiyaz/sprite-avatar/scripts (hizala → alt yüz yaması + renk eşitleme +
// DIS optik akış ara kareleri → atlas; kapalı gözlü taban; iris katmanları). Tuval 1024.
const KAI_DIR = "/avatars/kai";
const KAI: SpriteRig = {
  id: "kai",
  width: 1024,
  height: 1024,
  base: `${KAI_DIR}/portrait_base.jpg`,
  sclera: `${KAI_DIR}/eyes_sclera.png`,
  scleraRect: [367, 268, 308, 110],
  eyes: (["L", "R"] as const).map((k) => ({
    iris: `${KAI_DIR}/iris_${k}.png`,
    irisRect: kaiEyes[k].iris,
    aperture: `${KAI_DIR}/aperture_${k}.png`,
    shadow: `${KAI_DIR}/lidshadow_${k}.png`,
    apertureRect: kaiEyes[k].aperture,
  })),
  mouth: {
    src: `${KAI_DIR}/mouth_atlas.webp`,
    roi: kaiMouthAtlas.roi,
    tileSize: kaiMouthAtlas.tileSize,
    slots: kaiMouthAtlas.slots,
    axes: kaiMouthAtlas.axes,
  },
  focus: { x: 0.5, y: 0.39 },
  // o75'e kadar tutarlı açıklık serisi var — Raven'dan biraz daha geniş açılabilir
  mouthAmplitude: 0.85,
  // kalın kirpik irisin üstüne yapışık: büyük kaymada üst kenarda iz kalıyor
  gazeScale: 0.6,
  // ızgarayla ölçüldü (1024): kaşlar y≈266, gözler 320, ağız 465, çene ≈585, boyun 585–665, yaka ≥680
  motion: {
    neck: [512, 620],
    headFade: [590, 660],
    headHalfWidth: [230, 300],
    face: [512, 400],
    faceSigma: [110, 150],
    browL: [430, 266],
    browR: [600, 266],
    browSigma: [60, 16],
    chest: [680, 1024],
    sway: [512, 720],
  },
};

// Lena: Kai'nin Gemini hattı (taban + kapalı göz + 10 ağız; F/V yok → f/v yayvan ağza düşer).
// Farklar: (1) bazı açık ağız pozlarında Gemini kaşları da kaldırmış — göz bandı kaşın ALTINDAN
// başlar, yoksa her göz kırpışında kaş oynardı; (2) iris iri ve burun tarafında sklera yok denecek
// kadar dar, iris üstü kirpikle aynı koyulukta → kapak çizgisi renk eşiğiyle bulunamadı, 8x
// yakınlaştırmadan elle ölçülen noktalarla çizildi (irislayers "points" kipi); (3) saç yüze yakın,
// ağız yaması yüz genişliğiyle sınırlı; (4) "Kai'den sert" geri bildirimi ölçüldü: açıklık serisinde
// o30→o50 sıçraması diğer adımların ~2.5 katıydı ve aileler (nötr/O/E) aynı açıklıkta birbirinden
// uzaktı (geçişte çift ağız). Atlas eşit görsel adımla yeniden kuruldu (ara kare sayısı segment
// büyüklüğüyle orantılı), E ekseni dişleri kapalı sırıtma (E_small) yerine nötre yakın E_mid →
// geniş açık E, O ekseni ağır büzülen O_small'ı atlayıp doğrudan O_mid. İfade pozları
// (gülümseme, kaş) üretildi, henüz bağlı değil.
const LENA_DIR = "/avatars/lena";
const LENA: SpriteRig = {
  id: "lena",
  width: 1024,
  height: 1024,
  base: `${LENA_DIR}/portrait_base.jpg`,
  sclera: `${LENA_DIR}/eyes_sclera.png`,
  scleraRect: [349, 294, 339, 118],
  eyes: (["L", "R"] as const).map((k) => ({
    iris: `${LENA_DIR}/iris_${k}.png`,
    irisRect: lenaEyes[k].iris,
    aperture: `${LENA_DIR}/aperture_${k}.png`,
    shadow: `${LENA_DIR}/lidshadow_${k}.png`,
    apertureRect: lenaEyes[k].aperture,
  })),
  mouth: {
    src: `${LENA_DIR}/mouth_atlas.webp`,
    roi: lenaMouthAtlas.roi,
    tileSize: lenaMouthAtlas.tileSize,
    slots: lenaMouthAtlas.slots,
    axes: lenaMouthAtlas.axes,
  },
  focus: { x: 0.5, y: 0.4 },
  // o50/o75 Kai'ninkinden çok daha açık (çene iner, dil görünür): Praktika ölçüsünde o50 öncesinde kalır
  mouthAmplitude: 0.7,
  // O pozu belirgin öne büzülmüş: eksenin yarısında durur. Kısmi saydamlık çift dudak izi bıraktığı
  // için ağırlık değil konum kısılır.
  roundMax: 0.5,
  // iri iris + koyu üst kapak: büyük kaymada kapak kenarında kıl inceliğinde iz (Kai ile aynı ölçek)
  gazeScale: 0.6,
  // ızgarayla ölçüldü (1024): kaş merkezleri (425,280)/(615,279), gözler 346, ağız 490, çene ≈598,
  // çene altı gölgesi 615, choker 655–670; saç y=600'de boynun iki yanına iniyor (427 / 615)
  motion: {
    neck: [518, 628],
    headFade: [598, 656],
    headHalfWidth: [240, 310],
    face: [520, 410],
    faceSigma: [110, 150],
    browL: [425, 280],
    browR: [615, 279],
    browSigma: [58, 16],
    chest: [700, 1024],
    sway: [518, 740],
  },
};

export const SPRITE_RIGS: Partial<Record<AvatarId, SpriteRig>> = {
  raven: RAVEN,
  kai: KAI,
  lena: LENA,
};
