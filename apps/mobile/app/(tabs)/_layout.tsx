import { Text } from "react-native";
import { Tabs } from "expo-router";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{symbol}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F3D2E",
        tabBarInactiveTintColor: "#1B1B1866",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon: ({ focused }) => <TabIcon symbol="🏠" focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Explorer", tabBarIcon: ({ focused }) => <TabIcon symbol="🔍" focused={focused} /> }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications", tabBarIcon: ({ focused }) => <TabIcon symbol="🔔" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ focused }) => <TabIcon symbol="👤" focused={focused} /> }} />
    </Tabs>
  );
}
