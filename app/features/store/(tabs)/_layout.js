import { Tabs, useLocalSearchParams } from "expo-router";
import {
  Ionicons,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { StoreProvider } from "../../../../src/context/storeContext";

export default function StoreTabLayout() {
  const params = useLocalSearchParams();
  const storeIdParam =
    Array.isArray(params.shopId) ? params.shopId[0] : params.shopId ??
    (Array.isArray(params.storeId) ? params.storeId[0] : params.storeId);

  return (
    <StoreProvider storeId={storeIdParam}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FA4A0C",
          tabBarInactiveTintColor: "#ccc",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#ddd",
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="orderScreen"
          options={{
            tabBarLabel: "ORDER",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="box" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menuScreen"
          options={{
            tabBarLabel: "MENU",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="food" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="salesScreen"
          options={{
            tabBarLabel: "SALES",
            tabBarIcon: ({ color }) => (
              <Ionicons name="stats-chart" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="storeScreen"
          options={{
            tabBarLabel: "STORE",
            tabBarIcon: ({ color }) => (
              <Ionicons name="storefront-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </StoreProvider>
  );
}
