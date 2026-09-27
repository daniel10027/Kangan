import { getSupabaseAdmin } from "@/server/supabase-admin";
import { SchoolStatusActions } from "./school-status-actions";

export default async function AdminSchoolsPage() {
  const admin = getSupabaseAdmin();
  const { data: schools } = await admin.from("schools").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Établissements</h1>
      <p className="text-sm text-encre/60">File de validation KYB, activation, suspension (A2).</p>

      <div className="mt-6 space-y-3">
        {(schools ?? []).map((school) => (
          <div key={school.id} className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-white p-5 shadow-soft">
            <div>
              <p className="font-display font-bold text-encre">{school.name}</p>
              <p className="text-sm text-encre/60">{school.commune}, {school.city} · RCCM {school.rccm ?? "—"}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold ${
                  school.status === "actif" ? "bg-feuille/15 text-feuille" : school.status === "suspendu" ? "bg-piment/15 text-piment" : "bg-ocre/20 text-terre-cuite"
                }`}
              >
                {school.status.replace("_", " ")}
              </span>
              <SchoolStatusActions schoolId={school.id} currentStatus={school.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
