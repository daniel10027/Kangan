import { computeVerifyHash } from "@kangan/shared";
import { apiErrors, apiOk } from "@/server/api-response";
import { getSupabaseAdmin } from "@/server/supabase-admin";

/**
 * GET /api/v1/verify/{number} — vérifie l'authenticité d'un relevé (RG14).
 * Public : ne renvoie que les informations nécessaires à la vérification,
 * jamais l'historique détaillé ni les coordonnées du parent.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const admin = getSupabaseAdmin();

  const { data: statement } = await admin
    .from("statements")
    .select("number, total, period_start, period_end, verify_hash, savings_boxes(reference, schools(name))")
    .eq("number", number)
    .single();

  if (!statement) return apiOk({ valid: false, reason: "Numéro de relevé inconnu." }, 404);

  const secret = process.env.JWT_AUDIT_SALT ?? "dev-secret";
  const box = statement.savings_boxes as unknown as { reference: string; schools: { name: string } };
  const expectedHash = computeVerifyHash(
    { number: statement.number, boxReference: box.reference, total: statement.total, periodStart: statement.period_start, periodEnd: statement.period_end },
    secret,
  );

  const valid = expectedHash === statement.verify_hash;

  return apiOk({
    valid,
    number: statement.number,
    total: statement.total,
    period_start: statement.period_start,
    period_end: statement.period_end,
    school_name: box.schools?.name ?? null,
    box_reference: box.reference,
  });
}
