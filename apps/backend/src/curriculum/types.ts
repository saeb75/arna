import { cefrLevelSchema } from "@arna/contracts";
import { z } from "zod";

/**
 * SABİT MÜFREDAT KATALOĞU — yazım (authoring) formatı.
 *
 * Katalog kullanıcıdan, ana dilden ve track'ten BAĞIMSIZDIR:
 * - `title` / `focus` / `themeHint` kanonik İNGİLİZCE'dir. Ana dile çevrilmiş başlık
 *   katalogda durmaz; öğrenciye görünen ana-dil metni üretilen `LessonContent`ten gelir.
 *   Başlığı L1'de tutmak kataloğu tek dile çivilerdi (bkz. CLAUDE.md → Dil ilkesi).
 * - Track (business/conversation/exam) müfredatı değil, üretilen içeriğin SAHNESİNİ
 *   belirler; içerik önbellek anahtarının bir boyutudur, katalog satırının değil.
 *
 * Bu dosya yalnızca seed'in giriş şeklidir; API'ye çıkan şekiller @arna/contracts'ta.
 */

export const LESSON_KINDS = ["phrases", "grammar", "practice"] as const;
export const lessonKindSchema = z.enum(LESSON_KINDS);
export type LessonKind = z.infer<typeof lessonKindSchema>;

/**
 * Öğrencinin ders içinde BİREBİR söyleyeceği kısa kalıplar. `practice.mustUse`'a
 * verilen değer olarak geçer — bugün modelin uydurduğu ve iki kez canlı hataya yol
 * açan alan (gramer terimi yazması, tek işlev kelimesi yazması) burada denetleniyor.
 * Kural gövdesi `lesson/lint.ts` → `lintMustUse`; burada tekrar edilmez.
 */
const targetPhraseSchema = z.string().trim().min(1).max(60);

export const curriculumLessonSchema = z.object({
  /**
   * Kalıcı kimlik. Verilmezse başlıktan türetilir ("a1-she-works-at-night").
   * İlerleme ve içerik önbelleği bu kimliğe bağlı olduğu için BAŞLIK DEĞİŞİRSE
   * türetilmiş kimlik de değişir ve bağ kopar — başlığı sonradan düzeltirken
   * eski kimliği buraya elle yazıp bağı koru.
   */
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(80)
    .optional(),
  /** Seviye içinde 1'den başlayan kesintisiz sıra */
  position: z.number().int().min(1),
  /** Bağlı olduğu ünitenin `index`'i */
  unitIndex: z.number().int().min(1),
  kind: lessonKindSchema,
  /** Kanonik İngilizce başlık — öğrenciye de bu görünür ("She Works at Night") */
  title: z.string().trim().min(1).max(80),
  /** Öğretilecek TEK şey; lesson-gen'in sadakat çıpası ve önbellek anahtarının parçası */
  focus: z.string().trim().min(1).max(160),
  /** Nötr, İngilizce durum bağlamı — kişiselleştirme DEĞİL, sahne ipucu */
  themeHint: z.string().trim().min(1).max(160),
  targetPhrases: z.array(targetPhraseSchema).min(1).max(5),
});
export type CurriculumLesson = z.infer<typeof curriculumLessonSchema>;

export const curriculumUnitSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().trim().min(1).max(80),
  /** Ünite sonunda öğrencinin yapabilecek olduğu şey (can-do, İngilizce) */
  goal: z.string().trim().min(1).max(200),
});
export type CurriculumUnit = z.infer<typeof curriculumUnitSchema>;

export const curriculumLevelSchema = z.object({
  level: cefrLevelSchema,
  /** Kullanıcıya görünen basamak adı: Beginner, Pre-Intermediate, … */
  label: z.string().trim().min(1).max(40),
  units: z.array(curriculumUnitSchema).min(1),
  lessons: z.array(curriculumLessonSchema).min(1),
});
export type CurriculumLevel = z.infer<typeof curriculumLevelSchema>;
