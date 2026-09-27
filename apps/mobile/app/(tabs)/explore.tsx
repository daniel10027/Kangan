import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api-client";

interface School {
  id: string;
  name: string;
  slug: string;
  commune: string;
  cycles: string[];
}

const COMMUNES = ["", "Cocody", "Yopougon", "Abobo", "Marcory"];

/** Écran 04 — Explorer les écoles : liste, filtres (P2). La vue carte est prévue en phase 2 (voir SUIVI.md). */
export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [commune, setCommune] = useState("");
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (commune) params.set("commune", commune);
    api.get<{ items: School[] }>(`/schools?${params.toString()}`).then((r) => setSchools(r.items));
  }, [query, commune]);

  return (
    <View className="flex-1 bg-creme pt-14 px-5">
      <Text className="font-bold text-encre" style={{ fontSize: 22 }}>Explorer les écoles</Text>

      <TextInput
        placeholder="Rechercher une école…"
        value={query}
        onChangeText={setQuery}
        className="mt-4 h-12 rounded-field border border-encre/15 px-4 text-encre"
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={COMMUNES}
        keyExtractor={(c) => c || "all"}
        className="mt-3"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setCommune(item)}
            className={`mr-2 rounded-full px-4 py-2 ${commune === item ? "bg-vert-kangan" : "bg-encre/5"}`}
          >
            <Text className={commune === item ? "text-creme" : "text-encre/60"}>{item || "Toutes"}</Text>
          </Pressable>
        )}
      />

      <FlatList
        className="mt-4"
        data={schools}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/schools/${item.slug}`)} className="mb-3 rounded-card border border-encre/10 bg-white p-4">
            <Text className="font-bold text-encre">{item.name}</Text>
            <Text className="mt-1 text-sm text-encre/60">{item.commune}, Abidjan</Text>
            <Text className="mt-2 text-xs uppercase text-vert-kangan/70">{item.cycles.join(" · ")}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="mt-8 text-center text-encre/50">Aucune école trouvée.</Text>}
      />
    </View>
  );
}
