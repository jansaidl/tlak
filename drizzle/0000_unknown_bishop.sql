CREATE TABLE "measurement" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"systolic" smallint NOT NULL,
	"diastolic" smallint NOT NULL,
	"pulse" smallint,
	"arm" text,
	"context" text,
	"meds_taken" boolean DEFAULT false NOT NULL,
	"lifestyle" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	"label" text,
	CONSTRAINT "passkey_credential_id_pk" PRIMARY KEY("credential_id")
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"birth_date" date,
	"sex" text,
	"height_cm" integer,
	"medication" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'Europe/Prague' NOT NULL,
	"remind_morning" boolean DEFAULT true NOT NULL,
	"remind_evening" boolean DEFAULT true NOT NULL,
	"remind_weight_weekly" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webauthn_challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"user_id" text,
	"challenge" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weight_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"weight_kg_x10" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "measurement" ADD CONSTRAINT "measurement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entry" ADD CONSTRAINT "weight_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "measurement_user_time_idx" ON "measurement" USING btree ("user_id","measured_at");--> statement-breakpoint
CREATE INDEX "passkey_user_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_endpoint_uniq" ON "push_subscription" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "weight_user_time_idx" ON "weight_entry" USING btree ("user_id","measured_at");