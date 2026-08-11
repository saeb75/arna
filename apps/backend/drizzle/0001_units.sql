ALTER TABLE "program_lessons" ALTER COLUMN "vocab_theme" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "program_lessons" ADD COLUMN "unit_index" integer;--> statement-breakpoint
ALTER TABLE "program_lessons" ADD COLUMN "unit_title" text;--> statement-breakpoint
ALTER TABLE "program_lessons" ADD COLUMN "kind" text;