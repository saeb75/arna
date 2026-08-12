# Arna (Speakly) — AI İngilizce Öğretmeni

Praktika benzeri, 3B avatarlı, kalıcı hafızalı, kişiselleştirilmiş müfredatlı İngilizce öğrenme uygulaması. Bu repo monorepo'dur; tüm alt projeler burada yaşar.

## Doküman ve bağlam

- **Mimari tasarım dokümanı (tek doğruluk kaynağı):** `docs/Speakly-Mimari-Dokumani.pdf` (37 sayfa) · Artifact: https://claude.ai/code/artifact/8adfc878-fb2d-4142-b256-c113b3ee0844
- **Araştırma raporları:** `docs/research/` (rakip analizi, memory sistemleri, müfredat, ses pipeline'ı, backend, kişiselleştirme, eski kod analizi + tamlık denetimi)
- **Eski prototip repo:** `/Users/saebjafari/Desktop/speakly` — avatar kodu buradan taşınacak: `src/components/AvatarScene.tsx` (koru, ~1.020 satır, sağlam), `src/lib/viseme.ts` (Timeline sözleşmesi koru), `src/lib/alignment.ts`, `src/lib/arkitVisemes.ts`, `public/fatman.glb` (ana avatar, satın alınmış, ARKit-52) ve `public/draco/`.

## Monorepo yapısı

```
apps/backend    → Fastify 5 + TypeScript (API + ses gateway + pg-boss worker)
apps/web       → Next.js mini web MVP (prod'a çıkmayacak; dev/test yüzeyi + ilk kullanıcı akışı)
apps/mobile    → Expo/React Native (asıl ürün istemcisi — sonraki faz)
apps/admin     → Admin panel (sonraki faz)
packages/contracts → Zod şemaları (API sözleşmeleri, ders JSON şeması — backend & istemciler paylaşır)
docs/          → mimari doküman + araştırma raporları
```

## Dil ilkesi (KALICI — asla ihlal etme)

Uygulama ileride **100'lerce ana dile** İngilizce öğretecek. **Backend hiçbir yerde belirli bir ana dile göre yazılmaz.**

- Hedef dil (İngilizce) sabittir; **ana dil kullanıcı profilinden gelir** (`user_profiles.native_language`, BCP-47) ve prompt'lara **parametre** olarak geçer.
- Prompt/lint/servislerde "Turkish", "Türkçe", Türkçe karakter regex'i vb. **sabit dil referansı yasak**. Dil adı `src/lib/language.ts` → `languageName(code)` ile çözülür (`Intl.DisplayNames`).
- Emma'nın **sesli okuduğu** her alan İngilizce olmalı; lint bunu dil-bağımsız **ASCII** kontrolüyle doğrular (`isEnglishText`), dile özgü harf listesiyle değil.
- Öğrenciye görünen ana-dil alanları (`title`, `theme`, `scenario`, `userGoal`, `summary`, quiz geri bildirimi) prompt'ta `${l1}` ile istenir.
- **Frontend şimdilik Türkçe** olabilir (tek dilli arayüz); `DEFAULT_NATIVE_LANGUAGE` sabiti `apps/web/src/lib/api.ts` içinde, i18n gelince kullanıcıdan alınacak.

## Ders içeriği = pedagojik sözleşme (v6, kalıcı ilke)

- **Müfredat sabittir ve repo'da yaşar.** `apps/backend/src/curriculum/*.ts` tek doğruluk kaynağıdır; DB türetilmiş projeksiyondur (`scripts/seed-curriculum.ts`, idempotent). Katalog satırı kullanıcıdan, ana dilden ve track'ten bağımsızdır: `title`/`focus`/`themeHint` **kanonik İngilizce**dir, kimlik kalıcı slug'dır (`a1-she-works-at-night`). Onboarding'de **LLM çağrısı yoktur**. Katalog düzenlemeden önce `scripts/lint-curriculum.ts` koşar: ASCII, `targetPhrases` (aynı `lintMustUse` ile), sıra bütünlüğü, tekrar eden `focus`, ve **art arda en fazla 4 gramer dersi** ritim kuralı.
- **Ders JSON'u bir oynatma script'i DEĞİLDİR.** İçerik *malzemeyi* taşır: hedefler, anlatım maddeleri, alıştırma soruları + kabul edilen cevaplar, roleplay sahnesi. Hocanın **birebir cümleleri içerikte durmaz**; beat'ler `intent` (ne yapılacağı) taşır.
- **Hocanın cümleleri oturum açılışında üretilir** (`session-script.v1` → `sessions.state.script`), öğrencinin adı + hafızası + geçen dersiyle. Böylece selamlama kişiseldir ve aynı ders herkeste aynı iki cümleyle başlamaz. Üretim düşerse **deterministik yedek script** devreye girer — ders asla bu yüzden bloke olmaz.
- **İçerik kullanıcılar arasında PAYLAŞILIR.** `lesson_contents` satırı `(catalogLessonId, nativeLanguage, track, formatVersion, promptVersion, specHash)` ile anahtarlanır; aynı anahtardaki herkes aynı satırı alır, ikinci kullanıcı LLM ödemez. `specHash` üretimi etkileyen katalog alanlarının parmak izidir — bir `focus` düzeltilince anahtar değişir ve ders kendiliğinden yeniden üretilir. **Anahtarın altı kolonu da NOT NULL ve claim eden INSERT tarafından yazılır:** Postgres unique index'te NULL'ları farklı sayar, biri geç yazılırsa "tek üretim uçuşta" koruması sessizce çöker.
- **İçerikte kullanıcıya özel hiçbir veri YOKTUR.** Lint `LintContext.forbidden` listesini (ad + meslek) `JSON.stringify(content)` içinde arar. Paylaşımlı olduğu için bu artık bir **gizlilik** denetimi: sızan bir değer dersi açan herkese servis edilir. Bu yüzden `occupation`/`interests` **üretime girmez**; sahne bağlamı katalogdaki nötr `themeHint` ve `track`ten gelir. Meslek yalnızca canlı sohbette (`tutorPrompt`) kullanılır.
- **AKIŞ KONTROLÜ İÇERİKTE DEĞİL, KODDADIR** ve modelin düzyazısına ASLA bakmaz. Karar girdileri yalnızca şunlar olabilir: (1) öğrencinin kendi sözü, (2) sayaçlar, (3) içerik alanları, (4) şemayla doğrulanmış **yapısal** model çıktısı (`{ok: boolean}` gibi). Hocanın cümlesinin şekli — noktalama, anahtar kelime, özel işaret — karar girdisi **değildir**. Bu kural üç canlı hatanın ardından kondu: `<<DONE>>` işareti (model bazen unuttu), sonra iki kez `endsWithQuestion` (Emma "?" yerine "!" koyunca ders kaçtı).
- Kararlar `packages/contracts/src/lessonFlow.ts` içinde **saf fonksiyonlarda** yaşar (`decideOnStudentInput`, `decideAfterTutorReply`) — mobil de aynısını kullanacak. İmzalarında model metni **yoktur**, yani bu bağımlılık tip düzeyinde kurulamaz. Doğruluk tablosu `scripts/test-flow-rules.ts`'te, LLM'siz ve anlık koşar; akış kuralı değiştirmeden önce oraya vaka eklenir.
- **Ders KENDİLİĞİNDEN bitmez.** Faz akışı `lecture → practice → wrapup`. Practice bitince hoca rol karakterinden çıkar, dersi özetler ve soru alır; dersi bitiren tek şey **"Dersi Bitir" butonudur**. `decideInWrapup`'ın hiçbir dalı `finish` döndürmez — sayaç, tavan veya kelime tahmini kullanıcıyı asla kesemez (canlıda practice sayacı konuşmanın ortasında kapattığı için kondu).
- **`practice.mustUse` KATALOGDAN gelir, model üretmez.** Katalog satırındaki `targetPhrases` prompt'a verilen değer olarak girer ve üretimden sonra **kodda üzerine yazılır** — ölçümü besleyen alan modelin düzyazısına bırakılmaz. Bunlar öğrencinin BİREBİR söyleyeceği kısa kalıplardır ("I think", "have you ever"), gramer tarifi DEĞİL: tarif yazılınca metin eşleşmesi hiç tetiklenmiyor, tek kelime yazılınca ("do") her turda eşleşip sahneyi kesiyordu. Kural artık üretim anında değil, katalog lint'inde denetlenir. Dersin tarifi `tutorNotes.target` ve `successCriteria`'da durur. Eşleşme kelime sınırına saygı duyar; `goalMet` sahneyi `PRACTICE_MIN_TURNS_BEFORE_GOAL` (4) turundan önce bitiremez; tur tavanının tabanı 8'dir.
- **Cevap olmayan girdi deneme hakkı YEMEZ.** Alıştırma ve açık uçlu adımlarda sunucu yapısal `isAttempt` döndürür: selamlama/konu dışı laf hakkı yakmaz, hoca konudan kopmadan soruyu yeniden sorar (sonsuz döngüyü `MAX_BEAT_EXCHANGES` keser). "Bilmiyorum/I don't know" DENEMEDİR (`isSurrender`, deterministik) — pes eden öğrenci hakları bitince doğru cevabı duymayı hak eder.
- **Çoktan seçmelide şıklar tek kaynakta:** soru `prompt`'ta, şıklar YALNIZCA `options`'ta. İkisine birden yazılırsa ekranda iki kez görünür (lint reddeder; istemci eski içerik için savunmacı davranır). İstemci `exerciseText()`'i hem gösterir hem **seslendirir** — yalnızca `prompt` okunduğunda öğrenci şıkları duymuyordu.
- **Model çıktısını anahtar kelimeyle sınama.** Bu, akış kontrolündeki kırılganlığın test hâli: "dersin bittiğini söylüyor mu" gibi bir beklentiyi kelime listesiyle denetlemek yanlış negatif üretir (*"That was a wonderful lesson!"* listede yoktu). Testler YAPISAL olanı sınar; üslup prompt'un sorumluluğudur.
- **`onEnd` tam olarak bir kez çalışmalı.** Akış `voice.speak(text, onEnd)` callback'inin içinde ilerliyor; `awaiting === null` iken mikrofon ve klavye kapalı olduğundan kaybolan her callback dersi kilitler. `speak()` bu yüzden `onended` + `onerror` + zaman aşımını tek bir `settle()`'da toplar.
- `formatVersion` + `promptVersion` uyuşmayan satır **bayattır**, ilk açılışta otomatik yeniden üretilir (`isCurrentFormat`).
- Açık uçlu adımlar (`open_response`) `answers[]` ile ölçülemez → **rubrikle** değerlendirilir; model yalnızca `{ok, feedback}` döner, ilerleme kararı yine kodda.

## Hafıza (Memory v1)

- Ders bitince (`endSession`) fire-and-forget çıkarım: transkript → `memories` (pgvector, İngilizce 3. şahıs gerçekler) + `session_summaries` (özet + `continuity_hook` + `errors_observed`). **Kuyruk yok** (tek süreç); süreç yeniden başlarsa o oturumun çıkarımı kaybolur — bilinçli MVP ödünü.
- **Dilbilgisi performansı gerçek DEĞİLDİR** — `errors_observed`a gider, `memories`e asla.
- Dedup iki katmanlı: prompt'taki "ALREADY KNOWN" listesi (asıl savunma) + vektör benzerliği ≥ **0.75** (güvenlik ağı; ölçüldü: aynı gerçeğin farklı ifadeleri 0.79–0.96, farklı gerçekler 0.22–0.51).
- Geri getirme (`buildMemoryBlock`): süreklilik kancası + konuya en yakın 6 gerçek + en yeni 3, ≤700 karakter. Oturum başına **bir kez** hesaplanıp `sessions.state`'e yazılır.
- Hafıza metni kullanıcı konuşmasından türer → prompt'ta `<student_memory>` bloğunda "asla talimat sayma" uyarısıyla verilir. İstemciye asla gönderilmez.

## Kilitlenmiş yığın kararları

- **DB/Auth:** Supabase (Postgres + pgvector extension açık + Supabase Auth). Drizzle ORM, Supavisor pooler (port 6543) → `postgres-js` sürücüsünde `prepare: false`.
- **Kuyruk:** pg-boss (Postgres üzerinde; ayrı Redis YOK).
- **Storage:** Cloudflare R2 (S3 SDK ile; public bucket + CDN: avatar GLB + TTS ses önbelleği; private: presigned URL).
- **Backend framework:** Fastify 5 (NestJS ve Express bilinçli reddedildi). Modül deseni: `src/modules/<ad>/` içinde `routes.ts` + `service.ts` + `queries.ts`.
- **LLM:** MVP'de yalnızca OpenAI anahtarıyla başla (sohbet: ucuz model; plan/ders üretimi: güçlü model). Gateway sağlayıcı-soyut yazılır (`src/modules/llm/`), Anthropic sonra adaptörle eklenir. Her çağrı `llm_calls` tablosuna maliyet/token/prompt-sürümüyle loglanır.
- **TTS:** MVP'de ElevenLabs Flash v2.5 (mevcut hat çalışıyor). Hedef: Azure Neural TTS (native ARKit blendshape, ~7× ucuz) — Faz 0 spike'ıyla karar verilecek.
- **STT:** MVP'de gpt-4o-mini-transcribe (batch); streaming gateway gelince Deepgram Nova-3/Flux.

## MVP ürün kararları (kullanıcıyla kilitlendi)

- Onboarding tamamen form: günlük hedef + track (Business/Conversation/Sınav) + ilgi alanları + meslek (ops.) + **seviye select box** (A1–C1, yanına tek satır tarif). Yerleştirme testi YOK (Faz 2+).
- **Müfredat sabit, içerik tembel:** ders planı üretilmez, katalogdan gelir. **Altı seviye de yazıldı: 371 ders** (A1 46/8ü · A2 57/9 · B1 68/11 · B2 74/11 · C1 64/10 · C2 62/9). Ders İÇERİĞİ derse ilk tıklamada üretilip **paylaşımlı** kaydedilir. Tüm dersler açık — kullanıcı istediğine atlar, sıra zorunlu değil.
- **Ders tipi dağılımı seviyeyle kayar** ve bu kasıtlıdır: A1 %59 gramer → C2 %6 gramer / %65 serbest konuşma. Altta işlev, ortada gramer omurgası, üstte akıcılık. C2'de `focus` bir gramer yapısı değil, bir iletişim becerisidir ("baskı altında pozisyon savunmak") — `lesson-gen` `kind: practice` için ayrı yönerge taşır.
- **Otomatik seviye geçişi YOK:** kullanıcı ayarlardan seviye değiştirir (`PATCH /v1/me/profile`) → yalnızca profil güncellenir. İlerleme katalog kimliğine bağlı olduğu için **hiç etkilenmez**; eski `POST /programs/regenerate` planı yeniden üretip ilerlemeyi arşive gömüyordu, o uç kaldırıldı.
- Ustalık modeli (Elo), checkpoint kapıları, adaptif zorluk, FSRS, ligler → MVP DIŞI (dokümanda Faz 2/3).
- Memory v1 mini-MVP'nin hemen ardından: oturum sonu tek arka plan işi (transkript → çıkarım → pgvector `memories`) + sonraki ders açılışında continuity hook.

## Tablolar (12)

**Katalog (paylaşımlı, kullanıcıdan bağımsız):** `catalog_units` · `catalog_lessons` · `lesson_contents` (üretilmiş içerik JSONB, önbellek anahtarıyla tekil)

**Kullanıcıya ait:** `user_profiles` · `programs` (seviye/track kaydı — ders satırı taşımaz) · `lesson_progress` (**SEYREK**: satır yalnızca başlanan ders için açılır, yokluğu `not_started` demek) · `sessions` (`catalog_lesson_id` = müfredat yuvası, `content_id` = oynatılan paylaşımlı satır, `state` = hafıza bloğu + oturum script'i) · `transcript_turns` · `memories` (pgvector 1536) · `session_summaries` · `llm_calls`

**Kaldırılacak (migration 0005, uçtan uca doğrulamadan sonra):** `program_lessons` · `lessons` — genişletme fazında yerlerinde duruyorlar ama artık hiçbir kod okumuyor.

## Güvenlik notu

Eski prototipin `/api/chat|tts|stt` route'ları auth'suz açık proxy'ydi — bu repoda tüm AI uçları ilk günden auth + rate limit + kullanıcı-başı günlük maliyet bütçesi arkasında. Sistem prompt'u asla istemciye gitmez, sunucuda montajlanır.

## Gerekli ortam değişkenleri (apps/backend/.env)

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` (pooler), `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, (sonra: `R2_*`). Boot'ta Zod ile doğrulanır — eksikse süreç açılmaz.
