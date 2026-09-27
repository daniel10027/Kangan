import { clampPaymentToRemaining, createPaymentSchema, isWithinKycLimit } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { RATE_LIMITS, checkRateLimit } from "@/server/rate-limit";
import { initiatePayment } from "@/server/payments-service";
import { getAuthedSupabase } from "@/server/authed-supabase";

/**
 * POST /api/v1/boxes/{id}/payments — initie un versement (section 14).
 * En-tête `Idempotency-Key` obligatoire pour éviter les doubles débits en
 * cas de réseau instable (section 12, principes d'architecture).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { allowed } = checkRateLimit(`api:${user.id}`, RATE_LIMITS.apiPerUserPerMinute.limit, RATE_LIMITS.apiPerUserPerMinute.windowMs);
  if (!allowed) return apiErrors.rateLimited();

  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) return apiErrors.forbidden("En-tête Idempotency-Key obligatoire.");

  const body = await request.json().catch(() => null);
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { data: box } = await supabase.from("savings_boxes").select("*").eq("id", id).single();
  if (!box) return apiErrors.notFound("Caisse");
  if (!["en_attente", "active"].includes(box.status)) {
    return apiErrors.conflict(`Impossible de verser sur une caisse au statut "${box.status}".`);
  }

  const { data: balance } = await supabase.from("box_balances").select("*").eq("box_id", id).single();
  const currentBalance = balance?.balance ?? 0;
  const remainingDue = Math.max(box.target_amount - currentBalance, 0);
  if (remainingDue <= 0) return apiErrors.conflict("Objectif déjà atteint (RG05).");

  const { amountToApply, surplus } = clampPaymentToRemaining(parsed.data.amount, remainingDue);

  const { data: profile } = await supabase.from("profiles").select("kyc_level").eq("id", user.id).single();
  if (profile && !isWithinKycLimit(amountToApply, profile.kyc_level as 1 | 2 | 3, currentBalance)) {
    return apiErrors.forbidden("Ce versement dépasse le plafond autorisé pour votre niveau de vérification (KYC).");
  }

  const type = box.status === "en_attente" ? "deposit" : "payment";

  const { transaction, initiation } = await initiatePayment({
    boxId: id,
    boxReference: box.reference,
    type,
    amount: amountToApply,
    operator: parsed.data.operator,
    payerPhone: parsed.data.payer_phone,
    idempotencyKey,
  });

  return apiOk(
    {
      transaction,
      initiation,
      surplus_to_reallocate: surplus,
      simulator_hint:
        process.env.PAYMENT_MODE !== "live"
          ? "Mode démonstration : confirmez ce versement via POST /api/v1/dev/simulate-confirm."
          : null,
    },
    202,
  );
}
