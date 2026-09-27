import { verifyHmacSignature } from "./webhook-signature";
import type { InitiatePaymentParams, InitiatePaymentResult, PaymentAdapter, PaymentCallback, WebhookVerificationInput } from "./types";
import type { PaymentOperator } from "@kangan/shared";

export interface AggregatorConfig {
  provider: "cinetpay" | "paydunya";
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
}

/**
 * Adaptateur générique pour un agrégateur local (CinetPay, PayDunya ou
 * équivalent) couvrant MTN Money, Orange Money, Wave et les cartes
 * bancaires (section 10 : "Couverture de tous les parents").
 */
export class AggregatorAdapter implements PaymentAdapter {
  constructor(
    readonly operator: PaymentOperator,
    private readonly config: AggregatorConfig,
  ) {}

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    if (!this.config.apiKey) {
      throw new Error(`Identifiants agrégateur (${this.config.provider}) manquants.`);
    }

    const response = await fetch(`${this.config.baseUrl}/v2/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        apikey: this.config.apiKey,
        amount: params.amountFcfa,
        currency: "XOF",
        customer_phone_number: params.payerPhone,
        transaction_id: params.idempotencyKey,
        channel: this.operator,
        description: params.narrative,
      }),
    });

    if (!response.ok) {
      return { status: "echouee", operatorRef: null, message: "L'agrégateur a refusé la demande de paiement." };
    }

    const data = (await response.json()) as { payment_token?: string };
    return {
      status: "en_attente_validation",
      operatorRef: data.payment_token ?? null,
      message: "Demande envoyée à l'agrégateur, en attente de confirmation.",
    };
  }

  verifyWebhook(input: WebhookVerificationInput): PaymentCallback | null {
    if (!verifyHmacSignature(input.rawBody, input.signatureHeader, this.config.webhookSecret)) {
      return null;
    }
    const payload = JSON.parse(input.rawBody) as {
      transaction_id: string;
      payment_token: string;
      status: "ACCEPTED" | "REFUSED" | "PENDING";
      amount: number;
      customer_phone_number: string;
    };
    const statusMap = { ACCEPTED: "reussie", REFUSED: "echouee", PENDING: "en_attente" } as const;
    return {
      idempotencyKey: payload.transaction_id,
      operatorRef: payload.payment_token,
      status: statusMap[payload.status],
      amountFcfa: payload.amount,
      payerPhone: payload.customer_phone_number,
      rawPayload: payload,
    };
  }
}
