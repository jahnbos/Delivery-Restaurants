import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export const BottomBar = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff", // สีหลักของโปรเจกต์
        height: 70,
      }}
    >
      {/* ปุ่ม ออเดอร์ */}
      <TouchableOpacity style={{ alignItems: "center" }}>
        <FontAwesome6 name="box" size={28} color="#FA4A0C" />
        <Text style={{ color: "white", fontSize: 14, marginTop: 3 }}>
          ออเดอร์
        </Text>
      </TouchableOpacity>

      {/* ปุ่ม เมนู */}
      <TouchableOpacity style={{ alignItems: "center" }}>
        <MaterialCommunityIcons name="food" size={30} color="#FA4A0C" />
        <Text style={{ color: "white", fontSize: 14, marginTop: 3 }}>เมนู</Text>
      </TouchableOpacity>

      {/* ปุ่ม ยอดขาย */}
      <TouchableOpacity style={{ alignItems: "center" }}>
        <Ionicons name="stats-chart" size={30} color="#FA4A0C" />
        <Text style={{ color: "white", fontSize: 14, marginTop: 3 }}>
          ยอดขาย
        </Text>
      </TouchableOpacity>

      {/* ปุ่ม ร้านค้า */}
      <TouchableOpacity style={{ alignItems: "center" }}>
        <Ionicons name="storefront-outline" size={30} color="#FA4A0C" />
        <Text style={{ color: "white", fontSize: 14, marginTop: 3 }}>
          ร้านค้า
        </Text>
      </TouchableOpacity>
    </View>
  );
};
