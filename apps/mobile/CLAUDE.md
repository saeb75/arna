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

**Native bağımlılık = fingerprint değişir = yeni dev build.** Ekleme/çıkarma
kullanıcıya SORULMADAN yapılmaz (12 Eki 2026'da dördü onayla eklendi).

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
src/hooks/        # store birleşimleri: usePro, useQuota
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
  onboarding, paywall ve dersler hesapsız çalışır. Login ekranı YOK.
- "İlerlemeni kaydet" AYNI kullanıcıyı kalıcı yapar: e-posta+şifre
  `updateUser({email,password})` (tek çağrı), Apple `linkIdentity` — kimlik
  değişmediği için ilerleme, hafıza ve satın alma (RevenueCat müşteri kimliği =
  Supabase kimliği) taşınır. Mevcut hesaba GİRMEK kimliği değiştirir; misafir
  ilerlemesi varsa ekran önce uyarır.
- Token'ı **interceptor** ekler; 401'de `AuthController.recover()` önce
  belirteci tazeler, olmazsa yeni misafirle kapıdan geçer.
- Kapı: `/` → `me.profile` yoksa `/onboarding`, varsa `/lessons`. Kök, açılış
  bitmeden hiçbir ekranı çizmez (native splash açık kalır).

## Abonelik ve günlük kota

- Pro kararı SUNUCUDA (`me.entitlement`); RevenueCat'in anlık durumu
  (`useProStore.storeActive`) yalnız ekranı hemen açar ve sunucuya "yeniden
  doğrula" dedirtir (`POST /me/entitlement/refresh`). `usePro()` ikisinin VEYA'sı.
- Ücretsiz: günde 1 FARKLI ders + 1 FARKLI rol yapma (aynısını yeniden açmak hak
  yakmaz). Oturum açan uçlar 402 `quota_exceeded` döner → controller paywall'ı
  açar (`quotaKindOf`), hata göstermez.
- RevenueCat anahtarı yoksa (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`) paywall önizleme
  planlarıyla görünür, hiçbir şey satın alınmaz.

## API yüzeyi (backend'den doğrulandı — hepsi `/v1` öneki + JWT)

| Uç | İş |
|---|---|
| `POST /onboarding` | profil oluşturma |
| `GET /curriculum/current` | seviye listesi + ilerleme |
| `GET /me` · `GET /me/stats` | profil + abonelik + kota · seri/dakika/7 gün |
| `PATCH /me/profile` | profil alanları (seviye, track, açıklama dili, hedef, ad, saat dilimi) — müfredatı döner |
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
  iç terimler kullanıcıya gösterilmez). Ders yolu (3 Kas 2026, kullanıcı kararı —
  46fe195 zikzağı emekli): her ünite soft 3D illüstrasyonlu kapak kartıyla açılır
  (`UnitCard`, görsel `domain/unitArt.ts` — ÜRETİLMİŞ harita). Altındaki düğümlerin
  YAPISI Duolingo'ya benzer, RENKLERİ bizim (kullanıcı açıkça istedi; kil sikke
  düğümler ve aralarındaki taşlar beğenilmedi, kaldırıldı): düz yüz + koyu dudak
  (`node-*` token'ları), basınca yüz dudağa iner; yumuşak SİNÜS dalgası
  (`lessonPath.waveX(step)`); bitmiş ve kaldığın ders ember (bitmişte beyaz onay),
  başlanmamış gri; kaldığın derste halka + süzülen "BAŞLA/DEVAM" balonu. Etiket
  YOK — dokununca düğümün altında (yer yoksa üstünde) `NodePopover` açılır: ad,
  "Ders 3 / 6", tek eylem (Başla / Devam et / Tekrar et). Kaydırma kartı kapatır.
  Görseller `scripts/unit-art/` hattıyla üretilir: `dump-units.mts` → `generate.py`
  (Gemini 3 Pro Image, A1-1 stil çapası, `GEMINI_API_KEY` `.env.local`'de) →
  `write-map.mjs`. Düzen kullanıcı açıkça istemeden değişmez.
- **Ders ekranı düzeni (3 Kas 2026):** sohbet duvarı YOK. Anlatımda görüntülü
  görüşme — büyük avatar + yalnız o anki söz (`CaptionCard`); alıştırma/açık uçlu
  beat'te avatar AYNI WebView'la köşeye küçülür (`LessonStage`, yeniden yükleme
  yok), `TaskCard` ortaya gelir (MCQ şıkları içinde, dokunmak ANINDA gönderir).
  Geçmişin tamamı `TranscriptSheet`'te (RN Modal pageSheet). Rıhtım: ortada büyük
  bas-konuş, solda klavye, sağda transkript. Mod seçimi yalnız sunumdur (beat tipi);
  `promptMessageId` soru balonunu geri bildirimden ayırır, akış kararı DEĞİLDİR.
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
  basmak ya da yazılanı göndermek sesi anında keser (`VoiceService.skipSpeaking`:
  sesi durdurur ve bekleyen `onEnd`'i ZORLA çalıştırır — akış o zincirde yaşadığı
  için kesme kapanışı yutarsa ders kilitlenir). Sonra `fastForward` devreye girer:
  balonlar, transkript ve imleç aynen akar, yalnız TTS atlanır; akış cevabın
  beklendiği ilk noktaya varınca (`arrive`) ileri sarma kapanır ve kuyruktaki söz
  (`pendingInput`) oraya teslim edilir. Beat makinesi kesmeyi HİÇ görmez —
  `lessonFlow.ts` kararları ve sunucu sözleşmesi değişmez.
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
  · Ekrandan çıkışta (`leave`/`exit`/`finish`) `stopped` kurulur: ileri sarma ağ
    beklemediği için zincir aksi hâlde ekran kapandıktan sonra saniyelerce balon
    ve imleç yazmaya devam ederdi.
- **Avatar WebView ile** (kök CLAUDE.md kararı; native Three.js ayrı faz —
  expo-gl'de draco/postprocessing/52-morph desteği güvenilmez). Kurulum:
  `EXPO_PUBLIC_AVATAR_URL` → apps/web `/embed/avatar`; boşsa avatar kapalı,
  SpeakingIndicator'a dönülür. Ses, avatar aktifken WebView İÇİNDE çalar
  (dudak senkronu ses+timeline'ın aynı JS bağlamında olmasını gerektirir).
  Köprünün sahibi `lib/avatarBridge.ts` + rota seçimi `lib/voice.ts`;
  protokol tipleri `@glotmate/contracts` `avatarProtocol.ts`. Ekranlar yalnız
  `AvatarStage` render eder (köprünün fiziksel ucu — attach/onMessage).
  settle/watchdog sahipliği VoiceService'ten ÇIKMAZ: WebView ölürse 4sn
  start-watchdog aynı klipleri expo-audio'yla çalar, ders asla kilitlenmez.
  JWT WebView'a ASLA girmez — TTS'i RN çeker, yalnız klip baytları köprüden geçer.
  Ekran `AvatarStage`e `activity` verir (`recording` → dinliyor, `busy && !speaking`
  → düşünüyor); köprü yalnız değişimde `{type:"activity"}` yollar ve sayfa yeniden
  yüklenince `ready`de tekrarlar. Avatar bunu yalnız JEST için kullanır (2.5D:
  baş sallama, bakış) — akış kararı DEĞİLDİR.
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
