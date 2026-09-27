"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeDepositAmount,
  computeSavingsPlan,
  computeTargetAmount,
  formatFcfa,
  type PlanFrequency,
  type SavingsGoalType,
} from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";

interface School {
  id: string;
  name: string;
  slug: string;
}
interface FeeSchedule {
  id: string;
  level: string;
  registration_fee: number;
  tuition_fee: number;
  extra_fees: Array<{ label: string; amount: number }>;
  deposit_percent: number;
  deadline: string;
}
interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

const GOALS: { value: SavingsGoalType; label: string }[] = [
  { value: "inscription", label: "Inscription seule" },
  { value: "inscription_partielle", label: "Inscription + moitié scolarité" },
  { value: "totalite", label: "Totalité de l'année" },
];

const FREQUENCIES: { value: PlanFrequency; label: string }[] = [
  { value: "jour", label: "Par jour" },
  { value: "semaine", label: "Par semaine" },
  { value: "mois", label: "Par mois" },
];

export function NewBoxWizard({ initialSchoolId, initialFeeId }: { initialSchoolId?: string; initialFeeId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [schoolId, setSchoolId] = useState(initialSchoolId ?? "");
  const [feeId, setFeeId] = useState(initialFeeId ?? "");
  const [studentId, setStudentId] = useState("");
  const [newChildFirstName, setNewChildFirstName] = useState("");
  const [newChildLastName, setNewChildLastName] = useState("");
  const [goalType, setGoalType] = useState<SavingsGoalType>("totalite");
  const [frequency, setFrequency] = useState<PlanFrequency>("mois");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ items: School[] }>("/schools?limit=100").then((r) => setSchools(r.items));
    api.get<{ items: Student[] }>("/students").then((r) => setStudents(r.items));
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return;
    api.get<{ fee_schedules: FeeSchedule[] }>(`/schools/${school.slug}`).then((r) => setFeeSchedules(r.fee_schedules));
  }, [schoolId, schools]);

  const selectedFee = feeSchedules.find((f) => f.id === feeId);

  const preview = useMemo(() => {
    if (!selectedFee) return null;
    const target = computeTargetAmount(
      { registrationFee: selectedFee.registration_fee, tuitionFee: selectedFee.tuition_fee, extraFees: selectedFee.extra_fees },
      goalType,
    );
    const deposit = computeDepositAmount(target, selectedFee.deposit_percent);
    const plan = computeSavingsPlan(target, deposit, selectedFee.deadline, frequency);
    return { target, deposit, plan };
  }, [selectedFee, goalType, frequency]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      let finalStudentId = studentId;
      if (!finalStudentId && newChildFirstName && newChildLastName) {
        const created = await api.post<{ id: string }>("/students", { first_name: newChildFirstName, last_name: newChildLastName });
        finalStudentId = created.id;
      }
      if (!finalStudentId) throw new ApiError("VALIDATION_ERROR", "Sélectionnez ou créez un bénéficiaire.", 422);

      const result = await api.post<{ box: { id: string } }>("/boxes", {
        student_id: finalStudentId,
        school_id: schoolId,
        fee_schedule_id: feeId,
        goal_type: goalType,
        plan_frequency: frequency,
        color: "#0F3D2E",
      });
      router.push(`/parent/caisses/${result.box.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`h-1.5 flex-1 rounded-pill ${n <= step ? "bg-vert-kangan" : "bg-encre/10"}`} />
        ))}
      </div>

      <div className="rounded-card bg-white p-6 shadow-soft">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-encre">1. Choisir l'école</h2>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4">
              <option value="">Sélectionner une école</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {feeSchedules.length > 0 && (
              <select value={feeId} onChange={(e) => setFeeId(e.target.value)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4">
                <option value="">Sélectionner un niveau</option>
                {feeSchedules.map((f) => (
                  <option key={f.id} value={f.id}>{f.level}</option>
                ))}
              </select>
            )}
            <Button className="w-full" disabled={!schoolId || !feeId} onClick={() => setStep(2)}>
              Continuer
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-encre">2. Bénéficiaire</h2>
            {students.length > 0 && (
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="focus-ring h-12 w-full rounded-field border border-encre/15 px-4">
                <option value="">— ou créer un nouvel enfant —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                ))}
              </select>
            )}
            {!studentId && (
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Prénom" value={newChildFirstName} onChange={(e) => setNewChildFirstName(e.target.value)} className="focus-ring h-12 rounded-field border border-encre/15 px-4" />
                <input placeholder="Nom" value={newChildLastName} onChange={(e) => setNewChildLastName(e.target.value)} className="focus-ring h-12 rounded-field border border-encre/15 px-4" />
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Retour</Button>
              <Button className="flex-1" disabled={!studentId && !(newChildFirstName && newChildLastName)} onClick={() => setStep(3)}>
                Continuer
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-encre">3. Objectif</h2>
            <div className="space-y-2">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoalType(g.value)}
                  className={`focus-ring w-full rounded-field border px-4 py-3 text-left text-sm font-medium ${
                    goalType === g.value ? "border-vert-kangan bg-vert-kangan/5 text-vert-kangan" : "border-encre/15 text-encre/70"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value)}
                  className={`focus-ring flex-1 rounded-field px-3 py-2 text-sm font-semibold ${
                    frequency === f.value ? "bg-vert-kangan text-creme" : "bg-encre/5 text-encre/70"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Retour</Button>
              <Button className="flex-1" onClick={() => setStep(4)}>Continuer</Button>
            </div>
          </div>
        )}

        {step === 4 && preview && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-encre">4. Confirmer</h2>
            <div className="space-y-2 rounded-field bg-creme p-4 text-sm">
              <div className="flex justify-between"><span className="text-encre/60">Objectif</span><span className="font-semibold">{formatFcfa(preview.target)}</span></div>
              <div className="flex justify-between"><span className="text-encre/60">Acompte à verser</span><span className="font-semibold text-vert-kangan">{formatFcfa(preview.deposit)}</span></div>
              <div className="flex justify-between"><span className="text-encre/60">Versement suggéré</span><span className="font-semibold">{formatFcfa(preview.plan.suggestedPayment)} / {frequency}</span></div>
            </div>
            {error && <p className="text-sm font-medium text-piment">{error}</p>}
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(3)}>Retour</Button>
              <Button className="flex-1" loading={loading} onClick={submit}>Créer la caisse</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
