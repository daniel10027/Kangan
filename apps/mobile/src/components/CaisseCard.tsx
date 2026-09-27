import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { daysUntilDeadline, formatFcfa, type SavingsBoxStatus } from "@kangan/shared";
import { CanariIcon } from "./CanariIcon";
import { StatusBadge } from "./StatusBadge";

export interface CaisseCardProps {
  id: string;
  studentName: string;
  schoolName: string;
  status: SavingsBoxStatus;
  balance: number;
  targetAmount: number;
  percent: number;
  deadline: string;
  color?: string;
}

export function CaisseCard(props: CaisseCardProps) {
  const daysLeft = daysUntilDeadline(props.deadline);

  return (
    <Pressable
      onPress={() => router.push(`/caisse/${props.id}`)}
      className="mb-4 rounded-card border border-encre/10 bg-white p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-vert-kangan/10">
            <CanariIcon percent={props.percent} size={28} color={props.color ?? "#0F3D2E"} />
          </View>
          <View>
            <Text className="font-bold text-encre">{props.studentName}</Text>
            <Text className="text-sm text-encre/60">{props.schoolName}</Text>
          </View>
        </View>
        <StatusBadge status={props.status} />
      </View>

      <View className="mt-4 h-2 overflow-hidden rounded-full bg-encre/10">
        <View className="h-full rounded-full bg-ocre" style={{ width: `${Math.min(props.percent, 100)}%` }} />
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <Text className="font-semibold text-vert-kangan">{formatFcfa(props.balance)}</Text>
        <Text className="text-sm text-encre/50">sur {formatFcfa(props.targetAmount)}</Text>
      </View>

      <Text className="mt-2 text-xs text-encre/40">
        {daysLeft >= 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restants` : "Échéance dépassée"}
      </Text>
    </Pressable>
  );
}
