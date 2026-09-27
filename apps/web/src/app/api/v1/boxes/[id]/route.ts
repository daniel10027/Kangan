import { apiErrors, apiOk } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/boxes/{id} — détail, solde, plan d'épargne (P5, P6). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data: box, error } = await supabase
    .from("savings_boxes")
    .select("*, students(*), schools(*), fee_schedules(*)")
    .eq("id", id)
    .single();
  if (error || !box) return apiErrors.notFound("Caisse");

  const { data: balance } = await supabase.from("box_balances").select("*").eq("box_id", id).single();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("box_id", id)
    .order("created_at", { ascending: false });

  return apiOk({ box, balance: balance ?? { balance: 0, percent_reached: 0, last_payment_at: null }, transactions: transactions ?? [] });
}
