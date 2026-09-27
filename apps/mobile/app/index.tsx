import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CanariIcon } from "@/components/CanariIcon";
import { useAuth } from "@/lib/auth-context";

const ONBOARDING_KEY = "kangan:onboarded";

/** Écran 01 — Splash animé : vérifie la session et l'état d'onboarding avant de router. */
export default function SplashScreen() {
  const { session, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setOnboarded(v === "true"));
  }, []);

  if (loading || onboarded === null) {
    return (
      <View className="flex-1 items-center justify-center bg-vert-kangan">
        <CanariIcon percent={70} size={72} color="#F6EFE3" />
        <ActivityIndicator className="mt-6" color="#F6EFE3" />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!session) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
