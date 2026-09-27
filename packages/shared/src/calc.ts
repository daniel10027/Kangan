import { MIN_DEPOSIT_AMOUNT } from "./constants";
import type { PlanFrequency, SavingsGoalType } from "./constants";

export interface FeeInputs {
  registrationFee: number;
  tuitionFee: number;
  extraFees: Array<{ label: string; amount: number }>;
}

/**
 * RG01 — Montant cible : somme des frais choisis par le parent parmi ceux
 * publiés par l'école pour le niveau et l'année scolaire.
 */
export function computeTargetAmount(fees: FeeInputs, goalType: SavingsGoalType): number {
  const extras = fees.extraFees.reduce((sum, f) => sum + f.amount, 0);
  switch (goalType) {
    case "inscription":
      return fees.registrationFee;
    case "inscription_partielle":
      return fees.registrationFee + Math.round(fees.tuitionFee / 2);
    case "totalite":
      return fees.registrationFee + fees.tuitionFee + extras;
    default:
      throw new Error(`Type d'objectif inconnu: ${goalType satisfies never}`);
  }
}

/** Arrondit un montant F CFA à la centaine supérieure (RG02). */
export function roundUpToHundred(amount: number): number {
  return Math.ceil(amount / 100) * 100;
}

/**
 * RG02 — Acompte = pourcentage fixé par l'école × montant cible,
 * arrondi à la centaine supérieure.
 */
export function computeDepositAmount(targetAmount: number, depositPercent: number): number {
  if (depositPercent < 0 || depositPercent > 100) {
    throw new Error("depositPercent doit être compris entre 0 et 100");
  }
  const raw = (targetAmount * depositPercent) / 100;
  return Math.max(roundUpToHundred(raw), MIN_DEPOSIT_AMOUNT);
}

export interface SavingsPlan {
  remaining: number;
  suggestedPayment: number;
  numberOfPeriods: number;
  frequency: PlanFrequency;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calcule le plan d'épargne suggéré (montant par jour / semaine / mois)
 * pour atteindre l'objectif avant la date limite, une fois l'acompte versé.
 */
export function computeSavingsPlan(
  targetAmount: number,
  depositAmount: number,
  deadlineISO: string,
  frequency: PlanFrequency,
  fromDate: Date = new Date(),
): SavingsPlan {
  const remaining = Math.max(targetAmount - depositAmount, 0);
  const deadline = new Date(deadlineISO);
  const daysLeft = Math.max(Math.ceil((deadline.getTime() - fromDate.getTime()) / MS_PER_DAY), 1);

  const periodsPerFrequency: Record<PlanFrequency, number> = {
    jour: daysLeft,
    semaine: Math.max(Math.ceil(daysLeft / 7), 1),
    mois: Math.max(Math.ceil(daysLeft / 30), 1),
  };

  const numberOfPeriods = periodsPerFrequency[frequency];
  const suggestedPayment = remaining === 0 ? 0 : Math.max(roundUpToHundred(remaining / numberOfPeriods), MIN_DEPOSIT_AMOUNT);

  return { remaining, suggestedPayment, numberOfPeriods, frequency };
}

/**
 * RG05 — Plafond : un versement qui dépasse le restant dû est limité au
 * restant. Retourne le montant effectivement débité et l'excédent.
 */
export function clampPaymentToRemaining(
  requestedAmount: number,
  remainingDue: number,
): { amountToApply: number; surplus: number } {
  if (requestedAmount <= remainingDue) {
    return { amountToApply: requestedAmount, surplus: 0 };
  }
  return { amountToApply: remainingDue, surplus: requestedAmount - remainingDue };
}

/** RG04 — Versement minimum de 500 F CFA. */
export function isValidPaymentAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= MIN_DEPOSIT_AMOUNT;
}

/** Pourcentage de progression d'une caisse, borné à [0, 100]. */
export function computeProgressPercent(balance: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(Math.round((balance / targetAmount) * 100), 100);
}

/** Jours restants avant l'échéance (peut être négatif si dépassée). */
export function daysUntilDeadline(deadlineISO: string, fromDate: Date = new Date()): number {
  const deadline = new Date(deadlineISO);
  return Math.ceil((deadline.getTime() - fromDate.getTime()) / MS_PER_DAY);
}

/** Jalons de progression célébrés par l'app (section 11 — micro-interactions). */
export const PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

export function reachedMilestone(previousPercent: number, newPercent: number): number | null {
  for (const milestone of PROGRESS_MILESTONES) {
    if (previousPercent < milestone && newPercent >= milestone) return milestone;
  }
  return null;
}
