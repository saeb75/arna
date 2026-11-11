CREATE TABLE "tutors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_id" text NOT NULL,
	"gender" text NOT NULL,
	"voice_provider" text NOT NULL,
	"voice_id" text NOT NULL,
	"voice_model" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "tutor_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "tutors_default_idx" ON "tutors" USING btree ("is_default") WHERE "tutors"."is_default";