// AVATAR PROFİLLERİ — sahnenin modele bakan tüm bilgisi tek kayıtta.
//
// AvatarScene motoru kanonik adlarla konuşur (Oculus viseme'leri + ARKit ifade
// adları + mantıksal kemik adları); her avatar bu kanonik dile kendi rig'ini
// bu profille bağlar. Yeni avatar eklemek = GLB (public/avatars/) + buraya bir
// kayıt + contracts AVATAR_IDS'e id. Aktif olanı admin seçer (app_settings.avatar).
import type { AvatarId } from "@glotmate/contracts";
import { VISEME_TO_ARKIT } from "./arkitVisemes";
import { VISEME_TO_CC } from "./ccVisemes";

export type LogicalBone =
  | "Head"
  | "Neck"
  | "Spine"
  | "Spine1"
  | "Spine2"
  | "Hips"
  | "LeftShoulder"
  | "RightShoulder";

export interface AvatarProfile {
  id: AvatarId;
  modelUrl: string;
  /** Mixamo idle klibi — yalnız pozsuz/klasik rig'lerde anlamlı; şimdilik hepsi kapalı */
  animationUrl: string;
  /**
   * "arp-pose": Fat Man tarzı — poz klipli Auto-Rig Pro, düz-kardeş kol
   * hiyerarşisi, aimFace düzeltmesi. "cc4": Reallusion — normal ebeveyn zinciri,
   * poz klibi yok (embedded "Default" klipleri YOK SAYILIR), bind öne bakar.
   */
  rigMode: "arp-pose" | "cc4";
  /** face memo + kadraj ölçümü için kafa kemiğinin sahnedeki adı */
  headBone: string;
  /** Mantıksal kemik → rig'deki aday adlar (ilk bulunan kazanır; boş liste = katman o kemiği atlar) */
  boneAliases: Record<LogicalBone, string[]>;
  /** Temel duruş klipleri (ilki bake edilir); boşsa applyRestPose yolu */
  poseClips: string[];
  /** Dinlenme nişan tablosu: [kemik, çocuk, hedef dünya yönü] — null = varsayılan (Mixamo adları) */
  restAim: Array<[string, string, [number, number, number]]> | null;
  /** ARP düz-kardeş kol düzeltmesi + selam kol zinciri bu rig'de mi (yalnız Fat Man) */
  flatArmRest: boolean;
  greetEnabled: boolean;
  framing: { distance: number; drop: number; initialHeadY: number };
  /** Oculus viseme morph'u OLMAYAN modelde 15'li genişletme tablosu */
  visemeCombos: ReadonlyArray<Readonly<Record<string, number>>>;
  /**
   * Kanonik morph adı → {rig'deki gerçek ad: ağırlık}. Motorun addGoal çağrıları
   * (jawOpen, eyeBlinkLeft, eyeLook*, brow*, mouthSmile* …) hiç değişmeden bu
   * köprüden geçer; morphMap alias geçişi bunları kaydeder.
   */
  morphAliases: Record<string, Record<string, number>>;
  /** Tüm-yüz duygu morph'u (Fat Man "Joy") — yoksa null */
  emotionMorph: string | null;
  /**
   * Çene KEMİĞİ sürüşü (CC: Jaw_Open morph'u boş export ediliyor, gerçek çene
   * kemikte — tezgâhta ölçüldü). null = çene morph'la (jawOpen kanonik adı).
   */
  jawBone: { name: string; axis: "x" | "y" | "z"; openRad: number } | null;
}

const FATMAN: AvatarProfile = {
  id: "fatman",
  modelUrl: "/fatman.glb",
  animationUrl: "/idle.fbx",
  rigMode: "arp-pose",
  headBone: "headx",
  boneAliases: {
    Head: ["Head", "headx"],
    Neck: ["Neck", "neckx"],
    Spine: ["Spine", "spine_01x"],
    Spine1: ["Spine1", "spine_02x"],
    Spine2: ["Spine2", "spine_03x"],
    Hips: ["Hips", "rootx"],
    LeftShoulder: ["LeftShoulder", "shoulderl"],
    RightShoulder: ["RightShoulder", "shoulderr"],
  },
  poseClips: ["Pose_19"],
  restAim: null, // Mixamo varsayılanı (poz klibi varken zaten kullanılmaz)
  flatArmRest: true,
  greetEnabled: true,
  framing: { distance: 1.36, drop: 0, initialHeadY: 1.59 },
  visemeCombos: VISEME_TO_ARKIT,
  morphAliases: {}, // ARKit adları modelde birebir var
  emotionMorph: "Joy",
  jawBone: null,
};

