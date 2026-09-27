import { feeScheduleSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** PUT /api/v1/schools/{id}/fees — met à jour la grille tarifaire (E3). Rôle admin établissement. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data: member } = await supabase
    .from("school_members")
    .select("role")
    .eq("school_id", id)
    .eq("profile_id", user.id)
    .single();
  if (!member || member.role !== "admin") return apiErrors.forbidden("Réservé à l'administrateur de l'établissement.");

  const body = await request.json().catch(() => null);
  const parsed = feeScheduleSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { data, error } = await supabase
    .from("fee_schedules")
    .upsert(
      { school_id: id, ...parsed.data },
      { onConflict: "school_id,school_year_id,level" },
    )
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk(data);
}
