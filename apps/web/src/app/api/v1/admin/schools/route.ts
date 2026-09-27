import { apiErrors, apiOk } from "@/server/api-response";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/admin/schools — file de validation KYB, activation, suspension (A2). */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();
  const forbidden = await requireKanganStaff(supabase, user.id);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const admin = getSupabaseAdmin();
  let query = admin.from("schools").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;

  return apiOk({ items: data ?? [] });
}
