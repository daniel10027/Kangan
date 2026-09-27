import { apiErrors, apiOk } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/schools/{id}/dashboard — indicateurs agrégés (E4). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data: member } = await supabase.from("school_members").select("role").eq("school_id", id).eq("profile_id", user.id).single();
  if (!member) return apiErrors.forbidden();

  const { data: boxes } = await supabase.from("savings_boxes").select("id, status, target_amount, deadline").eq("school_id", id);
  const boxIds = (boxes ?? []).map((b) => b.id);

  const { data: balances } = boxIds.length ? await supabase.from("box_balances").select("*").in("box_id", boxIds) : { data: [] };
  const balanceByBox = new Map((balances ?? []).map((b) => [b.box_id, b]));

  const activeBoxes = (boxes ?? []).filter((b) => b.status === "active" || b.status === "completee");
  const totalSaved = activeBoxes.reduce((sum, b) => sum + (balanceByBox.get(b.id)?.balance ?? 0), 0);
  const totalExpected = activeBoxes.reduce((sum, b) => sum + b.target_amount, 0);
  const completionRate = totalExpected > 0 ? Math.round((totalSaved / totalExpected) * 100) : 0;

  const today = new Date();
  const lateBoxes = activeBoxes.filter((b) => {
    const balance = balanceByBox.get(b.id)?.balance ?? 0;
    const percent = balanceByBox.get(b.id)?.percent_reached ?? 0;
    return new Date(b.deadline) < today && percent < 100 && balance >= 0;
  }).length;

  return apiOk({
    active_boxes: activeBoxes.length,
    total_boxes: (boxes ?? []).length,
    total_saved: totalSaved,
    total_expected: totalExpected,
    completion_rate: completionRate,
    late_boxes: lateBoxes,
    by_status: {
      brouillon: (boxes ?? []).filter((b) => b.status === "brouillon").length,
      en_attente: (boxes ?? []).filter((b) => b.status === "en_attente").length,
      active: (boxes ?? []).filter((b) => b.status === "active").length,
      completee: (boxes ?? []).filter((b) => b.status === "completee").length,
      reversee: (boxes ?? []).filter((b) => b.status === "reversee").length,
      suspendue: (boxes ?? []).filter((b) => b.status === "suspendue").length,
    },
  });
}
