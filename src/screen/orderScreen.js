import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomBar } from "../component/bottomBar";
import { shadow } from "../styles/shadow";

export default function OrderScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 2, backgroundColor: "#FA4A0C" }}>
        <Text style={[style.topicText, { fontSize: 25, marginTop: 25 }]}>
          KFC
        </Text>
        <View>
          <Text style={[style.topicText, { fontSize: 15, marginTop: 15 }]}>
            1 ออเดอร์
          </Text>
        </View>
      </View>
      <View style={{ flex: 10, alignItems: "center" }}>
        <ScrollView>
          <View>
            <View style={[style.orderCard, shadow.strong]}>
              <View style={{ flex: 3, flexDirection: "row" }}>
                <View>
                  <Text
                    style={{
                      fontSize: 25,
                      marginTop: 15,
                      marginLeft:25,
                      
                    }}
                  >
                    ORD-001
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginTop: 10,
                      marginLeft: 25,
                    }}
                  >
                    สมชาย ใจดี
                  </Text>
                </View>
                <Text style={{ fontSize: 20, marginTop: 60, marginLeft: 170 }}>
                  12:00
                </Text>
              </View>
              <View style={{ flex: 4 , marginBottom:10}}>
                <View style={style.detailBox}>
                  {/* แถวรายการ 1 */}
                  <View style={style.detailRow}>
                    <Text style={style.detailText}>2x ข้าวมันไก่ทอด</Text>
                    <Text style={style.detailPrice}>฿90</Text>
                  </View>

                  {/* แถวรายการ 2 */}
                  <View style={style.detailRow}>
                    <Text style={style.detailText}>1x น้ำซุปไก่</Text>
                    <Text style={style.detailPrice}>฿15</Text>
                  </View>

                  {/* เส้นคั่น */}
                  <View style={style.separator} />

                  {/* รวม */}
                  <View style={style.detailRow}>
                    <Text style={[style.detailText, { fontWeight: "600" }]}>
                      รวม
                    </Text>
                    <Text
                      style={[
                        style.detailPrice,
                        { color: "#FA4A0C", fontWeight: "700" },
                      ]}
                    >
                      ฿105
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flex: 2, flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "red",
                    borderRadius: 20,
                    width: 155,
                    height: 45,
                    marginLeft: 25,
                  }}
                >
                  <Text
                    style={{
                      alignSelf: "center",
                      marginTop: 10,
                      color: "#fff",
                    }}
                  >
                    ปฏิเสธ order
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#FA4A0C",
                    borderRadius: 20,
                    width: 155,
                    height: 45,
                    marginLeft: 20,
                  }}
                >
                  <Text
                    style={{
                      alignSelf: "center",
                      marginTop: 10,
                      color: "#fff",
                    }}
                  >
                    ยืนยัน order
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        <BottomBar />
      </View>
    </SafeAreaView>
  );
}
const style = StyleSheet.create({
  topicText: {
    color: "#fff",
    paddingHorizontal: 25,
  },
  orderCard: {
    borderRadius: 25,
    width: 375,
    height: 300,
    marginTop: 20,
    backgroundColor: '#fff',
  },
  detailBox: {
    backgroundColor: "#F3F4F6", 
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: 350,
    alignSelf: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailText: {
    fontSize: 14.5,
    color: "#374151",
  },
  detailPrice: {
    fontSize: 14.5,
    color: "#111827",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 6,
  },
});
