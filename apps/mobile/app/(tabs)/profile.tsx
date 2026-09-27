import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api-client";
import { Button } from "@/components/Button";

interface Profile {
  full_name: string;
  phone: string;
  commune: string | null;
  language: string;
  kyc_level: number;
}

/** Écran 09 — Profil, paramètres (P1, P8). */
export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api.get<Profile>("/profile").then(setProfile).catch(() => null);
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-creme pt-14 px-5">
      <Text className="font-bold text-encre" style={{ fontSize: 22 }}>Mon profil</Text>

      {profile && (
        <View className="mt-6 rounded-card bg-white p-5">
          <Text className="text-lg font-bold text-encre">{profile.full_name}</Text>
          <Text className="mt-1 text-encre/60">{profile.phone}</Text>
          {profile.commune && <Text className="mt-1 text-encre/60">{profile.commune}</Text>}
          <View className="mt-3 self-start rounded-full bg-vert-kangan/10 px-3 py-1">
            <Text className="text-xs font-semibold text-vert-kangan">Vérification niveau {profile.kyc_level}</Text>
          </View>
        </View>
      )}

      <View className="mt-6 gap-3">
        <Button variant="ghost" onPress={() => Alert.alert("Aide", "Contactez-nous : contact@kangan-finance.ci")}>
          Centre d'aide
        </Button>
        <Button variant="danger" onPress={logout}>Se déconnecter</Button>
      </View>
    </View>
  );
}
