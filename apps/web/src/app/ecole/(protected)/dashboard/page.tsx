import { formatFcfa } from "@kangan/shared";
import { getMySchoolMembership } from "@/server/school-helpers";
import { getSupabaseServerClient } from "@/server/supabase-server";

export default async function SchoolDashboardPage() {
  const { schoolId, school } = await getMySchoolMembership();
  const supabase = await getSupabaseServerClient();

  const { data: boxes } = await supabase.from("savings_boxes").select("id, status, target_amount").eq("school_id", schoolId);
  const boxIds = (boxes ?? []).map((b) => b.id);
  const { data: balances } = boxIds.length ? await supabase.from("box_balances").select("*").in("box_id", boxIds) : { data: [] };
  const balanceByBox = new Map((balances ?? []).map((b) => [b.box_id, b]));

  const activeBoxes = (boxes ?? []).filter((b) => b.status === "active" || b.status === "completee");
  const totalSaved = activeBoxes.reduce((sum, b) => sum + (balanceByBox.get(b.id)?.balance ?? 0), 0);
  const totalExpected = activeBoxes.reduce((sum, b) => sum + b.target_amount, 0);
  const completionRate = totalExpected > 0 ? Math.round((totalSaved / totalExpected) * 100) : 0;

  const byStatus = ["brouillon", "en_attente", "active", "completee", "reversee", "suspendue"].map((status) => ({
    status,
    count: (boxes ?? []).filter((b) => b.status === status).length,
  }));

  const KPI = [
    { label: "Caisses actives", value: activeBoxes.length.toString() },
    { label: "Montant épargné", value: formatFcfa(totalSaved) },
    { label: "Montant attendu", value: formatFcfa(totalExpected) },
    { label: "Taux de complétion", value: `${completionRate}%` },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">{school.name}</h1>
      <p className="text-sm text-encre/60">Tableau de bord — année scolaire en cours</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.label} className="rounded-card bg-white p-5 text-center shadow-soft">
            <p className="font-display text-2xl font-bold text-vert-kangan">{k.value}</p>
            <p className="mt-1 text-xs text-encre/50">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-card bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-encre">Répartition par statut</h2>
        <div className="mt-4 space-y-2">
          {byStatus.map((s) => (
            <div key={s.status} className="flex items-center gap-3">
              <span className="w-32 text-sm capitalize text-encre/60">{s.status.replace("_", " ")}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-encre/10">
                <div
                  className="h-full rounded-pill bg-ocre"
                  style={{ width: `${(boxes ?? []).length ? (s.count / (boxes ?? []).length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-semibold text-encre">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
