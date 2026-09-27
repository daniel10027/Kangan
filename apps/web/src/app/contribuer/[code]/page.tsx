"use client";

import { use, useState } from "react";
import type { PaymentOperator } from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { MontantField } from "@/components/MontantField";
import { Logo } from "@/components/Logo";

export default function ContributePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [amount, setAmount] = useState<number | "">(5000);
  const [operator, setOperator] = useState<PaymentOperator>("moov_money");
  const [phone, setPhone] = useState("+225");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"form" | "sent" | "error">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/contribute", { code, amount, operator, payer_phone: phone, contributor_name: name });
      setStatus("sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la contribution.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vert-kangan px-5 py-12">
      <div className="w-full max-w-sm rounded-card bg-creme p-8 shadow-soft">
        <Logo className="justify-center" />
        <p className="mt-2 text-center text-sm text-encre/60">Contribuer à une caisse scolaire</p>

        {status === "sent" ? (
          <div className="mt-8 text-center">
            <p className="text-4xl">🙏</p>
            <p className="mt-3 font-semibold text-vert-kangan">Merci pour votre contribution !</p>
            <p className="mt-1 text-sm text-encre/60">Validez la demande sur votre téléphone pour finaliser le versement.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input required placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
            <MontantField label="Montant de la contribution" value={amount} onChange={setAmount} hint="Jusqu'à 200 000 F CFA sans créer de compte (RG12)." />
            <select value={operator} onChange={(e) => setOperator(e.target.value as PaymentOperator)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4">
              <option value="moov_money">Moov Money</option>
              <option value="mtn_money">MTN Money</option>
              <option value="orange_money">Orange Money</option>
              <option value="wave">Wave</option>
              <option value="card">Carte bancaire</option>
            </select>
            <input required placeholder="Votre numéro de téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
            {error && <p className="text-sm font-medium text-piment">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Contribuer</Button>
          </form>
        )}
      </div>
    </div>
  );
}
