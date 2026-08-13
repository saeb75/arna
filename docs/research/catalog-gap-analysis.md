# Katalog Boşluk Analizi — Rakip (380 ders) ↔ Arna (371 ders)

*13 Ağu 2026 · Kaynak: rakip uygulamanın 3 ekran kaydından çıkarılan tam liste (6 seviye, 380 ders) ↔ `src/curriculum/*.ts`. Karar bağlamı: B1 donmuş (yayınlı + incelenmiş + paketli); diğer seviyeler yalnız katalog satırı olduğundan değişiklik bedava. Yön: pedagojik yapı korunur, konular ilgi çekici, kategori öğrenciye görünmez.*

## Özet karar önerisi

Mevcut dersler **değişmez**; ~24 **ekleme** yapılır (371 → ~395). Eklemeler iki sınıf:
**(A) gerçek pedagojik boşluklar** — rakip karşılaştırması olmasa da eklenmesi gerekenler;
**(B) ilgi çekicilik eklemeleri** — durumsal/tema dersleri ve fonksiyon serileri.

---

## A. Gerçek pedagojik boşluklar (öncelikli — 8 ders)

| # | Konu | Önerilen başlık | Seviye/yer | Not |
|---|------|-----------------|------------|-----|
| 1 | **Present continuous (şimdi)** | "What Are You Doing?" | **A1 sonu** | ⚠️ SIRALAMA HATASI: A2'de "I'm Meeting Sam at Six" PC'yi GELECEK için kullanıyor ama PC'nin kendisi hiçbir seviyede öğretilmiyor. Bu rakipten bağımsız, düzeltilmesi şart. |
| 2 | Dönüşlü zamirler + each other | "Don't Burn Yourself" | A2 (People and Things ünitesi) | myself/yourself + each other tek derste |
| 3 | other / another | "The Other One" | A2 (People and Things) | klasik karışıklık, bizde hiç yok |
| 4 | Öneri kalıpları | "How About This?" | A2 (Rules and Advice) | why don't we / how about / shall we — fonksiyonel temel |
| 5 | Gelecek zaman yan cümleleri | "As Soon As I Arrive" | A2 (Reasons and Conditions) | as soon as / until / when + present |
| 6 | -ed / -ing sıfatları | "Boring or Bored?" | **A2 sonu** | klasik A2/B1 konusu, bizde hiç yok; B1 donmuş olduğu için A2'ye |
| 7 | Aşırı sıfatlar | "Absolutely Freezing!" | A2 (Comparing) | freezing/boiling/huge/tiny + very yasağı |
| 8 | Eğilim/grafik dili | "On the Rise" | B2 (Discussing Real Issues) | rise/fall/remain steady — work+exam track değeri |

## B. İlgi çekicilik eklemeleri (~16 ders)

**A1 (+5) — durumsal doz artışı** (A1 %59 gramer → eklemelerle ~%52'ye iner, ritim kuralı bozulmaz):
- "Lost & Found" (practice — kayıp eşya tarifi; there is/are + sıfatlar tekrarı)
- "At the Market" (phrases — yiyecek sözlüğü + miktar; rakipteki "Fruits"in genişi)
- "What Should I Wear?" (phrases — kıyafet sözlüğü + hava bağlamı)
- "Let's Go Out" (phrases — basit davet/kabul/ret)
- "Show Me a Photo" (practice — telefondaki fotoğrafı tarif etme; aile+mekan+renk tekrarı)

**A2 (+3) — seri deseni başlangıcı:**
- "Shopping II" (practice — iade + beden değişimi senaryosu; A1 Shopping I'in devamı)
- "Requests II" (practice — komşudan/iş arkadaşından rica senaryoları; Would You Mind'ın uygulaması)
- "Two Photos, One Story" (practice — rakipteki "Special Photos"; karşılaştırma + geçmiş anlatımı tekrarı)

**B2 (+3) — saf sohbet dersleri** (rakipte Social Media/Eating Well/Technology B1-B2'de tema dersi):
- "Scrolling Too Much?" (practice — sosyal medya alışkanlıkları)
- "What's for Dinner?" (practice — yemek kültürü/beslenme sohbeti)
- "Love It or Hate It: Tech" (practice — teknolojiyle ilişki)

**C1 (+2) / C2 (+3) — pop-sosyal konular** (bizim C katmanı rakipten daha resmi/profesyonel; sosyal denge için):
- C1: "Pet Peeves" (küçük sinir bozucular — complaint dili zarif kullanım), "Overhyped or Worth It?" (abartılmış mekan/film değerlendirme)
- C2: "Guilty Pleasures", "Commuting Stories", "City vs. Small Town"

**B1: sıfır dokunuş.** (İleride istenirse 69+ pozisyonuna ekleme yapılabilir; mevcut 68 ders ve paketleri etkilenmez.)

## Kapsama özeti (neden yeniden yazım YOK)

| Rakip seviyesi | Bizde birebir/yakın | Bizde başka seviyede | Salt tema (bizde sahne dekoru) | Gerçek boşluk |
|---|---|---|---|---|
| Beginner (41) | ~29 | ~4 (A2'de) | ~3 | ~5 |
| Pre-Int (65) | ~42 | ~6 | ~6 | ~11 |
| Intermediate (69) | ~40 | ~7 | ~8 | ~12 → çoğu B2/A2'ye eklendi |
| Upper-Int (75) | ~60 | ~6 | ~6 | ~3 |
| Advanced (65) | ~55 | — | ~7 | ~2 |
| Proficient (65) | ~50 | — | ~10 | ~5 (pop-sosyal) |

C katmanında bizim katalog rakipten **daha zengin** (onların Advanced'i "By the Way...", "Me Too!" gibi tek-kalıp dersleriyle dolu; bizde bunlar B2'de yapı dersi). Boşluk yönü tek: sosyal/pop konu çeşitliliği.

## Yeni ders yazım ilkeleri (bundan sonra geçerli)

1. **Başlıkta meta-dil yasak.** "Reflexive Pronouns" değil "Don't Burn Yourself". Gramer adı yalnız `focus` alanında (öğrenci görmez).
2. **Durum/duygu önce:** başlık bir sahneyi ya da söyleyeceğin cümleyi çağrıştırır.
3. **Fonksiyon serileri** Roma rakamıyla devam eder (Shopping II, Requests II) — aralıklı tekrar.
4. **Tema dersleri `practice` tipindedir** ve mevcut yapıların uygulaması olarak yazılır — yeni gramer iddiası taşımaz.
5. Tip dağılımı ve "art arda ≤4 gramer" ritmi lint'te denetlenmeye devam eder; eklemeler A1-A2'de gramer payını düşürür (bilinçli).

## Uygulama sırası (onay sonrası)

1. Katalog satırları: A1 +6, A2 +11, B2 +4, C1 +2, C2 +3 → `lint-curriculum` → `seed-curriculum`
2. Çekirdek yazımı Claude elle (LLM'siz), B1 inceleme derslerinden çıkan kontrol listesiyle; `review-dump` → insan incelemesi → yayın — mevcut süreç aynen
3. Ünite yerleşimi: mevcut ünitelere dağıtım yukarıdaki tabloda; ünite yapısı iç iskelet olarak kalır (öğrenci görmez)
