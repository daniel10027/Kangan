import { renderToBuffer } from "@react-pdf/renderer";
import { computeVerifyHash } from "@kangan/shared";
import { apiErrors } from "@/server/api-response";
import { buildQrDataUrl, StatementPdfDocument } from "@/server/pdf/statement-pdf";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

/**
 * GET /api/v1/boxes/{id}/statement — génère le relevé PDF horodaté avec QR
 * code de vérification (P6, RG14). Le relevé affiché au parent et celui
 * affiché à l'école partagent le même numéro et le même total (critère
 * d'acceptation, section 6).
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data: box } = await supabase.from("savings_boxes").select("*, students(*), schools(name)").eq("id", id).single();
  if (!box) return apiErrors.notFound("Caisse");

  const { searchParams } = new URL(request.url);
  const periodStart = searchParams.get("period_start") ?? box.created_at.slice(0, 10);
  const periodEnd = searchParams.get("period_end") ?? new Date().toISOString().slice(0, 10);

  // period_end est une date (sans heure) : la borne haute doit inclure toute
  // la journée, donc on compare à minuit du jour SUIVANT avec une borne
  // strictement inférieure plutôt qu'à minuit du jour même.
  const periodEndExclusive = new Date(`${periodEnd}T00:00:00.000Z`);
  periodEndExclusive.setUTCDate(periodEndExclusive.getUTCDate() + 1);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("box_id", id)
    .eq("status", "reussie")
    .gte("created_at", periodStart)
    .lt("created_at", periodEndExclusive.toISOString())
    .order("created_at");

  const total = (transactions ?? []).reduce((sum, t) => (["deposit", "payment", "contribution"].includes(t.type) ? sum + t.amount : sum), 0);

  const admin = getSupabaseAdmin();
  const year = new Date().getFullYear();
  const { data: number } = await admin.rpc("next_statement_number", { p_year: year });

  const secret = process.env.JWT_AUDIT_SALT ?? "dev-secret";
  const verifyHash = computeVerifyHash({ number, boxReference: box.reference, total, periodStart, periodEnd }, secret);
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify/${number}`;

  await admin.from("statements").insert({
    box_id: id,
    number,
    period_start: periodStart,
    period_end: periodEnd,
    total,
    verify_hash: verifyHash,
  });

  const qrDataUrl = await buildQrDataUrl(verifyUrl);
  const student = box.students as unknown as { first_name: string; last_name: string };
  const school = box.schools as unknown as { name: string };

  const pdfBuffer = await renderToBuffer(
    <StatementPdfDocument
      statementNumber={number}
      boxReference={box.reference}
      studentName={`${student.first_name} ${student.last_name}`}
      schoolName={school.name}
      periodStart={periodStart}
      periodEnd={periodEnd}
      targetAmount={box.target_amount}
      total={total}
      transactions={transactions ?? []}
      verifyUrl={verifyUrl}
      qrDataUrl={qrDataUrl}
    />,
  );

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="releve-${box.reference}-${number}.pdf"`,
    },
  });
}
