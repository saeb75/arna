# GlotMate Admin — Mimari Sözleşme

Operatör paneli (içerik yayın hattı, ileride kullanıcı/maliyet). Bu dosya
bağlayıcıdır ve `apps/mobile/CLAUDE.md`'nin web uyarlamasıdır: mobil ne kadar
temizse admin de o kadar. Desen tartışılacaksa önce bu dosya, sonra kod.

## Yığın

| Paket | Not |
|---|---|
| Next 16 (App Router) | `next dev -p 6568` — web 6567, backend 6560 |
| Tailwind 4 + shadcn (`base-nova`, neutral, dark) | `components.json` web ile aynı; bileşenler `@base-ui/react` üstünde (`render` prop, `asChild` yok) |
| Zustand 5 | domain başına store, middleware yok |
| Axios 1 | tek instance `src/api/index.ts` |
| @supabase/supabase-js 2 | oturum localStorage'da, yenileme supabase-js'te |
| @glotmate/contracts | tüm response şemaları BURADAN — elle şema yazmak yasak |
| motion (`motion/react`) | hafif animasyon; sözlük `src/lib/motion.ts` |

## Katmanlı akış — HER özellik için, istisnasız

```
Screen → Controller (static class) → Service → axios instance → validate (@glotmate/contracts)
   ↑                                                                    │
   └──────────────────────  Zustand store  ◄────────────────────────────┘
```

- **Bileşen** yalnız store'dan okur ve aksiyon olarak controller çağırır.
  `axios`/`fetch`/`supabase` import EDEMEZ.
- **Controller** stateless class, `static` metotlar, `Promise<void>`: değer
  döndürmez, store'a **kendisi** yazar. Şablon:
  `setLoading(true) → try service → store.set → catch setError(errorCode(err)) → finally setLoading(false)`.
- **Service** (mobilde yok, burada var): HTTP/Supabase'e dokunan TEK katman.
  Stateless; isteği atar, cevabı **contracts şemasından geçirir**, tipli veri
  döner ya da fırlatır. Store'a DOKUNMAZ, loading/error TUTMAZ.
- **Store**: `useXStore.ts` = hook adı. Setter'lar aptaldır; başarı setter'ı
  `error: null` da yazar. Yalnız kendi controller'ı yazar (istisna:
  `api/index.ts` 401'de `useAuthStore.clear()`).
- Hata değeri **kod**dur (`invalid_credentials`, `forbidden`, `http_503`);
  metne çeviri `src/lib/labels.ts`'te, ekranda.

## Yönlendirme ve kapılar

- Yönlendirme deklaratif ve YALNIZ rota dosyalarında: `<Redirect href/>`
  (`components/shared/Redirect.tsx`). Ekranlar ve interceptor yönlendirmez.
- `AppBootstrap` açılışta `AuthController.restore()` çağırır; `ready` olana
  kadar splash — login ekranı parlamaz.
- Auth + admin kapısı TEK yerde: `app/(panel)/layout.tsx`
  (`!session → /login`, `!isAdmin → ForbiddenScreen`). Alt rotalar tekrarlamaz.
- Admin rolü = JWT `app_metadata.role === "admin"`. Backend `requireAdmin` aynı
  claim'i okur; istemci kapısı yalnız UX. 401 oturumu düşürür, **403 düşürmez**.

## Klasör yapısı

```
src/
├── app/                    # YALNIZ ince rotalar — iş mantığı, state, stil YOK
│   ├── layout.tsx          # font + globals.css + <AppBootstrap/> + <Toaster/>
│   ├── page.tsx            # kapı: session → /lessons, yoksa /login
│   ├── login/page.tsx
│   └── (panel)/            # yetkili alan: layout kapı + <PanelShell/>
│       ├── lessons/page.tsx · lessons/[id]/page.tsx
│       ├── users/page.tsx · users/[id]/page.tsx     # salt okunur; auth.users + profil + sayaçlar
│       ├── sessions/page.tsx · sessions/[id]/page.tsx # bug avı: transkript + imleç + LLM çağrıları
│       └── settings/page.tsx
├── api/index.ts            # TEK axios instance + JWT interceptor + errorCode()
├── services/               # AuthService, AdminLessonsService…
├── controllers/            # AuthController, LessonsController…
├── stores/                 # useAuthStore, useLessonsStore…
├── screens/<ekran>/        # lessons/, lesson-detail/, users/, user-detail/, sessions/, session-detail/, settings/, login/, forbidden/
├── components/ui/          # shadcn (dokunulmaz, CLI ile güncellenir)
├── components/shared/      # 2+ ekranda kullanılan: PanelShell, Sidebar, ErrorState…
└── lib/                    # supabase.ts, labels.ts, motion.ts, saf yardımcılar
```

