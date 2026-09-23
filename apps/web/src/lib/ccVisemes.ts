// Oculus 15'li viseme dizisi → Reallusion CC yüz morph kombinasyonları (v2).
// Dizin sırası VISEME_MORPHS ile BİREBİR (sil PP FF TH DD kk CH SS nn RR aa E I O U).
//
// v1 CC'nin V_* viseme kaydırıcılarına güveniyordu; TEZGÂHTA ÖLÇÜLDÜ (23 Eyl):
// bu modelin export'unda V_Open/V_Explosive/V_Wide/V_Tight/V_Tight_O ve Jaw_Open
// morph'ları BOŞ geliyor (orijinal 392MB kaynakta da boş — CC export tuhaflığı,
// bizim boru hattı değil). Tablo yalnız ekranda deformasyonu DOĞRULANMIŞ
// morph'lardan kurulu: V_Lip_Open, V_Affricate, V_Dental_Lip, V_Tongue_*,
// Mouth_Funnel_4/Purse_4 çeyrekleri, Corner_Wide, UpperLip_Raise/LowerLip_Depress.
// Çene AYRICA kemikten sürülür (profil jawBone: CC_Base_JawRoot, +Z) — dişler
// ve dil gerçekten açılır; buradaki şekiller dudak katmanıdır.
const FUNNEL4 = { Mouth_Funnel_UL: 1, Mouth_Funnel_UR: 1, Mouth_Funnel_DL: 1, Mouth_Funnel_DR: 1 };
const PURSE4 = { Mouth_Lips_Purse_UL: 1, Mouth_Lips_Purse_UR: 1, Mouth_Lips_Purse_DL: 1, Mouth_Lips_Purse_DR: 1 };
const scale = (combo: Record<string, number>, k: number): Record<string, number> =>
  Object.fromEntries(Object.entries(combo).map(([n, w]) => [n, w * k]));

export const VISEME_TO_CC: ReadonlyArray<Readonly<Record<string, number>>> = [
  /* sil */ {},
  /* PP  */ { ...scale(PURSE4, 0.7) },
  /* FF  */ { V_Dental_Lip: 1.0 },
  /* TH  */ { V_Tongue_Out: 0.7, V_Lip_Open: 0.3 },
  /* DD  */ { V_Affricate: 0.5, V_Lip_Open: 0.2 },
  /* kk  */ { V_Lip_Open: 0.5, V_Affricate: 0.3 },
  /* CH  */ { V_Affricate: 0.9 },
  /* SS  */ { Mouth_Corner_Wide_L: 0.7, Mouth_Corner_Wide_R: 0.7, V_Dental_Lip: 0.4 },
  /* nn  */ { V_Lip_Open: 0.35, V_Affricate: 0.2 },
  /* RR  */ { V_Lip_Open: 0.3, ...scale(PURSE4, 0.3) },
  /* aa  */ { V_Lip_Open: 0.8, ...scale(FUNNEL4, 0.25) },
  /* E   */ {
    Mouth_UpperLip_Raise_L: 0.35,
    Mouth_UpperLip_Raise_R: 0.35,
    Mouth_LowerLip_Depress_L: 0.35,
    Mouth_LowerLip_Depress_R: 0.35,
    Mouth_Corner_Wide_L: 0.5,
    Mouth_Corner_Wide_R: 0.5,
  },
  /* I   */ { Mouth_Corner_Wide_L: 0.6, Mouth_Corner_Wide_R: 0.6, V_Lip_Open: 0.25 },
  /* O   */ { ...scale(FUNNEL4, 0.7), ...scale(PURSE4, 0.3) },
  /* U   */ { ...scale(PURSE4, 0.8), ...scale(FUNNEL4, 0.4) },
];
