import { getSupabaseAdmin } from "./supabase-admin";

/** Journal d'audit immuable — section 8 (A9) et section 15 (Traçabilité). */
export async function writeAuditLog(entry: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}) {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("audit_logs").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    ip: entry.ip ?? null,
  });
  if (error) {
    // Le journal d'audit ne doit jamais bloquer l'opération métier ; on trace l'échec côté logs applicatifs.
    console.error("audit_log insert failed", error);
  }
}
