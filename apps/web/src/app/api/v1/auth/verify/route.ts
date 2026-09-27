import { otpVerifySchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getSupabaseServerClient } from "@/server/supabase-server";

/**
 * POST /api/v1/auth/verify — vérifie l'OTP et ouvre la session (section 14).
 * Retourne aussi access_token/refresh_token en JSON pour le client mobile,
 * qui ne peut pas s'appuyer sur les cookies du navigateur.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.code,
    type: "sms",
  });
  if (error || !data.session) return apiErrors.forbidden("Code invalide ou expiré.");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();

  return apiOk({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user_id: data.session.user.id,
    role: profile?.role ?? "parent",
    profile_complete: Boolean(profile?.full_name && profile.pin_hash),
  });
}
