CREATE TABLE "roleplay_attempts" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"played_level" text NOT NULL,
	"active_objective_ids" jsonb NOT NULL,
	"complication_id" text,
	"objective_hits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"level_policy_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roleplay_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleplay_id" text NOT NULL,
	"revision" integer NOT NULL,
	"spec_format" integer NOT NULL,
	"spec_hash" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"spec" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roleplays" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"recommended_from" text NOT NULL,
	"supported_from" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "session_kind" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "roleplay_revision_id" uuid;--> statement-breakpoint
ALTER TABLE "roleplay_attempts" ADD CONSTRAINT "roleplay_attempts_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_revisions" ADD CONSTRAINT "roleplay_revisions_roleplay_id_roleplays_id_fk" FOREIGN KEY ("roleplay_id") REFERENCES "public"."roleplays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "roleplay_revisions_key_idx" ON "roleplay_revisions" USING btree ("roleplay_id","revision");--> statement-breakpoint
CREATE INDEX "roleplay_revisions_lookup_idx" ON "roleplay_revisions" USING btree ("roleplay_id","status");--> statement-breakpoint
CREATE INDEX "roleplays_browse_idx" ON "roleplays" USING btree ("status","category");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_roleplay_revision_id_roleplay_revisions_id_fk" FOREIGN KEY ("roleplay_revision_id") REFERENCES "public"."roleplay_revisions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Oturum türü doluysa TAM BİR bağlantı dolu olmalı.
--
-- `NOT VALID` BİLİNÇLİ: veritabanında 28 eski oturumun dört bağlantı kolonu da
-- null (322 transkript turu, 0 özet). Kısıt yeni satırları zorlar, eskileri
-- denetlemez — onlar `session_kind IS NULL` ile kapsam dışı kalır ve silinmez.
-- Silme kararı veri saklama/gizlilik politikasıyla AYRICA verilir; kısıt
-- eklemenin yan etkisi olarak verilmez.
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_kind_link_ck" CHECK (
  session_kind IS NULL
  OR (session_kind = 'lesson'   AND catalog_lesson_id IS NOT NULL AND roleplay_revision_id IS NULL)
  OR (session_kind = 'roleplay' AND roleplay_revision_id IS NOT NULL AND catalog_lesson_id IS NULL)
) NOT VALID;
