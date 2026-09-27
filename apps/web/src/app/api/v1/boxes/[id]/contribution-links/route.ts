import { createContributionLinkSchema, generateContributionCode } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** POST /api/v1/boxes/{id}/contribution-links — lien de contribution familiale (P7, RG12). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createContributionLinkSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  let code = generateContributionCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: clash } = await supabase.from("contribution_links").select("id").eq("code", code).maybeSingle();
    if (!clash) break;
    code = generateContributionCode();
  }

  const expiresAt = new Date(Date.now() + parsed.data.expires_in_hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("contribution_links")
    .insert({ box_id: id, code, max_amount: parsed.data.max_amount, expires_at: expiresAt, created_by: user.id })
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk({ ...data, share_url: `${process.env.NEXT_PUBLIC_APP_URL}/contribuer/${code}` }, 201);
}
