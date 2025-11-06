import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
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

const objectToArray = (obj) => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).map(([key, value]) => ({
    menuId: key,
    quantity: value,
  }));
};

const OrderCard = ({
  order,
  onAccept,
  onDecline,
  isProcessing,
  storeName,
  storeMenu,
}) => {
  const [expanded, setExpanded] = useState(false);
  const status = order.status?.toLowerCase() || "pending";
  const items = Array.isArray(order.items)
    ? order.items
    : objectToArray(order.items);

  const fallbackItemImage = require("../../../../assets/Food/boxkaitod.jpg");
  const menuCatalog = Array.isArray(storeMenu) ? storeMenu : [];
  const displayStoreName =
    storeName ||
    order.shopName ||
    order.storeName ||
    order.store ||
    order.shopId ||
    "N/A";

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.cardHeader}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>
            Order #{order.orderNumber || order.id}
          </Text>
          <Text style={styles.customerName}>{displayStoreName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[status] + "20" },
          ]}
        >
          <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
            {capitalize(order.status)}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          {items.length === 0 ? (
            <Text style={styles.emptyItemsText}>
              No menu items recorded for this order
            </Text>
          ) : (
            items.map((item, index) => {
              const parsedQuantity = Number(item.quantity);
              const itemQuantity =
                Number.isFinite(parsedQuantity) && parsedQuantity > 0
                  ? parsedQuantity
                  : 1;
              const normalizeValue = (value) =>
                value === undefined || value === null
                  ? null
                  : String(value).trim().toLowerCase();

              const orderIds = [
                item.menuId,
                item.menuItemId,
                item.itemId,
                item.id,
                item.productId,
                item.sku,
              ]
                .map(normalizeValue)
                .filter(Boolean);

              const orderNames = [
                item.name,
                item.title,
                item.menuName,
                item.label,
              ]
                .map(normalizeValue)
                .filter(Boolean);

              const findMenuMatch = () => {
                for (const menuItem of menuCatalog) {
                  const menuIds = [
                    menuItem.id,
                    menuItem.menuId,
                    menuItem.itemId,
                    menuItem.productId,
                    menuItem.sku,
                    menuItem.key,
                  ]
                    .map(normalizeValue)
                    .filter(Boolean);

                  if (menuIds.some((id) => orderIds.includes(id))) {
                    return menuItem;
                  }

                  const menuNames = [
                    menuItem.name,
                    menuItem.title,
                    menuItem.menuName,
                    menuItem.label,
                  ]
                    .map(normalizeValue)
                    .filter(Boolean);

                  if (menuNames.some((name) => orderNames.includes(name))) {
                    return menuItem;
                  }
                }
                return null;
              };

              const matchedMenu = findMenuMatch();
              const parsedItemPrice = Number(item.price);
              const parsedMenuPrice = Number(matchedMenu?.price);
              const unitPrice = Number.isFinite(parsedItemPrice)
                ? parsedItemPrice
                : Number.isFinite(parsedMenuPrice)
                ? parsedMenuPrice
                : 0;
              const matchedImage =
                matchedMenu?.imageUrl ||
                matchedMenu?.uri;
              
              const itemImage =
                item.imageUrl || item.image || item.photoUrl || item.photo;

              const imageSource =
                matchedImage || itemImage
                  ? { uri: matchedImage || itemImage }
                  : fallbackItemImage;

              return (
                <View key={index} style={styles.itemRow}>
                  <Image source={imageSource} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {matchedMenu?.name ||
                        matchedMenu?.title ||
                        item.name ||
                        "Menu item"}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {itemQuantity}x · THB {formatCurrency(unitPrice)}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    THB {formatCurrency(unitPrice * itemQuantity)}
                  </Text>
                </View>
              );
            })
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              THB {formatCurrency(order.total)}
            </Text>
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
            {isProcessing ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text style={styles.declineButtonText}>Decline</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAccept}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.acceptButtonText}>Accept</Text>
            )}
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

    const q = query(collection(db, "orders"), where("shopId", "==", storeId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [storeId]);

  const handleDecision = async (orderId, decision) => {
    setProcessingOrders((prev) => ({ ...prev, [orderId]: true }));
    try {
      const orderRef = doc(db, "orders", orderId);
      const newStatus = decision === "accept" ? "preparing" : "cancelled";
      await updateDoc(orderRef, {
        status: newStatus,
        statusUpdatedAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to update order status.");
    } finally {
      setProcessingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Incoming Orders</Text>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FA4A0C" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} active orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onAccept={() => handleDecision(item.id, "accept")}
            onDecline={() => handleDecision(item.id, "decline")}
            isProcessing={processingOrders[item.id]}
            storeName={
              store?.storeName || store?.name || store?.displayName || null
            }
            storeMenu={store?.menu}
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
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  itemMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  emptyItemsText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
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
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
});
