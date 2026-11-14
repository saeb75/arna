CREATE TABLE "answer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"text_hash" text NOT NULL,
	"text" text NOT NULL,
	"kind" text NOT NULL,
	"corrected" text DEFAULT '' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"explanation_lang" text NOT NULL,
	"origin_kind" text NOT NULL,
	"origin_title" text DEFAULT '' NOT NULL,
	"origin_ref" text,
	"dismissed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"word" text NOT NULL,
	"translation" text NOT NULL,
	"target_lang" text NOT NULL,
	"sentence" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answer_reviews" ADD CONSTRAINT "answer_reviews_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "answer_reviews_session_text_idx" ON "answer_reviews" USING btree ("session_id","text_hash");--> statement-breakpoint
CREATE INDEX "answer_reviews_user_idx" ON "answer_reviews" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_words_user_word_idx" ON "saved_words" USING btree ("user_id","word");