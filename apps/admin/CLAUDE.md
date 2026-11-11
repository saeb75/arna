# GlotMate Admin — Mimari Sözleşme

Operatör paneli (Overview maliyet panosu, içerik yayın hattı, roleplay yönetimi,
kullanıcı/abonelik, oturum bug avı). Bu dosya
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
| next-themes | tema (`class`, varsayılan `system`); durum next-themes'te (localStorage), store'da DEĞİL |

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
- Aksiyon sonrası yönlendirme de deklaratif: controller store'a bir işaret yazar,
  rota dosyası onu okuyup `<Redirect/>` döner (ör. roleplay oluşturma →
  `useRoleplayEditorStore.createdId` → `roleplays/new/page.tsx`). İşareti hedef
  ekranın controller'ı temizler (`RoleplayDetailController.load → clearCreated`).
- Tek istisna kullanıcının KENDİ tıklamasının devamı: `UnsavedChangesGuard`
  kaydedilmemiş editör varken panel içi `<a>` tıklamasını yakalar, onaydan sonra
  o adrese gider (+ `beforeunload`). App Router'da rota değişimini durduran API yok.
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
│   ├── layout.tsx          # font + globals.css + <ThemeProvider> + <AppBootstrap/> + <Toaster/>
│   ├── login/page.tsx      # oturum varsa → /
│   └── (panel)/            # yetkili alan: layout kapı + <PanelShell/>
│       ├── page.tsx        # / = Overview (oturumsuz ziyaret layout kapısında /login'e düşer)
│       ├── lessons/page.tsx · lessons/[id]/page.tsx
│       ├── roleplays/page.tsx · roleplays/new/page.tsx · roleplays/[id]/page.tsx
│       ├── users/page.tsx · users/[id]/page.tsx     # auth.users + profil + sayaçlar; tek yazma: Pro tanıma
│       ├── sessions/page.tsx · sessions/[id]/page.tsx # bug avı: transkript + imleç + LLM çağrıları
│       ├── tutors/page.tsx      # öğretmenler (ad + 2.5D rig + ses); oluştur/düzenle diyalogda, silme yok (gizlenir)
│       └── settings/            # /settings → /settings/voice; avatar/ ve voice/ AYRI sayfalar,
│                                #   voice/[provider] sağlayıcı detayı (ses/model/önizleme)
├── api/index.ts            # TEK axios instance + JWT interceptor + errorCode() + errorData() (422/400 gövdesi)
├── services/               # AuthService, AdminLessonsService…
├── controllers/            # AuthController, LessonsController…
├── stores/                 # useAuthStore, useLessonsStore…
├── screens/<ekran>/        # overview/, lessons/, lesson-detail/, roleplays/, roleplay-detail/, roleplay-new/,
│                           #   users/, user-detail/, sessions/, session-detail/, tutors/, settings/ (avatar+voice), tts-provider/, login/, forbidden/
├── components/ui/          # shadcn (dokunulmaz, CLI ile güncellenir)
├── components/shared/      # 2+ ekranda kullanılan: PanelShell, Sidebar, ErrorState, StatusPill, ConfirmAction…
│   └── roleplay/           # roleplay editörü + önizleme — detay VE /roleplays/new aynı grubu kullanır
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

- Onaylı her aksiyon (yayınla, taslağı at, emekli et, yeniden üret, Pro geri al)
  `components/shared/ConfirmAction` üstünden: bu shadcn varyantında `AlertDialogAction`
  düz Button'dır (Close değil) — diyalog kontrollüdür, onayda kendini kapatır.
- Ders mutasyon uçlarının TAMAMI `AdminLessonDetail` döner; controller store'a yazar ve
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

### Roleplay yönetimi

- Roleplay DB kaynaklıdır (müfredatın tersine panelden yazılır). Mutasyon uçlarının
  TAMAMI `AdminRoleplayDetail` döner → `RoleplayDetailController.applyDetail` (detay +
  liste tazelenir) → editör kayıtlı hâle eşitlenir.
