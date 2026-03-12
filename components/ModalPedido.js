import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useError } from "../context/ErrorContext";
import { criarPedido } from "../api/pedidos";

export function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ModalPedido({
  visible,
  onClose,
  produtos,
  handlePrint,
}) {
  const [itemSelecionado, setItemSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState("CLIENTE BALCÃO");
  const [pagamento, setPagamento] = useState("PIX");
  const [salvando, setSalvando] = useState(false);
  const { showError } = useError();

  const TAXA_CARTAO = 0.05;

  const totalGeral = lista.reduce(
    (sum, item) => sum + item.preco * item.qtd,
    0
  );

  const isCartao =
    pagamento === "CARTAO DE CREDITO" || pagamento === "CARTAO DE DEBITO";
  const valorTaxa = isCartao ? totalGeral * TAXA_CARTAO : 0;
  const totalFinal = totalGeral + valorTaxa;

  useEffect(() => {
    if (!visible) {
      setLista([]);
      setItemSelecionado("");
      setQuantidade(1);
      setPagamento("PIX");
    }
  }, [visible]);

  function adicionarProduto() {
    if (!itemSelecionado || !quantidade) {
      alert("Selecione um produto e informe a quantidade!");
      return;
    }

    const produto = produtos.find((p) => p.id == itemSelecionado);
    if (!produto) return;

    const qtdNova = quantidade;
    const preco = Number(produto.precovenda);

    setLista((prevLista) => {
      const existe = prevLista.find((i) => i.id === produto.id);

      if (existe) {
        return prevLista.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                qtd: item.qtd + qtdNova,
                total: (item.qtd + qtdNova) * preco,
              }
            : item
        );
      }

      return [
        ...prevLista,
        {
          id: produto.id,
          tbproduto_id: produto.tbproduto_id,
          nome: produto.nome,
          preco,
          qtd: qtdNova,
          total: preco * qtdNova,
        },
      ];
    });

    setItemSelecionado("");
    setQuantidade(1);
  }

  function removerItem(id) {
    setLista(lista.filter((i) => i.id !== id));
  }

  async function salvarCompra() {
    if (lista.length === 0) {
      alert("Adicione pelo menos 1 produto!");
      return;
    }

    const payload = {
      id: "",
      nome: "CLIENTE BALCÃO",
      telefone: "",
      endereco: "",
      entrega: "N",
      pagamento,
      total: totalFinal.toFixed(2),
      status: "IMPRESSO",
      ativo: "S",
      itens: lista.map((item) => ({
        id: "",
        qtd: item.qtd.toString(),
        precovenda: item.preco.toFixed(2),
        subtotal: (item.preco * item.qtd).toFixed(2),
        tbprodutokit_id: item.id.toString(),
        tbproduto_id: item.tbproduto_id?.toString(),
        nome: item.nome,
        linkfoto: "",
      })),
    };

    try {
      setSalvando(true);

      const pedidoCriado = await criarPedido(payload);

      await handlePrint(pedidoCriado);
      onClose();
    } catch (err) {
      showError(err.message || "Erro ao salvar pedido");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Criar Pedido</Text>

            <Text style={{ marginBottom: 5 }}>Selecione um produto:</Text>

            <View style={styles.selectBox}>
              <ScrollView style={{ maxHeight: 300 }}>
                {produtos
                  ?.filter((p) => p.qtdestoque >= p.qtdvenda)
                  .map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.option,
                        itemSelecionado == p.id && styles.optionSelected,
                      ]}
                      onPress={() => setItemSelecionado(p.id)}
                    >
                      <Text style={styles.optionText}>{p.nome}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>

            <View style={styles.quantidadeContainer}>
              <TouchableOpacity
                style={[
                  styles.botaoQtd,
                  quantidade === 1 && styles.botaoDesativado,
                ]}
                disabled={quantidade === 1}
                onPress={() => setQuantidade((q) => q - 1)}
              >
                <Text style={styles.textoBotao}>−</Text>
              </TouchableOpacity>

              <Text style={styles.valorQtd}>{quantidade}</Text>

              <TouchableOpacity
                style={styles.botaoQtd}
                onPress={() => setQuantidade((q) => q + 1)}
              >
                <Text style={styles.textoBotao}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={adicionarProduto}
            >
              <Text style={styles.btnSalvarText}>Adicionar à lista</Text>
            </TouchableOpacity>

            {lista.length > 0 && (
              <>
                <Text style={styles.title2}>Itens do pedido</Text>

                {lista.map((item) => (
                  <View key={item.id} style={styles.itemBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemNome}>{item.nome}</Text>
                      <Text>
                        Qtd: {item.qtd} | Preço: {formatarMoeda(item.preco)}
                      </Text>
                      <Text style={styles.itemTotal}>
                        Total: {formatarMoeda(item.total)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removerItem(item.id)}
                      style={styles.btnRemover}
                    >
                      <MaterialIcons name="delete" size={26} color="#b71c1c" />
                    </TouchableOpacity>
                  </View>
                ))}

                <Text style={styles.title2}>Forma de pagamento</Text>

                <View style={styles.pagamentoBox}>
                  {[
                    "PIX",
                    "DINHEIRO",
                    "CARTAO DE CREDITO",
                    "CARTAO DE DEBITO",
                  ].map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.pagamentoBtn,
                        pagamento === tipo && styles.pagamentoSelecionado,
                      ]}
                      onPress={() => setPagamento(tipo)}
                    >
                      <Text
                        style={[
                          styles.pagamentoText,
                          pagamento === tipo && { color: "#fff" },
                        ]}
                      >
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.totalGeral}>
                  Subtotal:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {formatarMoeda(totalGeral)}
                  </Text>
                </Text>

                {isCartao && (
                  <Text style={styles.taxa}>
                    Taxa cartão (5%):{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {formatarMoeda(valorTaxa)}
                    </Text>
                  </Text>
                )}

                <Text style={styles.totalFinal}>
                  Total Final:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {formatarMoeda(totalFinal)}
                  </Text>
                </Text>
              </>
            )}

            {lista.length > 0 && (
              <TouchableOpacity
                style={[styles.btnSalvar, salvando && { opacity: 0.6 }]}
                onPress={salvarCompra}
                disabled={salvando}
              >
                <Text style={styles.btnSalvarText}>
                  {salvando ? "Salvando..." : "Finalizar Pedido"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "100%",
    marginTop: "auto",
    marginBottom: "auto",
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#b71c1c",
  },
  title2: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#b71c1c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 5,
    marginBottom: 10,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionSelected: {
    backgroundColor: "#fce4e4",
  },
  optionText: {
    fontSize: 16,
  },
  btnSalvar: {
    backgroundColor: "#b71c1c",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  btnSalvarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  btnCancelar: {
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#b71c1c",
  },
  btnCancelarText: {
    color: "#b71c1c",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  itemBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  itemNome: {
    fontWeight: "700",
    fontSize: 16,
  },
  itemTotal: {
    color: "#b71c1c",
    fontWeight: "bold",
  },
  btnRemover: {
    marginLeft: 10,
  },
  totalGeral: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "right",
  },
  pagamentoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  pagamentoBtn: {
    borderWidth: 1,
    borderColor: "#b71c1c",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
  },

  pagamentoSelecionado: {
    backgroundColor: "#b71c1c",
  },

  pagamentoText: {
    color: "#b71c1c",
    fontWeight: "700",
  },

  taxa: {
    marginTop: 8,
    fontSize: 16,
    textAlign: "right",
    color: "#555",
  },

  totalFinal: {
    marginTop: 10,
    fontSize: 20,
    textAlign: "right",
    color: "#b71c1c",
    fontWeight: "700",
  },
  quantidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },

  botaoQtd: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#b71c1c",
    alignItems: "center",
    justifyContent: "center",
  },

  textoBotao: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  valorQtd: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#333",
  },
  quantidadeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },

  botaoQtd: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#b71c1c",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoDesativado: {
    backgroundColor: "#ccc",
  },

  textoBotao: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  valorQtd: {
    width: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#333",
  },
});
