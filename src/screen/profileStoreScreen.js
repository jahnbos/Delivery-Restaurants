import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from "react-native";
import { BottomBar } from "../component/bottomBar";
import { shadow } from "../styles/shadow";

import { Ionicons } from "@expo/vector-icons";

const SaveProfile = (props) => {
  if (
    props.storeName == "" ||
    props.address == "" ||
    props.openTime == "" ||
    props.closeTime == ""
  ) {
    return Alert.alert("กรุณาระบุข้อมูลของผู้ใช้");
  }
};

export default function ProfileStoreScreen() {
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [image, setImage] = useState(
    require("../../assets/Logo/kfc.jpg")
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ข้อมูลร้านอาหาร</Text>
      </View>

      <View
        style={{ flex: 10, alignItems: "center", justifyContent: "flex-start" }}
      >
        <View style={styles.imageContainer}>
          <TouchableOpacity>
            <Image source={image} style={styles.storeImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.card]}>
          <Text style={styles.label}>ชื่อร้าน</Text>
          <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="กรอกชื่อร้าน" />

          <Text style={styles.label}>ที่อยู่</Text>
          <TextInput
            style={[styles.input, { height: 70 }]}
            value={address}
            onChangeText={setAddress}
            placeholder="กรอกที่อยู่ร้าน"
            multiline
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>เวลาเปิด</Text>
              <TextInput style={styles.input} value={openTime} onChangeText={setOpenTime} placeholder="08:00" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>เวลาปิด</Text>
              <TextInput style={styles.input} value={closeTime} onChangeText={setCloseTime} placeholder="20:00" />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton}
            onPress={() =>
                    SaveProfile({
                      storeName: storeName,
                      address: address,
                      openTime: openTime,
                      closeTime: closeTime,
                    })
                  }
          >
            
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              บันทึกข้อมูล
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Bar */}
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
  imageContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  storeImage: {
    width: 140,
    height: 140,
    borderRadius: 100,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 110,
    backgroundColor: "#FA4A0C",
    padding: 8,
    borderRadius: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    ...shadow.medium
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
  },
  saveButton: {
    backgroundColor: "#FA4A0C",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
});
