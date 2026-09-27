import { otpRequestSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { RATE_LIMITS, checkRateLimit } from "@/server/rate-limit";
import { getSupabaseServerClient } from "@/server/supabase-server";

/** POST /api/v1/auth/otp — envoie un code OTP au numéro (section 14). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpRequestSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const { allowed } = checkRateLimit(`otp:${parsed.data.phone}`, RATE_LIMITS.otpPerPhonePerHour.limit, RATE_LIMITS.otpPerPhonePerHour.windowMs);
  if (!allowed) return apiErrors.rateLimited();

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data.phone });
  if (error) return apiErrors.internal(error.message);

  return apiOk({ message: "Code envoyé par SMS." });
}
