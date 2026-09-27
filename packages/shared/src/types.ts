import type {
  PaymentOperator,
  PlanFrequency,
  SavingsBoxStatus,
  SavingsGoalType,
  SchoolCycle,
  TransactionStatus,
  TransactionType,
  UserRole,
} from "./constants";

/** Table `profiles` — 1 par utilisateur Supabase Auth. */
export interface Profile {
  id: string;
  phone: string;
  full_name: string;
  commune: string | null;
  kyc_level: 1 | 2 | 3;
  role: UserRole;
  language: "fr" | "dioula" | "baoule";
  created_at: string;
}

/** Table `schools`. */
export interface School {
  id: string;
  name: string;
  slug: string;
  type: "prive" | "public" | "confessionnel";
  cycles: SchoolCycle[];
  commune: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  status: "en_attente_kyb" | "actif" | "suspendu";
  rccm: string | null;
  created_at: string;
}

/** Table `school_members`. */
export interface SchoolMember {
  id: string;
  school_id: string;
  profile_id: string;
  role: "admin" | "comptable" | "lecture_seule";
}

/** Table `school_years`. */
export interface SchoolYear {
  id: string;
  label: string; // "2026-2027"
  starts_on: string;
  ends_on: string;
  is_current: boolean;
}

/** Table `fee_schedules` — grille tarifaire par niveau et année. */
export interface FeeSchedule {
  id: string;
  school_id: string;
  school_year_id: string;
  level: string; // ex: "CM2", "6e", "Terminale D"
  registration_fee: number; // F CFA
  tuition_fee: number; // F CFA
  extra_fees: Array<{ label: string; amount: number }>;
  deposit_percent: number; // 5 à 50
  min_payment: number;
  deadline: string; // ISO date
}

/** Table `students` (bénéficiaires). */
export interface Student {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: "M" | "F" | null;
  school_matricule: string | null;
  photo_url: string | null;
}

/** Table `savings_boxes` (caisses) — cœur du système. */
export interface SavingsBox {
  id: string;
  reference: string; // KG-2026-000123
  student_id: string;
  school_id: string;
  fee_schedule_id: string;
  goal_type: SavingsGoalType;
  target_amount: number;
  deposit_amount: number;
  status: SavingsBoxStatus;
  deadline: string;
  plan_frequency: PlanFrequency;
  suggested_payment: number;
  color: string;
  avatar: string | null;
  created_at: string;
}

/** Table `transactions` — historique immuable (RG13). */
export interface Transaction {
  id: string;
  box_id: string;
  type: TransactionType;
  amount: number;
  operator: PaymentOperator;
  operator_ref: string | null;
  idempotency_key: string;
  status: TransactionStatus;
  payer_phone: string;
  reversal_of: string | null;
  created_at: string;
}

/** Table `ledger_entries` — double écriture, source unique du solde. */
export interface LedgerEntry {
  id: string;
  transaction_id: string;
  account: "caisse" | "sequestre" | "ecole" | "kangan_commission" | "operateur_frais";
  debit: number;
  credit: number;
  created_at: string;
}

/** Table `payouts` — reversements aux écoles. */
export interface Payout {
  id: string;
  school_id: string;
  amount: number;
  box_ids: string[];
  bank_ref: string | null;
  status: "demande" | "en_cours" | "execute" | "echoue";
  requested_by: string;
  executed_at: string | null;
}

/** Table `contribution_links` — liens de contribution familiale (RG12). */
export interface ContributionLink {
  id: string;
  box_id: string;
  code: string; // 6 caractères
  expires_at: string;
  max_amount: number;
}

/** Table `statements` — relevés PDF vérifiables (RG14). */
export interface Statement {
  id: string;
  box_id: string;
  number: string; // numéro unique
  period_start: string;
  period_end: string;
  total: number;
  file_url: string;
  verify_hash: string;
}

/** Table `notifications`. */
export interface Notification {
  id: string;
  profile_id: string;
  channel: "push" | "sms" | "whatsapp";
  template: string;
  payload: Record<string, unknown>;
  sent_at: string | null;
  read_at: string | null;
}

/** Table `audit_logs` — journal en ajout seul. */
export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

/** Vue calculée `box_balances`. */
export interface BoxBalance {
  box_id: string;
  balance: number;
  percent_reached: number;
  last_payment_at: string | null;
}
