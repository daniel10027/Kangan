import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api-client";
import { Button } from "@/components/Button";

/** Écran 02 (suite) — Vérification OTP. */
export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    if (error || !data.session) {
      setError("Code invalide ou expiré.");
      setLoading(false);
      return;
    }
    const profile = await api.get<{ full_name: string | null; pin_hash: string | null }>("/profile").catch(() => null);
    setLoading(false);
    if (profile?.full_name && profile.pin_hash) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/pin-setup");
    }
  }

  return (
    <View className="flex-1 justify-center bg-creme px-8">
      <Text className="text-center font-bold text-encre" style={{ fontSize: 20 }}>Code de vérification</Text>
      <Text className="mt-2 text-center text-encre/60">Envoyé au {phone}</Text>

      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
        keyboardType="number-pad"
        maxLength={6}
        className="mt-8 h-16 rounded-field border border-encre/15 text-center text-encre"
        style={{ fontSize: 28, letterSpacing: 12 }}
      />
      {error && <Text className="mt-2 text-center text-sm font-medium text-piment">{error}</Text>}
      <Button className="mt-6" loading={loading} onPress={verify}>
        Valider
      </Button>
    </View>
  );
}
