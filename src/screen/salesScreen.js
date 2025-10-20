import { SafeAreaView, Text, View, ScrollView } from "react-native";
import { BottomBar } from "../component/bottomBar";
import { shadow } from "../styles/shadow";

export default function SalesScreen() {
  return (
    <SafeAreaView style={{ flex: 1}}>
      <View
        style={{
          flex: 3,
          backgroundColor: "#FA4A0C",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, opacity: 0.9 }}>
          ยอดขายวันนี้
        </Text>
        <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold" }}>
          ฿3,245.00
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            marginTop: 10,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", opacity: 0.8 }}>ออเดอร์</Text>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>28 รายการ</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", opacity: 0.8 }}>เฉลี่ย/ออเดอร์</Text>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>฿116</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#fff", opacity: 0.8 }}>เมนูขายดี</Text>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>ไก่ทอด</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 10, backgroundColor: "#F6F6F6" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 15,
                padding: 20,
                width: "47%",
                ...shadow.medium
              }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>เดือนนี้</Text>
              <Text
                style={{ color: "#FA4A0C", fontWeight: "bold", fontSize: 18 }}
              >
                ฿48,560
              </Text>
              <Text style={{ color: "green", fontSize: 12 }}>+12.5%</Text>
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 15,
                padding: 20,
                width: "47%",
                ...shadow.medium
              }}
            >
              <Text style={{ color: "#666", fontSize: 14 }}>ออเดอร์/เดือน</Text>
              <Text
                style={{ color: "#FA4A0C", fontWeight: "bold", fontSize: 18 }}
              >
                456
              </Text>
              <Text style={{ color: "green", fontSize: 12 }}>+8.3%</Text>
            </View>
          </View>

          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
            เมนูขายดี
          </Text>

          {[
            { name: "ไก่ทอด", sold: 200, revenue: 11100 },
            { name: "เซนเดอร์สไก่ฮิต", sold: 38, revenue: 8322 },
            { name: "ทาร์ตไข่", sold: 30, revenue: 1170 },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#fff",
                borderRadius: 15,
                padding: 15,
                marginBottom: 12,
                ...shadow.medium
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: "#333",
                      marginBottom: 3,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text style={{ color: "#777", fontSize: 13 }}>
                    ขายได้ {item.sold} จาน
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      backgroundColor: "#f5beaaff",
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      marginBottom: 3,
                    }}
                  >
                    <Text style={{ color: "#FA4A0C", fontSize: 12 }}>
                      #{index + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#FA4A0C",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    ฿{item.revenue}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <BottomBar/>
      </View>
    </SafeAreaView>
  );
}
