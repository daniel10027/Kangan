import { formatFcfa } from "@kangan/shared";
import { getSupabaseAdmin } from "@/server/supabase-admin";

export default async function AdminDashboardPage() {
  const admin = getSupabaseAdmin();

  const [{ count: schoolsActive }, { count: boxesActive }, { data: ledger }] = await Promise.all([
    admin.from("schools").select("id", { count: "exact", head: true }).eq("status", "actif"),
    admin.from("savings_boxes").select("id", { count: "exact", head: true }).in("status", ["active", "completee"]),
    admin.from("ledger_entries").select("account, debit, credit"),
  ]);

  const totalSaved = (ledger ?? []).filter((l) => l.account === "caisse").reduce((sum, l) => sum + (l.credit - l.debit), 0);

  const { data: todayTx } = await admin.from("transactions").select("amount, operator, status").gte("created_at", new Date().toISOString().slice(0, 10));
  const byOperator: Record<string, number> = {};
  for (const t of todayTx ?? []) if (t.status === "reussie") byOperator[t.operator] = (byOperator[t.operator] ?? 0) + t.amount;

  const KPI = [
    { label: "Établissements actifs", value: (schoolsActive ?? 0).toString() },
    { label: "Caisses actives", value: (boxesActive ?? 0).toString() },
    { label: "Volume épargné cumulé", value: formatFcfa(totalSaved) },
    { label: "Transactions aujourd'hui", value: (todayTx ?? []).length.toString() },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Vue globale</h1>
      <p className="text-sm text-encre/60">Volume épargné, transactions du jour, caisses actives, répartition par opérateur (A1).</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <div key={k.label} className="rounded-card bg-white p-5 text-center shadow-soft">
            <p className="font-display text-2xl font-bold text-vert-kangan">{k.value}</p>
            <p className="mt-1 text-xs text-encre/50">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-card bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-encre">Volume du jour par opérateur</h2>
        <div className="mt-4 space-y-2">
          {Object.entries(byOperator).map(([op, amount]) => (
            <div key={op} className="flex items-center justify-between border-b border-encre/5 py-2 text-sm">
              <span className="capitalize text-encre/60">{op.replace("_", " ")}</span>
              <span className="font-semibold text-encre">{formatFcfa(amount)}</span>
            </div>
          ))}
          {Object.keys(byOperator).length === 0 && <p className="text-sm text-encre/50">Aucune transaction réussie aujourd'hui.</p>}
        </div>
      </div>
    </div>
  );
}
