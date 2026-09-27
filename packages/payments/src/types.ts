import type { PaymentOperator } from "@kangan/shared";

export interface InitiatePaymentParams {
  /** Identifiant unique généré côté Kangan pour éviter tout double débit (architecture, section 12). */
  idempotencyKey: string;
  amountFcfa: number;
  payerPhone: string;
  /** Référence lisible de la caisse (KG-2026-000123) affichée dans le message opérateur. */
  boxReference: string;
  narrative: string;
}

export type PaymentInitiationStatus = "initiee" | "en_attente_validation" | "echouee";

export interface InitiatePaymentResult {
  status: PaymentInitiationStatus;
  operatorRef: string | null;
  message: string;
}

export type PaymentCallbackStatus = "reussie" | "echouee" | "en_attente";

export interface PaymentCallback {
  idempotencyKey: string;
  operatorRef: string;
  status: PaymentCallbackStatus;
  amountFcfa: number;
  payerPhone: string;
  rawPayload: Record<string, unknown>;
}

export interface WebhookVerificationInput {
  rawBody: string;
  signatureHeader: string | null;
}

/**
 * Adaptateur de paiement — interface commune à tous les opérateurs
 * (architecture technique, section 12 : "chaque opérateur implémente la
 * même interface : initier, vérifier, recevoir le webhook").
 */
export interface PaymentAdapter {
  readonly operator: PaymentOperator;
  initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  verifyWebhook(input: WebhookVerificationInput): PaymentCallback | null;
}
