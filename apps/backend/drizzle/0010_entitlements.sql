CREATE TABLE "user_entitlements" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"rc_active" boolean DEFAULT false NOT NULL,
	"rc_product_id" text,
	"rc_expires_at" timestamp with time zone,
	"admin_grant_until" timestamp with time zone,
	"checked_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;