- **Yayınlı revizyon değişmez.** Düzenleme senaryo başına TEK açık taslakta; taslak
  yoksa editör yayından başlar ve kayıt yeni taslak doğurur. Yayın önceki yayını
  `retired` yapar (silinmez — oturumlar revizyona pinli). Eski revizyona dönmek =
  "Duplicate as draft". Yayın butonu: taslak var + taslak lint'i hatasız + editör temiz.
- Editör YAPILANDIRILMIŞ formdur (JSON yalnız salt okunur görünüm). Form durumu
  `useRoleplayEditorStore`'da (`key` = senaryo kimliği ya da `"new"`): sekme değişimi ve
  panel içi gezinme yazılanı kaybettirmez; kirli = `candidateKey(form) !== baseline`.
- İki kapı: istemcide `roleplaySpecSchema` + sunucunun KESİN kurallarının aynısı
  (açılış "?" ile biter, benzersiz kimlik, `recommendedFrom ≥ supportedFrom`,
  `supportedFrom`'da ≥2 aktif hedef) alan altında İNGİLİZCE (`lib/roleplayDraft.ts` —
  contracts'taki Türkçe regex mesajları ekrana taşınmaz); istemci kapısından geçen
  taslak 450 ms debounce ile `POST /roleplays/lint` kuru koşusuna gider. Sunucu
  hataları kaydı ENGELLER, uyarılar engellemez. Kayıtlı hedef/komplikasyon kimliği
  kalıcıdır — yalnız bu oturumda eklenen öğenin kimliği etiketten türetilir.
- Önizleme sunucunun AYNI saf fonksiyonlarını çalıştırır (`resolvePlayedLevel`,
  `activeComplications`): oynanan seviye, yükseltme notu, aktif hedefler, seviyede
  İLK aktif komplikasyon.
- Kullanıcılarda tek yazma: ücretsiz Pro tanıma/geri alma (`POST /users/:id/pro`);
  mağaza (RevenueCat) aboneliğine dokunmaz, detay döner, liste tazelenir.

### Öğretmenler

- Öğretmen = ad + koddaki bir 2.5D rig + KENDİ sesi (sağlayıcı/ses/model). Mutasyon uçları
  listenin tamamını döner (varsayılan bayrağı satırlar arasında taşınır) → `TutorsController`
  store'u bütün olarak yazar. Ses seçenekleri ve önizleme TTS ayar uçlarından.
- Form `useTutorsStore.editor`da; doğrulama saf `lib/tutorDraft.ts` (`scripts/test-tutor-draft.ts`):
  contracts şemaları + sunucunun kuralları (varsayılan gizlenemez, varsayılanın bayrağı doğrudan
  kalkmaz, ilk öğretmen varsayılan) alan altında İNGİLİZCE. "Play sample" cümleyi sunucudan alır
  (`/tutors/sample-line`) ve `components/shared/ClipPlayer` ile çalar.

## Liste ekranı sözleşmesi

Her tablo **sayfalıdır** — sorulmadan. Varsayılan 25, seçenekler 25/50/100; şerit
`components/shared/TablePagination.tsx`, `Paged` şekli `lib/paginate.ts`.
- **Sınırlı, sabit listeler** (katalog 395 ders, kullanıcılar) tek seferde gelir; süzme →
  sıralama → sayfalama istemcide (`paginate`). Sayfa/ebat store'da, filtre değişince 1.
- **Detay kartlarındaki küçük tablolar** da sayfalıdır (LLM çağrıları, ilerleme, ünite
  testleri, maliyet kırılımları, revizyonlar, hedef istatistikleri): sayfa durumu
  store'da `Record<tablo, PageState>` (`lib/paginate.ts` → `nextPageState`: ebat
  değişimi sayfayı 1'e alır); veri/aralık değişince 1.
- **Büyüyen alt listeler** (kullanıcının oturumları/hafızası, senaryo denemeleri)
  ayrı uçlardan sunucu sayfalıdır, kendi `loading/error`'larıyla — sayfa değişiminde
  tablo yerinde kalır, soluklaşır; "son N" kesiti gösterilmez.
- **Büyüyen listeler** (oturumlar) SUNUCU TARAFI sayfalıdır: süzgeç/sıralama/sayfa
  `AdminSessionsQuery` ile gider, cevap `page/pageSize/total` + `stats` (süzülmemiş
  özet) döner; istemci `pagedFromServer` ile aynı şeridi kurar. "Son N" kısıtı YOK —
  bu bir sayfalama değil kesmedir (kullanıcı geri bildirimi). Arama 300 ms debounce,
  bayat cevap sıra numarasıyla elenir.

## Dil ilkesi — arayüz İNGİLİZCE

Kullanıcıya görünen her metin (etiket, buton, toast, placeholder, boş/hata
durumu) **İngilizce**. Kod yorumları ve bu doküman Türkçe kalır (repo geleneği).
Biçimler: tarih `Intl.DateTimeFormat("en-GB")`, para `en-US` USD, dil adları
`Intl.DisplayNames(["en"])` (`lib/labels.ts` — dil adı sabitlenmez). Denetim:
`grep -rnE '[çğıöşüÇĞİÖŞÜ]' src | grep -vE '(//|\*)'` yalnız yorum döndürmeli.

## Tema ve renk ilkesi

Light + dark tema (next-themes, `attribute="class"`, varsayılan `system`; seçici sidebar
altında: System / Light / Dark). Renkler YALNIZ `globals.css` token'larından gelir —
`bg-white`, `text-black`, `gray-500` gibi sabit sınıf yazılmaz; her token `.dark`'ta
karşılığına sahip. Token düzeni GlotCast admin'inkidir (3 Kas 2026, mavi vurgu
kaldırıldı): `primary` NÖTR, renkli tek vurgu ayrı `brand` token'ı (GlotCast ember'i:
açık `#b94d17`, koyu `#ee8146`; koyuda `brand-foreground` zemin rengi — turuncu üstünde
beyaz okunmuyor). Ölçülü palet — panel "renkli AI uygulaması" gibi görünmez:

