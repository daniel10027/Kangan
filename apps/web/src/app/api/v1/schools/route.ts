import { schoolSearchQuerySchema } from "@kangan/shared";
import { apiOk, apiValidationError } from "@/server/api-response";
import { getSupabaseServerClient } from "@/server/supabase-server";

/** GET /api/v1/schools — liste et recherche des écoles (commune, cycle, texte). Public. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = schoolSearchQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    commune: searchParams.get("commune") ?? undefined,
    cycle: searchParams.get("cycle") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
  });
  if (!parsed.success) return apiValidationError(parsed.error);
  const { q, commune, cycle, limit } = parsed.data;

  const supabase = await getSupabaseServerClient();
  let query = supabase.from("schools").select("*").eq("status", "actif").order("name").limit(limit);

  if (q) query = query.ilike("name", `%${q}%`);
  if (commune) query = query.eq("commune", commune);
  if (cycle) query = query.contains("cycles", [cycle]);

  const { data, error } = await query;
  if (error) return apiOk({ items: [], error: error.message }, 500);

  return apiOk({ items: data ?? [] });
}
