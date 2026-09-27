import { createStudentSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** POST /api/v1/students — crée un bénéficiaire (enfant) pour le parent connecté. */
export async function POST(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { data, error } = await supabase
    .from("students")
    .insert({ ...parsed.data, parent_id: user.id })
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk(data, 201);
}

/** GET /api/v1/students — liste des enfants du parent connecté. */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data } = await supabase.from("students").select("*").eq("parent_id", user.id).order("created_at");
  return apiOk({ items: data ?? [] });
}
