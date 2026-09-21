# GlotMate Admin — Mimari Sözleşme

Operatör paneli (içerik yayın hattı, ileride kullanıcı/maliyet). Bu dosya
bağlayıcıdır ve `apps/mobile/CLAUDE.md`'nin web uyarlamasıdır: mobil ne kadar
temizse admin de o kadar. Desen tartışılacaksa önce bu dosya, sonra kod.

## Yığın

| Paket | Not |
|---|---|
| Next 16 (App Router) | `next dev -p 6568` — web 6567, backend 6566 |
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
│       └── lessons/page.tsx
├── api/index.ts            # TEK axios instance + JWT interceptor + errorCode()
├── services/               # AuthService, AdminLessonsService…
├── controllers/            # AuthController, LessonsController…
├── stores/                 # useAuthStore, useLessonsStore…
├── screens/<ekran>/        # ekran + yalnız orada kullanılan alt bileşenler
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

## Yapılmayacaklar

- Bileşende `axios`/`fetch`/`supabase` import etmek (yalnız `services/`, `api/`)
- Controller'ın doğrudan `api`ye gitmesi (service'ten geçer)
- Store'a controller dışından yazmak
- Bir dosyada birden çok bileşen
- Elle response tipi/şeması (contracts varken)
- Rota dosyasında iş mantığı, state, stil
- `components/ui/` içini elle düzenlemek (shadcn CLI ile eklenir/güncellenir)
- Katalog metnini (title/focus) çevirmek — kanonik İngilizce, olduğu gibi gösterilir
