import Link from "next/link";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { CaisseCard } from "@/components/CaisseCard";
import { EmptyState } from "@/components/EmptyState";
import { CanariIcon } from "@/components/CanariIcon";

export default async function ParentDashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: boxes } = await supabase
    .from("savings_boxes")
    .select("*, students(first_name, last_name), schools(name)")
    .order("created_at", { ascending: false });

  const boxIds = (boxes ?? []).map((b) => b.id);
  const { data: balances } = boxIds.length ? await supabase.from("box_balances").select("*").in("box_id", boxIds) : { data: [] };
  const balanceByBoxId = new Map((balances ?? []).map((b) => [b.box_id, b]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-encre">Mes caisses scolaires</h1>
          <p className="text-sm text-encre/60">{user?.phone}</p>
        </div>
        <Link
          href="/parent/nouvelle-caisse"
          className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-field bg-vert-kangan px-5 font-semibold text-creme hover:bg-vert-kangan/90"
        >
          + Nouvelle caisse
        </Link>
      </div>

      <div className="mt-8">
        {(boxes ?? []).length === 0 ? (
          <EmptyState
            icon={<CanariIcon percent={0} className="h-16 w-16" />}
            title="Aucune caisse pour le moment"
            description="Créez votre première caisse scolaire en moins de 3 minutes."
            action={
              <Link href="/parent/nouvelle-caisse" className="font-semibold text-vert-kangan hover:underline">
                Ouvrir une caisse →
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(boxes ?? []).map((box) => {
              const balance = balanceByBoxId.get(box.id);
              const student = box.students as unknown as { first_name: string; last_name: string };
              const school = box.schools as unknown as { name: string };
              return (
                <CaisseCard
                  key={box.id}
                  id={box.id}
                  reference={box.reference}
                  studentName={`${student.first_name} ${student.last_name}`}
                  schoolName={school.name}
                  status={box.status}
                  balance={balance?.balance ?? 0}
                  targetAmount={box.target_amount}
                  percent={balance?.percent_reached ?? 0}
                  deadline={box.deadline}
                  color={box.color}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
