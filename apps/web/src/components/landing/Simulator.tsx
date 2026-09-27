"use client";

import { useMemo, useState } from "react";
import { computeSavingsPlan, formatFcfa, type PlanFrequency } from "@kangan/shared";
import { MontantField } from "../MontantField";
import { JaugeCanari } from "../JaugeCanari";

const FREQUENCIES: { value: PlanFrequency; label: string }[] = [
  { value: "jour", label: "Par jour" },
  { value: "semaine", label: "Par semaine" },
  { value: "mois", label: "Par mois" },
];

function defaultDeadline(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
}

/** Simulateur interactif — section 16, ordre 6. */
export function Simulator() {
  const [amount, setAmount] = useState<number | "">(300_000);
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [frequency, setFrequency] = useState<PlanFrequency>("mois");

  const plan = useMemo(() => {
    const target = amount === "" ? 0 : amount;
    const deposit = Math.round(target * 0.2);
    return computeSavingsPlan(target, deposit, deadline, frequency);
  }, [amount, deadline, frequency]);

  const percent = amount === "" || amount === 0 ? 0 : Math.round(((amount - plan.remaining) / amount) * 100);

  return (
    <section id="simulateur" className="bg-vert-kangan py-20 text-creme">
      <div className="container grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Simulez votre rythme d'épargne</h2>
          <p className="mt-3 max-w-md text-creme/80">
            Entrez le montant des frais et votre date de rentrée : Kangan calcule le versement
            suggéré par jour, semaine ou mois.
          </p>

          <div className="mt-8 space-y-5 rounded-card bg-creme p-6 text-encre shadow-soft">
            <MontantField label="Montant total des frais" value={amount} onChange={setAmount} />

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-encre">Date limite (rentrée)</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4 text-base"
              />
            </label>

            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`focus-ring flex-1 rounded-field px-3 py-2 text-sm font-semibold transition-colors ${
                    frequency === f.value ? "bg-vert-kangan text-creme" : "bg-encre/5 text-encre/70 hover:bg-encre/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="rounded-field bg-ocre/10 p-4 text-center">
              <p className="text-sm text-encre/60">Versement suggéré</p>
              <p className="font-display text-3xl font-bold text-vert-kangan">{formatFcfa(plan.suggestedPayment)}</p>
              <p className="text-xs text-encre/50">{FREQUENCIES.find((f) => f.value === frequency)?.label.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="rounded-card bg-creme/5 p-10">
            <JaugeCanari balance={amount === "" ? 0 : amount - plan.remaining} targetAmount={amount === "" ? 1 : amount} percent={percent} />
          </div>
        </div>
      </div>
    </section>
  );
}
