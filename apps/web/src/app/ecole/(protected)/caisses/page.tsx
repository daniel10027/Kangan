import { formatFcfa } from "@kangan/shared";
import { getMySchoolMembership } from "@/server/school-helpers";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { StatusBadge } from "@/components/StatusBadge";

export default async function SchoolBoxesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { schoolId } = await getMySchoolMembership();
  const { status } = await searchParams;
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("savings_boxes")
    .select("*, students(first_name, last_name)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: boxes } = await query;

  const boxIds = (boxes ?? []).map((b) => b.id);
  const { data: balances } = boxIds.length ? await supabase.from("box_balances").select("*").in("box_id", boxIds) : { data: [] };
  const balanceByBox = new Map((balances ?? []).map((b) => [b.box_id, b]));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Gestion des caisses</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {["", "brouillon", "en_attente", "active", "completee", "reversee", "suspendue"].map((s) => (
          <a
            key={s || "all"}
            href={s ? `?status=${s}` : "?"}
            className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${status === s || (!status && !s) ? "bg-vert-kangan text-creme" : "bg-white text-encre/60"}`}
          >
            {s ? s.replace("_", " ") : "Toutes"}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-encre/10 text-left text-encre/50">
              <th className="px-5 py-3">Élève</th>
              <th className="px-5 py-3">Référence</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Progression</th>
              <th className="px-5 py-3">Objectif</th>
            </tr>
          </thead>
          <tbody>
            {(boxes ?? []).map((box) => {
              const student = box.students as unknown as { first_name: string; last_name: string };
              const balance = balanceByBox.get(box.id);
              return (
                <tr key={box.id} className="border-b border-encre/5">
                  <td className="px-5 py-3 font-medium text-encre">{student.first_name} {student.last_name}</td>
                  <td className="px-5 py-3 text-encre/60">{box.reference}</td>
                  <td className="px-5 py-3"><StatusBadge status={box.status} /></td>
                  <td className="px-5 py-3">{balance?.percent_reached ?? 0}%</td>
                  <td className="px-5 py-3">{formatFcfa(box.target_amount)}</td>
                </tr>
              );
            })}
            {(boxes ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-encre/50">Aucune caisse.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
