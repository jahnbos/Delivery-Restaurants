import React from "react";
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
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../../../src/config/firebase";
import { router } from "expo-router";

const fallbackImage = require("../../../../assets/Logo/kfc.jpg");

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "0.00";
  }
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

const infoFieldLabels = [
  { label: "Address", key: "address", icon: "location-outline" },
  { label: "Contact", key: "person-outline", icon: "person-outline" },
  { label: "Phone", key: "call-outline", icon: "call-outline" },
  { label: "Email", key: "mail-outline", icon: "mail-outline" },
  { label: "Line", key: "send-outline", icon: "send-outline" },
  { label: "Facebook", key: "logo-facebook", icon: "logo-facebook" },
  { label: "Website", key: "globe-outline", icon: "globe-outline" },
];

const STATUS_COLORS = {
  pending: "#F59E0B",
  preparing: "#3B82F6",
  ready: "#22C55E",
  completed: "#059669",
  cancelled: "#EF4444",
  canceled: "#EF4444",
  refunded: "#7C3AED",
};

// Mock data for the weekly chart
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

  useEffect(() => {
    if (!storeId) {
      setOrders([]);
      setOrdersStatus("idle");
      return;
    }

    setOrdersStatus("loading");
    const ordersQuery = query(collection(db, "orders"), where("storeId", "==", storeId));
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setOrdersStatus("success");
    }, (err) => {
      setOrdersStatus("error");
    });

    return () => unsubscribe();
  }, [storeId]);

  const recentOrders = useMemo(() => 
    [...orders]
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 5),
    [orders]
  );

  const ordersSummary = useMemo(() => {
    if (!orders.length) {
      return { totalCount: 0, revenue: 0 };
    }
    return {
      totalCount: orders.length,
      revenue: orders.reduce((acc, o) => acc + (o.total || 0), 0),
    };
  }, [orders]);

  const infoFields = useMemo(() => 
    infoFieldLabels
      .map(field => ({ ...field, value: store?.[field.key] }))
      .filter(field => field.value),
    [store]
  );

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
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#FA4A0C" /></SafeAreaView>;
  }

  if (status === "error" || !store) {
    return <SafeAreaView style={styles.center}><Text>Error loading store.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 🔶 Header */}
        <View style={[styles.card, styles.headerCard]}>
          <Image source={imageSource} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{store.storeName || store.name}</Text>
            <View style={styles.statusRow}>
              <Ionicons
                name={store.isOpen ? "ellipse" : "ellipse-outline"}
                size={12}
                color={store.isOpen ? "#22c55e" : "#9ca3af"}
              />
              <Text style={[styles.statusText, store.isOpen && styles.openText]}>
                {store.isOpen ? "เปิดอยู่" : "ปิดแล้ว"}
              </Text>
            </View>
            {operatingHours && 
              <View style={styles.statusRow}>
                <Ionicons name="time-outline" size={12} color="#9ca3af" />
                <Text style={styles.statusText}>{operatingHours}</Text>
              </View>
            }
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
              <Text style={styles.summaryValue}>{ordersSummary.totalCount}</Text>
            </View>
            <View style={[styles.summaryBox, shadow.light]}>
              <Text style={styles.summaryLabel}>Revenue</Text>
              <Text style={[styles.summaryValue, { color: "#FA4A0C" }]}>
                {formatCurrency(ordersSummary.revenue)}
              </Text>
            </View>
            <TouchableOpacity style={[styles.summaryBox, shadow.light]} onPress={() => router.push("/features/store/menuScreen")}>
              <Text style={styles.summaryLabel}>Menu Items</Text>
              <Text style={styles.summaryValue}>{store.menu?.length || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 📈 Weekly Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Performance</Text>
          <View style={[styles.card, { paddingHorizontal: 10 }]}>
            <View style={styles.chartContainer}>
              {weeklyData.map((item, index) => (
                <View key={index} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${item.orders / 20 * 100}%` }]} />
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 🧾 Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {ordersStatus === 'loading' ? <ActivityIndicator color="#FA4A0C"/> : 
           recentOrders.length > 0 ?
            <View style={[styles.infoCard, shadow.light]}>
              {recentOrders.map(order => (
                <View key={order.id} style={styles.recentOrderRow}>
                  <View style={styles.recentOrderLeft}>
                    <Text style={styles.recentOrderId}>Order #{order.queueNumber || order.id}</Text>
                    <Text style={styles.recentOrderCustomer}>{order.customerName || 'N/A'}</Text>
                  </View>
                  <View style={styles.recentOrderRight}>
                    <Text style={styles.recentOrderTotal}>THB {formatCurrency(order.total)}</Text>
                    <Text style={[styles.recentOrderStatus, { color: STATUS_COLORS[order.status] || '#6C757D' }]}>{capitalize(order.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
            :
            <View style={[styles.emptyBox, shadow.light]}>
              <Ionicons name="document-text-outline" size={30} color="#9CA3AF" />
              <Text style={styles.emptyText}>No recent orders</Text>
            </View>
          }
        </View>

        {/* 🏪 Store Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={[styles.infoCard, shadow.light]}>
            {infoFields.map(field => (
              <View key={field.key} style={styles.infoRow}>
                <Ionicons name={field.icon} size={18} color="#FA4A0C" />
                <Text style={styles.infoText}>{field.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },
  scroll: {
    padding: 16,
    gap: 18,
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },
  headerCard: {
    ...shadow.light,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 50,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    color: "#6B7280",
  },
  openText: {
    color: "#22C55E",
  },
  editButton: {
    backgroundColor: "#FA4A0C",
    padding: 10,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingVertical: 20,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  infoCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#374151",
    flexShrink: 1,
  },
  recentOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recentOrderLeft: {
    flex: 1,
  },
  recentOrderRight: {
    alignItems: 'flex-end',
  },
  recentOrderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  recentOrderCustomer: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  recentOrderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  recentOrderStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 12,
    backgroundColor: '#FA4A0C',
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
});