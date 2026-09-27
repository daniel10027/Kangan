import { apiErrors, apiOk } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/notifications — notifications de l'utilisateur connecté (P8). */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return apiOk({ items: data ?? [] });
}
