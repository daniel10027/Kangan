import type { SupabaseClient } from "@supabase/supabase-js";
import { apiErrors } from "./api-response";

/** Vérifie que l'utilisateur connecté appartient à l'équipe Kangan (back-office, section 8). */
export async function requireKanganStaff(supabase: SupabaseClient, userId: string, requireSuperAdmin = false) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile) return apiErrors.forbidden();
  if (requireSuperAdmin && profile.role !== "kangan_super_admin") return apiErrors.forbidden("Réservé au super-admin.");
  if (!["kangan_agent", "kangan_super_admin"].includes(profile.role)) return apiErrors.forbidden();
  return null;
}
