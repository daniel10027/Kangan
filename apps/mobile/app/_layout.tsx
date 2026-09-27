import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="schools/[slug]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="caisse/create" options={{ headerShown: true, title: "Nouvelle caisse" }} />
          <Stack.Screen name="caisse/[id]" options={{ headerShown: true, title: "" }} />
          <Stack.Screen name="payment/[boxId]" options={{ presentation: "modal", headerShown: true, title: "Verser" }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
