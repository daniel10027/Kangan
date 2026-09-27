import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { formatDateShort } from "@kangan/shared";
import { api } from "@/lib/api-client";

interface Notif {
  id: string;
  template: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  sent_at: string | null;
}

const TEMPLATE_LABELS: Record<string, string> = {
  payment_confirmed: "Versement confirmé",
  deposit_confirmed: "Acompte confirmé, caisse activée",
  milestone_reached: "Jalon de progression atteint",
  deadline_reminder: "Rappel d'échéance",
  box_completed: "Objectif atteint",
};

/** Écran 09 — Notifications (P8). */
export default function NotificationsScreen() {
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    api.get<{ items: Notif[] }>("/notifications").then((r) => setItems(r.items)).catch(() => setItems([]));
  }, []);

  return (
    <View className="flex-1 bg-creme pt-14 px-5">
      <Text className="font-bold text-encre" style={{ fontSize: 22 }}>Notifications</Text>
      <FlatList
        className="mt-4"
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View className={`mb-3 rounded-card border border-encre/10 p-4 ${item.read_at ? "bg-white" : "bg-ocre/10"}`}>
            <Text className="font-semibold text-encre">{TEMPLATE_LABELS[item.template] ?? item.template}</Text>
            {item.sent_at && <Text className="mt-1 text-xs text-encre/50">{formatDateShort(item.sent_at)}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text className="mt-8 text-center text-encre/50">Aucune notification pour le moment.</Text>}
      />
    </View>
  );
}
