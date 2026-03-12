// components/BotaoEditar.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


export default function BotaoEditar({ onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <MaterialIcons name="edit" size={20} color="#fff" />
      <Text style={styles.text}>Editar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ca7b05ff",
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
});