import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Switch,
  SafeAreaView,
  Image,
} from "react-native";
import { BottomBar } from "../component/bottomBar";

import { useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function MenuScreen() {
  const menuList = [
    {
      id: 1,
      name: "เซนเดอร์สไก่ฮิต",
      price: 45,
      popular: true,
      image: require("../../assets/Food/boxkaitod.jpg"),
    },
    {
      id: 2,
      name: "ไก่ทอด",
      price: 40,
      popular: true,
      image: require("../../assets/Food/realkaitod.jpg"),
    },
    {
      id: 3,
      name: "ทาร์ตไข่",
      price: 50,
      popular: true,
      image: require("../../assets/Food/egg.jpg"),
    },
    {
      id: 4,
      name: "เฟรนช์ฟรายส์",
      price: 60,
      popular: false,
      image: require("../../assets/Food/French fries.jpg"),
    },
  ];

  const [switchStates, setSwitchStates] = useState(
    Object.fromEntries(menuList.map((item) => [item.id, false]))
  );

  // ฟังก์ชันสลับสถานะของแต่ละอัน
  const toggleSwitch = (id) => {
    setSwitchStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{ flex: 2, flexDirection: "row", backgroundColor: "#FA4A0C" }}
      >
        <Text
          style={{
            fontSize: 25,
            color: "#fff",
            marginLeft: 25,
            alignSelf: "center",
          }}
        >จัดการเมนูอาหาร
        </Text>
        <TouchableOpacity
          style={{
            borderRadius: 100,
            width: 65,
            height: 65,
            alignSelf: "center",
            marginLeft: 110,
            backgroundColor: "green",
          }}
        >
          <FontAwesome6
            style={{ alignSelf: "center", marginTop: 10 }}
            name="add"
            size={40}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 10 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginTop: 25 }}>
            {menuList.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  width: 375,
                  height: 100,
                  alignSelf: "center",
                  marginBottom: 15,
                  paddingHorizontal: 15,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                {/* รูปภาพเมนู */}
                <Image
                  source={item.image}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 15,
                    marginRight: 15,
                  }}
                />

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {item.name}
                    </Text>
                    {item.popular && (
                      <View
                        style={{
                          backgroundColor: "#FFD9A0",
                          borderRadius: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginLeft: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#E67E22" }}>
                          ยอดนิยม
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: "#7B7B7B", marginTop: 5 }}>
                    ฿{item.price}
                  </Text>
                </View>

                {/* Switch + icons */}
                <View style={{ alignItems: "center" }}>
                  <Switch
                    style={{ marginRight: 5, transform: [{ scale: 0.9 }] }}
                    trackColor={{ false: "#ccc", true: "#4CAF50" }}
                    thumbColor="#fff"
                    value={switchStates[item.id]} // ใช้ state ของแต่ละเมนู
                    onValueChange={() => toggleSwitch(item.id)} // สลับเฉพาะ id นั้น
                  />
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity style={{ marginRight: 15 }}>
                      <Ionicons
                        name="create-outline"
                        size={25}
                        color="#7B7B7B"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Ionicons name="trash-outline" size={25} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={{ flex: 1}}>
        <BottomBar/>
      </View>
    </SafeAreaView>
  );
}
