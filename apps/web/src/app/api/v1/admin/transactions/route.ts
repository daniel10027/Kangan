import { apiErrors, apiOk } from "@/server/api-response";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/admin/transactions — journal complet, statut opérateur (A4). */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();
  const forbidden = await requireKanganStaff(supabase, user.id);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

  const admin = getSupabaseAdmin();
  let query = admin.from("transactions").select("*, savings_boxes(reference)").order("created_at", { ascending: false }).limit(limit);
  if (status) query = query.eq("status", status);
  const { data } = await query;

  return apiOk({ items: data ?? [] });
}
