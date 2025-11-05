import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../../../src/config/firebase";
import { shadow } from "../../../src/styles/shadow";

const fallbackImage = require("../../../assets/Logo/kfc.jpg");

const StoreCard = ({ store, onPress }) => {
  const storeName = store?.storeName || store?.name || "Store";
  const address = store?.address;
  const imageSource = store?.logo? { uri: store.logo } : fallbackImage;
  const status =
    typeof store?.isOpen === "boolean"
      ? store.isOpen
        ? "Open"
        : "Closed"
      : store?.status;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.card, shadow.medium]}>
        <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {storeName}
            </Text>
            {status ? (
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: status === "Open" ? "#DCFCE7" : "#FEE2E2",
                    borderColor: status === "Open" ? "#16A34A" : "#DC2626",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: status === "Open" ? "#166534" : "#B91C1C" },
                  ]}
                >
                  {status}
                </Text>
              </View>
            ) : null}
          </View>
          {address ? (
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {address}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function StoreListScreen() {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    const storesRef = collection(db, "info");
    const storesQuery = query(storesRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(
      storesQuery,
      (snapshot) => {
        const storeDocs = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setStores(storeDocs);
        setStatus("success");
        setError(null);
      },
      (snapshotError) => {
        setStores([]);
        setStatus("error");
        setError(snapshotError);
      }
    );

    return unsubscribe;
  }, []);

  const contentContainerStyle = useMemo(
    () =>
      stores.length === 0
        ? [styles.listContent, styles.listEmptyContent]
        : styles.listContent,
    [stores.length]
  );

  const renderEmpty = () => {
    if (status === "loading") {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator color="#FA4A0C" />
          <Text style={styles.emptySubtitle}>กำลังโหลดรายชื่อร้าน...</Text>
        </View>
      );
    }

    if (status === "error") {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>โหลดรายชื่อร้านไม่สำเร็จ</Text>
          <Text style={styles.emptySubtitle}>{error?.message ?? "ลองใหม่อีกครั้ง"}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>ยังไม่มีร้านในระบบ</Text>
        <Text style={styles.emptySubtitle}>เพิ่มข้อมูลใน Firestore collection info เพื่อแสดงผลที่นี่</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>เลือกร้านค้า</Text>
        <Text style={styles.headerSubtitle}>แตะเพื่อดูรายละเอียดและคำสั่งซื้อของแต่ละร้าน</Text>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() =>
              router.push({
                pathname: "/features/store/(tabs)/storeScreen",
                params: { shopId: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
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
    paddingTop: 32,
    paddingBottom: 20,
    backgroundColor: "#FA4A0C",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerSubtitle: {
    marginTop: 6,
    color: "#fff",
    fontSize: 15,
    opacity: 0.9,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
