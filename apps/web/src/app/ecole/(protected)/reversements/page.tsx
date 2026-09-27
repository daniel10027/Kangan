import { formatDateShort, formatFcfa } from "@kangan/shared";
import { getMySchoolMembership } from "@/server/school-helpers";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { PayoutRequestForm } from "./payout-request-form";

export default async function SchoolPayoutsPage() {
  const { schoolId } = await getMySchoolMembership();
  const supabase = await getSupabaseServerClient();

  const { data: payouts } = await supabase.from("payouts").select("*").eq("school_id", schoolId).order("created_at", { ascending: false });

  const { data: eligibleBoxes } = await supabase
    .from("savings_boxes")
    .select("id, reference, status, students(first_name, last_name)")
    .eq("school_id", schoolId)
    .in("status", ["active", "completee"]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Reversements</h1>
      <p className="text-sm text-encre/60">Demandez le virement des caisses actives vers votre compte bancaire (E6).</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PayoutRequestForm
            schoolId={schoolId}
            boxes={(eligibleBoxes ?? []).map((b) => ({
              id: b.id,
              reference: b.reference,
              students: Array.isArray(b.students) ? b.students[0] : b.students,
            }))}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-card bg-white shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-encre/10 text-left text-encre/50">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Caisses</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(payouts ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-encre/5">
                    <td className="px-5 py-3">{formatDateShort(p.created_at)}</td>
                    <td className="px-5 py-3 font-semibold">{formatFcfa(p.amount)}</td>
                    <td className="px-5 py-3 text-encre/60">{p.box_ids.length}</td>
                    <td className="px-5 py-3 capitalize">{p.status.replace("_", " ")}</td>
                  </tr>
                ))}
                {(payouts ?? []).length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-encre/50">Aucune demande de reversement.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
