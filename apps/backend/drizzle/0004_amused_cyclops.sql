CREATE TABLE "catalog_lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_id" text NOT NULL,
	"level" text NOT NULL,
	"position" integer NOT NULL,
	"unit_index" integer NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"focus" text NOT NULL,
	"theme_hint" text NOT NULL,
	"target_phrases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"spec_hash" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalog_units" (
	"id" text PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"unit_index" integer NOT NULL,
	"title" text NOT NULL,
	"goal" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"catalog_lesson_id" text NOT NULL,
	"native_language" text NOT NULL,
	"track" text NOT NULL,
	"spec_hash" text NOT NULL,
	"format_version" integer NOT NULL,
	"prompt_version" text NOT NULL,
	"status" text DEFAULT 'generating' NOT NULL,
	"content" jsonb,
	"validation_report" jsonb,
	"model" text,
	"generated_for_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"user_id" uuid NOT NULL,
	"catalog_lesson_id" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"first_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_user_id_catalog_lesson_id_pk" PRIMARY KEY("user_id","catalog_lesson_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "catalog_lesson_id" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "content_id" uuid;--> statement-breakpoint
ALTER TABLE "catalog_lessons" ADD CONSTRAINT "catalog_lessons_unit_id_catalog_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."catalog_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_contents" ADD CONSTRAINT "lesson_contents_catalog_lesson_id_catalog_lessons_id_fk" FOREIGN KEY ("catalog_lesson_id") REFERENCES "public"."catalog_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_catalog_lesson_id_catalog_lessons_id_fk" FOREIGN KEY ("catalog_lesson_id") REFERENCES "public"."catalog_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_lessons_level_pos_idx" ON "catalog_lessons" USING btree ("level","position");--> statement-breakpoint
CREATE INDEX "catalog_lessons_unit_idx" ON "catalog_lessons" USING btree ("unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "catalog_units_level_idx" ON "catalog_units" USING btree ("level","unit_index");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_contents_cache_key_idx" ON "lesson_contents" USING btree ("catalog_lesson_id","native_language","track","format_version","prompt_version","spec_hash");--> statement-breakpoint
CREATE INDEX "lesson_contents_lookup_idx" ON "lesson_contents" USING btree ("catalog_lesson_id","native_language","status");--> statement-breakpoint
CREATE INDEX "lesson_progress_user_idx" ON "lesson_progress" USING btree ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_catalog_lesson_id_catalog_lessons_id_fk" FOREIGN KEY ("catalog_lesson_id") REFERENCES "public"."catalog_lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_content_id_lesson_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."lesson_contents"("id") ON DELETE set null ON UPDATE no action;