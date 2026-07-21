-- Idempotent migration script — safe to run multiple times.
-- Applied by post-merge.sh via psql instead of drizzle-kit push
-- (drizzle-kit push requires an interactive TTY in CI environments).

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- users
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar UNIQUE,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  role varchar DEFAULT 'client',
  plan_count integer NOT NULL DEFAULT 0,
  is_premium boolean DEFAULT false,
  phone varchar,
  dob date,
  retirement_age integer,
  monthly_income numeric(15,2),
  monthly_expenses numeric(15,2),
  monthly_savings numeric(15,2),
  income_growth_rate numeric(5,2),
  current_assets numeric(15,2),
  share_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- scenarios
CREATE TABLE IF NOT EXISTS scenarios (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar NOT NULL,
  name varchar NOT NULL,
  mode varchar NOT NULL,
  lead_id varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- assumptions
CREATE TABLE IF NOT EXISTS assumptions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  inflation_headline numeric(5,2),
  inflation_edu numeric(5,2),
  inflation_health numeric(5,2),
  return_pre numeric(5,2),
  return_post numeric(5,2),
  life_expectancy integer,
  equity_allocation numeric(5,2) DEFAULT 70,
  debt_allocation numeric(5,2) DEFAULT 30,
  equity_return numeric(5,2) DEFAULT 14,
  debt_return numeric(5,2) DEFAULT 8,
  source varchar DEFAULT 'crm'
);

-- household_members
CREATE TABLE IF NOT EXISTS household_members (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  name varchar NOT NULL,
  relation varchar NOT NULL,
  dob date,
  dependent boolean DEFAULT false,
  dependence_end integer,
  is_joint_retirement boolean DEFAULT false,
  retirement_age integer
);

-- income_items
CREATE TABLE IF NOT EXISTS income_items (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  type varchar NOT NULL,
  amount numeric(15,2) NOT NULL,
  frequency varchar DEFAULT 'monthly',
  start integer,
  "end" integer
);

-- expense_items
CREATE TABLE IF NOT EXISTS expense_items (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  type varchar NOT NULL,
  amount_monthly numeric(15,2) NOT NULL
);

-- goals
CREATE TABLE IF NOT EXISTS goals (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  kind varchar NOT NULL,
  name varchar,
  todays_cost numeric(15,2) NOT NULL,
  target_month integer,
  target_year integer NOT NULL,
  inflation_category varchar DEFAULT 'headline'
);

-- assets
CREATE TABLE IF NOT EXISTS assets (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  kind varchar NOT NULL,
  value numeric(15,2) NOT NULL,
  expected_return_pre numeric(5,2),
  expected_return_post numeric(5,2)
);

-- liabilities
CREATE TABLE IF NOT EXISTS liabilities (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  name varchar,
  type varchar,
  principal_left numeric(15,2) NOT NULL,
  rate numeric(5,2) NOT NULL,
  emi numeric(15,2) NOT NULL,
  tenure_years integer,
  tenure_months integer DEFAULT 0,
  start_date date,
  end_date date NOT NULL
);

-- mini_retirements
CREATE TABLE IF NOT EXISTS mini_retirements (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar NOT NULL,
  start integer NOT NULL,
  months integer NOT NULL,
  income_during numeric(15,2) DEFAULT 0,
  expense_delta_pct numeric(5,2) DEFAULT 0,
  funding_order text
);

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id varchar,
  name varchar NOT NULL,
  email varchar,
  phone varchar NOT NULL,
  utm jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
-- Unique constraint on leads.phone (idempotent)
DO $$ BEGIN
  ALTER TABLE leads ADD CONSTRAINT leads_phone_unique UNIQUE (phone);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar UNIQUE NOT NULL,
  source varchar DEFAULT 'blog',
  created_at timestamp DEFAULT now()
);

-- crm_defaults
CREATE TABLE IF NOT EXISTS crm_defaults (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  inflation_headline numeric(5,2) DEFAULT 6.0,
  inflation_edu numeric(5,2) DEFAULT 8.0,
  inflation_health numeric(5,2) DEFAULT 7.0,
  return_pre numeric(5,2) DEFAULT 10.0,
  return_post numeric(5,2) DEFAULT 7.0,
  life_expectancy integer DEFAULT 85,
  tax_regime varchar DEFAULT 'new',
  updated_at timestamp DEFAULT now()
);
