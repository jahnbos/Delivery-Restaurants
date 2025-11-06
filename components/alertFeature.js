import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";

export default function FancyAlert() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>Show Alert</Text>
      </TouchableOpacity>

      <Modal isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>✨ Coming Soon!</Text>
          <Text style={styles.message}>
            This feature will be available in the next update.
          </Text>

          <TouchableOpacity
            style={styles.okButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.okText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FA4A0C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "700" },
  alertBox: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#FA4A0C", marginBottom: 8 },
  message: { fontSize: 15, color: "#374151", textAlign: "center", marginBottom: 16 },
  okButton: {
    backgroundColor: "#FA4A0C",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  okText: { color: "white", fontWeight: "700" },
});
