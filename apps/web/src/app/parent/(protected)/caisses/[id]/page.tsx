import { notFound } from "next/navigation";
import { formatDateLong, formatFcfa } from "@kangan/shared";
import { getSupabaseServerClient } from "@/server/supabase-server";
import { JaugeCanari } from "@/components/JaugeCanari";
import { StatusBadge } from "@/components/StatusBadge";
import { TransactionLine } from "@/components/TransactionLine";
import { BoxActions } from "./box-actions";

export default async function BoxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  const { data: box } = await supabase.from("savings_boxes").select("*, students(*), schools(*)").eq("id", id).single();
  if (!box) notFound();

  const { data: balance } = await supabase.from("box_balances").select("*").eq("box_id", id).single();
  const { data: transactions } = await supabase.from("transactions").select("*").eq("box_id", id).order("created_at", { ascending: false });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const student = box.students as unknown as { first_name: string; last_name: string };
  const school = box.schools as unknown as { name: string };
  const percent = balance?.percent_reached ?? 0;
  const remaining = Math.max(box.target_amount - (balance?.balance ?? 0), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-card bg-white p-6 text-center shadow-soft">
          <StatusBadge status={box.status} />
          <h1 className="mt-3 font-display text-xl font-bold text-encre">{student.first_name} {student.last_name}</h1>
          <p className="text-sm text-encre/60">{school.name}</p>
          <p className="mt-1 text-xs text-encre/40">{box.reference}</p>

          <div className="mt-6 flex justify-center">
            <JaugeCanari balance={balance?.balance ?? 0} targetAmount={box.target_amount} percent={percent} />
          </div>

          <p className="mt-4 text-sm text-encre/60">
            Reste <span className="font-semibold text-encre">{formatFcfa(remaining)}</span> avant le {formatDateLong(box.deadline)}
          </p>

          <div className="mt-6">
            <BoxActions
              boxId={box.id}
              suggestedAmount={box.suggested_payment}
              defaultPhone={user?.phone ?? ""}
              status={box.status}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-encre">Historique</h2>
          <div className="mt-4">
            {(transactions ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-encre/50">Aucun mouvement pour le moment.</p>
            ) : (
              (transactions ?? []).map((t) => (
                <TransactionLine key={t.id} type={t.type} amount={t.amount} operator={t.operator} status={t.status} createdAt={t.created_at} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
