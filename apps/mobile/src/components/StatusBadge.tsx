import { Text, View } from "react-native";
import type { SavingsBoxStatus } from "@kangan/shared";

const CONFIG: Record<SavingsBoxStatus, { label: string; bg: string; text: string }> = {
  brouillon: { label: "Brouillon", bg: "bg-encre/10", text: "text-encre" },
  en_attente: { label: "En attente", bg: "bg-ocre/20", text: "text-terre-cuite" },
  active: { label: "Active", bg: "bg-feuille/15", text: "text-feuille" },
  completee: { label: "Complétée", bg: "bg-vert-kangan", text: "text-creme" },
  reversee: { label: "Reversée", bg: "bg-vert-kangan/10", text: "text-vert-kangan" },
  suspendue: { label: "Suspendue", bg: "bg-piment/15", text: "text-piment" },
  remboursee: { label: "Remboursée", bg: "bg-encre/10", text: "text-encre" },
};

export function StatusBadge({ status }: { status: SavingsBoxStatus }) {
  const c = CONFIG[status];
  return (
    <View className={`rounded-full px-3 py-1 ${c.bg}`}>
      <Text className={`text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}
