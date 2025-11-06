import { useCallback } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { shadow } from "../../../../src/styles/shadow";
import { useStore } from "../../../../src/context/storeContext";
import { db } from "../../../../src/config/firebase";
import Modal from "react-native-modal";


const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "THB 0.00";
  }
  return `THB ${amount.toFixed(2)}`;
};

const MenuCard = ({ item, isActive, onToggle, onEdit, onDelete }) => (
  <View style={[styles.card, shadow.strong]}>
    <View style={styles.cardMain}>
      <Image source={{ uri: item.uri }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          {item.popular ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Top Seller</Text>
            </View>
          ) : null}
        </View>
        {item.category ? (
          <Text style={styles.cardCategory}>{item.category}</Text>
        ) : null}
        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.toggleColumn}>
        <Text
          style={[
            styles.toggleLabel,
            isActive ? styles.toggleLabelActive : styles.toggleLabelInactive,
          ]}
        >
          {isActive ? "Active" : "Paused"}
        </Text>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: "#E5E7EB", true: "#00fb58ff" }}
          thumbColor="#fff"
          ios_backgroundColor="#E5E7EB"
          style={styles.toggleSwitch}
        />
      </View>
    </View>
    <View style={styles.cardFooter}>
      <TouchableOpacity
        style={[styles.actionButton, styles.editButton]}
        onPress={onEdit}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={18} color="#2563EB" />
        <Text style={[styles.actionText, styles.editText]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={onDelete}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={18} color="#EF4444" />
        <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function MenuScreen() {
  const [modalContent, setModalContent] = useState(null);
  const { store } = useStore();
  const menuItems = store?.menu || [];

  const getFeatureAlertConfig = useCallback((type, context = {}) => {
    const itemLabel = context.itemName
      ? `"${context.itemName}"`
      : "this menu item";

    switch (type) {
      case "editItem":
        return {
          title: "Edit feature coming soon",
          iconName: "create-outline",
          iconColor: "#2563EB",
          iconBackgroundColor: "#EEF2FF",
          buttonText: "Okay, thanks",
        };
      case "deleteItem":
        return {
          title: "Remove feature coming soon",
          iconName: "trash-outline",
          iconColor: "#EF4444",
          iconBackgroundColor: "#FEF2F2",
          buttonText: "Okay, thanks",
        };
      case "newItem":
      default:
        return {
          title: "New item coming soon",
          iconName: "sparkles-outline",
          iconColor: "#FA4A0C",
          iconBackgroundColor: "#FFF1EB",
          buttonText: "Okay, thanks",
        };
    }
  }, []);

  const showFeatureAlert = useCallback(
    (type, context = {}) => {
      setModalContent(getFeatureAlertConfig(type, context));
    },
    [getFeatureAlertConfig]
  );

  const closeModal = useCallback(() => setModalContent(null), []);

  const toggleItemStatus = useCallback(
    async (itemId) => {
      if (!store?.id) {
        console.log("store.id is missing");
        return;
      }

      // ✅ ต้องเป็น string เสมอ
      const storeRef = doc(db, "info", String(store.id));

      try {
        // 1. ดึงข้อมูลล่าสุดจาก Firestore
        const docSnap = await getDoc(storeRef);
        if (!docSnap.exists()) {
          console.error("Document does not exist!");
          return;
        }

        const currentMenu = docSnap.data().menu || [];
        if (!Array.isArray(currentMenu)) {
          console.error("Menu data is not an array!");
          return;
        }

        // 2. สร้างเมนูใหม่ โดยสลับสถานะ
        const newMenu = currentMenu.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status: item.status === "active" ? "paused" : "active",
            };
          }
          return item;
        });

        // 3. เขียนกลับเข้า Firestore
        await updateDoc(storeRef, { menu: newMenu });

        console.log("✅ Updated status successfully for item:", itemId);

        // 4. (แนะนำ) อัปเดต local state เพื่อให้ UI เปลี่ยนทันที
        store.menu = newMenu; // ถ้า context รองรับ
      } catch (error) {
        console.error("❌ Failed to toggle item:", error);
      }
    },
    [store?.id]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandText}>Menu</Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.85}
            onPress={() => showFeatureAlert("newItem")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New item</Text>
          </TouchableOpacity>
        </View>
      
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            isActive={item.status === "active"}
            onToggle={() => toggleItemStatus(item.id)}
            onEdit={() =>
              showFeatureAlert("editItem", { itemName: item.name || "" })
            }
            onDelete={() =>
              showFeatureAlert("deleteItem", { itemName: item.name || "" })
            }
          />
        ))}
      </ScrollView>

      <Modal
        isVisible={Boolean(modalContent)}
        onBackdropPress={closeModal}
        backdropTransitionOutTiming={0}
      >
        {modalContent ? (
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalIconBadge,
                modalContent.iconBackgroundColor
                  ? { backgroundColor: modalContent.iconBackgroundColor }
                  : null,
              ]}
            >
              <Ionicons
                name={modalContent.iconName || "sparkles-outline"}
                size={32}
                color={modalContent.iconColor || "#FA4A0C"}
              />
            </View>
            <Text style={styles.modalTitle}>
              {modalContent.title || "Coming soon"}
            </Text>
            {modalContent.message ? (
              <Text style={styles.modalMessage}>{modalContent.message}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModal}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>
                {modalContent.buttonText || "Got it"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffffff",
     borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  brandText: {
    color: "#000000ff",
    fontSize: 26,
    fontWeight: "700",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  headerSubtitle: {
    marginTop: 8,
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  modalContent: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF1EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalMessage: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 4,
    backgroundColor: "#FA4A0C",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 18,
    gap: 16,
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  cardImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 12,
    color: "#B45309",
    fontWeight: "600",
  },
  cardCategory: {
    fontSize: 13,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#4B5563",
  },
  cardPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "700",
    color: "#FA4A0C",
  },
  toggleColumn: {
    alignItems: "center",
    gap: 6,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  toggleLabelActive: {
    color: "#16A34A",
  },
  toggleLabelInactive: {
    color: "#9CA3AF",
  },
  toggleSwitch: {
    transform: [{ scale: 0.9 }],
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  editButton: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EEF2FF",
  },
  editText: {
    color: "#2563EB",
  },
  deleteButton: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteText: {
    color: "#EF4444",
  },
});