const EMMA: AvatarProfile = {
  id: "emma",
  modelUrl: "/avatars/emma.glb",
  animationUrl: "/idle.fbx", // kullanılmıyor (cc4 + animate kapalı); prop uyumu için
  rigMode: "cc4",
  headBone: "CC_Base_Head",
  boneAliases: {
    Head: ["CC_Base_Head"],
    Neck: ["CC_Base_NeckTwist01"],
    Spine: ["CC_Base_Spine01"],
    Spine1: ["CC_Base_Spine02"],
    // Spine2 bilerek boş: CC'de üçüncü omurga yok; aynı kemiğe iki katman
    // yazmak nefes genliğini abartırdı.
    Spine2: [],
    Hips: ["CC_Base_Hip"],
    LeftShoulder: ["CC_Base_L_Clavicle"],
    RightShoulder: ["CC_Base_R_Clavicle"],
  },
  poseClips: [], // gömülü "Default" klipleri poz DEĞİL — yok sayılır
  restAim: [
    // CC A-pose'dan kollar yana: normal ebeveyn zinciri, ölçülü-nişan yeter
    ["CC_Base_L_Upperarm", "CC_Base_L_Forearm", [0.18, -1, 0.03]],
    ["CC_Base_L_Forearm", "CC_Base_L_Hand", [0.08, -1, 0.12]],
    ["CC_Base_R_Upperarm", "CC_Base_R_Forearm", [-0.18, -1, 0.03]],
    ["CC_Base_R_Forearm", "CC_Base_R_Hand", [-0.08, -1, 0.12]],
  ],
  flatArmRest: false,
  greetEnabled: false, // selam kol koreografisi Fat Man ölçülerine göre — ayrı iş
  framing: { distance: 1.15, drop: 0, initialHeadY: 1.55 }, // bench ile ayarlanır
  visemeCombos: VISEME_TO_CC,
  morphAliases: {
    // jawOpen alias'ı YOK: Jaw_Open morph'u boş export edilmiş — çene jawBone'la sürülür
    mouthFunnel: { Mouth_Funnel_UL: 1, Mouth_Funnel_UR: 1, Mouth_Funnel_DL: 1, Mouth_Funnel_DR: 1 },
    eyeBlinkLeft: { Eye_Blink_L: 1 },
    eyeBlinkRight: { Eye_Blink_R: 1 },
    // "In" = buruna doğru: sol göz için sağa bakış, sağ göz için sola bakış
    eyeLookOutLeft: { Eye_Look_Left_L: 1 },
    eyeLookInLeft: { Eye_Look_Right_L: 1 },
    eyeLookOutRight: { Eye_Look_Right_R: 1 },
    eyeLookInRight: { Eye_Look_Left_R: 1 },
    eyeLookUpLeft: { Eye_Look_Up_L: 1 },
    eyeLookUpRight: { Eye_Look_Up_R: 1 },
    eyeLookDownLeft: { Eye_Look_Down_L: 1 },
    eyeLookDownRight: { Eye_Look_Down_R: 1 },
    browInnerUp: { Brow_Raise_In_L: 1, Brow_Raise_In_R: 1 },
    browOuterUpLeft: { Brow_Raise_Outer_L: 1 },
    browOuterUpRight: { Brow_Raise_Outer_R: 1 },
    eyeSquintLeft: { Eye_Squint_Inner_L: 1 },
    eyeSquintRight: { Eye_Squint_Inner_R: 1 },
    mouthSmile: { Mouth_Corner_Up_L: 0.7, Mouth_Corner_Up_R: 0.7 },
    mouthSmileLeft: { Mouth_Corner_Up_L: 1 },
    mouthSmileRight: { Mouth_Corner_Up_R: 1 },
    mouthDimpleLeft: { Mouth_Dimple_L: 1 },
    mouthDimpleRight: { Mouth_Dimple_R: 1 },
  },
  emotionMorph: null,
  jawBone: { name: "CC_Base_JawRoot", axis: "z", openRad: 0.24 },
};

export const AVATAR_PROFILES: Record<AvatarId, AvatarProfile> = {
  fatman: FATMAN,
  emma: EMMA,
};

export const DEFAULT_AVATAR_ID: AvatarId = "fatman";

/** Bilinmeyen/boş id güvenle varsayılana düşer (embed ?avatar= parametresi için) */
export function resolveAvatarProfile(id: string | null | undefined): AvatarProfile {
  return AVATAR_PROFILES[(id ?? DEFAULT_AVATAR_ID) as AvatarId] ?? AVATAR_PROFILES[DEFAULT_AVATAR_ID];
}
