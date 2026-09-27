"use client";

import { useState } from "react";
import { formatFcfa } from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";

interface FeeSchedule {
  id: string;
  level: string;
  registration_fee: number;
  tuition_fee: number;
  deposit_percent: number;
  min_payment: number;
  deadline: string;
  extra_fees: Array<{ label: string; amount: number }>;
}

export function FeeScheduleEditor({ schoolId, schoolYearId, initialFees }: { schoolId: string; schoolYearId: string; initialFees: FeeSchedule[] }) {
  const [fees, setFees] = useState(initialFees);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<FeeSchedule>>({});
  const [newLevel, setNewLevel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function startEdit(fee: FeeSchedule) {
    setEditing(fee.id);
    setDraft(fee);
  }

  async function save(level: string) {
    setLoading(true);
    setError(null);
    try {
      const saved = await api.put<FeeSchedule>(`/schools/${schoolId}/fees`, {
        school_year_id: schoolYearId,
        level,
        registration_fee: Number(draft.registration_fee),
        tuition_fee: Number(draft.tuition_fee),
        deposit_percent: Number(draft.deposit_percent),
        min_payment: Number(draft.min_payment) || 500,
        deadline: draft.deadline,
        extra_fees: draft.extra_fees ?? [],
      });
      setFees((prev) => {
        const others = prev.filter((f) => f.level !== level);
        return [...others, saved].sort((a, b) => a.level.localeCompare(b.level));
      });
      setEditing(null);
      setNewLevel("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm font-medium text-piment">{error}</p>}

      {fees.map((fee) => (
        <div key={fee.id} className="rounded-card bg-white p-5 shadow-soft">
          {editing === fee.id ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="focus-ring h-11 rounded-field border border-encre/15 px-3" value={draft.level} disabled />
              <div className="flex items-center gap-2">
                <span className="text-xs text-encre/50">Inscription</span>
                <input type="number" className="focus-ring h-11 flex-1 rounded-field border border-encre/15 px-3" value={draft.registration_fee ?? 0} onChange={(e) => setDraft({ ...draft, registration_fee: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-encre/50">Scolarité</span>
                <input type="number" className="focus-ring h-11 flex-1 rounded-field border border-encre/15 px-3" value={draft.tuition_fee ?? 0} onChange={(e) => setDraft({ ...draft, tuition_fee: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-encre/50">Acompte %</span>
                <input type="number" min={5} max={50} className="focus-ring h-11 flex-1 rounded-field border border-encre/15 px-3" value={draft.deposit_percent ?? 20} onChange={(e) => setDraft({ ...draft, deposit_percent: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-encre/50">Date limite</span>
                <input type="date" className="focus-ring h-11 flex-1 rounded-field border border-encre/15 px-3" value={draft.deadline?.slice(0, 10) ?? ""} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button size="sm" loading={loading} onClick={() => save(fee.level)}>Enregistrer</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-encre">{fee.level}</p>
                <p className="text-sm text-encre/60">
                  Inscription {formatFcfa(fee.registration_fee)} · Scolarité {formatFcfa(fee.tuition_fee)} · Acompte {fee.deposit_percent}%
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => startEdit(fee)}>Modifier</Button>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-card border border-dashed border-encre/20 p-5">
        <p className="mb-3 text-sm font-semibold text-encre">Ajouter un niveau</p>
        <div className="flex gap-3">
          <input placeholder="Ex: CM2" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="focus-ring h-11 flex-1 rounded-field border border-encre/15 px-3" />
          <Button
            size="sm"
            disabled={!newLevel}
            onClick={() => {
              setEditing("new");
              setDraft({ level: newLevel, registration_fee: 0, tuition_fee: 0, deposit_percent: 20, min_payment: 500, deadline: new Date().toISOString().slice(0, 10), extra_fees: [] });
            }}
          >
            Configurer
          </Button>
        </div>
        {editing === "new" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="number" placeholder="Inscription" className="focus-ring h-11 rounded-field border border-encre/15 px-3" onChange={(e) => setDraft({ ...draft, registration_fee: Number(e.target.value) })} />
            <input type="number" placeholder="Scolarité" className="focus-ring h-11 rounded-field border border-encre/15 px-3" onChange={(e) => setDraft({ ...draft, tuition_fee: Number(e.target.value) })} />
            <input type="number" placeholder="Acompte %" className="focus-ring h-11 rounded-field border border-encre/15 px-3" onChange={(e) => setDraft({ ...draft, deposit_percent: Number(e.target.value) })} />
            <input type="date" className="focus-ring h-11 rounded-field border border-encre/15 px-3" onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
            <Button size="sm" loading={loading} onClick={() => save(newLevel)}>Créer</Button>
          </div>
        )}
      </div>
    </div>
  );
}
