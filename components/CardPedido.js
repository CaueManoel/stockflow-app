import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import BotaoImprimir from "../components/BotaoImprimir";
import BotaoCancelar from "../components/BotaoCancelar";

function formatMoney(value) {
  if (value === null || value === undefined) return "0,00";

  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export default function PedidoCard({ pedido, onPrint, onAtualizar }) {
  const [expandido, setExpandido] = useState(false);
  const TAXA_CARTAO = 0.05;

  const isCartao =
    pedido.pagamento === "CARTAO DE CREDITO" ||
    pedido.pagamento === "CARTAO DE DEBITO";

  let totalFinal = pedido.total;
  const VALOR_ENTREGA = 6;

  const temEntrega = pedido.entrega === "S";

  let taxaEntrega = temEntrega ? VALOR_ENTREGA : 0;
  let taxaCartao = 0;
  let subtotal = 0;

  if (temEntrega && !isCartao) {
    subtotal = totalFinal - taxaEntrega;
  } else if (isCartao && !temEntrega) {
    subtotal = totalFinal / (1 + TAXA_CARTAO);
    taxaCartao = subtotal * TAXA_CARTAO;
  } else if (isCartao && temEntrega) {
    subtotal = (totalFinal) / (1 + TAXA_CARTAO);
    taxaCartao = subtotal * TAXA_CARTAO;
    subtotal -= taxaEntrega;
  } else {
    subtotal = totalFinal;
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpandido(!expandido)}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nome}>{pedido.nome}</Text>

            <Text style={styles.subText}>
              {formatDate(pedido.dataalt)} • {pedido.horaalt}
            </Text>

            <View style={styles.statusColumn}>
              <View style={styles.statusItem}>
                <MaterialIcons name="payment" size={16} color="#b71c1c" />
                <Text style={styles.status}>{pedido.pagamento}</Text>
              </View>
              <View style={styles.statusItem}>
                <MaterialIcons name="location-on" size={16} color="#b71c1c" />
                <Text style={styles.status}>
                  {pedido.endereco ? pedido.endereco : "RETIRADA"}
                </Text>
              </View>
            </View>

            {pedido.telefone ? (
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => {
                  const url = `https://wa.me/55${pedido.telefone}`;
                  console.log(url);
                  Linking.openURL(url).catch((err) =>
                    console.error("Não foi possível abrir o WhatsApp", err)
                  );
                }}
              >
                <Image
                  source={require("../assets/whatsapp.jpg")}
                  style={{ width: 50, height: 50 }}
                />
              </TouchableOpacity>
            ) : null}

            {(temEntrega || isCartao) && (
              <Text style={styles.entrega}>
                Subtotal: R$ {formatMoney(subtotal)}
              </Text>
            )}
            {!temEntrega && !isCartao && (
              <Text style={styles.entrega}>
                Subtotal: {formatMoney(pedido.total)}
              </Text>
            )}

            {temEntrega && <Text style={styles.entrega}>Entrega: R$ 6,00</Text>}
            {!temEntrega && (
              <Text style={styles.entrega}>Entrega: R$ 0,00</Text>
            )}

            {isCartao && (
              <Text style={styles.entrega}>
                Taxa do cartão: R$ {formatMoney(taxaCartao)}
              </Text>
            )}
            {!isCartao && (
              <Text style={styles.entrega}>Taxa do cartão: R$ 0,00</Text>
            )}

            <Text style={styles.total}>
              Total: R$ {formatMoney(pedido.total)}
            </Text>

            <View style={styles.expandHint}>
              <View style={styles.expandLine} />
              <MaterialIcons
                name={expandido ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
                color="#999"
                style={styles.expandArrow}
              />
              <View style={styles.expandLine} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {pedido.status !== "CANCELADO" && (
        <TouchableOpacity style={styles.impressoraButton} onPress={onPrint}>
          <Image
            source={require("../assets/impressora.png")}
            style={{ width: 40, height: 40 }}
          />
        </TouchableOpacity>
      )}
      {expandido && (
        <View style={styles.itensContainer}>
          {pedido.itens.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              {item.linkfoto ? (
                <Image
                  source={{ uri: item.linkfoto }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={styles.placeholder}>
                  <MaterialIcons name="image" size={24} color="#ccc" />
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemNome}>{item.nome}</Text>

                <Text style={styles.itemDetail}>
                  {item.qtd} x R$ {formatMoney(item.precovenda)}
                </Text>

                <Text style={styles.itemSubtotal}>
                  Subtotal: R$ {formatMoney(item.subtotal)}
                </Text>
              </View>
            </View>
          ))}

          {pedido.status !== "CANCELADO" && (
            <View style={styles.botoesRow}>
              <BotaoImprimir onPress={onPrint} />
              <BotaoCancelar pedido={pedido} onAtualizar={onAtualizar} />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
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

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  nome: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },

  subText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    fontStyle: "italic",
  },

  total: {
    fontSize: 16,
    color: "#b71c1c",
    marginTop: 6,
    fontWeight: "bold",
  },

  entrega: {
    fontSize: 12,
    color: "#7c7a7aff",
    marginTop: 3,
    fontWeight: "500",
    fontStyle: "italic",
  },

  statusColumn: {
    marginTop: 6,
  },

  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  status: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
    textTransform: "uppercase",
  },

  statusPedido: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
    textTransform: "uppercase",
  },

  setaExpandir: {
    marginTop: 60,
    marginRight: 10,
  },

  itensContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },

  itemRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },

  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  itemInfo: {
    flex: 1,
  },

  itemNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  itemDetail: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  itemSubtotal: {
    fontSize: 13,
    color: "#b71c1c",
    marginTop: 2,
    fontWeight: "500",
  },

  botoesRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  taxaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fc8585ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },

  taxaBadgeText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },

  resumoBox: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    marginTop: 10,
  },

  resumoText: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
  },

  resumoTaxa: {
    fontSize: 14,
    color: "#777",
    textAlign: "right",
    marginTop: 2,
  },

  resumoTotal: {
    fontSize: 16,
    color: "#b71c1c",
    fontWeight: "700",
    textAlign: "right",
    marginTop: 6,
  },
  expandidoInfo: {
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  infoText: {
    marginLeft: 4,
    color: "#555",
    fontSize: 12,
    flexShrink: 1,
  },
  whatsappButton: {
    position: "absolute",
    right: 0,
    top: 10,
  },
  impressoraButton: {
    position: "absolute",
    right: 110,
    top: 28,
  },
  expandHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  expandLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  expandArrow: {
    marginHorizontal: 6,
  },
});
