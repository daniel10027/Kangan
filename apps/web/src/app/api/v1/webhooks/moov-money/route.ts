import { getPaymentAdapter } from "@kangan/payments";
import { apiErrors, apiOk } from "@/server/api-response";
import { settlePayment } from "@/server/payments-service";

/**
 * POST /api/v1/webhooks/moov-money — confirmation de paiement, signature
 * vérifiée (section 10, étape 03 ; section 14 ; section 15).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-Moov-Signature") ?? request.headers.get("Idempotency-Key");

  const adapter = getPaymentAdapter("moov_money");
  const callback = adapter.verifyWebhook({ rawBody, signatureHeader });
  if (!callback) return apiErrors.forbidden("Signature de webhook invalide.");

  try {
    const tx = await settlePayment(callback);
    return apiOk({ received: true, transaction_id: tx?.id });
  } catch (err) {
    return apiErrors.internal(err instanceof Error ? err.message : "Erreur de règlement.");
  }
}
