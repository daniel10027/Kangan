import { formatDateShort, formatFcfa } from "@kangan/shared";
import { getSupabaseAdmin } from "@/server/supabase-admin";

export default async function AdminTransactionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const admin = getSupabaseAdmin();

  let query = admin.from("transactions").select("*, savings_boxes(reference)").order("created_at", { ascending: false }).limit(100);
  if (status) query = query.eq("status", status);
  const { data: transactions } = await query;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Transactions</h1>
      <p className="text-sm text-encre/60">Journal complet, statut opérateur, relance des callbacks (A4).</p>

      <div className="mt-4 flex gap-2">
        {["", "initiee", "reussie", "echouee", "annulee"].map((s) => (
          <a key={s || "all"} href={s ? `?status=${s}` : "?"} className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${status === s || (!status && !s) ? "bg-vert-kangan text-creme" : "bg-white text-encre/60"}`}>
            {s || "Toutes"}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-encre/10 text-left text-encre/50">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Caisse</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Opérateur</th>
              <th className="px-5 py-3">Montant</th>
              <th className="px-5 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {(transactions ?? []).map((t) => (
              <tr key={t.id} className="border-b border-encre/5">
                <td className="px-5 py-3">{formatDateShort(t.created_at)}</td>
                <td className="px-5 py-3 text-encre/60">{(t.savings_boxes as unknown as { reference: string })?.reference}</td>
                <td className="px-5 py-3 capitalize">{t.type}</td>
                <td className="px-5 py-3 capitalize">{t.operator.replace("_", " ")}</td>
                <td className="px-5 py-3 font-semibold">{formatFcfa(t.amount)}</td>
                <td className="px-5 py-3 capitalize">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
