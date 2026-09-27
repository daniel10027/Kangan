-- Kangan Finance — schéma initial
-- Cahier des charges v1.0, section 13 (Modèle de données).
-- Quatorze tables PostgreSQL ; tous les montants sont stockés en entiers
-- de F CFA (bigint), jamais en décimales.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Types énumérés
-- ---------------------------------------------------------------------------

create type user_role as enum (
  'parent',
  'contributeur',
  'ecole_admin',
  'ecole_comptable',
  'kangan_agent',
  'kangan_super_admin'
);

create type school_member_role as enum ('admin', 'comptable', 'lecture_seule');

create type school_cycle as enum (
  'maternelle',
  'primaire',
  'secondaire',
  'superieur',
  'formation_professionnelle'
);

create type school_status as enum ('en_attente_kyb', 'actif', 'suspendu');

create type savings_goal_type as enum ('inscription', 'inscription_partielle', 'totalite');

create type plan_frequency as enum ('jour', 'semaine', 'mois');

create type savings_box_status as enum (
  'brouillon',
  'en_attente',
  'active',
  'completee',
  'reversee',
  'suspendue',
  'remboursee'
);

create type transaction_type as enum ('deposit', 'payment', 'contribution', 'payout', 'refund', 'reversal');

create type transaction_status as enum ('initiee', 'reussie', 'echouee', 'annulee');

create type payment_operator as enum ('moov_money', 'mtn_money', 'orange_money', 'wave', 'card');

create type ledger_account as enum ('caisse', 'sequestre', 'ecole', 'kangan_commission', 'operateur_frais');

create type payout_status as enum ('demande', 'en_cours', 'execute', 'echoue');

create type notification_channel as enum ('push', 'sms', 'whatsapp');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null unique,
  full_name text not null,
  commune text,
  kyc_level smallint not null default 1 check (kyc_level in (1, 2, 3)),
  role user_role not null default 'parent',
  language text not null default 'fr' check (language in ('fr', 'dioula', 'baoule')),
  pin_hash text,
  failed_pin_attempts smallint not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null check (type in ('prive', 'public', 'confessionnel')),
  cycles school_cycle[] not null default '{}',
  commune text not null,
  city text not null default 'Abidjan',
  address text,
  lat double precision,
  lng double precision,
  logo_url text,
  status school_status not null default 'en_attente_kyb',
  rccm text,
  responsible_name text,
  responsible_phone text,
  bank_account_iban text,
  reversement_account text,
  created_at timestamptz not null default now()
);

create table school_members (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  role school_member_role not null default 'lecture_seule',
  created_at timestamptz not null default now(),
  unique (school_id, profile_id)
);

create table school_years (
  id uuid primary key default gen_random_uuid(),
  label text not null unique, -- "2026-2027"
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false
);

create table fee_schedules (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools (id) on delete cascade,
  school_year_id uuid not null references school_years (id) on delete cascade,
  level text not null,
  registration_fee bigint not null check (registration_fee >= 0),
  tuition_fee bigint not null check (tuition_fee >= 0),
  extra_fees jsonb not null default '[]'::jsonb,
  deposit_percent numeric(5, 2) not null check (deposit_percent >= 5 and deposit_percent <= 50),
  min_payment bigint not null default 500 check (min_payment >= 500),
  deadline date not null,
  created_at timestamptz not null default now(),
  unique (school_id, school_year_id, level)
);

create table students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references profiles (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date,
  gender text check (gender in ('M', 'F')),
  school_matricule text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table savings_boxes (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique, -- KG-2026-000123
  student_id uuid not null references students (id) on delete cascade,
  school_id uuid not null references schools (id) on delete restrict,
  school_year_id uuid not null references school_years (id) on delete restrict,
  fee_schedule_id uuid not null references fee_schedules (id) on delete restrict,
  goal_type savings_goal_type not null,
  target_amount bigint not null check (target_amount > 0),
  deposit_amount bigint not null check (deposit_amount >= 500),
  status savings_box_status not null default 'brouillon',
  deadline date not null,
  plan_frequency plan_frequency not null default 'mois',
  suggested_payment bigint not null default 0,
  color text not null default '#0F3D2E',
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RG15 : un même élève ne peut avoir qu'une caisse active par année scolaire.
create unique index one_active_box_per_student_year
  on savings_boxes (student_id, school_year_id)
  where status in ('en_attente', 'active', 'completee');

create table transactions (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references savings_boxes (id) on delete restrict,
  type transaction_type not null,
  amount bigint not null check (amount > 0),
  operator payment_operator not null,
  operator_ref text,
  idempotency_key text not null unique,
  status transaction_status not null default 'initiee',
  payer_phone text not null,
  reversal_of uuid references transactions (id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions (id) on delete restrict,
  account ledger_account not null,
  debit bigint not null default 0 check (debit >= 0),
  credit bigint not null default 0 check (credit >= 0),
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools (id) on delete restrict,
  amount bigint not null check (amount > 0),
  box_ids uuid[] not null default '{}',
  bank_ref text,
  status payout_status not null default 'demande',
  requested_by uuid not null references profiles (id),
  executed_at timestamptz,
  created_at timestamptz not null default now()
);

create table contribution_links (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references savings_boxes (id) on delete cascade,
  code text not null unique,
  max_amount bigint not null check (max_amount > 0 and max_amount <= 200000),
  expires_at timestamptz not null,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table statements (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references savings_boxes (id) on delete cascade,
  number text not null unique,
  period_start date not null,
  period_end date not null,
  total bigint not null,
  file_url text,
  verify_hash text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  channel notification_channel not null,
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  ip text,
  created_at timestamptz not null default now()
);

comment on table savings_boxes is 'Cœur du système : une caisse scolaire liée à un élève, une école et une année scolaire (RG15).';
comment on table transactions is 'Historique immuable des mouvements (RG13). Toute correction passe par une contre-écriture (type=reversal).';
comment on table ledger_entries is 'Grand livre en double écriture : le solde d''une caisse est toujours recalculé depuis ces lignes, jamais stocké seul.';
