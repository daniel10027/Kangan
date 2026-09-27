import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Client Supabase lié à la session de l'utilisateur courant (cookies),
 * respectant RLS. À utiliser dans les Server Components et Route Handlers
 * pour toute opération effectuée "au nom" du parent, de l'école, etc.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : ignoré, le middleware rafraîchit la session.
        }
      },
    },
  });
}

/**
 * Récupère l'utilisateur Supabase Auth courant (session uniquement), ou
 * null. À utiliser pour protéger une page qui ne requiert qu'une session
 * active — pas nécessairement un profil complet (ex. écran d'onboarding).
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Récupère le profil (avec rôle) de l'utilisateur authentifié courant, ou null. */
export async function getCurrentProfile() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return profile ?? null;
}
