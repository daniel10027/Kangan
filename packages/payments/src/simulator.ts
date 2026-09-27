import type { PaymentOperator } from "@kangan/shared";
import type { InitiatePaymentParams, InitiatePaymentResult, PaymentAdapter, PaymentCallback, WebhookVerificationInput } from "./types";

export const SIMULATOR_WEBHOOK_SECRET = "kangan-simulator-dev-secret";

/**
 * Adaptateur simulateur — utilisé en mode PAYMENT_MODE=simulator pour la
 * démonstration devant le jury et pour le développement local, "sans
 * dépenser d'argent réel" (cahier des charges, section 12 : Principes
 * d'architecture). Suit exactement le même contrat PaymentAdapter que les
 * opérateurs réels : le reste de l'application (API, base, UI) ne sait pas
 * qu'il s'agit d'une simulation.
 *
 * Flux : initiate() place la transaction "en attente de validation",
 * exactement comme un vrai push USSD. L'écran de paiement affiche alors un
 * bouton "Confirmer le paiement (simulateur)" qui appelle
 * `/api/v1/dev/simulate-confirm`, lequel construit un faux webhook via
 * `buildFakeWebhook` et le rejoue sur le même point d'entrée que les
 * webhooks réels — la démonstration emprunte donc le chemin de code de
 * production de bout en bout.
 */
export class SimulatorAdapter implements PaymentAdapter {
  constructor(readonly operator: PaymentOperator = "moov_money") {}

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    return {
      status: "en_attente_validation",
      operatorRef: `SIM-${params.idempotencyKey.slice(0, 12)}`,
      message: "Simulateur : en attente de confirmation manuelle (mode démonstration).",
    };
  }

  verifyWebhook(input: WebhookVerificationInput): PaymentCallback | null {
    if (input.signatureHeader !== SIMULATOR_WEBHOOK_SECRET) return null;
    const payload = JSON.parse(input.rawBody) as PaymentCallback;
    return payload;
  }

  /** Construit le corps + la signature d'un faux webhook, pour les besoins de la démo. */
  static buildFakeWebhook(callback: PaymentCallback): { rawBody: string; signatureHeader: string } {
    return { rawBody: JSON.stringify(callback), signatureHeader: SIMULATOR_WEBHOOK_SECRET };
  }
}
