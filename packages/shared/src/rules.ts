import {
  ALLOWED_STATUS_TRANSITIONS,
  CONTRIBUTION_NO_ACCOUNT_MAX,
  KYC_LEVEL_LIMITS,
  PAYOUT_DELAY_AFTER_ACTIVATION_DAYS,
  PAYOUT_DELAY_AT_DEADLINE_HOURS,
  REFUND_DELAY_BUSINESS_DAYS,
  type SavingsBoxStatus,
} from "./constants";

/** Vérifie qu'une transition de statut de caisse est autorisée. */
export function canTransitionStatus(from: SavingsBoxStatus, to: SavingsBoxStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: SavingsBoxStatus, to: SavingsBoxStatus): void {
  if (!canTransitionStatus(from, to)) {
    throw new Error(`Transition de statut refusée : ${from} → ${to}`);
  }
}

/** RG12 — au-delà de 200 000 F CFA, une contribution externe exige un compte. */
export function requiresAccountForContribution(amount: number): boolean {
  return amount > CONTRIBUTION_NO_ACCOUNT_MAX;
}

/** Vérifie qu'un montant respecte le plafond du niveau KYC du parent. */
export function isWithinKycLimit(amount: number, kycLevel: 1 | 2 | 3, cumulativeBoxBalance: number): boolean {
  const limit = KYC_LEVEL_LIMITS[kycLevel];
  if (limit === null) return true; // niveau 3 : décision au cas par cas côté support
  return cumulativeBoxBalance + amount <= limit;
}

/** RG06 — date limite de reversement de l'acompte à l'école après activation. */
export function depositPayoutDueDate(activatedAt: Date): Date {
  const due = new Date(activatedAt);
  due.setDate(due.getDate() + PAYOUT_DELAY_AFTER_ACTIVATION_DAYS);
  return due;
}

/** RG08 — date limite de reversement du solde à l'échéance de la caisse. */
export function deadlinePayoutDueDate(deadline: Date): Date {
  const due = new Date(deadline);
  due.setHours(due.getHours() + PAYOUT_DELAY_AT_DEADLINE_HOURS);
  return due;
}

/** RG10 — date limite de remboursement (jours ouvrés, hors samedi/dimanche). */
export function refundDueDate(requestedAt: Date): Date {
  const due = new Date(requestedAt);
  let daysAdded = 0;
  while (daysAdded < REFUND_DELAY_BUSINESS_DAYS) {
    due.setDate(due.getDate() + 1);
    const day = due.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }
  return due;
}

/**
 * RG11 — Changement d'école avant l'échéance : le solde hors acompte est
 * transférable, l'acompte reste acquis à l'école d'origine sauf accord.
 */
export function computeTransferableAmount(currentBalance: number, depositAmount: number): number {
  return Math.max(currentBalance - depositAmount, 0);
}

/** RG15 — un même élève ne peut avoir qu'une caisse active par année scolaire. */
export function violatesOneActiveBoxPerYear(
  existingBoxes: Array<{ studentId: string; schoolYearId: string; status: SavingsBoxStatus }>,
  candidate: { studentId: string; schoolYearId: string },
): boolean {
  const activeStatuses: SavingsBoxStatus[] = ["en_attente", "active", "completee"];
  return existingBoxes.some(
    (b) =>
      b.studentId === candidate.studentId &&
      b.schoolYearId === candidate.schoolYearId &&
      activeStatuses.includes(b.status),
  );
}

/** RG13 — une transaction n'est jamais modifiée : seule une contre-écriture motivée est permise. */
export interface ReversalRequest {
  originalTransactionId: string;
  reason: string;
  requestedBy: string;
}

export function assertValidReversal(reason: string): void {
  if (!reason || reason.trim().length < 10) {
    throw new Error("Une contre-écriture doit être motivée (10 caractères minimum).");
  }
}
