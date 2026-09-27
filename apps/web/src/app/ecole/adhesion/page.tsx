"use client";

import { useState } from "react";
import type { SchoolCycle } from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

const CYCLES: { value: SchoolCycle; label: string }[] = [
  { value: "maternelle", label: "Maternelle" },
  { value: "primaire", label: "Primaire" },
  { value: "secondaire", label: "Secondaire" },
  { value: "superieur", label: "Supérieur" },
  { value: "formation_professionnelle", label: "Formation professionnelle" },
];

export default function SchoolAdhesionPage() {
  const [form, setForm] = useState({
    name: "", type: "prive" as const, commune: "", city: "Abidjan", address: "", rccm: "",
    responsible_name: "", responsible_phone: "+225", bank_account_iban: "",
  });
  const [cycles, setCycles] = useState<SchoolCycle[]>([]);
  const [status, setStatus] = useState<"form" | "sent" | "error">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCycle(c: SchoolCycle) {
    setCycles((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/schools/adhesion", { ...form, cycles });
      setStatus("sent");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'envoi.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-creme px-5">
        <div className="max-w-md rounded-card bg-white p-8 text-center shadow-soft">
          <Logo className="justify-center" />
          <p className="mt-6 font-display text-xl font-bold text-vert-kangan">Demande envoyée !</p>
          <p className="mt-2 text-sm text-encre/60">Notre équipe valide les dossiers (KYB) sous 72 heures et vous recontacte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme px-5 py-12">
      <div className="mx-auto max-w-xl">
        <Logo className="mb-8 justify-center" />
        <h1 className="text-center font-display text-2xl font-bold text-encre">Devenir école partenaire</h1>
        <p className="mt-2 text-center text-sm text-encre/60">Section 5 : demande d'adhésion, vérification KYB, contrat de partenariat.</p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-card bg-white p-6 shadow-soft">
          <input required placeholder="Nom de l'établissement" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="focus-ring h-12 rounded-field border border-encre/15 px-4">
              <option value="prive">Privé</option>
              <option value="public">Public</option>
              <option value="confessionnel">Confessionnel</option>
            </select>
            <input required placeholder="Commune" value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="focus-ring h-12 rounded-field border border-encre/15 px-4" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-encre">Cycles enseignés</p>
            <div className="flex flex-wrap gap-2">
              {CYCLES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => toggleCycle(c.value)}
                  className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${cycles.includes(c.value) ? "bg-vert-kangan text-creme" : "bg-encre/5 text-encre/60"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <input placeholder="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
          <input placeholder="RCCM (optionnel)" value={form.rccm} onChange={(e) => setForm({ ...form, rccm: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
          <input required placeholder="Nom du responsable" value={form.responsible_name} onChange={(e) => setForm({ ...form, responsible_name: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
          <input required placeholder="Téléphone du responsable" value={form.responsible_phone} onChange={(e) => setForm({ ...form, responsible_phone: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />
          <input required placeholder="IBAN / compte de reversement" value={form.bank_account_iban} onChange={(e) => setForm({ ...form, bank_account_iban: e.target.value })} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4" />

          {error && <p className="text-sm font-medium text-piment">{error}</p>}
          <Button type="submit" loading={loading} disabled={cycles.length === 0} className="w-full">
            Envoyer la demande
          </Button>
        </form>
      </div>
    </div>
  );
}
