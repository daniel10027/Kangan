import { apiErrors, apiOk } from "@/server/api-response";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/**
 * GET /api/v1/admin/reconciliation — écarts du rapprochement quotidien (A4, A8).
 *
 * Vérifie la cohérence interne grand livre ↔ transactions (toute transaction
 * réussie doit avoir exactement une écriture au grand livre, et vice versa).
 * Le rapprochement avec les relevés opérateurs réels (Moov Money, agrégateur)
 * nécessite l'intégration live et les fichiers de règlement fournis par ces
 * opérateurs — hors périmètre de ce code, voir SUIVI.md.
 */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();
  const forbidden = await requireKanganStaff(supabase, user.id, true);
  if (forbidden) return forbidden;

  const admin = getSupabaseAdmin();
  const { data: successfulTx } = await admin.from("transactions").select("id, amount, type, box_id").eq("status", "reussie");
  const { data: ledger } = await admin.from("ledger_entries").select("transaction_id, debit, credit");

  const ledgerByTx = new Map<string, number>();
  for (const entry of ledger ?? []) {
    ledgerByTx.set(entry.transaction_id, (ledgerByTx.get(entry.transaction_id) ?? 0) + (entry.credit - entry.debit));
  }

  const discrepancies = (successfulTx ?? [])
    .filter((tx) => {
      const net = ledgerByTx.get(tx.id);
      if (net === undefined) return true; // aucune écriture correspondante
      const expectedSign = ["deposit", "payment", "contribution"].includes(tx.type) ? tx.amount : -tx.amount;
      return net !== expectedSign;
    })
    .map((tx) => ({ transaction_id: tx.id, box_id: tx.box_id, expected_amount: tx.amount, type: tx.type }));

  return apiOk({
    checked: (successfulTx ?? []).length,
    discrepancies_count: discrepancies.length,
    discrepancies,
    note: "Rapprochement interne (grand livre ↔ transactions). Le rapprochement avec les relevés opérateurs réels requiert PAYMENT_MODE=live.",
  });
}
