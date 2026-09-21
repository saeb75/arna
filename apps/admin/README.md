# @glotmate/admin

Operatör paneli — içerik yayın hattının yüzü. Mimari kurallar `CLAUDE.md`'de.

## Çalıştırma

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev:admin            # kökten → http://localhost:6568
```

Backend `CORS_ORIGINS` içinde `http://localhost:6568` olmalı (`.env.example` güncel).

## Admin rolü atama

Panel ve backend `GET /v1/admin/*` uçları, JWT'deki `app_metadata.role === "admin"`
claim'ine bakar. Rol yalnız Supabase tarafında atanır (kullanıcı kendi değiştiremez):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'operator@ornek.com';
```

Kullanıcı **yeniden giriş yapınca** claim token'a düşer. Rolsüz kullanıcı panelde
"Yönetici yetkisi yok" ekranını, API'de `403 {"error":"forbidden"}` görür.

## Fazlar

- ✅ Faz 1 — Login (Supabase), oturum geri yükleme, admin kapısı
- ✅ Faz 2 — Dersler: katalog × çekirdek · sahne seti · dil paketleri durum matrisi (salt okunur)
- ⏳ Faz 3 — Satır/seviye aksiyonları: çekirdek/sahne üret, yayınla, dil paketi ısıt
