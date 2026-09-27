import { z } from "zod";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

const payoutRequestSchema = z.object({
  box_ids: z.array(z.string().uuid()).min(1),
});

/** POST /api/v1/schools/{id}/payouts — demande de reversement (E6). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data: member } = await supabase
    .from("school_members")
    .select("role")
    .eq("school_id", id)
    .eq("profile_id", user.id)
    .single();
  if (!member || !["admin", "comptable"].includes(member.role)) return apiErrors.forbidden();

  const body = await request.json().catch(() => null);
  const parsed = payoutRequestSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { data: balances } = await supabase.from("box_balances").select("*").in("box_id", parsed.data.box_ids);
  const amount = (balances ?? []).reduce((sum, b) => sum + b.balance, 0);
  if (amount <= 0) return apiErrors.conflict("Aucun solde disponible pour ces caisses.");

  const { data, error } = await supabase
    .from("payouts")
    .insert({ school_id: id, amount, box_ids: parsed.data.box_ids, status: "demande", requested_by: user.id })
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk(data, 201);
}

/** GET /api/v1/schools/{id}/payouts — suivi des demandes de reversement (E6). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data } = await supabase.from("payouts").select("*").eq("school_id", id).order("created_at", { ascending: false });
  return apiOk({ items: data ?? [] });
}
