import { createProfileSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { hashPin } from "@/server/pin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** PUT /api/v1/profile — complète le profil (nom, commune, langue, PIN) après vérification OTP (P1). */
export async function PUT(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createProfileSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    phone: user.phone,
    full_name: parsed.data.full_name,
    commune: parsed.data.commune ?? null,
    language: parsed.data.language,
    pin_hash: hashPin(parsed.data.pin),
    role: "parent",
  });
  if (error) return apiErrors.internal(error.message);

  return apiOk({ message: "Profil enregistré." });
}

export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return apiOk(data);
}
