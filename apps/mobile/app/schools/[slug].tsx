import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { formatDateLong, formatFcfa } from "@kangan/shared";
import { api } from "@/lib/api-client";
import { Button } from "@/components/Button";

interface FeeSchedule {
  id: string;
  level: string;
  registration_fee: number;
  tuition_fee: number;
  deposit_percent: number;
  deadline: string;
}
interface SchoolDetail {
  school: { id: string; name: string; commune: string; city: string; cycles: string[] };
  fee_schedules: FeeSchedule[];
}

/** Écran 05 — Fiche école (P2). */
export default function SchoolDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData] = useState<SchoolDetail | null>(null);

  useEffect(() => {
    api.get<SchoolDetail>(`/schools/${slug}`).then(setData);
  }, [slug]);

  if (!data) return <View className="flex-1 bg-creme" />;

  return (
    <View className="flex-1 bg-creme px-5 pt-4">
      <Text className="font-bold text-encre" style={{ fontSize: 22 }}>{data.school.name}</Text>
      <Text className="mt-1 text-encre/60">{data.school.commune}, {data.school.city}</Text>
      <Text className="mt-2 text-xs uppercase text-vert-kangan/70">{data.school.cycles.join(" · ")}</Text>

      <Text className="mt-6 font-bold text-encre">Grille tarifaire</Text>
      <FlatList
        className="mt-2"
        data={data.fee_schedules}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-card border border-encre/10 bg-white p-4">
            <Text className="font-semibold text-encre">{item.level}</Text>
            <Text className="mt-1 text-sm text-encre/60">
              Inscription {formatFcfa(item.registration_fee)} · Scolarité {formatFcfa(item.tuition_fee)}
            </Text>
            <Text className="mt-1 text-xs text-encre/50">Acompte {item.deposit_percent}% · Limite {formatDateLong(item.deadline)}</Text>
            <Button
              variant="secondary"
              className="mt-3"
              onPress={() => router.push({ pathname: "/caisse/create", params: { schoolId: data.school.id, feeId: item.id } })}
            >
              Ouvrir une caisse
            </Button>
          </View>
        )}
      />
    </View>
  );
}
