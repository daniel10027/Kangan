import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateLong, formatFcfa } from "@kangan/shared";
import { getSupabaseServerClient } from "@/server/supabase-server";

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: school } = await supabase.from("schools").select("*").eq("slug", slug).single();
  if (!school) notFound();

  const { data: currentYear } = await supabase.from("school_years").select("*").eq("is_current", true).single();
  const { data: feeSchedules } = await supabase
    .from("fee_schedules")
    .select("*")
    .eq("school_id", school.id)
    .eq("school_year_id", currentYear?.id ?? "")
    .order("level");

  return (
    <div>
      <div className="rounded-card bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-ocre">{school.commune}, {school.city}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-encre">{school.name}</h1>
        <p className="mt-2 text-sm text-encre/60">{(school.cycles ?? []).join(" · ")}</p>
        {school.address && <p className="mt-1 text-sm text-encre/50">{school.address}</p>}
      </div>

      <div className="mt-8 rounded-card bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold text-encre">Grille tarifaire {currentYear?.label}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-encre/10 text-left text-encre/50">
                <th className="py-2">Niveau</th>
                <th className="py-2">Inscription</th>
                <th className="py-2">Scolarité</th>
                <th className="py-2">Acompte</th>
                <th className="py-2">Date limite</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {(feeSchedules ?? []).map((fee) => (
                <tr key={fee.id} className="border-b border-encre/5">
                  <td className="py-3 font-semibold text-encre">{fee.level}</td>
                  <td className="py-3">{formatFcfa(fee.registration_fee)}</td>
                  <td className="py-3">{formatFcfa(fee.tuition_fee)}</td>
                  <td className="py-3">{fee.deposit_percent}%</td>
                  <td className="py-3">{formatDateLong(fee.deadline)}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/parent/nouvelle-caisse?school=${school.id}&fee=${fee.id}`}
                      className="font-semibold text-vert-kangan hover:underline"
                    >
                      Ouvrir une caisse →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
