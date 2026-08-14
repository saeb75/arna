CREATE TABLE "unit_checkpoints" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"level" text NOT NULL,
	"unit_index" integer NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"weak_lesson_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "unit_checkpoints_user_idx" ON "unit_checkpoints" USING btree ("user_id","level","unit_index");