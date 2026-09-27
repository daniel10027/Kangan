import { formatDateLong, formatFcfa } from "@kangan/shared";
import { Logo } from "@/components/Logo";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { computeVerifyHash } from "@kangan/shared";

export const dynamic = "force-dynamic";

export default async function VerifyStatementPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const admin = getSupabaseAdmin();

  const { data: statement } = await admin
    .from("statements")
    .select("number, total, period_start, period_end, verify_hash, savings_boxes(reference, schools(name))")
    .eq("number", number)
    .single();

  const box = statement?.savings_boxes as unknown as { reference: string; schools: { name: string } } | undefined;
  const secret = process.env.JWT_AUDIT_SALT ?? "dev-secret";
  const valid =
    statement && box
      ? computeVerifyHash(
          { number: statement.number, boxReference: box.reference, total: statement.total, periodStart: statement.period_start, periodEnd: statement.period_end },
          secret,
        ) === statement.verify_hash
      : false;

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme px-5 py-12">
      <div className="w-full max-w-sm rounded-card bg-white p-8 text-center shadow-soft">
        <Logo className="justify-center" />

        {statement && valid ? (
          <div className="mt-8">
            <span className="inline-flex rounded-pill bg-feuille/15 px-4 py-1.5 text-sm font-semibold text-feuille">✓ Relevé authentique</span>
            <p className="mt-4 font-display text-lg font-bold text-encre">{box?.schools.name}</p>
            <p className="text-sm text-encre/60">Caisse {box?.reference}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-encre/60">Période : {formatDateLong(statement.period_start)} — {formatDateLong(statement.period_end)}</p>
              <p className="font-display text-2xl font-bold text-vert-kangan">{formatFcfa(statement.total)}</p>
            </div>
            <p className="mt-4 text-xs text-encre/40">N° {statement.number}</p>
          </div>
        ) : (
          <div className="mt-8">
            <span className="inline-flex rounded-pill bg-piment/15 px-4 py-1.5 text-sm font-semibold text-piment">✗ Relevé introuvable</span>
            <p className="mt-4 text-sm text-encre/60">Ce numéro de relevé n'a pas pu être vérifié.</p>
          </div>
        )}
      </div>
    </div>
  );
}
