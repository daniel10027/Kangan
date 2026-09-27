import { reversalSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { writeAuditLog } from "@/server/audit";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/**
 * POST /api/v1/admin/transactions/{id}/reverse — contre-écriture motivée
 * (A6, litiges et remboursements ; RG13). Aucune modification/suppression
 * de la transaction d'origine : une nouvelle écriture inverse est créée.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();
  const forbidden = await requireKanganStaff(supabase, user.id);
  if (forbidden) return forbidden;

  const body = await request.json().catch(() => null);
  const parsed = reversalSchema.safeParse({ ...body, original_transaction_id: id });
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = getSupabaseAdmin();
  const { data: reversal, error } = await admin.rpc("reverse_transaction", {
    p_original_transaction_id: id,
    p_reason: parsed.data.reason,
    p_actor_id: user.id,
  });
  if (error) return apiErrors.conflict(error.message);

  await writeAuditLog({ actorId: user.id, action: "reverse_transaction", entity: "transactions", entityId: id, after: reversal });

  return apiOk(reversal, 201);
}
