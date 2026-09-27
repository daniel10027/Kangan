import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import type { PaymentOperator } from "@kangan/shared";
import { api, ApiError, generateIdempotencyKey } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { MontantField } from "@/components/MontantField";

const OPERATORS: { value: PaymentOperator; label: string }[] = [
  { value: "moov_money", label: "Moov Money" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "orange_money", label: "Orange Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
];

type Phase = "form" | "pending" | "success" | "failed";

/** Écran 07 — Paiement : opérateur, montant, confirmation, succès animé (P4). */
export default function PaymentScreen() {
  const { boxId } = useLocalSearchParams<{ boxId: string }>();
  const [phase, setPhase] = useState<Phase>("form");
  const [amount, setAmount] = useState<number | "">(5000);
  const [operator, setOperator] = useState<PaymentOperator>("moov_money");
  const [phone, setPhone] = useState("+225");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const key = generateIdempotencyKey();
    try {
      const result = await api.post<{ transaction: { idempotency_key: string } }>(`/boxes/${boxId}/payments`, { amount, operator, payer_phone: phone }, { "Idempotency-Key": key });
      setIdempotencyKey(result.transaction.idempotency_key);
      setPhase("pending");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors du paiement.");
    } finally {
      setLoading(false);
    }
  }

  async function simulateConfirm(outcome: "reussie" | "echouee") {
    setLoading(true);
    try {
      await api.post("/dev/simulate-confirm", { idempotency_key: idempotencyKey, outcome });
      if (outcome === "reussie") await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase(outcome === "reussie" ? "success" : "failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-creme px-5 pt-6">
      {phase === "form" && (
        <View className="gap-4">
          <MontantField label="Montant" value={amount} onChange={setAmount} />
          <Text className="text-sm font-medium text-encre">Opérateur</Text>
          <View className="gap-2">
            {OPERATORS.map((op) => (
              <Pressable key={op.value} onPress={() => setOperator(op.value)} className={`rounded-field border px-4 py-3 ${operator === op.value ? "border-vert-kangan bg-vert-kangan/5" : "border-encre/15"}`}>
                <Text className={operator === op.value ? "font-semibold text-vert-kangan" : "text-encre/70"}>{op.label}</Text>
              </Pressable>
            ))}
          </View>
          {error && <Text className="text-sm font-medium text-piment">{error}</Text>}
          <Button loading={loading} onPress={submit}>Payer</Button>
        </View>
      )}

      {phase === "pending" && (
        <View className="items-center gap-4 pt-8">
          <Text className="text-center text-encre/70">
            Demande envoyée à {OPERATORS.find((o) => o.value === operator)?.label}.{"\n"}Validez avec votre code secret opérateur.
          </Text>
          <View className="w-full rounded-field border border-dashed border-ocre bg-ocre/5 p-4">
            <Text className="mb-3 text-center text-xs font-semibold uppercase text-terre-cuite">Mode démonstration</Text>
            <View className="flex-row gap-3">
              <Button variant="danger" className="flex-1" loading={loading} onPress={() => simulateConfirm("echouee")}>Échec</Button>
              <Button className="flex-1" loading={loading} onPress={() => simulateConfirm("reussie")}>Confirmer ✓</Button>
            </View>
          </View>
        </View>
      )}

      {phase === "success" && (
        <View className="items-center gap-4 pt-16">
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text className="font-bold text-vert-kangan" style={{ fontSize: 18 }}>Versement confirmé !</Text>
          <Button onPress={() => router.back()}>Retour à la caisse</Button>
        </View>
      )}

      {phase === "failed" && (
        <View className="items-center gap-4 pt-16">
          <Text className="font-bold text-piment">Le paiement a échoué.</Text>
          <Button onPress={() => setPhase("form")}>Réessayer</Button>
        </View>
      )}
    </View>
  );
}
