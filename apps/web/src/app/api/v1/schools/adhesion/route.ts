import { schoolAdhesionSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getSupabaseAdmin } from "@/server/supabase-admin";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * POST /api/v1/schools/adhesion — formulaire d'adhésion établissement (E1).
 * Crée l'école au statut "en_attente_kyb" ; validation manuelle sous 72h
 * par l'équipe Kangan via le back-office (A2), section 5.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schoolAdhesionSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);
  const input = parsed.data;

  const admin = getSupabaseAdmin();
  const baseSlug = slugify(`${input.name}-${input.commune}`);
  let slug = baseSlug;
  for (let i = 1; i < 20; i++) {
    const { data: clash } = await admin.from("schools").select("id").eq("slug", slug).maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data, error } = await admin
    .from("schools")
    .insert({
      name: input.name,
      slug,
      type: input.type,
      cycles: input.cycles,
      commune: input.commune,
      city: input.city,
      address: input.address ?? null,
      rccm: input.rccm ?? null,
      responsible_name: input.responsible_name,
      responsible_phone: input.responsible_phone,
      bank_account_iban: input.bank_account_iban,
      status: "en_attente_kyb",
    })
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk({ school: data, message: "Demande reçue. Notre équipe valide les dossiers sous 72 heures (KYB)." }, 201);
}
