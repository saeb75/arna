CREATE TABLE "text_translations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source_hash" text NOT NULL,
	"source_text" text NOT NULL,
	"target_lang" text NOT NULL,
	"provider" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "text_translations_key_idx" ON "text_translations" USING btree ("source_hash","target_lang","provider");