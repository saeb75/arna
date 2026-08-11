// Oculus viseme'lerinin ARKit blendshape karşılıkları. ARKit'in 52'lik standart
// setini taşıyan ama Oculus viseme morph'u içermeyen modeller (ör. Fat Man) için
// her viseme bir morph kombinasyonuna açılır. Dizi indeksi viseme.ts'teki
// VISEME_MORPHS sırasıyla birebir aynıdır; değerler motorun yumuşatılmış viseme
// ağırlığı w[i] ile çarpılarak uygulanır.
//
// Çene açıklığı burada YOKTUR — jawOpen ayrı kanaldan sesin gerçek enerjisiyle
// sürülür (VISEME_JAW). Buradaki şekiller yalnızca dudak/dil duruşudur.
export const VISEME_TO_ARKIT: ReadonlyArray<Readonly<Record<string, number>>> = [
  /*  0 sil */ {},
  // p b m — dudaklar bastırılarak kapanır; mouthClose çene açıkken bile kapatır
  /*  1 PP  */ {
    mouthClose: 1.0,
    mouthPressLeft: 0.6,
    mouthPressRight: 0.6,
    mouthRollLower: 0.15,
    mouthRollUpper: 0.15,
  },
  // f v — alt dudak üst dişlerin altına kıvrılır
  /*  2 FF  */ {
    mouthRollLower: 0.9,
    mouthShrugUpper: 0.25,
    mouthPressLeft: 0.2,
    mouthPressRight: 0.2,
  },
  // th — dil ucu dişlerin arasında görünür
  /*  3 TH  */ { tongueOut: 0.65, mouthShrugUpper: 0.2, mouthRollUpper: 0.12 },
  /*  4 DD  */ {
    mouthShrugUpper: 0.25,
    mouthRollUpper: 0.2,
    mouthStretchLeft: 0.2,
    mouthStretchRight: 0.2,
  },
  /*  5 kk  */ {
    mouthShrugUpper: 0.15,
    mouthStretchLeft: 0.18,
    mouthStretchRight: 0.18,
    mouthDimpleLeft: 0.1,
    mouthDimpleRight: 0.1,
  },
  /*  6 CH  */ {
    mouthFunnel: 0.55,
    mouthPucker: 0.3,
    mouthShrugLower: 0.2,
    mouthShrugUpper: 0.15,
  },
  // s z — dişler bitişik, dudak köşeleri gergin
  /*  7 SS  */ {
    mouthStretchLeft: 0.4,
    mouthStretchRight: 0.4,
    mouthSmileLeft: 0.25,
    mouthSmileRight: 0.25,
    mouthClose: 0.15,
  },
  /*  8 nn  */ {
    mouthShrugUpper: 0.18,
    mouthStretchLeft: 0.12,
    mouthStretchRight: 0.12,
    tongueOut: 0.12,
  },
  /*  9 RR  */ { mouthPucker: 0.4, mouthFunnel: 0.25, mouthShrugLower: 0.2 },
  // Açık sesliler: üst/alt dudak ayrılır, dişler görünür
  /* 10 aa  */ {
    mouthLowerDownLeft: 0.55,
    mouthLowerDownRight: 0.55,
    mouthUpperUpLeft: 0.45,
    mouthUpperUpRight: 0.45,
    mouthStretchLeft: 0.1,
    mouthStretchRight: 0.1,
  },
  /* 11 E   */ {
    mouthLowerDownLeft: 0.35,
    mouthLowerDownRight: 0.35,
    mouthUpperUpLeft: 0.28,
    mouthUpperUpRight: 0.28,
    mouthSmileLeft: 0.22,
    mouthSmileRight: 0.22,
    mouthStretchLeft: 0.25,
    mouthStretchRight: 0.25,
  },
  // Yayvan sesli (ee) — gülümseme baskın
  /* 12 I   */ {
    mouthSmileLeft: 0.45,
    mouthSmileRight: 0.45,
    mouthStretchLeft: 0.3,
    mouthStretchRight: 0.3,
    mouthLowerDownLeft: 0.2,
    mouthLowerDownRight: 0.2,
    mouthUpperUpLeft: 0.12,
    mouthUpperUpRight: 0.12,
  },
  // Yuvarlak sesliler: O huni baskın, U büzülme baskın (VISEME_ROUND'un
  // mouthFunnel'ıyla max semantiğinde birleşirler, üst üste binmez)
  /* 13 O   */ {
    mouthFunnel: 0.8,
    mouthPucker: 0.25,
    mouthLowerDownLeft: 0.15,
    mouthLowerDownRight: 0.15,
    mouthUpperUpLeft: 0.15,
    mouthUpperUpRight: 0.15,
  },
  /* 14 U   */ {
    mouthPucker: 0.9,
    mouthFunnel: 0.4,
    mouthPressLeft: 0.1,
    mouthPressRight: 0.1,
  },
];
