// AVATAR MOTORU — platformdan bağımsız saf mantık (`@glotmate/contracts/avatar`).
//
// Web (3D AvatarScene + 2.5D WebGL SpriteAvatar) ve mobil (native 2.5D) AYNI
// zamanlama/ağız/davranış kodunu kullanır — lessonFlow deseni: kural tek yerde,
// iki istemci aynı fonksiyonu çağırır. DOM, React, ses API'si YOK; girdi yalnız
// sayı ve zaman. Ana paketten ayrı alt yol: viseme tipleri (Line, Frame…) kök
// dışa aktarımla çakışmasın.
export * from "./viseme.js";
export * from "./alignment.js";
export * from "./rigs.js";
export * from "./mouth.js";
export * from "./life.js";
export * from "./estimate.js";
