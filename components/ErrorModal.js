import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useError } from "../context/ErrorContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function ErrorModal() {
  const { error, hideError } = useError();

  if (!error) return null;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <MaterialIcons name="error-outline" size={48} color="#b71c1c" />

          <Text style={styles.title}>Ops!</Text>
          <Text style={styles.message}>{error}</Text>

          <TouchableOpacity style={styles.button} onPress={hideError}>
            <Text style={styles.buttonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0007",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 10,
    color: "#b71c1c",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  button: {
    backgroundColor: "#b71c1c",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
