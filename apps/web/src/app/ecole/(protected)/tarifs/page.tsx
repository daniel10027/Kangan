import { getMySchoolMembership } from "@/server/school-helpers";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { FeeScheduleEditor } from "./fee-schedule-editor";

export default async function SchoolFeesPage() {
  const { schoolId } = await getMySchoolMembership();
  const supabase = await getSupabaseServerClient();

  const { data: currentYear } = await supabase.from("school_years").select("*").eq("is_current", true).single();
  const { data: feeSchedules } = await supabase
    .from("fee_schedules")
    .select("*")
    .eq("school_id", schoolId)
    .eq("school_year_id", currentYear?.id ?? "")
    .order("level");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Grille tarifaire {currentYear?.label}</h1>
      <p className="text-sm text-encre/60">Frais d'inscription, scolarité et pourcentage d'acompte par niveau (E3).</p>

      <div className="mt-8">
        <FeeScheduleEditor schoolId={schoolId} schoolYearId={currentYear?.id ?? ""} initialFees={feeSchedules ?? []} />
      </div>
    </div>
  );
}
