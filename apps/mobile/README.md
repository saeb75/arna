# @arna/mobile

Asıl ürün istemcisi — Expo SDK 57 + Expo Router + NativeWind 4 + Zustand.
Mimari sözleşme: `CLAUDE.md` (bağlayıcı — her özellik oradaki katmanlı desene uyar).

## Çalıştırma

```bash
cp .env.example .env            # EXPO_PUBLIC_* değerlerini doldur
npm run dev:backend             # kökten — API localhost:6566
cd apps/mobile && npx expo start
```

Avatar ilk aşamada WebView ile gelecek; ses/ders oynatma sonraki dilim.
