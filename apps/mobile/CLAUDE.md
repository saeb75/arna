# Arna Mobil — Mimari Sözleşme

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
| @arna/contracts | workspace | tüm response tipleri ve zod şemaları BURADAN |

Kurulum kuralı: Expo'ya bağlı her paket **`npx expo install`** ile eklenir —
sürüm uyumunu Expo çözer, elle sürüm sabitlenmez. Expo dışı paketler (zustand,
axios) normal `npm i` ile en son stabil.

## Katmanlı akış — HER özellik için, istisnasız

```
Screen  →  Controller (class)  →  axios instance  →  validate (@arna/contracts)
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
import { lessonContentV7Schema, type LessonContentV7 } from "@arna/contracts";
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
import type { LessonContentV7 } from "@arna/contracts";

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

## Doğrulama = @arna/contracts (elle şema yazmak yasak)

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
│   ├── lessons.tsx
│   ├── lesson/[id].tsx
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
```

**Monorepo notu:** `expo-doctor`'ın react-dom kopya uyarısı (mobil 19.2.x ↔ kökte
web'in Next sürümü) ZARARSIZ — yalnız kullanılmayan expo-web hedefini etkiler;
mobil kendi `node_modules/react`'ini çözüyor (doğrulandı). Metro, SDK 57'de
workspace'i otomatik algılar; `@arna/contracts` ek ayarsız çözülür (export
testiyle doğrulandı).

**Bileşen yerleştirme kuralı:** tek ekranda kullanılıyorsa `screens/<ekran>/`,
iki+ ekranda kullanılıyorsa `components/shared/`, tasarım sistemi parçasıysa
`components/ui/`. Bileşen ikinci bir ekranda kullanılmaya başlandığı an
`shared`a TAŞINIR — kopyalanmaz.

**Dosya başına TEK bileşen.** Yardımcı alt bileşen bile ayrı dosyaya çıkar.

## Auth

- `src/lib/supabase.ts`: `createClient` + AsyncStorage (`auth.storage`),
  `autoRefreshToken: true`, `persistSession: true`.
- Token'ı **interceptor** ekler (yukarıdaki `api/index.ts`) — hiçbir controller
  elle header kurmaz.
- Response interceptor 401'de: `useAuthStore.getState().clear()` + login'e
  yönlendirme. Tek yerde, tek kez.
- Login/logout/signup akışı da desene uyar: `AuthController` → supabase çağrısı
  → `useAuthStore`.

## API yüzeyi (backend'den doğrulandı — hepsi `/v1` öneki + JWT)

| Uç | İş |
|---|---|
| `POST /onboarding` | profil oluşturma |
| `GET /curriculum/current` | seviye listesi + ilerleme |
| `PATCH /me/profile` | seviye/track/tutorLanguage değişimi |
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
  iç terimler kullanıcıya gösterilmez), düz ders yolu, kart metinleri L1.
- **Dil bağımsızlığı:** hiçbir yerde dil adı sabitlenmez; `nativeLanguage`
  profilden gelir. RichText parçaları (`{lang: "en"|"l1"}`) ekranda `en` vurgulu
  (+RTL'de `<bdi>` karşılığı), TTS her parçayı kendi diliyle okur.
- **Ders/roleplay bitişi:** bitiren YALNIZ butondur — hiçbir sayaç/etiket akışı
  kapatamaz. `speak(text, onEnd)` — `onEnd` TAM BİR kez çalışmalı (web'deki
  `settle()` deseni: onended + onerror + timeout tek noktada).
- **MCQ cevabı butonla** — web'de canlı hatadan öğrenildi: tek harf STT için en
  kötü girdi. Şıklar tıklanabilir; mikrofon/klavye açık kalır.
- **Avatar ilk aşamada WebView** ile (kök CLAUDE.md kararı); native Three.js
  entegrasyonu ayrı faz.
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
- Tailwind v4'e / NativeWind v5'e kendi kendine geçiş — stabil çıkana kadar bekle
