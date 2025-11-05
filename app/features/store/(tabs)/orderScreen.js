import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useStore } from "../../../../src/context/storeContext";
import { db } from "../../../../src/config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const STATUS_COLORS = {
  pending: "#F59E0B",
  preparing: "#3B82F6",
  ready: "#10B981",
  completed: "#059669",
  cancelled: "#EF4444",
};

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

const OrderCard = ({ order, onAccept, onDecline, isProcessing }) => {
  const [expanded, setExpanded] = useState(false);
  const status = order.status?.toLowerCase() || 'pending';

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>Order #{order.queueNumber || order.id}</Text>
          <Text style={styles.customerName}>{order.customerName || 'N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>{capitalize(order.status)}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>THB {formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>THB {formatCurrency(order.total)}</Text>
          </View>
        </View>
      )}

      {status === "pending" && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]} 
            onPress={onDecline} 
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="#EF4444"/> : <Text style={styles.declineButtonText}>Decline</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]} 
            onPress={onAccept} 
            disabled={isProcessing}
          >
            {isProcessing ? <ActivityIndicator color="#FFFFFF"/> : <Text style={styles.acceptButtonText}>Accept</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function OrderScreen() {
  const { storeId, store } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingOrders, setProcessingOrders] = useState({});

  useEffect(() => {
    if (!storeId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "orders"), where("storeId", "==", storeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleDecision = async (orderId, decision) => {
    setProcessingOrders(prev => ({ ...prev, [orderId]: true }));
    try {
      const orderRef = doc(db, "orders", orderId);
      const newStatus = decision === 'accept' ? 'preparing' : 'cancelled';
      await updateDoc(orderRef, {
        status: newStatus,
        statusUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update order status.");
    } finally {
      setProcessingOrders(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Incoming Orders</Text>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#FA4A0C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} active orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard 
            order={item} 
            onAccept={() => handleDecision(item.id, 'accept')}
            onDecline={() => handleDecision(item.id, 'decline')}
            isProcessing={processingOrders[item.id]}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>No orders yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  customerName: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6B7280",
    width: 30,
  },
  itemName: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FA4A0C",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#FEE2E2",
  },
  declineButtonText: {
    color: "#EF4444",
    fontWeight: "700",
  },
  acceptButton: {
    backgroundColor: "#FA4A0C",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyState: {
    marginTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});