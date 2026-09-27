import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./supabase-server";

/** Récupère l'établissement du membre connecté, ou redirige vers la connexion. */
export async function getMySchoolMembership() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ecole/login");

  const { data: membership } = await supabase
    .from("school_members")
    .select("role, school_id, schools(*)")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!membership) redirect("/ecole/login");

  return { userId: user.id, role: membership.role, schoolId: membership.school_id, school: membership.schools as unknown as { id: string; name: string } };
}
