import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { editarPedido } from "../api/pedidos";

export default function BotaoCancelar({ pedido, onAtualizar }) {
  const confirmar = () => {
    Alert.alert(
      "Cancelar pedido",
      "Tem certeza que deseja cancelar este pedido?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: cancelarPedido },
      ]
    );
  };

  const cancelarPedido = async () => {
    try {
      if (!pedido || !pedido.id) {
        Alert.alert("Erro", "Pedido inválido.");
        return;
      }

      const dados = { ...pedido, status: "CANCELADO" };
      console.log("Enviando para API:", dados);

      const resultado = await editarPedido(dados);
      console.log("Resposta da API:", resultado);

      Alert.alert("Sucesso", "Pedido cancelado com sucesso!");
      if (onAtualizar) onAtualizar();
    } catch (error) {
      console.log("Erro ao cancelar pedido:", error);
      Alert.alert("Erro", "Ocorreu um erro ao cancelar o pedido.");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={confirmar}>
      <MaterialIcons name="cancel" size={20} color="#fff" />
      <Text style={styles.text}>Cancelar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#b71c1c",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    height: 50,
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 14, marginLeft: 5 },
});
