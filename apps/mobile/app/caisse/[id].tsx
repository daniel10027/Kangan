import { useCallback, useState } from "react";
import { Alert, ScrollView, Share, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { formatDateLong, type SavingsBoxStatus } from "@kangan/shared";
import { api, ApiError } from "@/lib/api-client";
import { JaugeCanari } from "@/components/JaugeCanari";
import { StatusBadge } from "@/components/StatusBadge";
import { TransactionLine } from "@/components/TransactionLine";
import { Button } from "@/components/Button";

interface Transaction { id: string; type: "deposit" | "payment" | "contribution" | "payout" | "refund" | "reversal"; amount: number; operator: string; status: "initiee" | "reussie" | "echouee" | "annulee"; created_at: string }
interface BoxDetail {
  box: { id: string; reference: string; status: SavingsBoxStatus; target_amount: number; deadline: string; students: { first_name: string; last_name: string }; schools: { name: string } };
  balance: { balance: number; percent_reached: number };
  transactions: Transaction[];
}

/** Écran 08 — Détail de caisse : jauge, historique, relevé, partage (P5, P6). */
export default function BoxDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<BoxDetail | null>(null);

  const load = useCallback(async () => {
    const res = await api.get<BoxDetail>(`/boxes/${id}`);
    setData(res);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function createContributionLink() {
    try {
      const link = await api.post<{ share_url: string }>(`/boxes/${id}/contribution-links`, { max_amount: 50_000, expires_in_hours: 24 * 14 });
      await Share.share({ message: `Contribuez à la caisse scolaire sur Kangan Finance : ${link.share_url}` });
    } catch (err) {
      if (err instanceof ApiError) Alert.alert("Erreur", err.message);
    }
  }

  if (!data) return <View className="flex-1 bg-creme" />;

  const { box, balance, transactions } = data;
  const canPay = box.status === "en_attente" || box.status === "active";

  return (
    <ScrollView className="flex-1 bg-creme px-5 pt-4">
      <View className="items-center rounded-card bg-white p-6">
        <StatusBadge status={box.status} />
        <Text className="mt-3 font-bold text-encre" style={{ fontSize: 18 }}>{box.students.first_name} {box.students.last_name}</Text>
        <Text className="text-encre/60">{box.schools.name}</Text>
        <Text className="mt-1 text-xs text-encre/40">{box.reference}</Text>

        <View className="mt-4">
          <JaugeCanari balance={balance.balance} targetAmount={box.target_amount} percent={balance.percent_reached} />
        </View>

        <Text className="mt-3 text-sm text-encre/60">Date limite : {formatDateLong(box.deadline)}</Text>

        <View className="mt-5 w-full gap-3">
          {canPay && <Button onPress={() => router.push(`/payment/${box.id}`)}>Verser maintenant</Button>}
          <Button variant="ghost" onPress={createContributionLink}>Inviter un proche à contribuer</Button>
        </View>
      </View>

      <View className="mt-6 rounded-card bg-white p-5">
        <Text className="font-bold text-encre">Historique</Text>
        <View className="mt-2">
          {transactions.length === 0 ? (
            <Text className="py-6 text-center text-sm text-encre/50">Aucun mouvement.</Text>
          ) : (
            transactions.map((t) => <TransactionLine key={t.id} type={t.type} amount={t.amount} operator={t.operator} status={t.status} createdAt={t.created_at} />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}
