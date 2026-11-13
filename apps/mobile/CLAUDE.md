# GlotMate Mobil — Mimari Sözleşme

Asıl ürün istemcisi. Bu dosya bağlayıcıdır: her ekran, her özellik, her oturum
buradaki desene uyar. Desen tartışılacaksa önce bu dosya güncellenir, sonra kod.

## Yığın (son stabil — 21 Ağustos 2026'da npm'den doğrulandı)

| Paket | Sürüm | Not |
|---|---|---|
| Expo SDK | 57 | `npx create-expo-app` en günceli kurar |
| Expo Router | SDK ile gelir | dosya tabanlı navigasyon |
| NativeWind | **4.x** (4.2.6) | v5 HENÜZ stabil değil — çıkınca ayrıca değerlendirilir |
| tailwindcss | 3.4.x | NativeWind 4'ün peer'ı `>3.3.0`; **Tailwind v4 KULLANILMAZ** |
| Zustand | 5.x | domain başına store |
| Axios | 1.x | tek instance, `src/api/index.ts` |
| @supabase/supabase-js | 2.x | + `@react-native-async-storage/async-storage` (oturum kalıcılığı) |
| @glotmate/contracts | workspace | tüm response tipleri ve zod şemaları BURADAN |
| react-native-svg | 15.x | gradyanlar (GradientFill, ScreenGlow, Sheen), halkalar, lucide ikonlarının altyapısı |
| react-native-reanimated | 4.x | TÜM hareket (giriş, nefes, halka, sayfa çevirme) — RN `Animated` kullanılmaz |
| lucide-react-native | 1.x | TEK ikon seti (saf JS, svg üstünde — fingerprint'e dokunmaz) |
| expo-haptics | SDK | dokunsal geri bildirim — yalnız `services/HapticsService` |
| react-native-purchases | 10.x | RevenueCat — yalnız `services/PurchasesService` |
| expo-notifications | SDK | günlük YEREL hatırlatıcı — yalnız `services/NotificationsService` |
| expo-apple-authentication | SDK | Sign in with Apple — yalnız `services/AppleAuthService` |

**Native bağımlılık = yeni build.** Ekleme/çıkarma kullanıcıya SORULMADAN
yapılmaz (12 Eki 2026'da dördü onayla eklendi).

**OTA güncelleme SÜRÜM bazlıdır** (`runtimeVersion.policy: "appVersion"`, 5 Kas 2026,
kullanıcı kararı — fingerprint emekli; 1.0.0 (10) fingerprint uyuşmazlığıyla hiç
güncelleme alamadı). `eas update` aynı `expo.version`'daki TÜM build'lere gider.
Bu yüzden native değişiklik (native paket, `app.json` plugin/izin/ikon/splash)
içeren her build'den önce `app.json` → `version` ARTIRILIR; artırılmazsa JS
güncellemesi o native kodu taşımayan eski build'e iner ve uygulama çöker.
Yalnız JS/asset değişikliği → sürüm aynı kalır, `eas update` yeter.

**OTA YALNIZ `npm run update:prod -- "mesaj"` İLE** (5 Kas 2026): çıplak `eas update`
pakete yerel `.env.local`'i (`localhost:6560`) gömer — telefon kendi localhost'una
bağlanmaya çalışır, her istek "Bağlanamadık" olur. İki sebep, ikisi de betikte:
`--environment production` (EAS değişkenleri) ve `--clear-cache` (Metro `EXPO_PUBLIC_*`
değerlerini önbellekte tutuyor; ölçüldü: doğru değer verilse bile önbellekle localhost
girdi, `--clear` ile doğru adres girdi).

**Marka varlıkları** `assets/brand/` (GlotCast deseni): `icon.png` (kaynak),
`icon-dark`/`icon-tinted` (iOS), `splash-mark.png` (gradyan, şeffaf), `adaptive-*`
(Android). Hepsi tek kaynak görselden türetilir.

Kurulum kuralı: Expo'ya bağlı her paket **`npx expo install`** ile eklenir —
sürüm uyumunu Expo çözer, elle sürüm sabitlenmez. Expo dışı paketler (zustand,
axios) normal `npm i` ile en son stabil.

## Katmanlı akış — HER özellik için, istisnasız

```
Screen  →  Controller (class)  →  axios instance  →  validate (@glotmate/contracts)
   ↑                                                            │
   └────────────────  Zustand store  ◄──────────────────────────┘
```

- Bileşen API'ye **asla** doğrudan gitmez; controller metodunu çağırır.
- Controller axios instance'ıyla isteği atar, cevabı **contracts şemasıyla**
  doğrular, store'a **kendisi** yazar. Değer döndürmek yerine store'a yazmak
  esastır; bileşen dönüş değerine bağımlı olmaz.
- Bileşen yalnız store'dan okur ve aksiyon olarak controller çağırır.
- Controller **stateless class**tır: kendi alanında veri tutmaz, tüm durum
  store'dadır. Metotlar `static` yazılır — instance gerekmez.
- Auth, lesson, practice, roleplay, onboarding… hepsi aynı desen. "Küçük istek,
  controller'a gerek yok" istisnası **yoktur**.

### Uçtan uca örnek: `getLesson`

```
src/api/index.ts                    ← axios instance + baseURL + JWT interceptor
src/controllers/LessonController.ts ← getLesson(catalogLessonId)
src/stores/useLessonStore.ts        ← lesson, loading, error
src/screens/lesson/LessonScreen.tsx ← store'dan okur, controller'ı çağırır
src/app/lesson/[id].tsx             ← 3 satırlık ince rota
```

```ts
// src/api/index.ts — TEK axios instance. Bileşenler bunu import EDEMEZ.
import axios from "axios";
import { supabase } from "../lib/supabase";

export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

```ts
// src/controllers/LessonController.ts
import { lessonContentV7Schema, type LessonContentV7 } from "@glotmate/contracts";
import { z } from "zod";
import { api } from "../api";
import { useLessonStore } from "../stores/useLessonStore";

// Response zarfı burada tanımlanır; İÇERİK şeması contracts'tan gelir.
const getLessonResponse = z.object({ lessonId: z.string(), lesson: lessonContentV7Schema });

export class LessonController {
  /** GET /v1/lessons/:catalogLessonId — doğrular, store'a yazar. */
  static async getLesson(catalogLessonId: string): Promise<void> {
    const store = useLessonStore.getState();
    store.setLoading(true);
    try {
      const res = await api.get(`/v1/lessons/${catalogLessonId}`);
      const parsed = getLessonResponse.parse(res.data); // şemadan geçmeyen veri EKRANA ULAŞMAZ
      store.setLesson(parsed.lesson);
    } catch (err) {
      store.setError(errorCode(err)); // errorCode: axios hatasından backend'in `error` alanını çıkarır
    } finally {
      store.setLoading(false);
    }
  }
}
```

```ts
// src/stores/useLessonStore.ts
import { create } from "zustand";
import type { LessonContentV7 } from "@glotmate/contracts";

interface LessonState {
  lesson: LessonContentV7 | null;
  loading: boolean;
  error: string | null;
  setLesson: (l: LessonContentV7) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  lesson: null,
  loading: false,
  error: null,
  setLesson: (lesson) => set({ lesson, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
```

```tsx
// src/screens/lesson/LessonScreen.tsx — store'dan okur, controller'ı tetikler
export function LessonScreen({ catalogLessonId }: { catalogLessonId: string }) {
  const { lesson, loading, error } = useLessonStore();
  useEffect(() => {
    void LessonController.getLesson(catalogLessonId);
  }, [catalogLessonId]);
  // ... render yalnız store durumundan
}
```

```tsx
// src/app/lesson/[id].tsx — İNCE ROTA: iş mantığı YASAK, sadece yönlendirme
import { useLocalSearchParams } from "expo-router";
import { LessonScreen } from "../../screens/lesson/LessonScreen";

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LessonScreen catalogLessonId={id} />;
}
```

## Doğrulama = @glotmate/contracts (elle şema yazmak yasak)

Monorepo'nun asıl avantajı: backend'in ürettiği ve web'in tükettiği zod şemaları
zaten `packages/contracts`'ta. Mobil controller'lar response İÇERİĞİNİ oradan
import eder; elle tip/şema yazmak sözleşmeyi çatallar ve sessizce eskir. Yalnız
response ZARFI (`{ lessonId, lesson }` gibi uç-özel sarmalayıcılar) controller
dosyasında tanımlanabilir.

## Klasör yapısı

```
apps/mobile/src/
├── app/                        # Expo Router — YALNIZ ince rota dosyaları
│   │                           # (SDK 57 şablonu rotaları src/ altında tutar)
│   ├── _layout.tsx             # kök layout: global.css + oturum geri yükleme
│   ├── index.tsx               # auth kapısı: session varsa /lessons, yoksa /login
│   ├── login.tsx
│   ├── (tabs)/                 # SEKME KABUĞU — grup, URL'e segment EKLEMEZ
│   │   ├── _layout.tsx         #   auth kapısı + <Tabs tabBar={<TabBar/>}>
│   │   ├── lessons.tsx         #   → /lessons (ders yolu, ana ekran)
│   │   ├── practice.tsx        #   → /practice
│   │   └── profile.tsx         #   → /profile
│   ├── lesson/[id].tsx         # sekme DIŞINDA: tam ekran, bar görünmez
│   ├── checkpoint/[level]/[unit].tsx   # ünite testi — sekme dışında
│   └── roleplay/[slug].tsx
├── api/index.ts                # axios instance (baseURL + JWT interceptor)
├── controllers/                # AuthController, CurriculumController, LessonController…
├── stores/                     # useAuthStore, useCurriculumStore, useLessonStore…
├── screens/                    # ekrana özel bileşenler
│   ├── login/LoginScreen.tsx
│   ├── login/Banner.tsx        # ← yalnız login'de kullanılıyorsa BURADA
│   └── lessons/LessonsScreen.tsx
├── components/
│   ├── ui/                     # tasarım sistemi: Button.tsx, Input.tsx, Badge.tsx…
│   └── shared/                 # birden çok ekranda kullanılan: MessageBubble.tsx…
├── lib/                        # supabase.ts, yardımcılar
└── global.css                  # @tailwind direktifleri — _layout.tsx import eder
apps/mobile/colors.js           # PALET — tek renk kaynağı, AÇIK + KOYU (themeColors/cssVariables)
```

Ek klasörler (12 Eki 2026 yeniden yazımı):

```
src/theme/        # useScheme, useThemeColors, motion (enter), layout (sekme barı boşluğu)
src/services/     # cihaz G/Ç: Haptics, Purchases, Notifications, AppleAuth, Browser
src/domain/       # saf yardımcılar: pro planları, dil adı, kategori/ilgi/track görünümü
src/hooks/        # store birleşimleri: usePro
src/i18n/tr.ts    # TÜM arayüz metni (bileşende sabit metin YOK)
src/config/       # yasal URL'ler (EXPO_PUBLIC_* ile ezilir)
```

Rotalar: `onboarding` (fade) · `paywall` (fullScreenModal) · `(tabs)/{lessons,roleplay,profile}`
· `lesson/[id]` · `checkpoint/[level]/[unit]` · `roleplay/[slug]` (brief) ·
`roleplay/[slug]/play` · `auth/{login,save-progress}` ve `settings/*` (native formSheet).
Yığının seçenekleri `screens/root/RootStack.tsx`'te; `_layout.tsx` yalnız `<AppRoot/>`.

**Renk ve tema kuralı (açık + koyu, GlotCast token sistemi — 12 Eki 2026):** her
renk `colors.js`'teki bir token'dır; değerler tema başına CSS değişkeni olarak
kökte (`components/ui/ThemeRoot`, NativeWind `vars()`) uygulanır, Tailwind
sınıfları `rgb(var(--color-x) / <alpha-value>)` okur → `bg-brand/15` çalışır ve
tema TEK noktada değişir. Sınıf: `bg-canvas` (ekran), `bg-card`, `bg-muted`,
`border-border`, `text-foreground`, `text-muted-foreground`, `text-brand`,
`bg-primary`/`text-primary-foreground`, marka zemininde `text-on-brand`.
Sınıf alamayan prop (`color=`, SVG, gölge) → `useThemeColors()`. Literal
Tailwind rengi (`text-white`, `bg-red-500`), hex ve `dark:` öneki YAZILMAZ.
Yüzeyler nötr taban + biraz marka karışımıdır (`mix`). Renk de GlotCast'inkidir
(3 Kas 2026'da mordan geçildi): marka ember `#b94d17`/`#ee8146`, gradyan
`brand-from → brand-to` (`#f07a34 → #e5484a`), koyu tema sıcak kahve yüzeyler;
marka + yüzey tabloları GlotCast `src/ui/colors.js` ile birebir tutulur. Gradyanın
açık ucu beyaz metinle ~2.8:1 → gradyan yalnız kalın/büyük metin ya da ikon taşır
(CTA, mikrofon, aktif yol düğümü, Pro/hero); gövde metni taşıyan dolu yüzey
(öğrenci balonu) `bg-primary` + `text-primary-foreground`. Görünüm tercihi
(Sistem/Açık/Koyu) `useSettingsStore`'da, cihazda kalıcı.

**Hareket kuralı (GlotCast dili):** giriş `theme/motion.ts` → `enter(i)`
(FadeInDown, 420 ms, ease-out cubic, 60 ms kademe). YAY YOK, zıplama yok
(`withSpring`/`springify` kullanılmaz). Süreler: küçük 180–220, durum 260–320,
sayfa 380–420, halka/sayaç 1100 ms. Her döngü `useReducedMotion()`'a saygı
duyar. Basış geri bildirimi `active:opacity-*` (ölçek yok) + anlamlı
dokunuşlarda `HapticsService`. Yükleme her yerde `Skeleton` — spinner yok
(tek istisna: buton içi `busy`).

**Bileşen dili:** sayfanın TEK ana eylemi `CtaButton` (gradyan + ışık geçişi,
`breathe`); seçimler `OptionCard`; ayarlar `SettingsGroup/Row`; liste sayfası
`SectionHeader` + kart rafları; üst bar `TopBar` (kaydırınca başlık belirir).

**Monorepo notu:** `expo-doctor`'ın react-dom kopya uyarısı (mobil 19.2.x ↔ kökte
web'in Next sürümü) ZARARSIZ — yalnız kullanılmayan expo-web hedefini etkiler;
mobil kendi `node_modules/react`'ini çözüyor (doğrulandı). Metro, SDK 57'de
workspace'i otomatik algılar; `@glotmate/contracts` ek ayarsız çözülür (export
testiyle doğrulandı).

**Sekme kabuğu:** üç sekme `(tabs)` grubunda yaşar; grup parantezli olduğu için
`/lessons` gibi URL'ler DEĞİŞMEZ. Auth kapısı artık her rotada tekrarlanmaz, tek
yerde — `(tabs)/_layout.tsx`. Barın tamamı `components/shared/TabBar.tsx`'te;
layout dosyası stil taşımaz (ince rota kuralı). Tam ekran akışlar (ders, ünite
testi) grubun DIŞINDA durur, böylece bar onları bölemez. Bar içeriğin üstünde
yüzdüğü için sekme ekranları alt boşluk bırakır.

**Güvenli alan (`useSafeAreaInsets`) ve yüzde genişlik gibi ÇALIŞMA ZAMANI
değerleri** NativeWind sınıfıyla ifade edilemez; bunlar `style={{…}}` ile ve
gerekçe yorumuyla yazılır — `StyleSheet.create` yasağının istisnası budur.

**Bileşen yerleştirme kuralı:** tek ekranda kullanılıyorsa `screens/<ekran>/`,
iki+ ekranda kullanılıyorsa `components/shared/`, tasarım sistemi parçasıysa
`components/ui/`. Bileşen ikinci bir ekranda kullanılmaya başlandığı an
`shared`a TAŞINIR — kopyalanmaz.

**Dosya başına TEK bileşen.** Yardımcı alt bileşen bile ayrı dosyaya çıkar.

## Auth — MİSAFİR ÖNCE (12 Eki 2026 kararı)

- İlk açılışta Supabase **anonim** oturum açılır (`AuthController.boot`):
  onboarding ve dersler hesapsız çalışır. Login ekranı YOK.
- "İlerlemeni kaydet" AYNI kullanıcıyı kalıcı yapar: e-posta+şifre
  `updateUser({email,password})` (tek çağrı), Apple `linkIdentity` — kimlik
  değişmediği için ilerleme, hafıza ve satın alma (RevenueCat müşteri kimliği =
  Supabase kimliği) taşınır. Mevcut hesaba GİRMEK kimliği değiştirir; misafir
  ilerlemesi varsa ekran önce uyarır.
- Token'ı **interceptor** ekler; 401'de `AuthController.recover()` önce
  belirteci tazeler, olmazsa yeni misafirle kapıdan geçer.
- Kapı: `/` → `me.profile` yoksa `/onboarding`, varsa `/lessons`. Kök, açılış
  bitmeden hiçbir ekranı çizmez (native splash açık kalır).

## Abonelik

- **HER ŞEY ÜCRETSİZ (5 Kas 2026, kullanıcı kararı):** günlük kota tamamen kalktı —
  sunucu 402 dönmez, `/me` kota taşımaz, ekranda kota bandı / Pro tacı / Pro afişi yok,
  onboarding'de paywall adımı yok. Abonelik kurgusu ileride tasarlanacak.
- Altyapı dokunulmadan duruyor ama HİÇBİR YERDEN AÇILMIYOR: `PaywallController` /
  `PaywallScreen` (rota `paywall`), RevenueCat (`PurchasesService`, `ProController`),
  `usePro()`. Admin'in tanıdığı Pro profilde yalnız gösterilir (`ProActiveCard`,
  abonelik ayarları yalnız Pro'da).

## API yüzeyi (backend'den doğrulandı — hepsi `/v1` öneki + JWT)

| Uç | İş |
|---|---|
| `POST /onboarding` | profil oluşturma |
| `GET /curriculum/current` | seviye listesi + ilerleme |
| `GET /me` · `GET /me/stats` | profil + abonelik · seri/dakika/7 gün |
| `PATCH /me/profile` | profil alanları (seviye, track, açıklama dili, öğretmen `tutorId`, hedef, ad, saat dilimi) — müfredatı döner |
| `GET /tutors` · `POST /tutors/:id/sample` | seçilebilir öğretmenler (+ varsayılan) · öğretmenin sesiyle kısa tanıtım klibi |
| `GET /avatar` | kullanıcının öğretmeninin yüzü + adı (`{ activeId, tutorName }`) — ders/rol yapma sahnesi |
| `DELETE /me` | hesabı ve kişisel veriyi sil |
| `POST /me/entitlement/refresh` | satın alma sonrası zorla doğrulama |
| `GET /lessons/:catalogLessonId` | ders içeriği (`{ lessonId, lesson }`) |
| `POST /lessons/:catalogLessonId/sessions` | ders oturumu aç (script döner) |
| `POST /sessions/:id/chat` | sohbet turu |
| `POST /sessions/:id/tts` · `/stt` | ses |
| `POST /sessions/:id/translate` · `/review` | çeviri · cevap incelemesi |
| `POST /sessions/:id/end` | oturum kapat (roleplay'de debrief döner) |
| `GET /checkpoints/:level/:unitIndex` · `POST` | ünite testi al · sonucu yaz |
| `GET /roleplays` · `GET /roleplays/:slug` | roleplay listesi · brief |
| `POST /roleplays/:slug/sessions` | roleplay oturumu aç |

## Ürün kuralları (kök CLAUDE.md'den taşınan, mobilde de bağlayıcı)

- **Mobil UI:** kategori/jargon ekranda YOK ("beat", "core", "checkpoint" gibi
  iç terimler kullanıcıya gösterilmez). Ders yolu — KIVRIMLI YOL (11 Kas 2026,
  kullanıcı kararı; soft 3D ünite kapakları + sinüs dalgası emekli, görseller ve
  `scripts/unit-art/` silindi): yol her ünitede AYNI kalıbı tekrar eder, kendi
  kafasına göre yön değiştirmez — sıra 0 ortada tek düğüm, yol sağa akar → sağ
  kenarda yarım daire → sıra 1'de sağ + sol çift düğüm, yol sola akar → sol kenarda
  yarım daire → tek düğüm… (`lessonPath.packUnit` + saf `trackGeometry`; yarım
  daire iki sıraya bölünür, yol çizgisi her sırada tepeden `ROAD_R`). Bir FlatList
  satırı = bir yol sırası (`PathTrack`: SVG yol + `LessonStop`/`TestStop`). Ders
  düğümleri sırayla dönen altı renk (`path-1…6` + `-lip` + `-ink` token'ları), ikon
  ders tipinden, ders ADI düğümün altında; bitmişte köşede onay rozeti, kaldığın
  derste renkli halka + "BAŞLA/DEVAM"; varılmış yol `path-road-done` ile boyanır.
  ÜNİTE TESTİ yolun en belirgin durağıdır: her zaman kendi sırasında, ortada, büyük
  altın düğüm + kupa (`test-*` token'ları), dersler bitince halka nefes alır; yol
  orada biter. Ünite görselsiz başlıkla açılır (`UnitHeader`: ayraç + no/ilerleme +
  başlık + `goal`). Dokununca `NodePopover` (ad, "Ders 3 / 6", tek eylem). Düzen
  kullanıcı açıkça istemeden değişmez.
- **Ders ekranı düzeni (5 Kas 2026, kullanıcı kararı; 12 Kas 2026 güncellemesi):** avatar
  SAĞ ÜST köşede yüzen 2:3 kart (120×180, `LessonStage`) — ad/durum satırı YOK; ilk söz
  avatarın yanına sığar, sonrakiler altından tam genişlik akar; hoca yazısı 17px. Avatar
  ağaçta tek yerde (oyun bloğunda küçülür, yeniden bağlanmaz); altında dersin TÜM konuşması
  kaydırılabilir akış (`CaptionCard` hoca, `MessageBubble` öğrenci). O anki görevin
  sorusu akışta `TaskCard` olarak durur (MCQ şıkları içinde, dokunmak ANINDA gönderir);
  geçmiş görevler düz söz. Yeni söz yalnız kullanıcı zaten en alttaysa akışı kaydırır.
  Eski "anlatımda büyük görüntülü görüşme + yalnız o anki söz" düzeni emekli: geçmişi
  görmek Transkript sheet'ine dokunmayı gerektiriyordu. Rıhtım aynı (ortada bas-konuş,
  solda klavye, sağda transkript). `promptMessageId` görev kartının yerini belirler,
  akış kararı DEĞİLDİR.
- **Oyun bloğu (drills, 10 Kas 2026):** dersin `drills` beat'inde (`awaiting === "drills"`)
  sohbet akışı + rıhtım yerini `screens/lesson/drills/DrillStage`'e bırakır, avatar küçülür
  (`LessonStage compact`). Akış `LessonDrillController`'da (ses, kayıt, dokun-çevir, senkron);
  puan/kuyruk kararı contracts `drillGrade`'de, ekran yalnız okur. Madde başına tek ana eylem:
  Kontrol et → panel → Devam (`CtaButton`); eşleştirme ve konuşma kartı kendi eylemiyle kapanır.
  Seçim/kart/dokunuş YEREL görünüm durumudur (`DrillCard`, madde anahtarıyla sıfırlanır —
  CheckpointScreen deseni). Şık listesi ve kart dizme ünite testiyle ORTAK
  (`components/shared/ChoiceList`, `TileBuilder`). Doğru/yanlış sesi `services/SoundService`
  (paketlenmiş wav, expo-audio — yeni native bağımlılık yok). Blokta serbest giriş yoktur:
  `handleUserText`/`pressMic` `drills`te hiçbir şey yapmaz; konuşma kartının mikrofonu
  `LessonDrillController.pressSpeak/releaseSpeak`. Blok bitince özet kartı → "Rol yapmaya geç"
  (`afterDrills`). Eski formatlı dersler (exercise beat'leri) aynen çalışır.
- **Oyun bileşenleri ORTAK** (`components/shared/drills/`, 10 Kas 2026): ders oyun bloğu ve ünite
  testi aynı `DrillCard` + tür bileşenlerini kullanır. Bileşenler G/Ç bilmez; ses, kontrol, ilerleme,
  dokun-çevir, "Konuyu hatırla" ve konuşma kartı `DrillHost` bağlamından gelir — ders
  `DrillStage`'de LessonDrillController'a, test `CheckpointScreen`'de kendi puanlamasına bağlar.
  Opsiyonel alan yoksa özellik görünmez (testte ipucu ve konuşma kartı yok). Testin sesi oturumsuz
  (`VoiceService.speak(null, …)` → `/v1/tts`).
- **Ders içi rol yapmada hedef çipleri** (`screens/lesson/PracticeTargets`, 10 Kas 2026): `practice`
  fazında avatarın altında "Bu sohbette kullan" + dersin `mustUse` kalıpları; öğrencinin
  BİREBİR söylediği kalıp tiklenir (`practiceUsed`, contracts `usedTargetPhrases`, devamda
  transkriptten yeniden kurulur). Yalnız gösterim — ölçüm sunucuda.
- **ÖĞRETMEN SEÇİMİ (10 Kas 2026):** kullanıcı hocasını (yüz + ses + ad) onboarding'de
  (`TeacherStep`, seviye ile açıklama dili arasında) ve Ayarlar → Öğretmen'de (`TeacherSheet`)
  seçer; açıklama DİLİ ayrı sorudur (`TutorStep`/`TutorSheet`). Kartlar ortak
  (`components/shared/TutorGrid` + `TutorCard`): paketlenmiş portre, dokunmak seçer + sesini
  çalar (`TutorController.playSample` → `VoiceService.playClips`). Portresi bu derlemede
  olmayan öğretmen gösterilmez (`domain/tutors.pickableTutors`); liste boşsa adım ve satır
  hiç görünmez (eski davranış). Ad sabit yazılmaz: ekranlar `/me.tutor.name`
  (`hooks/useTutorName`) ya da oturumun `/v1/avatar` `tutorName`'ini okur, yoksa "Emma".
  Ada ek bağlanmaz (ünlü uyumu her adda tutmaz) — "{ad} ile", "{ad} diyor ki" gibi nötr kurgu.
  Ses ve rol yapmadaki karakter adı sunucuda öğretmene bağlanır; istemci yalnız seçer.
- **Rol yapma:** her zaman İngilizce; bitiren YALNIZ "Bitir" (✕ denemeyi
  kaydetmeden çıkar); hedef tikleri sunucudan (`newHits`), istemci karar vermez.
- **Dil bağımsızlığı:** hiçbir yerde dil adı sabitlenmez; `nativeLanguage`
  profilden gelir. RichText parçaları (`{lang: "en"|"l1"}`) ekranda `en` vurgulu
  (+RTL'de `<bdi>` karşılığı), TTS her parçayı kendi diliyle okur.
- **Ders/roleplay bitişi:** bitiren YALNIZ butondur — hiçbir sayaç/etiket akışı
  kapatamaz. `speak(text, onEnd)` — `onEnd` TAM BİR kez çalışmalı (web'deki
  `settle()` deseni: onended + onerror + timeout tek noktada).
- **Ders devamı (resume):** pozisyon + script/deterministik transkript satırları
  her geçişte `POST /sessions/:id/sync` ile fire-and-forget sunucuya yazılır
  (hata SESSİZCE yutulur — ders asla bloke olmaz). Devam AYNI oturumda sürer
  (`GET /lessons/:id/resume`); yeni oturum açmak practice hitTurns'ü ve LLM
  bağlamını sıfırlar. Oturum ekran mount'unda DEĞİL, başlat butonunda açılır.
  Sunucuya giden chat/judge çiftleri ASLA logTurn'la loglanmaz (çift kayıt).
  **✕ ÇIKIŞTIR** (`exit()`: ses sus + geri; oturum AÇIK kalır) — dersi bitiren
  YALNIZ wrapup'taki "Dersi Bitir" (`finish()`). ✕'i finish'e bağlamak devam
  sistemini komple boşa düşürür (canlı hata, 16 Eyl 2026).
- **MCQ cevabı butonla** — web'de canlı hatadan öğrenildi: tek harf STT için en
  kötü girdi. Şıklar tıklanabilir; mikrofon/klavye açık kalır.
- **SÖZ KESME (barge-in):** hoca konuşurken girdi ASLA kilitlenmez. Mikrofona
  basmak ya da yazılanı göndermek sesi anında keser. Yol, YÜRÜYEN ADIMIN
  (konuşma ya da iki söz arasındaki kısa bekleme — `speak(runs, onEnd, leadsToAwait)`
  / `later(ms, fn)`) devamına göre seçilir (`interrupt`):
  · **Devam aynı adımın sorusuna varıyorsa** (görevi okumak, "hazır mısın?",
    practice/wrapup): `VoiceService.skipSpeaking` sesi durdurur ve bekleyen `onEnd`'i
    ZORLA çalıştırır; `fastForward` devreye girer — balonlar, transkript ve imleç
    aynen akar, yalnız TTS atlanır; akış cevabın beklendiği ilk noktaya varınca
    (`arrive`) ileri sarma kapanır ve kuyruktaki söz (`pendingInput`) oraya teslim edilir.
  · **Devam dersi ilerletiyorsa** (anlatım, geçiş, övgü — 4 Kas 2026): ARAYA GİRME.
    `hold()` sesi `stopPlayback` ile durdurur (kapanış abandon — `onEnd` ÇALIŞMAZ),
    devamı `held`'e alır; söz `/chat`'e `interjection: true` ile gider, hocanın kısa
    cevabı söylenir, sonra bekletilen devam TAM BİR KEZ çalışır (ders kaldığı yerden).
    Eskiden ileri sarma sözü bir SONRAKİ — duyulmamış — görevin cevabı yapıyordu.
    Mikrofonla araya girilip STT boş/başarısız dönerse devam hemen sürer. Jeton
    (`Pending.token`): `hold` devamı aldıktan sonra yolda kalan kapanış no-op olur.
  Beat makinesi kesmeyi HİÇ görmez — `lessonFlow.ts` kararları değişmez.
  · `awaiting`in tek yazarı `arrive()`: ileri sarmayı girdiye değil BEKLEME
    NOKTASINA bağlamak şart (öğrenci mikrofona basıp hiç konuşmayabilir; STT boş
    dönünce ders sonuna kadar sessiz oynardı).
  · Kuyruk `skipSpeaking`den ÖNCE kurulur — kesme kapanışı senkron koştuğu için
    sonra kurulan kuyruk aynı karede kaçırılır.
  · Mikrofon BASILIYKEN teslim yok (hocanın cevabı kayda konuşur, STT onu
    öğrencinin sözü sanar) — `releaseMic` devralır. Basılı butonun `disabled`
    olması da yasak: RN `onPressOut`u düşürür, kayıt sahipsiz kalır.
  · Girdi kilidi TEK ifade: `busy || grace`. `grace`, her yeni hoca balonundan
    sonraki 500ms (`INPUT_GRACE_MS`) — kullanıcı okumadan yanlışlıkla kesmesin.
  · Ekrandan çıkışta (`leave`/`exit`/`finish`) `stopped` kurulur ve bekletilen
    devam bırakılır (`dropPending`): ileri sarma ağ beklemediği için zincir aksi
    hâlde ekran kapandıktan sonra saniyelerce balon ve imleç yazmaya devam ederdi.
- **GÖRÜNÜR HATA (4 Kas 2026):** STT (`VoiceService.stopRecording` → `SttResult`:
  `text | empty | failed`), sohbet (`chat` → null) ya da TTS (`speak`'in `onFail`'i)
  düşünce controller `NoticeBar` uyarısı gösterir (`components/shared/NoticeBar`,
  metin `i18n/tr.ts` → `notice.*`, 7 sn ya da yeni girdiye kadar). Hak yanmaz, akış
  kilitlenmez. Eskiden üçü de sessizdi — "cevap veriyorum, hoca cevap vermiyor".
  Ders ve rol yapma ekranı aynı deseni kullanır.
- **Transkript sırası:** istemcinin çözdüğü söz + cevabı (`praise`, davet, veda)
  TEK `/sync` isteğinde gider (`logTurns`) — iki ayrı fire-and-forget isteği yarışıyor,
  "Tam isabet!" öğrencinin cevabından önce kaydediliyordu.
- **AKIŞLI SES (5 Kas 2026):** 3D avatar köprüsü yoksa (native 2.5D / avatarsız)
  `VoiceService.speak` önce `POST /sessions/:id/tts/stream` ile bilet alır ve dönen adresi
  expo-audio'ya verir — ses sunucu üretirken çalar (Gemini'de ilk ses ~0,5 sn). Bitiş:
  `didJustFinish` ya da süre sonu ya da ses başladıktan sonra 1,5 sn tamponsuz duruş
  (uzunluğu bilinmeyen akışta bazı oynatıcılar bitişi raporlamıyor) + metin uzunluğundan
  watchdog. 409 → 5 dk akış denenmez; ses 6 sn'de başlamazsa tam klip yolu (`/tts`).
  **AĞIZ İZİ:** expo-audio uzak adresten çalarken `audioSampleUpdate` HİÇ gelmez (yalnız
  cihazdaki dosyada) → akışta ağzın açıklığı sunucunun ağız izinden (`{path}/mouth`, 250 ms
  yoklama, `SpeechClock.appendTrack`): ±3 kare ortalama + 40 ms önden okuma (iz sesten önce
  geldiği için gecikmesiz yumuşatma). Uç yoksa (eski sunucu) 3 hatada vazgeçer, ağız metne düşer.
  3D köprüsü base64 klip istediği için onda tam klip yolu sürer. `onEnd` TAM BİR KEZ
  kuralı aynı `settle()`'dan geçer.
- **2.5D avatar NATIVE, 3D avatar WebView** (5 Kas 2026). 2.5D (raven/kai/lena/theo)
  `components/shared/SpriteAvatar` ile çizilir: portre → göz beyazı → kayan iris →
  açıklığı oyulmuş göz çerçevesi → kapak gölgesi → ağız atlası yığını. Zamanlama,
  ağız ve davranış web ile AYNI kod (`@glotmate/contracts/avatar`: stepMouth,
  createLife, viseme). Ses expo-audio'dan çalar; avatar saati/enerjiyi/timeline'ı
  `lib/speechClock`'tan okur (VoiceService her klipte `begin/end` der). Sebep: WKWebView'daki
  Web Audio mikrofon sonrası ses oturumu değişiminde askıya düşüp sesi yutuyordu
  (ağız oynuyor, ses yok). Görseller paketlenmiş (`assets/avatars/`, OTA ile gider);
  göz çerçeveleri `scripts/sprite-avatars/build.py` ile web varlıklarından türetilir
  (`src/domain/spriteAssets.ts` ÜRETİLMİŞ). **KATMANLI BEDEN** (5 Kas 2026, Kai):
  portre kişi maskesiyle (birefnet-portrait) arka plan + boyun altlığı + baş + gövde
  olarak ayrılır (`rig.layers`, `layer_*` dosyaları; betik `sprite-avatar/scripts/layers_kai.py`).
  Arka plan az kayar, gövde nefesle kalkar, baş boyundan tam genlikle döner; gövde başın
  ÜSTÜNDE çizilir → ek yeri yaka/tişört yakasının arkasında. Skia GEREKMEDİ (OTA ile gider).
  Sebep: tek parça salınımda yalnız ağız/göz canlı görünüyordu ("robotik"). Katmansız rig
  portreyi bütün olarak ölçülü salar. Kaş esnetmesi hâlâ yok (WebGL/Skia ister).
  Yeni 2.5D avatar: web'e varlık + contracts `rigs.ts`'e geometri, sonra betik.
- **3D avatar WebView ile** (kök CLAUDE.md kararı; native Three.js ayrı faz —
  expo-gl'de draco/postprocessing/52-morph desteği güvenilmez). Kurulum:
  `EXPO_PUBLIC_AVATAR_URL` → apps/web `/embed/avatar`; boşsa avatar kapalı,
  SpeakingIndicator'a dönülür. Ses, 3D avatar aktifken WebView İÇİNDE çalar
  (dudak senkronu ses+timeline'ın aynı JS bağlamında olmasını gerektirir) — düz
  `<audio>`'dan; Web Audio YALNIZ enerji zarfı içindir (OfflineAudioContext), ses
  çıkışı ona bağlanmaz (`apps/web/src/lib/clipPlayer.ts`).
  Köprünün sahibi `lib/avatarBridge.ts` + rota seçimi `lib/voice.ts`;
  protokol tipleri `@glotmate/contracts` `avatarProtocol.ts`. Ekranlar yalnız
  `AvatarStage` render eder (2.5D'de native, 3D'de köprünün fiziksel ucu).
  settle/watchdog sahipliği VoiceService'ten ÇIKMAZ: WebView ölürse 4sn
  start-watchdog aynı klipleri expo-audio'yla çalar, ders asla kilitlenmez.
  JWT WebView'a ASLA girmez — TTS'i RN çeker, yalnız klip baytları köprüden geçer.
  Ekran `AvatarStage`e `activity` verir (`recording` → dinliyor, `busy && !speaking`
  → düşünüyor); avatar bunu yalnız JEST için kullanır — akış kararı DEĞİLDİR.
- Sistem prompt'u, LLM anahtarı, akıl yürütme İSTEMCİDE YAŞAMAZ — mobil yalnız
  `/v1` uçlarını çağırır.

## Yapılmayacaklar

- Bileşende `fetch`/`axios` import etmek (yalnız controller)
- Store'a controller dışından yazmak (bileşen yalnız okur + aksiyon çağırır)
- Bir dosyada birden çok bileşen
- `StyleSheet.create` (NativeWind varken) — istisna: NativeWind'in
  destekleyemediği animasyon/native prop durumunda, yorum satırıyla gerekçeli
- Elle response tipi/şeması yazmak (contracts varken)
- Rota dosyasında (`src/app/`) iş mantığı, state, stil
- Literal renk: `text-white`, `text-red-400`, hex string, `dark:` öneki — yalnız
  `colors.js` token'ları (bkz. Renk kuralı)
- Bileşende sabit arayüz metni — yalnız `i18n/tr.ts`
- `withSpring`/zıplayan hareket, RN `Animated` (Reanimated var)
- Tailwind v4'e / NativeWind v5'e kendi kendine geçiş — stabil çıkana kadar bekle
