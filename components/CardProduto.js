import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import BotaoEditar from "../components/BotaoEditar";

function formatMoney(value) {
  if (value === null || value === undefined) return "0,00";

  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProdutoCard({ produto, onEditar }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {produto.linkfoto ? (
          <Image source={{ uri: produto.linkfoto }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="image" size={40} color="#ccc" />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nomeRow}>
            <Text style={styles.nome}>{produto.nome}</Text>
          </View>

          <Text style={styles.preco}>R$ {formatMoney(produto.precovenda)}</Text>

          <View style={styles.detailRow}>
            <MaterialIcons name="inventory" size={18} color="#b71c1c" />
            <Text style={styles.detailText}>Unidade: {produto.qtdestoque}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="shopping-cart" size={18} color="#b71c1c" />
            <Text style={styles.detailText}>
              Qtd. para venda: {produto.qtdvenda}
            </Text>
          </View>

          <BotaoEditar onPress={() => onEditar && onEditar(produto)} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  nomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nome: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  preco: {
    fontSize: 15,
    color: "#b71c1c",
    marginTop: 4,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
  },
});
