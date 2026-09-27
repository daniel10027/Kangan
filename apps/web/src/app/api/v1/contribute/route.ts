import { contributeViaLinkSchema, requiresAccountForContribution } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { initiatePayment } from "@/server/payments-service";
import { getSupabaseAdmin } from "@/server/supabase-admin";

/**
 * POST /api/v1/contribute — contribution familiale externe via un code à 6
 * caractères (P7), accessible sans compte Kangan, y compris depuis la
 * diaspora (section 6). RG12 : au-delà de 200 000 F CFA, un compte est requis.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contributeViaLinkSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  if (requiresAccountForContribution(parsed.data.amount)) {
    return apiErrors.forbidden("Au-delà de 200 000 F CFA, la création d'un compte Kangan est obligatoire (RG12).");
  }

  const admin = getSupabaseAdmin();
  const { data: link } = await admin.from("contribution_links").select("*, savings_boxes(reference)").eq("code", parsed.data.code).single();
  if (!link) return apiErrors.notFound("Lien de contribution");
  if (new Date(link.expires_at).getTime() < Date.now()) return apiErrors.conflict("Ce lien de contribution a expiré.");
  if (parsed.data.amount > link.max_amount) return apiErrors.conflict(`Le montant dépasse le plafond de ce lien (${link.max_amount} F CFA).`);

  const idempotencyKey = `contrib-${link.code}-${Date.now()}`;
  const { transaction, initiation } = await initiatePayment({
    boxId: link.box_id,
    boxReference: (link as { savings_boxes: { reference: string } }).savings_boxes.reference,
    type: "contribution",
    amount: parsed.data.amount,
    operator: parsed.data.operator,
    payerPhone: parsed.data.payer_phone,
    idempotencyKey,
  });

  return apiOk({ transaction, initiation }, 202);
}
