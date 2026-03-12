import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";


export default function FiltroProdutos({ onFilter }) {
  const [nome, setNome] = useState("");
  const [estoque, setEstoque] = useState("s");

  const aplicarFiltro = () => {
    if (onFilter) {
      onFilter({ nome, estoque });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Filtrar Produtos</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="search" size={24} color="#b71c1c" />
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          placeholderTextColor="#777"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={estoque}
          onValueChange={(itemValue) => setEstoque(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="COM ESTOQUE" value="s" color="#9b9999ff" />
          <Picker.Item label="SEM ESTOQUE" value="n" color="#9b9999ff" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.botao} onPress={aplicarFiltro}>
        <MaterialIcons name="filter-list" size={22} color="#fff" />
        <Text style={styles.botaoTexto}>Filtrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    marginTop: 35,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b71c1c",
    marginBottom: 15,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },

  pickerContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },

  picker: {
    width: "100%",
  },

  botao: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});