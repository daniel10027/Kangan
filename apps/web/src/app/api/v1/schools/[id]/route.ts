import { apiErrors, apiOk } from "@/server/api-response";
import { getSupabaseServerClient } from "@/server/supabase-server";

/**
 * GET /api/v1/schools/{slug} — fiche école et grilles tarifaires publiées. Public.
 *
 * Le segment dynamique est nommé `id` (et non `slug`) pour rester cohérent
 * avec les routes soeurs `/schools/{id}/fees`, `/dashboard`, `/payouts`
 * (Next.js exige un nom de segment dynamique identique pour tous les
 * fichiers d'un même niveau) ; la valeur reçue reste le slug de l'école.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: school, error } = await supabase.from("schools").select("*").eq("slug", slug).single();
  if (error || !school) return apiErrors.notFound("École");

  const { data: currentYear } = await supabase.from("school_years").select("*").eq("is_current", true).single();
  const { data: feeSchedules } = await supabase
    .from("fee_schedules")
    .select("*")
    .eq("school_id", school.id)
    .eq("school_year_id", currentYear?.id ?? "");

  return apiOk({ school, school_year: currentYear, fee_schedules: feeSchedules ?? [] });
}
