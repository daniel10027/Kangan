import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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

interface School { id: string; name: string; slug: string }
interface FeeSchedule { id: string; level: string; registration_fee: number; tuition_fee: number; extra_fees: Array<{ label: string; amount: number }>; deposit_percent: number; deadline: string }
interface Student { id: string; first_name: string; last_name: string }

const GOALS: { value: SavingsGoalType; label: string }[] = [
  { value: "inscription", label: "Inscription seule" },
  { value: "inscription_partielle", label: "Inscription + moitié scolarité" },
  { value: "totalite", label: "Totalité de l'année" },
];
const FREQUENCIES: { value: PlanFrequency; label: string }[] = [
  { value: "jour", label: "Jour" },
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
];

/** Écran 06 — Assistant de création de caisse en 4 étapes (P3). */
export default function CreateBoxScreen() {
  const params = useLocalSearchParams<{ schoolId?: string; feeId?: string }>();
  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<School[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<FeeSchedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [schoolId, setSchoolId] = useState(params.schoolId ?? "");
  const [feeId, setFeeId] = useState(params.feeId ?? "");
  const [studentId, setStudentId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [goalType, setGoalType] = useState<SavingsGoalType>("totalite");
  const [frequency, setFrequency] = useState<PlanFrequency>("mois");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<{ items: School[] }>("/schools?limit=100").then((r) => setSchools(r.items));
    api.get<{ items: Student[] }>("/students").then((r) => setStudents(r.items));
  }, []);

  useEffect(() => {
    const school = schools.find((s) => s.id === schoolId);
    if (!school) return;
    api.get<{ fee_schedules: FeeSchedule[] }>(`/schools/${school.slug}`).then((r) => setFeeSchedules(r.fee_schedules));
  }, [schoolId, schools]);

  const selectedFee = feeSchedules.find((f) => f.id === feeId);
  const preview = useMemo(() => {
    if (!selectedFee) return null;
    const target = computeTargetAmount({ registrationFee: selectedFee.registration_fee, tuitionFee: selectedFee.tuition_fee, extraFees: selectedFee.extra_fees }, goalType);
    const deposit = computeDepositAmount(target, selectedFee.deposit_percent);
    const plan = computeSavingsPlan(target, deposit, selectedFee.deadline, frequency);
    return { target, deposit, plan };
  }, [selectedFee, goalType, frequency]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      let finalStudentId = studentId;
      if (!finalStudentId && firstName && lastName) {
        const created = await api.post<{ id: string }>("/students", { first_name: firstName, last_name: lastName });
        finalStudentId = created.id;
      }
      const result = await api.post<{ box: { id: string } }>("/boxes", {
        student_id: finalStudentId,
        school_id: schoolId,
        fee_schedule_id: feeId,
        goal_type: goalType,
        plan_frequency: frequency,
        color: "#0F3D2E",
      });
      router.replace(`/caisse/${result.box.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-creme px-5 pt-4">
      <View className="mb-6 flex-row gap-2">
        {[1, 2, 3, 4].map((n) => (
          <View key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-vert-kangan" : "bg-encre/10"}`} />
        ))}
      </View>

      {step === 1 && (
        <View className="gap-3">
          <Text className="font-bold text-encre">1. Choisir l'école</Text>
          {schools.map((s) => (
            <Pressable key={s.id} onPress={() => setSchoolId(s.id)} className={`rounded-field border px-4 py-3 ${schoolId === s.id ? "border-vert-kangan bg-vert-kangan/5" : "border-encre/15"}`}>
              <Text className={schoolId === s.id ? "font-semibold text-vert-kangan" : "text-encre/70"}>{s.name}</Text>
            </Pressable>
          ))}
          {feeSchedules.length > 0 &&
            feeSchedules.map((f) => (
              <Pressable key={f.id} onPress={() => setFeeId(f.id)} className={`rounded-field border px-4 py-3 ${feeId === f.id ? "border-ocre bg-ocre/10" : "border-encre/15"}`}>
                <Text className="text-encre/70">{f.level}</Text>
              </Pressable>
            ))}
          <Button disabled={!schoolId || !feeId} onPress={() => setStep(2)}>Continuer</Button>
        </View>
      )}

      {step === 2 && (
        <View className="gap-3">
          <Text className="font-bold text-encre">2. Bénéficiaire</Text>
          {students.map((s) => (
            <Pressable key={s.id} onPress={() => setStudentId(s.id)} className={`rounded-field border px-4 py-3 ${studentId === s.id ? "border-vert-kangan bg-vert-kangan/5" : "border-encre/15"}`}>
              <Text className="text-encre/70">{s.first_name} {s.last_name}</Text>
            </Pressable>
          ))}
          {!studentId && (
            <View className="flex-row gap-3">
              <TextInput placeholder="Prénom" value={firstName} onChangeText={setFirstName} className="h-12 flex-1 rounded-field border border-encre/15 px-3 text-encre" />
              <TextInput placeholder="Nom" value={lastName} onChangeText={setLastName} className="h-12 flex-1 rounded-field border border-encre/15 px-3 text-encre" />
            </View>
          )}
          <Button disabled={!studentId && !(firstName && lastName)} onPress={() => setStep(3)}>Continuer</Button>
        </View>
      )}

      {step === 3 && (
        <View className="gap-3">
          <Text className="font-bold text-encre">3. Objectif</Text>
          {GOALS.map((g) => (
            <Pressable key={g.value} onPress={() => setGoalType(g.value)} className={`rounded-field border px-4 py-3 ${goalType === g.value ? "border-vert-kangan bg-vert-kangan/5" : "border-encre/15"}`}>
              <Text className={goalType === g.value ? "font-semibold text-vert-kangan" : "text-encre/70"}>{g.label}</Text>
            </Pressable>
          ))}
          <View className="flex-row gap-2">
            {FREQUENCIES.map((f) => (
              <Pressable key={f.value} onPress={() => setFrequency(f.value)} className={`flex-1 rounded-field px-3 py-2 ${frequency === f.value ? "bg-vert-kangan" : "bg-encre/5"}`}>
                <Text className={`text-center text-sm font-semibold ${frequency === f.value ? "text-creme" : "text-encre/70"}`}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          <Button onPress={() => setStep(4)}>Continuer</Button>
        </View>
      )}

      {step === 4 && preview && (
        <View className="gap-3">
          <Text className="font-bold text-encre">4. Confirmer</Text>
          <View className="rounded-field bg-white p-4">
            <Text className="text-encre/60">Objectif : <Text className="font-semibold text-encre">{formatFcfa(preview.target)}</Text></Text>
            <Text className="mt-1 text-encre/60">Acompte : <Text className="font-semibold text-vert-kangan">{formatFcfa(preview.deposit)}</Text></Text>
            <Text className="mt-1 text-encre/60">Suggéré : <Text className="font-semibold text-encre">{formatFcfa(preview.plan.suggestedPayment)} / {frequency}</Text></Text>
          </View>
          {error && <Text className="text-sm font-medium text-piment">{error}</Text>}
          <Button loading={loading} onPress={submit}>Créer la caisse</Button>
        </View>
      )}
    </ScrollView>
  );
}
