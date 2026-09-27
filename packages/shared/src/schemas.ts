import { z } from "zod";
import { MIN_DEPOSIT_AMOUNT, PAYMENT_OPERATORS, PLAN_FREQUENCIES, SAVINGS_GOAL_TYPES, SCHOOL_CYCLES } from "./constants";

/** Numéro ivoirien : +225 suivi de 10 chiffres (formats CI 2021+). */
export const phoneSchema = z
  .string()
  .regex(/^\+225[0-9]{10}$/, "Numéro ivoirien attendu au format +225XXXXXXXXXX");

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
});

export const pinSchema = z.string().regex(/^[0-9]{4}$/, "Le code PIN doit contenir 4 chiffres");

export const createProfileSchema = z.object({
  full_name: z.string().min(2).max(120),
  commune: z.string().max(80).optional(),
  language: z.enum(["fr", "dioula", "baoule"]).default("fr"),
  pin: pinSchema,
});

export const createStudentSchema = z.object({
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  birth_date: z.string().date().optional(),
  gender: z.enum(["M", "F"]).optional(),
  school_matricule: z.string().max(40).optional(),
  photo_url: z.string().url().optional(),
});

export const createSavingsBoxSchema = z.object({
  student_id: z.string().uuid(),
  school_id: z.string().uuid(),
  fee_schedule_id: z.string().uuid(),
  goal_type: z.enum(SAVINGS_GOAL_TYPES),
  plan_frequency: z.enum(PLAN_FREQUENCIES),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#0F3D2E"),
});

export const createPaymentSchema = z.object({
  amount: z.number().int().min(MIN_DEPOSIT_AMOUNT),
  operator: z.enum(PAYMENT_OPERATORS),
  payer_phone: phoneSchema,
});

export const createContributionLinkSchema = z.object({
  max_amount: z.number().int().min(500).max(200_000),
  expires_in_hours: z.number().int().min(1).max(24 * 30).default(24 * 14),
});

export const contributeViaLinkSchema = z.object({
  code: z.string().length(6),
  amount: z.number().int().min(MIN_DEPOSIT_AMOUNT),
  operator: z.enum(PAYMENT_OPERATORS),
  payer_phone: phoneSchema,
  contributor_name: z.string().min(2).max(120),
});

export const schoolSearchQuerySchema = z.object({
  q: z.string().max(120).optional(),
  commune: z.string().max(80).optional(),
  cycle: z.enum(SCHOOL_CYCLES).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});

export const schoolAdhesionSchema = z.object({
  name: z.string().min(2).max(160),
  type: z.enum(["prive", "public", "confessionnel"]),
  cycles: z.array(z.enum(SCHOOL_CYCLES)).min(1),
  commune: z.string().min(2).max(80),
  city: z.string().min(2).max(80),
  address: z.string().max(200).optional(),
  rccm: z.string().max(60).optional(),
  responsible_name: z.string().min(2).max(120),
  responsible_phone: phoneSchema,
  bank_account_iban: z.string().min(10).max(40),
});

export const feeScheduleSchema = z.object({
  school_year_id: z.string().uuid(),
  level: z.string().min(1).max(60),
  registration_fee: z.number().int().min(0),
  tuition_fee: z.number().int().min(0),
  extra_fees: z
    .array(z.object({ label: z.string().min(1).max(60), amount: z.number().int().min(0) }))
    .default([]),
  deposit_percent: z.number().min(5).max(50),
  min_payment: z.number().int().min(MIN_DEPOSIT_AMOUNT).default(MIN_DEPOSIT_AMOUNT),
  deadline: z.string().date(),
});

export const webhookMoovMoneySchema = z.object({
  reference: z.string(),
  idempotency_key: z.string(),
  status: z.enum(["success", "failed", "pending"]),
  amount: z.number().int(),
  msisdn: z.string(),
  signature: z.string(),
  timestamp: z.string(),
});

export const reversalSchema = z.object({
  original_transaction_id: z.string().uuid(),
  reason: z.string().min(10).max(500),
});

export const statementQuerySchema = z.object({
  period_start: z.string().date().optional(),
  period_end: z.string().date().optional(),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateSavingsBoxInput = z.infer<typeof createSavingsBoxSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateContributionLinkInput = z.infer<typeof createContributionLinkSchema>;
export type ContributeViaLinkInput = z.infer<typeof contributeViaLinkSchema>;
export type SchoolSearchQuery = z.infer<typeof schoolSearchQuerySchema>;
export type SchoolAdhesionInput = z.infer<typeof schoolAdhesionSchema>;
export type FeeScheduleInput = z.infer<typeof feeScheduleSchema>;
export type WebhookMoovMoneyInput = z.infer<typeof webhookMoovMoneySchema>;
export type ReversalInput = z.infer<typeof reversalSchema>;
