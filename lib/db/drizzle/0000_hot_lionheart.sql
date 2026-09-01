CREATE TABLE "assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"expected_return_pre" numeric(5, 2),
	"expected_return_post" numeric(5, 2),
	"monthly_contribution" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "assumptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"inflation_headline" numeric(5, 2),
	"inflation_edu" numeric(5, 2),
	"inflation_health" numeric(5, 2),
	"return_pre" numeric(5, 2),
	"return_post" numeric(5, 2),
	"life_expectancy" integer,
	"equity_allocation" numeric(5, 2) DEFAULT '70',
	"debt_allocation" numeric(5, 2) DEFAULT '30',
	"equity_return" numeric(5, 2) DEFAULT '14',
	"debt_return" numeric(5, 2) DEFAULT '8',
	"source" varchar DEFAULT 'crm',
	"post_retirement_monthly_expense" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "crm_defaults" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inflation_headline" numeric(5, 2) DEFAULT '6.0',
	"inflation_edu" numeric(5, 2) DEFAULT '8.0',
	"inflation_health" numeric(5, 2) DEFAULT '7.0',
	"return_pre" numeric(5, 2) DEFAULT '10.0',
	"return_post" numeric(5, 2) DEFAULT '7.0',
	"life_expectancy" integer DEFAULT 85,
	"tax_regime" varchar DEFAULT 'new',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount_monthly" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"name" varchar,
	"todays_cost" numeric(15, 2) NOT NULL,
	"target_month" integer,
	"target_year" integer NOT NULL,
	"inflation_category" varchar DEFAULT 'headline'
);
--> statement-breakpoint
CREATE TABLE "household_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"relation" varchar NOT NULL,
	"dob" date,
	"dependent" boolean DEFAULT false,
	"dependence_end" integer,
	"is_joint_retirement" boolean DEFAULT false,
	"retirement_age" integer
);
--> statement-breakpoint
CREATE TABLE "income_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"frequency" varchar DEFAULT 'monthly',
	"start" integer,
	"end" integer
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar NOT NULL,
	"utm" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leads_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "liabilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"name" varchar,
	"type" varchar,
	"principal_left" numeric(15, 2) NOT NULL,
	"rate" numeric(5, 2) NOT NULL,
	"emi" numeric(15, 2) NOT NULL,
	"tenure_years" integer,
	"tenure_months" integer DEFAULT 0,
	"start_date" date,
	"end_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mini_retirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" varchar NOT NULL,
	"start" integer NOT NULL,
	"months" integer NOT NULL,
	"income_during" numeric(15, 2) DEFAULT '0',
	"expense_delta_pct" numeric(5, 2) DEFAULT '0',
	"funding_order" text
);
--> statement-breakpoint
CREATE TABLE "plan_email_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"plan_snapshot" jsonb NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"consent_timestamp" timestamp with time zone,
	"source" varchar NOT NULL,
	"ip_address" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"mode" varchar NOT NULL,
	"lead_id" varchar,
	"projected_corpus" numeric(20, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"source" varchar DEFAULT 'blog',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'client',
	"plan_count" integer DEFAULT 0 NOT NULL,
	"is_premium" boolean DEFAULT false,
	"phone" varchar,
	"dob" date,
	"retirement_age" integer,
	"monthly_income" numeric(15, 2),
	"monthly_expenses" numeric(15, 2),
	"monthly_savings" numeric(15, 2),
	"income_growth_rate" numeric(5, 2),
	"current_assets" numeric(15, 2),
	"share_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "plan_email_leads_email_created_at_idx" ON "plan_email_leads" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "plan_email_leads_ip_created_at_idx" ON "plan_email_leads" USING btree ("ip_address","created_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");