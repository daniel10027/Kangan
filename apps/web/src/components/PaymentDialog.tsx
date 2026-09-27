"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { PaymentOperator } from "@kangan/shared";
import { api, ApiError, generateIdempotencyKey } from "@/lib/api-client";
import { Button } from "./Button";
import { MontantField } from "./MontantField";

const OPERATORS: { value: PaymentOperator; label: string }[] = [
  { value: "moov_money", label: "Moov Money" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "orange_money", label: "Orange Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
];

interface PaymentDialogProps {
  boxId: string;
  suggestedAmount: number;
  defaultPhone: string;
  onSettled: () => void;
  trigger: React.ReactNode;
}

type Phase = "form" | "pending" | "success" | "failed";

const isSimulatorMode = process.env.NEXT_PUBLIC_PAYMENT_MODE !== "live";

export function PaymentDialog({ boxId, suggestedAmount, defaultPhone, onSettled, trigger }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [amount, setAmount] = useState<number | "">(suggestedAmount);
  const [operator, setOperator] = useState<PaymentOperator>("moov_money");
  const [phone, setPhone] = useState(defaultPhone);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const key = generateIdempotencyKey();
    setIdempotencyKey(key);
    try {
      const result = await api.post<{ transaction: { idempotency_key: string } }>(
        `/boxes/${boxId}/payments`,
        { amount, operator, payer_phone: phone },
        { "Idempotency-Key": key },
      );
      setIdempotencyKey(result.transaction.idempotency_key);
      setPhase("pending");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'initiation du paiement.");
    } finally {
      setLoading(false);
    }
  }

  async function simulateConfirm(outcome: "reussie" | "echouee") {
    setLoading(true);
    try {
      await api.post("/dev/simulate-confirm", { idempotency_key: idempotencyKey, outcome });
      setPhase(outcome === "reussie" ? "success" : "failed");
      if (outcome === "reussie") onSettled();
    } catch {
      setError("Échec de la confirmation simulée.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPhase("form");
    setError(null);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => (v ? setOpen(true) : reset())}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-encre/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-6 shadow-soft">
          <Dialog.Title className="font-display text-xl font-bold text-encre">Verser sur la caisse</Dialog.Title>

          {phase === "form" && (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <MontantField label="Montant" value={amount} onChange={setAmount} />

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-encre">Opérateur</span>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as PaymentOperator)}
                  className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-encre">Numéro payeur</span>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4"
                />
              </label>

              {error && <p className="text-sm font-medium text-piment">{error}</p>}

              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" className="flex-1">
                    Annuler
                  </Button>
                </Dialog.Close>
                <Button type="submit" loading={loading} className="flex-1">
                  Payer
                </Button>
              </div>
            </form>
          )}

          {phase === "pending" && (
            <div className="mt-5 space-y-4 text-center">
              <p className="text-sm text-encre/70">
                Demande envoyée à {OPERATORS.find((o) => o.value === operator)?.label}. Validez avec votre code secret opérateur.
              </p>
              {isSimulatorMode && (
                <div className="rounded-field border border-dashed border-ocre bg-ocre/5 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-terre-cuite">
                    Mode démonstration — simuler la réponse opérateur
                  </p>
                  <div className="flex gap-3">
                    <Button variant="danger" size="sm" className="flex-1" loading={loading} onClick={() => simulateConfirm("echouee")}>
                      Échec
                    </Button>
                    <Button size="sm" className="flex-1" loading={loading} onClick={() => simulateConfirm("reussie")}>
                      Confirmer ✓
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "success" && (
            <div className="mt-5 space-y-4 text-center">
              <p className="text-4xl">🎉</p>
              <p className="font-semibold text-vert-kangan">Versement confirmé !</p>
              <Button onClick={reset} className="w-full">
                Fermer
              </Button>
            </div>
          )}

          {phase === "failed" && (
            <div className="mt-5 space-y-4 text-center">
              <p className="font-semibold text-piment">Le paiement a échoué.</p>
              <Button onClick={() => setPhase("form")} className="w-full">
                Réessayer
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
