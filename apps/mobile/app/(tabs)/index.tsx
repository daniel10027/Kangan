import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import type { SavingsBoxStatus } from "@kangan/shared";
import { api } from "@/lib/api-client";
import { CaisseCard } from "@/components/CaisseCard";
import { Button } from "@/components/Button";
import { CanariIcon } from "@/components/CanariIcon";

interface BoxItem {
  id: string;
  status: SavingsBoxStatus;
  target_amount: number;
  deadline: string;
  color: string;
  students: { first_name: string; last_name: string };
  schools: { name: string };
  balance: { balance: number; percent_reached: number };
}

export default function HomeScreen() {
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<{ items: BoxItem[] }>("/boxes");
    setBoxes(res.items);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const payableBox = boxes.find((b) => b.status === "en_attente" || b.status === "active");

  return (
    <View className="flex-1 bg-creme pt-14">
      <View className="flex-row items-center justify-between px-5">
        <Text className="font-bold text-encre" style={{ fontSize: 22 }}>Mes caisses</Text>
        <Button variant="ghost" onPress={() => router.push("/caisse/create")}>+ Nouvelle</Button>
      </View>

      {payableBox && (
        <View className="mx-5 mt-4 flex-row items-center justify-between rounded-card bg-vert-kangan p-4">
          <Text className="flex-1 pr-3 font-semibold text-creme">Continuez d'alimenter {payableBox.students.first_name}</Text>
          <Button variant="secondary" onPress={() => router.push(`/payment/${payableBox.id}`)}>Verser</Button>
        </View>
      )}

      <FlatList
        className="mt-4 px-5"
        data={boxes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <CaisseCard
            id={item.id}
            studentName={`${item.students.first_name} ${item.students.last_name}`}
            schoolName={item.schools.name}
            status={item.status}
            balance={item.balance?.balance ?? 0}
            targetAmount={item.target_amount}
            percent={item.balance?.percent_reached ?? 0}
            deadline={item.deadline}
            color={item.color}
          />
        )}
        ListEmptyComponent={
          <View className="mt-16 items-center">
            <CanariIcon percent={0} size={64} />
            <Text className="mt-4 text-center text-encre/60">Aucune caisse pour le moment.{"\n"}Créez-en une en moins de 3 minutes.</Text>
          </View>
        }
      />
    </View>
  );
}
