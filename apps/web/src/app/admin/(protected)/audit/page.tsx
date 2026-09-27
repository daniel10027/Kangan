import { formatDateShort } from "@kangan/shared";
import { getSupabaseAdmin } from "@/server/supabase-admin";

export default async function AdminAuditPage() {
  const admin = getSupabaseAdmin();
  const { data: logs } = await admin.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-encre">Journal d'audit</h1>
      <p className="text-sm text-encre/60">Journal immuable de toutes les actions sensibles : qui, quoi, quand (A9).</p>

      <div className="mt-6 overflow-x-auto rounded-card bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-encre/10 text-left text-encre/50">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Entité</th>
              <th className="px-5 py-3">Acteur</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-b border-encre/5">
                <td className="px-5 py-3">{formatDateShort(log.created_at)}</td>
                <td className="px-5 py-3 font-medium">{log.action}</td>
                <td className="px-5 py-3 text-encre/60">{log.entity} {log.entity_id ? `· ${log.entity_id.slice(0, 8)}` : ""}</td>
                <td className="px-5 py-3 text-encre/60">{log.actor_id ? log.actor_id.slice(0, 8) : "système"}</td>
              </tr>
            ))}
            {(logs ?? []).length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-encre/50">Aucune entrée pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
