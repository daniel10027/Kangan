import { useRef, useState } from "react";
import { Dimensions, FlatList, Text, View, type ViewToken } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CanariIcon } from "@/components/CanariIcon";
import { Button } from "@/components/Button";

const { width } = Dimensions.get("window");

const CARDS = [
  { title: "La rentrée se prépare pièce par pièce", desc: "Épargnez les frais scolaires par petits versements, au rythme de vos revenus.", percent: 20 },
  { title: "Payez via Moov Money", desc: "Un simple numéro de téléphone suffit pour verser dans la caisse de votre enfant.", percent: 60 },
  { title: "Zéro dette, zéro stress", desc: "L'école reçoit un acompte dès l'ouverture, et le solde à la date limite.", percent: 100 },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  async function finish() {
    await AsyncStorage.setItem("kangan:onboarded", "true");
    router.replace("/(auth)/login");
  }

  function next() {
    if (index < CARDS.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  }

  return (
    <View className="flex-1 bg-vert-kangan">
      <FlatList
        ref={listRef}
        data={CARDS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onViewableItemsChanged={({ viewableItems }: { viewableItems: ViewToken[] }) => {
          if (viewableItems[0]) setIndex(viewableItems[0].index ?? 0);
        }}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-8">
            <CanariIcon percent={item.percent} size={100} color="#F6EFE3" />
            <Text className="mt-8 text-center font-bold text-creme" style={{ fontSize: 26 }}>{item.title}</Text>
            <Text className="mt-3 text-center text-creme/80">{item.desc}</Text>
          </View>
        )}
      />

      <View className="flex-row justify-center gap-2 pb-4">
        {CARDS.map((_, i) => (
          <View key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-ocre" : "bg-creme/30"}`} />
        ))}
      </View>

      <View className="px-8 pb-10">
        <Button variant="secondary" onPress={next}>
          {index === CARDS.length - 1 ? "Commencer" : "Suivant"}
        </Button>
        {index < CARDS.length - 1 && (
          <Text onPress={finish} className="mt-4 text-center text-sm text-creme/60">
            Passer
          </Text>
        )}
      </View>
    </View>
  );
}
