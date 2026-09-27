import { apiErrors, apiOk } from "@/server/api-response";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/** GET /api/v1/admin/overview — vue globale du back-office (A1). */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const forbidden = await requireKanganStaff(supabase, user.id);
  if (forbidden) return forbidden;

  const admin = getSupabaseAdmin();
  const [{ count: schoolsActive }, { count: boxesActive }, { data: ledger }, { data: schools }] = await Promise.all([
    admin.from("schools").select("id", { count: "exact", head: true }).eq("status", "actif"),
    admin.from("savings_boxes").select("id", { count: "exact", head: true }).in("status", ["active", "completee"]),
    admin.from("ledger_entries").select("account, debit, credit"),
    admin.from("schools").select("id, name"),
  ]);

  const totalSaved = (ledger ?? [])
    .filter((l) => l.account === "caisse")
    .reduce((sum, l) => sum + (l.credit - l.debit), 0);

  const { data: todayTx } = await admin
    .from("transactions")
    .select("id, amount, operator, status")
    .gte("created_at", new Date().toISOString().slice(0, 10));

  const byOperator: Record<string, number> = {};
  for (const t of todayTx ?? []) {
    if (t.status === "reussie") byOperator[t.operator] = (byOperator[t.operator] ?? 0) + t.amount;
  }

  return apiOk({
    schools_active: schoolsActive ?? 0,
    boxes_active: boxesActive ?? 0,
    total_saved: totalSaved,
    transactions_today: (todayTx ?? []).length,
    volume_today_by_operator: byOperator,
    schools_count: (schools ?? []).length,
  });
}
