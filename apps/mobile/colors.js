/**
 * GlotMate paleti — TEK renk kaynağı (light tema).
 *
 * Hem tailwind.config.js (sınıflar: bg-background, text-foreground…) hem de
 * NativeWind sınıfı alamayan prop'lar (`color=`, `placeholderTextColor=`,
 * Stack `contentStyle`) BURADAN okur. Bileşende hex ya da literal Tailwind
 * rengi (`text-white`, `text-red-400`) YAZILMAZ — CLAUDE.md.
 *
 * Ana ekran tasarımının menekşesi MARKA rengidir; login ve ders ekranı da aynı
 * moru kullanır (iki mor yan yana yaşamasın).
 *
 * @type {Record<string, string>}
 */
module.exports = {
  primary: "#8b5cf6", // marka — değişmez
  background: "#f6f5fb", // ekran zemini, hafif menekşe tonlu off-white
  card: "#ffffff", // balon, giriş, şık, sıralama kutucuğu
  surface: "#eeedf5", // pil, yüzen kart, sekme barı
  nodeIdle: "#e2e1ea", // başlanmamış düğüm, ilerleme rayı, kilitli mikrofon
  track: "#cfcdd9", // yolun henüz yürünmemiş kısmı (noktalı eğri) — nodeIdle zeminde kayboluyordu
  border: "#e4e3ec", // çerçeve/ayraç — light'ta yüzeyler zeminden çizgiyle ayrılır
  foreground: "#15131f", // birincil metin
  muted: "#6b7280", // ikincil metin — gray-500 (gray-400 beyazda 2.5:1 kalıyordu)
  onPrimary: "#ffffff", // mor zemin üstü metin/ikon
  success: "#16a34a", // green-600 — metin olarak da beyazda okunur
  danger: "#dc2626", // hata metni, kayıt butonu, kalpler
  warning: "#b45309", // ipucu kartı (amber-700)
  accent: "#6d28d9", // balonlarda İngilizce parçalar (violet-700, beyaz kartta okunur)
};
