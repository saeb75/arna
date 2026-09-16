ALTER TABLE "sessions" ADD COLUMN "position" jsonb;--> statement-breakpoint
ALTER TABLE "transcript_turns" ADD COLUMN "source" text DEFAULT 'chat' NOT NULL;--> statement-breakpoint
ALTER TABLE "transcript_turns" ADD COLUMN "runs" jsonb;--> statement-breakpoint
CREATE INDEX "sessions_open_lookup_idx" ON "sessions" USING btree ("user_id","catalog_lesson_id") WHERE ended_at IS NULL;--> statement-breakpoint
-- Admin filtreleri için backfill: catalog bağlantısı olan eski ders oturumlarına
-- tür etiketi. 28 karantina oturumu (dört bağlantı da NULL) bilerek NULL kalır.
UPDATE "sessions" SET "session_kind" = 'lesson' WHERE "session_kind" IS NULL AND "catalog_lesson_id" IS NOT NULL;
