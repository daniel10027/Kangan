import { computeDepositAmount, computeSavingsPlan, computeTargetAmount, createSavingsBoxSchema } from "@kangan/shared";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { getAuthedSupabase } from "@/server/authed-supabase";

/**
 * POST /api/v1/boxes — crée une caisse en brouillon et calcule l'acompte
 * (RG01, RG02). Section 6, module P3 : "Assistant en 4 écrans".
 */
export async function POST(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createSavingsBoxSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);
  const input = parsed.data;

  const { data: student } = await supabase.from("students").select("*").eq("id", input.student_id).eq("parent_id", user.id).single();
  if (!student) return apiErrors.notFound("Élève");

  const { data: feeSchedule } = await supabase.from("fee_schedules").select("*").eq("id", input.fee_schedule_id).single();
  if (!feeSchedule) return apiErrors.notFound("Grille tarifaire");

  const { data: currentYear } = await supabase.from("school_years").select("*").eq("is_current", true).single();
  if (!currentYear) return apiErrors.internal("Aucune année scolaire courante configurée.");

  // RG15 : vérification amicale avant l'insertion (l'index unique en base est le garde-fou final).
  const { data: existingActive } = await supabase
    .from("savings_boxes")
    .select("id")
    .eq("student_id", input.student_id)
    .eq("school_year_id", currentYear.id)
    .in("status", ["en_attente", "active", "completee"])
    .maybeSingle();
  if (existingActive) return apiErrors.conflict("Cet élève a déjà une caisse active pour cette année scolaire (RG15).");

  const targetAmount = computeTargetAmount(
    { registrationFee: feeSchedule.registration_fee, tuitionFee: feeSchedule.tuition_fee, extraFees: feeSchedule.extra_fees },
    input.goal_type,
  );
  const depositAmount = computeDepositAmount(targetAmount, feeSchedule.deposit_percent);
  const plan = computeSavingsPlan(targetAmount, depositAmount, feeSchedule.deadline, input.plan_frequency);

  const { data: reference } = await supabase.rpc("next_box_reference", { p_year: new Date(currentYear.starts_on).getFullYear() });

  const { data: box, error } = await supabase
    .from("savings_boxes")
    .insert({
      reference,
      student_id: input.student_id,
      school_id: input.school_id,
      school_year_id: currentYear.id,
      fee_schedule_id: input.fee_schedule_id,
      goal_type: input.goal_type,
      target_amount: targetAmount,
      deposit_amount: depositAmount,
      status: "brouillon",
      deadline: feeSchedule.deadline,
      plan_frequency: input.plan_frequency,
      suggested_payment: plan.suggestedPayment,
      color: input.color,
    })
    .select()
    .single();
  if (error) return apiErrors.internal(error.message);

  return apiOk({ box, plan }, 201);
}

/** GET /api/v1/boxes — liste des caisses visibles par l'utilisateur connecté (parent ou école). */
export async function GET(request: Request) {
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();

  const { data, error } = await supabase
    .from("savings_boxes")
    .select("*, students(*), schools(name, slug, logo_url)")
    .order("created_at", { ascending: false });
  if (error) return apiErrors.internal(error.message);

  const boxIds = (data ?? []).map((b) => b.id);
  const { data: balances } = boxIds.length
    ? await supabase.from("box_balances").select("*").in("box_id", boxIds)
    : { data: [] };
  const balanceByBoxId = new Map((balances ?? []).map((b) => [b.box_id, b]));

  const items = (data ?? []).map((box) => ({
    ...box,
    balance: balanceByBoxId.get(box.id) ?? { balance: 0, percent_reached: 0, last_payment_at: null },
  }));

  return apiOk({ items });
}
