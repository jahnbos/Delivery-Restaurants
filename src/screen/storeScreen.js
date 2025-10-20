import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from "react-native";
import { BottomBar } from "../component/bottomBar";
import { shadow } from "../styles/shadow";

import { Ionicons, FontAwesome6 } from "@expo/vector-icons";

export default function StoreScreen() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ร้านของฉัน</Text>
      </View>

      <View style={{ flex: 10, alignItems: "center", marginTop: 20 }}>
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/Logo/kfc.jpg")}
            style={styles.storeImage}
          />
          <Text style={styles.storeName}>​KFC</Text>

        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>
            สถานะร้าน:{" "}
            <Text style={{ color: isOpen ? "green" : "red" }}>
              {isOpen ? "เปิดอยู่" : "ปิดอยู่"}
            </Text>
          </Text>
          <Switch
            trackColor={{ false: "#ccc", true: "#4CAF50" }}
            thumbColor="#fff"
            value={isOpen}
            onValueChange={setIsOpen}
            style={{ transform: [{ scale: 1.2 }] }}
          />
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <FontAwesome6 name="bowl-food" size={24} color="#FA4A0C" />
            <Text style={styles.summaryValue}>4</Text>
            <Text style={styles.summaryLabel}>เมนูทั้งหมด</Text>
          </View>
          <View style={styles.summaryCard}>
            <FontAwesome6 name="receipt" size={24} color="#FA4A0C" />
            <Text style={styles.summaryValue}>1</Text>
            <Text style={styles.summaryLabel}>ออเดอร์วันนี้</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={24} color="#FA4A0C" />
            <Text style={styles.summaryValue}>฿3,245.00</Text>
            <Text style={styles.summaryLabel}>ยอดขายวันนี้</Text>
          </View>
        </View>

        <View style={styles.manageCard}>
          <TouchableOpacity style={styles.manageItem}>
            <Ionicons name="create-outline" size={22} color="#FA4A0C" />
            <Text style={styles.manageText}>แก้ไขข้อมูลร้านอาหาร</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageItem}>
            <Ionicons name="log-out-outline" size={22} color="red" />
            <Text style={[styles.manageText, { color: "red" }]}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    backgroundColor: "#FA4A0C",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  storeImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
  },
  editBtn: {
    position: "absolute",
    bottom: 5,
    right: 115,
    backgroundColor: "#FA4A0C",
    padding: 6,
    borderRadius: 20,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
  },
  statusBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 350,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
    ...shadow.light
  },
  statusLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 12,
    width: 100,
    ...shadow.medium
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  manageCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 350,
    marginTop: 25,
    paddingVertical: 10,
    ...shadow.medium
  },
  manageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderRadius:50,
    borderBottomColor: "#eee",
  },
  manageText: {
    fontSize: 15,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
  },
});
