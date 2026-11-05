// 2.5D SPRITE RIG GEOMETRİSİ — katmanlı portre avatarların ÖLÇÜLERİ (platformdan bağımsız).
//
// Web (/embed/avatar, WebGL) ve mobil (native katmanlar) aynı ölçüleri buradan okur;
// görsellerin YERİ platforma özeldir (web: /avatars/<id>/<dosya>, mobil: paketlenmiş
// require haritası) — bu dosya yalnız dosya ADLARINI bilir.
//
// Taban görsel opak tek portredir: gözler KAPALI (göz kırpma = göz katmanını
// çizmemek), ağız bölgesi temizlenmiş. Üstüne iki küçük dinamik bölge çizilir:
//   - gözler: göz beyazı katmanı + kayan irisler (göz açıklığı maskesiyle
//     kırpılır) + kapağa sabit üst kapak gölgesi → bakış hareketi
//   - ağız: MORF ATLASI (pozlar + her poz çifti için optik akış ara kareleri)
// Kaynak: AI_Tutor rig v0.3 (sprite prototip, Live2D DEĞİL). İris katmanları göz
// görselinden türetildi: ~/Desktop/imtiyaz/raven-avatar/scripts; Kai/Lena/Theo hattı
// ~/Desktop/imtiyaz/sprite-avatar/scripts.
import type { AvatarId } from "../avatars.js";
import { KAI_ATLAS, KAI_EYES, LENA_ATLAS, LENA_EYES, RAVEN_ATLAS, RAVEN_EYES, THEO_ATLAS, THEO_EYES } from "./rigData.js";

/** Timeline şekil ailesi — "F" (f/v: üst dişler alt dudakta) atlasında FV pozu olmayan rig'de yayvana düşer */
export type MouthShape = "REST" | "M" | "A" | "E" | "O" | "talk" | "smile" | "F";

/** Atlas yerleşimi: kareler tuvalin `roi` dikdörtgenine birebir oturur */
export interface MouthAtlasGeometry {
  /** atlas görselinin dosya adı (rig klasöründe) */
  file: string;
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

export interface SpriteEyeGeometry {
  /** dosya son eki: iris_<side>.png, aperture_<side>.png, lidshadow_<side>.png */
  side: "L" | "R";
  /** tam iris diskinin tuvaldeki kutusu [x, y, w, h] */
  irisRect: number[];
  /** göz açıklığı maskesi ve kapak gölgesinin ortak kutusu [x, y, w, h] */
  apertureRect: number[];
}

export interface SpriteRigGeometry {
  id: AvatarId;
  width: number;
  height: number;
  /** göz katmanının (eyes_sclera.png) saydam olmayan kutusu [x, y, w, h] */
  scleraRect: number[];
  eyes: SpriteEyeGeometry[];
  mouth: MouthAtlasGeometry;
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

/** Her rig'in sabit dosya adları (atlas hariç — o `mouth.file`) */
export const SPRITE_FILES = {
  base: "portrait_base.jpg",
  sclera: "eyes_sclera.png",
  iris: (side: "L" | "R") => `iris_${side}.png`,
  aperture: (side: "L" | "R") => `aperture_${side}.png`,
  shadow: (side: "L" | "R") => `lidshadow_${side}.png`,
} as const;

/**
 * Oculus viseme (viseme.ts sırası) → ağız katmanı. FF/TH ayrı çizim yok, E'ye
 * yaklaşık (rig belgesindeki eşlemeyle aynı); CH/SH yatay dudak → E. Buradaki
 * poz yalnız ŞEKİL AİLESİDİR — açıklığı sesin enerjisi kademesiz sürer
 * (mouth.ts stepMouth).
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

type EyeData = { readonly L: { readonly iris: readonly number[]; readonly aperture: readonly number[] }; readonly R: { readonly iris: readonly number[]; readonly aperture: readonly number[] } };
const eyesOf = (data: EyeData): SpriteEyeGeometry[] =>
  (["L", "R"] as const).map((side) => ({ side, irisRect: [...data[side].iris], apertureRect: [...data[side].aperture] }));

const RAVEN: SpriteRigGeometry = {
  id: "raven",
  width: 885,
  height: 887,
  scleraRect: [265, 258, 373, 157],
  eyes: eyesOf(RAVEN_EYES),
  mouth: {
    file: "mouth_morph_atlas.webp",
    roi: RAVEN_ATLAS.roi,
    tileSize: RAVEN_ATLAS.tileSize,
    slots: RAVEN_ATLAS.slots,
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
// Hat: hizala → alt yüz yaması + renk eşitleme + DIS optik akış ara kareleri → atlas;
// kapalı gözlü taban; iris katmanları. Tuval 1024.
const KAI: SpriteRigGeometry = {
  id: "kai",
  width: 1024,
  height: 1024,
  scleraRect: [367, 268, 308, 110],
  eyes: eyesOf(KAI_EYES),
  mouth: { file: "mouth_atlas.webp", ...KAI_ATLAS },
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
const LENA: SpriteRigGeometry = {
  id: "lena",
  width: 1024,
  height: 1024,
  scleraRect: [349, 294, 339, 118],
  eyes: eyesOf(LENA_EYES),
  mouth: { file: "mouth_atlas.webp", ...LENA_ATLAS },
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

// Theo: gözlüklü, sakallı öğretmen — Gemini hattı, 14 görsel (12 temel + kapalı/dişli gülümseme).
// Poz seti tutarlı: açıklık serisi dengeli, E pozları nötre yakın → varsayılan eksenler, yalnız O
// ekseni doğrudan O_mid (Lena gibi). Gözlük çerçevesi kapalı göz görselinde aynı yerde (fark yok
// denecek kadar) → göz yamasına girmesi zararsız. Mercek arkasında sklera renk eşiği tutmadı →
// kapak çizgisi elle ölçülmüş noktalarla (irislayers "points"). Sol iris çemberi sağdan aynalandı.
const THEO: SpriteRigGeometry = {
  id: "theo",
  width: 1024,
  height: 1024,
  scleraRect: [369, 265, 295, 117],
  eyes: eyesOf(THEO_EYES),
  mouth: { file: "mouth_atlas.webp", ...THEO_ATLAS },
  focus: { x: 0.5, y: 0.38 },
  mouthAmplitude: 0.8,
  roundMax: 0.5,
  gazeScale: 0.6,
  // ızgarayla ölçüldü (1024): kaşlar (440,268)/(594,265), gözler 318, ağız ≈475, sakal/çene ≈590,
  // çene altı gölgesi 590–610, yaka ≥620
  motion: {
    neck: [512, 612],
    headFade: [588, 640],
    headHalfWidth: [200, 260],
    face: [512, 380],
    faceSigma: [110, 150],
    browL: [440, 268],
    browR: [594, 265],
    browSigma: [58, 16],
    chest: [660, 1024],
    sway: [512, 720],
  },
};

export const SPRITE_RIG_GEOMETRY: Partial<Record<AvatarId, SpriteRigGeometry>> = {
  raven: RAVEN,
  kai: KAI,
  lena: LENA,
  theo: THEO,
};
