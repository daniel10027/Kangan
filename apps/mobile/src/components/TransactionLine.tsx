import { Text, View } from "react-native";
import { formatDateShort, formatFcfa, type TransactionStatus, type TransactionType } from "@kangan/shared";

const TYPE_LABELS: Record<TransactionType, string> = {
  deposit: "Acompte",
  payment: "Versement",
  contribution: "Contribution",
  payout: "Reversement école",
  refund: "Remboursement",
  reversal: "Contre-écriture",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  initiee: "En attente",
  reussie: "Réussi",
  echouee: "Échoué",
  annulee: "Annulé",
};

export function TransactionLine({ type, amount, operator, status, createdAt }: { type: TransactionType; amount: number; operator: string; status: TransactionStatus; createdAt: string }) {
  const isCredit = ["deposit", "payment", "contribution"].includes(type);
  return (
    <View className="flex-row items-center justify-between border-b border-encre/8 py-3">
      <View>
        <Text className="text-sm font-medium text-encre">{TYPE_LABELS[type]}</Text>
        <Text className="text-xs text-encre/50">{formatDateShort(createdAt)} · {operator.replace("_", " ")}</Text>
      </View>
      <View className="items-end">
        <Text className={`font-semibold ${isCredit ? "text-vert-kangan" : "text-encre"}`}>
          {isCredit ? "+" : "−"}{formatFcfa(amount)}
        </Text>
        <Text className="text-xs text-encre/50">{STATUS_LABELS[status]}</Text>
      </View>
    </View>
  );
}
