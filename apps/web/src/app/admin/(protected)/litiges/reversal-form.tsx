"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";

export function ReversalForm({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/admin/transactions/${transactionId}/reverse`, { reason });
      setOpen(false);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la contre-écriture.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        Contre-écriture
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-80">
      <textarea
        placeholder="Motif (10 caractères minimum)…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="focus-ring rounded-field border border-encre/15 p-2 text-sm"
        rows={2}
      />
      {error && <p className="text-xs font-medium text-piment">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
        <Button size="sm" variant="danger" loading={loading} disabled={reason.trim().length < 10} onClick={submit}>
          Confirmer
        </Button>
      </div>
    </div>
  );
}
