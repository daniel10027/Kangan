import { formatDateShort, formatFcfa } from "@kangan/shared";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { ReversalForm } from "./reversal-form";

export default async function AdminDisputesPage() {
  const admin = getSupabaseAdmin();
  const { data: transactions } = await admin
    .from("transactions")
    .select("*, savings_boxes(reference)")
    .eq("status", "reussie")
    .neq("type", "reversal")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Litiges et remboursements</h1>
      <p className="text-sm text-encre/60">
        Toute correction passe par une contre-écriture motivée (RG13) — la transaction d'origine n'est jamais modifiée.
      </p>

      <div className="mt-6 space-y-3">
        {(transactions ?? []).map((t) => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-white p-5 shadow-soft">
            <div>
              <p className="font-semibold text-encre">
                {formatFcfa(t.amount)} · <span className="capitalize">{t.type}</span>
              </p>
              <p className="text-sm text-encre/60">
                {(t.savings_boxes as unknown as { reference: string })?.reference} · {formatDateShort(t.created_at)} · {t.operator}
              </p>
            </div>
            <ReversalForm transactionId={t.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
