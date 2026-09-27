import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { CanariIcon } from "@/components/CanariIcon";

/** Écran 02 — Connexion par téléphone (P1). */
export default function LoginScreen() {
  const [phone, setPhone] = useState("+225");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push({ pathname: "/(auth)/otp", params: { phone } });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-creme">
      <View className="flex-1 justify-center px-8">
        <View className="items-center">
          <CanariIcon percent={50} size={64} color="#0F3D2E" />
          <Text className="mt-3 font-bold text-vert-kangan" style={{ fontSize: 22 }}>Kangan Finance</Text>
          <Text className="mt-1 text-encre/60">Espace parent</Text>
        </View>

        <View className="mt-10">
          <Text className="mb-1.5 text-sm font-medium text-encre">Numéro de téléphone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="h-14 rounded-field border border-encre/15 px-4 text-base text-encre"
          />
          {error && <Text className="mt-2 text-sm font-medium text-piment">{error}</Text>}
          <Button className="mt-4" loading={loading} onPress={sendOtp}>
            Recevoir un code par SMS
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
