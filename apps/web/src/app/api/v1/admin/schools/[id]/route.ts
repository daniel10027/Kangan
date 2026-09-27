import { z } from "zod";
import { apiErrors, apiOk, apiValidationError } from "@/server/api-response";
import { writeAuditLog } from "@/server/audit";
import { requireKanganStaff } from "@/server/require-role";
import { getSupabaseAdmin } from "@/server/supabase-admin";
import { getAuthedSupabase } from "@/server/authed-supabase";

const updateSchema = z.object({ status: z.enum(["en_attente_kyb", "actif", "suspendu"]) });

/** PUT /api/v1/admin/schools/{id} — active ou suspend un établissement (A2). */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await getAuthedSupabase(request);
  if (!user) return apiErrors.unauthorized();
  const forbidden = await requireKanganStaff(supabase, user.id);
  if (forbidden) return forbidden;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiValidationError(parsed.error);

  const admin = getSupabaseAdmin();
  const { data: before } = await admin.from("schools").select("*").eq("id", id).single();
  const { data, error } = await admin.from("schools").update({ status: parsed.data.status }).eq("id", id).select().single();
  if (error) return apiErrors.internal(error.message);

  await writeAuditLog({ actorId: user.id, action: "update_school_status", entity: "schools", entityId: id, before, after: data });

  return apiOk(data);
}
