import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase "service role" — contourne RLS. Réservé strictement au
 * code serveur (routes API, jamais exposé au navigateur). Utilisé pour :
 *  - écrire dans transactions/ledger_entries (section 15 : "seules les
 *    fonctions serveur écrivent dans transactions et ledger_entries")
 *  - le back-office Kangan, après vérification applicative du rôle
 *  - la vérification publique d'un relevé (/verify/{number})
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis côté serveur.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
