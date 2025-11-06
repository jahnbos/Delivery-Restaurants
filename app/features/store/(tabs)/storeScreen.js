import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../../../src/context/storeContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../../src/config/firebase";
import { router } from "expo-router";
import { FlatList } from "react-native";

const fallbackImage = require("../../../../assets/Logo/kfc.jpg");

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "0.00";
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const capitalize = (value) => {
  if (!value) return "";
  const text = String(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const STATUS_COLORS = {
  pending: "#F59E0B",
  preparing: "#3B82F6",
  ready: "#22C55E",
  completed: "#059669",
  cancelled: "#EF4444",
  canceled: "#EF4444",
  refunded: "#7C3AED",
};

const weeklyData = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 19 },
  { day: "Wed", orders: 3 },
  { day: "Thu", orders: 5 },
  { day: "Fri", orders: 2 },
  { day: "Sat", orders: 3 },
  { day: "Sun", orders: 9 },
];

export default function StoreDetailScreen() {
  const { store, storeId, status, error } = useStore();
  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState("idle");

  // ✅ ดึงข้อมูลจาก Firestore collection "orders" เท่านั้น
  useEffect(() => {
    if (!storeId) {
      setOrders([]);
      setOrdersStatus("idle");
      return;
    }

    setOrdersStatus("loading");

    const ordersQuery = query(
      collection(db, "orders"),
      where("shopId", "==", String(storeId))
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setOrdersStatus("success");
      },
      () => setOrdersStatus("error")
    );

    return () => unsubscribe();
  }, [storeId]);

  // ✅ Sort orders by creation date
  const displayOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      ),
    [orders]
  );

  // ✅ รวมยอด + จำนวน order ทั้งหมด
  const ordersSummary = useMemo(() => {
    if (!orders.length) {
      return { totalCount: 0, revenue: 0 };
    }
    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    );
    return {
      totalCount: orders.length,
      revenue: completedOrders.reduce((acc, o) => acc + (o.total || 0), 0),
    };
  }, [orders]);

  const imageSource = store?.imageUrl
    ? { uri: store.imageUrl }
    : store?.logo
    ? { uri: store.logo }
    : fallbackImage;

  const operatingHours =
    store?.openTime && store?.closeTime
      ? `${store.openTime} - ${store.closeTime}`
      : store?.operatingHours;

  if (status === "loading") {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FA4A0C" />
      </SafeAreaView>
    );
  }

  if (status === "error" || !store) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Error loading store.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scroll}>
        {/* 🔶 Header */}
        <View style={[styles.card, styles.headerCard]}>
          <Image source={imageSource} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>
              {store.storeName || store.name}
            </Text>
            <View style={styles.statusRow}>
              <Ionicons
                name={store.isOpen ? "ellipse" : "ellipse-outline"}
                size={12}
                color={store.isOpen ? "#22c55e" : "#6B7280"}
              />
              <Text
                style={[styles.statusText, store.isOpen && styles.openText]}
              >
                {store.isOpen = "เปิดอยู่" }
              </Text>
            </View>
            {operatingHours && (
              <View style={styles.statusRow}>
                <Ionicons name="time-outline" size={12} color="#9ca3af" />
                <Text style={styles.statusText}>{operatingHours}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 📊 Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, shadow.light]}>
              <Text style={styles.summaryLabel}>Orders</Text>
              <Text style={styles.summaryValue}>
                {ordersSummary.totalCount}
              </Text>
            </View>
            <View style={[styles.summaryBox, shadow.light]}>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryValue, { color: "#FA4A0C" }]}>
                {formatCurrency(ordersSummary.revenue)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.summaryBox, shadow.light]}
              onPress={() => router.push("/features/store/menuScreen")}
            >
              <Text style={styles.summaryLabel}>Menu Items</Text>
              <Text style={styles.summaryValue}>{store.menu?.length || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🧾 Recent Orders */}
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>

          {ordersStatus === "loading" ? (
            <ActivityIndicator color="#FA4A0C" />
          ) : displayOrders.length > 0 ? (
            <View style={[styles.infoCard, shadow.light]}>
              {/* ✅ FlatList แบบ scroll แยกภายในกล่อง */}
              <FlatList
                data={displayOrders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.recentOrderRow}>
                    <View style={styles.recentOrderLeft}>
                      <Text style={styles.recentOrderId}>
                        Order #{item.orderNumber || item.id}
                      </Text>
                      <Text style={styles.recentOrderCustomer}>
                        {item.customerName || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.recentOrderRight}>
                      <Text style={styles.recentOrderTotal}>
                        THB {formatCurrency(item.total)}
                      </Text>
                      <Text
                        style={[
                          styles.recentOrderStatus,
                          { color: STATUS_COLORS[item.status] || "#6C757D" },
                        ]}
                      >
                        {capitalize(item.status)}
                      </Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={() => (
                  <View style={[styles.emptyBox, shadow.light]}>
                    <Ionicons
                      name="document-text-outline"
                      size={30}
                      color="#9CA3AF"
                    />
                    <Text style={styles.emptyText}>No recent orders</Text>
                  </View>
                )}
                contentContainerStyle={{ padding: 16, gap: 18 }}
              />
            </View>
          ) : (
            <View style={[styles.emptyBox, shadow.light]}>
              <Ionicons
                name="document-text-outline"
                size={30}
                color="#9CA3AF"
              />
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const shadow = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1, padding: 16, gap: 18 },
  card: { borderRadius: 20, backgroundColor: "#fff", padding: 20 },
  headerCard: {
    ...shadow.light,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: { width: 64, height: 64, borderRadius: 50 },
  storeName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusText: { fontSize: 13, color: "#6B7280" },
  openText: { color: "#22C55E" },
  editButton: {
    backgroundColor: "#FA4A0C",
    padding: 10,
    borderRadius: 999,
    marginLeft: "auto",
  },
  section: { marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingVertical: 20,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { color: "#9CA3AF", fontSize: 14 },
  infoCard: { flex: 1, borderRadius: 16, backgroundColor: "#fff", padding: 10 },
  recentOrderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  recentOrderLeft: { flex: 1 },
  recentOrderRight: { alignItems: "flex-end" },
  recentOrderId: { fontSize: 16, fontWeight: "600", color: "#111827" },
  recentOrderCustomer: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  recentOrderTotal: { fontSize: 16, fontWeight: "700", color: "#111827" },
  recentOrderStatus: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  chartContainer: {
    flexDirection: "row",
    height: 150,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  barWrapper: { alignItems: "center", flex: 1 },
  bar: { width: 12, backgroundColor: "#FA4A0C", borderRadius: 6 },
  barLabel: { marginTop: 4, fontSize: 12, color: "#6B7280" },
});
