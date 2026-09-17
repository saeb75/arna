import {
  activeObjectives,
  atLeastLevel,
  MIN_ACTIVE_OBJECTIVES,
  type RoleplaySpec,
} from "@glotmate/contracts";
import { isEnglishText } from "../lesson/lint.js";

/**
 * ROLEPLAY KAPISI — kayıt anında koşar, inceleme aşamasında değil.
 *
 * Külliyatta kalite üç inceleme turuyla korundu; panelden eklenen senaryolar için
 * o lüks yok. O yüzden kapı KAYDETMEYE İZİN VERMEZ. Bu modülü iki taraf çağırır:
 * `seed-roleplays.ts` (iki pilot) ve ileride admin panel — böylece panel geldiğinde
 * yalnız form yazılır, kural yeniden yazılmaz.
 *
 * HATA / UYARI AYRIMI kasten: engelleyen bir kural yanlış pozitif verdiğinde
 * güvenilirliğini yitirir (külliyatta iki kez yaşandı). Sezgisel olan her şey
 * UYARIR; yalnız kesin olan ENGELLER.
 */
export interface RoleplayLintReport {
  errors: string[];
  warnings: string[];
}

/** Dünya durumu bildiren fiiller — hedef "iletişim adımı" olmalı, sonuç değil */
const OUTCOME_VERBS = [
  "get",
  "receive",
  "obtain",
  "resolve",
  "win",
  "secure",
  "achieve",
  "succeed",
  "acquire",
];

/**
 * İngilizce alan denetimi — KÜLLİYATIN KURALINI yeniden yazmıyoruz.
 *
 * İlk sürüm kendi katı ASCII regex'ini kullanıyordu ve iki pilotu da reddetti:
 * uzun tire (—) ASCII değil, ama külliyat onu bol bol kullanıyor. `isEnglishText`
 * tam bu yüzden tipografik tırnak/tireyi hoş görüyor ve yalnız GERÇEK dil
 * sızıntısını (aksanlı harf, Kiril, CJK) yakalıyor. Aynı kural, tek yerde.
 */
function checkEnglish(label: string, value: string, errors: string[]): void {
  if (!isEnglishText(value)) errors.push(`${label}: İngilizce (ASCII) olmalı — "${value.slice(0, 40)}"`);
}

export function lintRoleplay(
  spec: RoleplaySpec,
  opts: { forbidden?: string[] } = {},
): RoleplayLintReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- Açılış turu öğrenciye devretmeli ------------------------------------
  // Sahne lint'inde aynı kural var ve C1 yazımında SEKİZ kez yakaladı: soruyla
  // bitmeyen açılış `awaiting === null` bırakıp mikrofonu kapatıyor, ders kilitlenir.
  if (!spec.opening.trim().endsWith("?")) {
    errors.push(`opening: soruyla bitmeli — turu öğrenciye devretmiyor ("${spec.opening.slice(-40)}")`);
  }

  // --- İngilizce alanlar ASCII ---------------------------------------------
  checkEnglish("title", spec.title, errors);
  checkEnglish("category", spec.category, errors);
  checkEnglish("persona.name", spec.persona.name, errors);
  checkEnglish("persona.role", spec.persona.role, errors);
  checkEnglish("persona.goal", spec.persona.goal, errors);
  checkEnglish("scene", spec.scene, errors);
  checkEnglish("opening", spec.opening, errors);
  for (const o of spec.objectives) checkEnglish(`objective "${o.id}".label`, o.label, errors);
  for (const c of spec.complications) checkEnglish(`complication "${c.id}".text`, c.text, errors);

  // --- Kimlikler benzersiz -------------------------------------------------
  const oIds = spec.objectives.map((o) => o.id);
  if (new Set(oIds).size !== oIds.length) errors.push("objectives: kimlikler benzersiz olmalı");
  const cIds = spec.complications.map((c) => c.id);
  if (new Set(cIds).size !== cIds.length) errors.push("complications: kimlikler benzersiz olmalı");

  // --- supportedFrom EN AZ İKİ aktif hedef vermeli -------------------------
  // Onaylanan sözleşmenin 4. maddesinin yayın-zamanı yarısı. Canlı açık şuydu:
  // bütün hedefleri `activeFrom: C1` olan bir senaryoya A1 kullanıcısı girince
  // aktif hedef listesi BOŞ kalıyordu. Çalışma anı `supportedFrom`'a yükseltiyor,
  // ama `supportedFrom`'un kendisi iki hedef vermiyorsa yükseltmek de kurtarmaz.
  const atSupported = activeObjectives(spec, spec.supportedFrom);
  if (atSupported.length < MIN_ACTIVE_OBJECTIVES) {
    errors.push(
      `supportedFrom "${spec.supportedFrom}" yalnız ${atSupported.length} aktif hedef veriyor — en az ${MIN_ACTIVE_OBJECTIVES} gerekli`,
    );
  }


  // recommendedFrom, supportedFrom'un altında olamaz: keşifte önerilen seviye
  // teknik tabanın altındaysa kullanıcıya "senin seviyende" diye sunulup sonra
  // yükseltilir — tutarsız.
  if (!atLeastLevel(spec.recommendedFrom, spec.supportedFrom)) {
    errors.push(
      `recommendedFrom "${spec.recommendedFrom}" supportedFrom "${spec.supportedFrom}" altında olamaz`,
    );
  }

  // --- Gizlilik: içerik PAYLAŞIMLI ----------------------------------------
  // Sızan bir değer senaryoyu açan HERKESE servis edilir; bu bir gizlilik denetimi.
  const blob = JSON.stringify(spec).toLowerCase();
  for (const value of opts.forbidden ?? []) {
    const needle = value.trim().toLowerCase();
    if (needle.length >= 3 && blob.includes(needle)) {
      errors.push(`kullanıcıya özel değer sızmış ("${value}") — içerik paylaşımlı`);
    }
  }

  // --- UYARILAR (engellemez) ----------------------------------------------

  // Hedef = iletişim adımı, dünya durumu DEĞİL. Sezgisel olduğu için UYARIR:
  // "Get the point across" meşru, "Get a table" değil — ayrımı fiil listesi
  // güvenilir biçimde yapamaz. Asıl kapı kapsama raporu ve insan onayı.
  for (const o of spec.objectives) {
    const first = o.label.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
    if (OUTCOME_VERBS.includes(first)) {
      warnings.push(
        `objective "${o.id}": "${first}" sonuç fiili — hedef dünya durumu gibi yazılmış olabilir ("${o.label}"). İletişim adımı mı? Örn. "Ask for a table"`,
      );
    }
  }

  // openingHint olmayan hedefe persona kapı açmayabilir — kapsama raporunun
  // kovaladığı hata, ama yazma anında da söylemek ucuz.
  for (const o of spec.objectives) {
    if (!o.openingHint) {
      warnings.push(`objective "${o.id}": openingHint yok — persona bu hedefe kapı açmayabilir`);
    }
  }

  // Hiçbir senaryo üst seviyede kilitli değil, o yüzden komplikasyonsuz her
  // senaryo C2'de sıkıcı kalır: "alt seviyeler işlemi alır, üst seviyeler belayı
  // alır" kararının pratik karşılığı. Koşulu seviyeye bağlamak totolojiydi.
  if (spec.complications.length === 0) {
    warnings.push("complications boş — üst seviyelerde senaryo sıkıcı kalır");
  }

  return { errors, warnings };
}
