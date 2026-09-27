import { getPaymentAdapter } from "@kangan/payments";
import { apiErrors, apiOk } from "@/server/api-response";
import { settlePayment } from "@/server/payments-service";

/** POST /api/v1/webhooks/aggregator — confirmation des autres canaux (section 14). */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-Aggregator-Signature");

  const adapter = getPaymentAdapter("mtn_money");
  const callback = adapter.verifyWebhook({ rawBody, signatureHeader });
  if (!callback) return apiErrors.forbidden("Signature de webhook invalide.");

  try {
    const tx = await settlePayment(callback);
    return apiOk({ received: true, transaction_id: tx?.id });
  } catch (err) {
    return apiErrors.internal(err instanceof Error ? err.message : "Erreur de règlement.");
  }
}