- **Gri skala** (`foreground / muted-foreground / muted / border`) her şeyin zemini.
- **`primary` (nötr siyah/beyaz)**: butonlar, varsayılan `Badge` (Admin, Active).
  Aktif sidebar öğesi `sidebar-accent` (gri).
- **`brand` (ember)** tek renkli vurgu: marka işareti (`BrandMark`, `LoginBrand`),
  `published`/accent hapı, Pro, tamamlanan ders, grafik çubukları, `RatioBar`,
  transkriptte öğrenci balonu ve isabet. Vurgu için `primary` YAZILMAZ.
- **`destructive` (kırmızı)** yalnız `failed` ve hata ekranı.
- Ember dışında yeşil / sarı / mavi / menekşe **yok**. Yeni durum rengi EKLENMEZ; anlam
  biçimle ayrılır: dolgu (yayında), düz gri (ara durum), kesik çerçeve + içi boş
  halka (bayat paket), kesik çerçeveli gri (açık taslak, misafir hesap).
- Durum hapları `components/shared/StatusPill` tonlarından (accent · neutral · muted ·
  destructive) — LayerStatusBadge ile aynı dört ton. Pro = accent + taç ikonu.
- Grafikler kütüphanesizdir (CSS/SVG) ve TEK seri = TEK renk (`brand`); oranlar
  `RatioBar` (uzunluk anlam taşır, renk değil). Kategorik palet gerektiren grafik
  eklenecekse önce bu ilke güncellenir.

## Yapılmayacaklar

- Bileşende `axios`/`fetch`/`supabase` import etmek (yalnız `services/`, `api/`)
- Controller'ın doğrudan `api`ye gitmesi (service'ten geçer)
- Store'a controller dışından yazmak (istisna: istemci tarafı süzgeç/sıralama/sayfa gibi
  saf sunum durumu — ekran store setter'ını doğrudan çağırır; sunucuya giden sorgu
  değişimi ise controller'dan geçer çünkü yeniden çekim tetikler)
- Bir dosyada birden çok bileşen
- Elle response tipi/şeması (contracts varken)
- Rota dosyasında iş mantığı, state, stil
- `components/ui/` içini elle düzenlemek (shadcn CLI ile eklenir/güncellenir)
- Katalog metnini (title/focus) çevirmek — kanonik İngilizce, olduğu gibi gösterilir
