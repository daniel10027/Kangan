import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";

/** Écran 02 (fin) — Profil et création du PIN (P1), puis proposition biométrie. */
export default function PinSetupScreen() {
  const [fullName, setFullName] = useState("");
  const [commune, setCommune] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await api.put("/profile", { full_name: fullName, commune, language: "fr", pin });

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (compatible && enrolled) {
        const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Activer la biométrie pour Kangan Finance" });
        if (result.success) await SecureStore.setItemAsync("kangan:biometric_enabled", "true");
      }

      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-creme px-8">
      <Text className="text-center font-bold text-encre" style={{ fontSize: 20 }}>Complétez votre profil</Text>

      <View className="mt-8 gap-4">
        <TextInput placeholder="Nom complet" value={fullName} onChangeText={setFullName} className="h-14 rounded-field border border-encre/15 px-4 text-encre" />
        <TextInput placeholder="Commune (Cocody, Yopougon…)" value={commune} onChangeText={setCommune} className="h-14 rounded-field border border-encre/15 px-4 text-encre" />
        <TextInput
          placeholder="Code PIN à 4 chiffres"
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, ""))}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          className="h-14 rounded-field border border-encre/15 px-4 text-center text-encre"
          style={{ fontSize: 22, letterSpacing: 10 }}
        />
        {error && <Text className="text-sm font-medium text-piment">{error}</Text>}
        <Button loading={loading} disabled={!fullName || pin.length !== 4} onPress={submit}>
          Continuer
        </Button>
      </View>
    </View>
  );
}
