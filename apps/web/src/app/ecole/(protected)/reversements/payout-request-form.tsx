"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";

interface Box {
  id: string;
  reference: string;
  students: { first_name: string; last_name: string };
}

export function PayoutRequestForm({ schoolId, boxes }: { schoolId: string; boxes: Box[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/schools/${schoolId}/payouts`, { box_ids: selected });
      setSelected([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-card bg-white p-5 shadow-soft">
      <p className="mb-3 text-sm font-semibold text-encre">Sélectionner les caisses</p>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {boxes.map((box) => (
          <label key={box.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={selected.includes(box.id)} onChange={() => toggle(box.id)} />
            {box.students.first_name} {box.students.last_name} — {box.reference}
          </label>
        ))}
        {boxes.length === 0 && <p className="text-sm text-encre/50">Aucune caisse éligible.</p>}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-piment">{error}</p>}
      <Button className="mt-4 w-full" size="sm" disabled={selected.length === 0} loading={loading} onClick={submit}>
        Demander le reversement ({selected.length})
      </Button>
    </div>
  );
}
