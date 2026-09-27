import { SimulatorAdapter, getPaymentAdapter } from "@kangan/payments";
import { z } from "zod";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { settlePayment } from "@/server/payments-service";
import { getSupabaseAdmin } from "@/server/supabase-admin";

const bodySchema = z.object({
  idempotency_key: z.string().min(1),
  outcome: z.enum(["reussie", "echouee"]).default("reussie"),
});

/**
 * POST /api/v1/dev/simulate-confirm — rejoue un faux webhook opérateur pour
 * la démonstration (section 12 : "Un simulateur permet la démonstration
 * devant le jury sans dépenser d'argent réel"). N'existe fonctionnellement
 * que lorsque PAYMENT_MODE=simulator ; en mode "live" cette route refuse
 * tout appel pour ne jamais pouvoir simuler un vrai paiement.
 */
export async function POST(request: Request) {
  if (process.env.PAYMENT_MODE === "live") {
    return apiErrors.forbidden("Le simulateur est désactivé en mode paiement live.");
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = getSupabaseAdmin();
  const { data: tx } = await admin.from("transactions").select("*").eq("idempotency_key", parsed.data.idempotency_key).single();
  if (!tx) return apiErrors.notFound("Transaction");

  const { rawBody, signatureHeader } = SimulatorAdapter.buildFakeWebhook({
    idempotencyKey: tx.idempotency_key,
    operatorRef: tx.operator_ref ?? `SIM-${tx.id.slice(0, 8)}`,
    status: parsed.data.outcome,
    amountFcfa: tx.amount,
    payerPhone: tx.payer_phone,
    rawPayload: {},
  });

  const adapter = getPaymentAdapter(tx.operator);
  const callback = adapter.verifyWebhook({ rawBody, signatureHeader });
  if (!callback) return apiErrors.internal("Échec de construction du webhook simulé.");

  const settled = await settlePayment(callback);
  return apiOk({ transaction: settled });
}
