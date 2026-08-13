CREATE TABLE "lesson_cores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"catalog_lesson_id" text NOT NULL,
	"core_format" integer NOT NULL,
	"prompt_version" text NOT NULL,
	"spec_hash" text NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"core" jsonb,
	"validation_report" jsonb,
	"model" text,
	"generated_for_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_locales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"core_id" uuid NOT NULL,
	"scene_set_id" uuid NOT NULL,
	"language" text NOT NULL,
	"l10n_format" integer NOT NULL,
	"prompt_version" text NOT NULL,
	"source_hash" text NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"pack" jsonb,
	"validation_report" jsonb,
	"model" text,
	"generated_for_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_scene_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"core_id" uuid NOT NULL,
	"scene_format" integer NOT NULL,
	"prompt_version" text NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"scenes" jsonb,
	"validation_report" jsonb,
	"model" text,
	"generated_for_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "core_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "scene_set_id" uuid;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "locale_id" uuid;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "tutor_language" text DEFAULT 'native' NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_cores" ADD CONSTRAINT "lesson_cores_catalog_lesson_id_catalog_lessons_id_fk" FOREIGN KEY ("catalog_lesson_id") REFERENCES "public"."catalog_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_locales" ADD CONSTRAINT "lesson_locales_core_id_lesson_cores_id_fk" FOREIGN KEY ("core_id") REFERENCES "public"."lesson_cores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_locales" ADD CONSTRAINT "lesson_locales_scene_set_id_lesson_scene_sets_id_fk" FOREIGN KEY ("scene_set_id") REFERENCES "public"."lesson_scene_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_scene_sets" ADD CONSTRAINT "lesson_scene_sets_core_id_lesson_cores_id_fk" FOREIGN KEY ("core_id") REFERENCES "public"."lesson_cores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_cores_key_idx" ON "lesson_cores" USING btree ("catalog_lesson_id","core_format","prompt_version","spec_hash");--> statement-breakpoint
CREATE INDEX "lesson_cores_lookup_idx" ON "lesson_cores" USING btree ("catalog_lesson_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_locales_key_idx" ON "lesson_locales" USING btree ("core_id","scene_set_id","language","l10n_format","prompt_version","source_hash");--> statement-breakpoint
CREATE INDEX "lesson_locales_lookup_idx" ON "lesson_locales" USING btree ("core_id","language","status");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_scene_sets_key_idx" ON "lesson_scene_sets" USING btree ("core_id","scene_format","prompt_version");--> statement-breakpoint
CREATE INDEX "lesson_scene_sets_lookup_idx" ON "lesson_scene_sets" USING btree ("core_id","status");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_core_id_lesson_cores_id_fk" FOREIGN KEY ("core_id") REFERENCES "public"."lesson_cores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_scene_set_id_lesson_scene_sets_id_fk" FOREIGN KEY ("scene_set_id") REFERENCES "public"."lesson_scene_sets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_locale_id_lesson_locales_id_fk" FOREIGN KEY ("locale_id") REFERENCES "public"."lesson_locales"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
-- Track değerleri yeni sözlüğe eşlenir (conversation→everyday, business→work).
-- Yalnızca kullanıcı profilleri: lesson_contents v6 satırları zaten emekli,
-- onları taşımıyoruz (yeni katmanlar sıfırdan üretilecek).
UPDATE "user_profiles" SET "track" = 'everyday' WHERE "track" = 'conversation';
--> statement-breakpoint
UPDATE "user_profiles" SET "track" = 'work' WHERE "track" = 'business';
