import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomBar } from "../component/bottomBar";

export default function OrderScreen() {
  const uri = require("../../assets/Food/boxkaitod.jpg");
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 2, backgroundColor: "#FA4A0C" }}>
        <Text style={[style.topicText, { fontSize: 25, marginTop: 25 }]}>
          ชื่อร้าน
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
            <View style={[style.orderCard, style.shadowCard]}>
              <View style={{ flex: 3, flexDirection: "row" }}>
                <View>
                  <Text
                    style={{
                      fontSize: 25,
                      marginTop: 15,
                      paddingHorizontal: 15,
                    }}
                  >
                    รหัส
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      marginTop: 10,
                      paddingHorizontal: 15,
                    }}
                  >
                    ชื่อ user
                  </Text>
                </View>
                <Text style={{ fontSize: 20, marginTop: 60, marginLeft: 210 }}>
                  12:00
                </Text>
              </View>
              <View style={{ flex: 4 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 25,
                    width: 350,
                    height: 125,
                    alignSelf: "center",
                  }}
                ></View>
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
                    backgroundColor: "green",
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
    backgroundColor: "#fff",
  },
  shadowCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
});