- **Dosya başına TEK bileşen.** Yardımcı alt bileşen bile ayrı dosyaya çıkar.
- Bileşen tek ekranda → `screens/<ekran>/`; ikinci ekranda kullanılınca
  `components/shared/`'a TAŞINIR, kopyalanmaz.
- Saf mantık (süzme, gruplama, özet) `lib/`'de React'siz durur ve
  `scripts/test-*.ts` ile `tsx` altında sınanır.

## Animasyon ilkesi

Hafif ve tekdüze: süre ≤250ms, hareket ≤8px, hepsi `lib/motion.ts` sözlüğünden.
Satır stagger'ı `STAGGER_CAP` ile sınırlı — 400 satırlık tablo saniyeler boyu
akmaz. Animasyon geçişi yumuşatır, dikkat çekmez; `layoutId` yalnız tek aktif
öğesi olan yerlerde (sidebar).

## Aksiyonlar ve toplu işler

- Mutasyon uçlarının TAMAMI `AdminLessonDetail` döner; controller store'a yazar ve
  matrisi (`LessonsController.load()`) tazeler — liste ile detay birbirine yalan
  söylemez. Sonuç bildirimi (toast) yalnız controller'da.
- **Sunucuda kuyruk yok.** LLM tetikleyen uçlar senkron (10–60 sn); toplu iş
  (seviye bazlı dil paketi ısıtma) İSTEMCİDE orkestre edilir: `LocaleWarmController`
  tek ders ucunu eşzamanlılık 2 ile çağırır, ilerleme/iptal store'da.
- **Katalog alanları düzenlenmez** (`title/focus/targetPhrases/themeHint`): kaynak
  repo (`apps/backend/src/curriculum`), DB projeksiyon. Panel yalnız katmanları
  (çekirdek · sahne · dil paketi) yönetir; `practice.mustUse` katalogdan dayatılır.
- Çekirdek editörü JSON + canlı önizleme: istemcide `lessonCoreSchema` (şema),
  sunucuda `lintCore` (pedagoji). Kayıt satırı `ready`ye düşürür — yayın ayrı buton.

## Dil ilkesi — arayüz İNGİLİZCE

Kullanıcıya görünen her metin (etiket, buton, toast, placeholder, boş/hata
durumu) **İngilizce**. Kod yorumları ve bu doküman Türkçe kalır (repo geleneği).
Biçimler: tarih `Intl.DateTimeFormat("en-GB")`, para `en-US` USD, dil adları
`Intl.DisplayNames(["en"])` (`lib/labels.ts` — dil adı sabitlenmez). Denetim:
`grep -rnE '[çğıöşüÇĞİÖŞÜ]' src | grep -vE '(//|\*)'` yalnız yorum döndürmeli.

## Renk ilkesi

Light tema, ölçülü palet — panel "renkli AI uygulaması" gibi görünmez:

- **Gri skala** (`foreground / muted-foreground / muted / border`) her şeyin zemini.
- **`primary` (mavi)** tek vurgu: aktif sidebar öğesi, ana buton, marka ve
  `published` durumu.
- **`destructive` (kırmızı)** yalnız `failed` ve hata ekranı.
- Yeşil / sarı / turuncu / menekşe **yok**. Yeni durum rengi EKLENMEZ; anlam
  biçimle ayrılır: dolgu (yayında), düz gri (ara durum), kesik çerçeve + içi boş
  halka (bayat paket).

## Yapılmayacaklar

- Bileşende `axios`/`fetch`/`supabase` import etmek (yalnız `services/`, `api/`)
- Controller'ın doğrudan `api`ye gitmesi (service'ten geçer)
- Store'a controller dışından yazmak
- Bir dosyada birden çok bileşen
- Elle response tipi/şeması (contracts varken)
- Rota dosyasında iş mantığı, state, stil
- `components/ui/` içini elle düzenlemek (shadcn CLI ile eklenir/güncellenir)
- Katalog metnini (title/focus) çevirmek — kanonik İngilizce, olduğu gibi gösterilir
