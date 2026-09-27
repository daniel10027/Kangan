import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabase-server";

/**
 * Résout un client Supabase respectant RLS pour la requête courante, que
 * l'appelant soit le navigateur web (session par cookies) ou l'application
 * mobile (jeton `Authorization: Bearer <access_token>` — le mobile ne peut
 * pas s'appuyer sur les cookies). Architecture section 12 : "un seul
 * contrat de données ... partagé par le web et le mobile."
 */
export async function getAuthedSupabase(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    return { supabase, user };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
