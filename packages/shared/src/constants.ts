/**
 * Constantes métier Kangan Finance — cahier des charges v1.0, section 9 (Règles de gestion).
 * Tous les montants sont des entiers en F CFA (jamais de décimales).
 */

export const MIN_DEPOSIT_AMOUNT = 500; // RG04 — versement minimum
export const CONTRIBUTION_NO_ACCOUNT_MAX = 200_000; // RG12 — plafond contribution externe sans compte
export const PAYOUT_DELAY_AFTER_ACTIVATION_DAYS = 7; // RG06 — reversement de l'acompte
export const PAYOUT_DELAY_AT_DEADLINE_HOURS = 48; // RG08 — reversement à l'échéance
export const REFUND_DELAY_BUSINESS_DAYS = 7; // RG10 — remboursement

export const KYC_LEVEL_LIMITS: Record<1 | 2 | 3, number | null> = {
  1: 500_000, // OTP téléphone
  2: 2_000_000, // pièce d'identité + selfie
  3: null, // justificatif complémentaire validé par le support — plafond sur décision
};

export const SAVINGS_BOX_STATUSES = [
  "brouillon",
  "en_attente",
  "active",
  "completee",
  "reversee",
  "suspendue",
  "remboursee",
] as const;

export type SavingsBoxStatus = (typeof SAVINGS_BOX_STATUSES)[number];

/** RG08 / statuts — transitions autorisées d'un statut de caisse vers un autre. */
export const ALLOWED_STATUS_TRANSITIONS: Record<SavingsBoxStatus, SavingsBoxStatus[]> = {
  brouillon: ["en_attente", "brouillon"],
  en_attente: ["active", "brouillon"], // confirmation ou échec/annulation opérateur (RG03)
  active: ["completee", "suspendue", "reversee"],
  completee: ["reversee"],
  reversee: [],
  suspendue: ["active", "remboursee"],
  remboursee: [],
};

export const TRANSACTION_TYPES = [
  "deposit", // acompte
  "payment", // versement régulier
  "contribution", // contribution familiale externe
  "payout", // reversement à l'école
  "refund", // remboursement au parent
  "reversal", // contre-écriture (RG13)
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["initiee", "reussie", "echouee", "annulee"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const PAYMENT_OPERATORS = ["moov_money", "mtn_money", "orange_money", "wave", "card"] as const;
export type PaymentOperator = (typeof PAYMENT_OPERATORS)[number];

export const USER_ROLES = [
  "parent",
  "contributeur",
  "ecole_admin",
  "ecole_comptable",
  "kangan_agent",
  "kangan_super_admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SCHOOL_CYCLES = ["maternelle", "primaire", "secondaire", "superieur", "formation_professionnelle"] as const;
export type SchoolCycle = (typeof SCHOOL_CYCLES)[number];

export const SAVINGS_GOAL_TYPES = ["inscription", "inscription_partielle", "totalite"] as const;
export type SavingsGoalType = (typeof SAVINGS_GOAL_TYPES)[number];

export const PLAN_FREQUENCIES = ["jour", "semaine", "mois"] as const;
export type PlanFrequency = (typeof PLAN_FREQUENCIES)[number];

export const BRAND_COLORS = {
  vertKangan: "#0F3D2E",
  ocre: "#D98E2B",
  terreCuite: "#B5502F",
  creme: "#F6EFE3",
  encre: "#1B1B18",
  feuille: "#2F8F5B",
  piment: "#C0392B",
} as const;
