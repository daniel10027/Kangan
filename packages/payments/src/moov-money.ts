import { verifyHmacSignature } from "./webhook-signature";
import type { InitiatePaymentParams, InitiatePaymentResult, PaymentAdapter, PaymentCallback, WebhookVerificationInput } from "./types";

export interface MoovMoneyConfig {
  baseUrl: string;
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
}

/**
 * Adaptateur Moov Money — rail de paiement principal (cahier des charges,
 * section 10). L'intégration réelle doit être contractualisée avec Moov
 * Africa Côte d'Ivoire ; cette implémentation respecte la forme attendue
 * du flux ("push USDD sur le téléphone du parent", webhook signé) afin de
 * pouvoir être branchée sur l'API réelle dès l'obtention des identifiants
 * marchands, sans changer le reste de l'application.
 */
export class MoovMoneyAdapter implements PaymentAdapter {
  readonly operator = "moov_money" as const;

  constructor(private readonly config: MoovMoneyConfig) {}

  async initiate(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    if (!this.config.apiKey || !this.config.merchantId) {
      throw new Error(
        "Identifiants Moov Money manquants. Renseignez MOOV_MONEY_MERCHANT_ID et MOOV_MONEY_API_KEY, " +
          "ou utilisez PAYMENT_MODE=simulator pour la démonstration.",
      );
    }

    const response = await fetch(`${this.config.baseUrl}/v1/payment-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "X-Merchant-Id": this.config.merchantId,
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify({
        amount: params.amountFcfa,
        currency: "XOF",
        msisdn: params.payerPhone,
        reference: params.idempotencyKey,
        narrative: params.narrative,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/v1/webhooks/moov-money`,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { status: "echouee", operatorRef: null, message: `Moov Money a refusé la demande : ${body}` };
    }

    const data = (await response.json()) as { reference?: string };
    return {
      status: "en_attente_validation",
      operatorRef: data.reference ?? null,
      message: "Demande envoyée : le parent doit valider avec son code secret Moov Money.",
    };
  }

  verifyWebhook(input: WebhookVerificationInput): PaymentCallback | null {
    if (!verifyHmacSignature(input.rawBody, input.signatureHeader, this.config.webhookSecret)) {
      return null;
    }
    const payload = JSON.parse(input.rawBody) as {
      idempotency_key: string;
      reference: string;
      status: "success" | "failed" | "pending";
      amount: number;
      msisdn: string;
    };
    const statusMap = { success: "reussie", failed: "echouee", pending: "en_attente" } as const;
    return {
      idempotencyKey: payload.idempotency_key,
      operatorRef: payload.reference,
      status: statusMap[payload.status],
      amountFcfa: payload.amount,
      payerPhone: payload.msisdn,
      rawPayload: payload,
    };
  }
}
