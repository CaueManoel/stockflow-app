import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";

import Menu from "../components/Menu";
import FiltroProdutos from "../components/FiltroProduto";
import BotaoAdicionar from "../components/BotaoAdicionar";
import ModalProduto from "../components/ModalProduto";
import ProdutoCard from "../components/CardProduto";
import { buscarProdutos } from "../api/produtos";

export default function ProdutoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoEditar, setProdutoEditar] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);

  const filtroInicial = { nome: "", estoque: "s" };

  const aplicarFiltro = async ({ nome, estoque }) => {
    setLoading(true);
    try {
      const resultado = await buscarProdutos({ nome, estoque });
      setProdutos(resultado);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    aplicarFiltro(filtroInicial);
  }, []);

  const abrirModalEdicao = (produto) => {
    setProdutoEditar(produto);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setProdutoEditar(null);
    aplicarFiltro(filtroInicial);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.filtroContainer}>
        <FiltroProdutos onFilter={aplicarFiltro} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#b71c1c"
            style={{ marginTop: 20 }}
          />
        ) : produtos.length > 0 ? (
          produtos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onEditar={abrirModalEdicao}
            />
          ))
        ) : (
          <Text style={{ textAlign: "center" }}>Nenhum produto encontrado</Text>
        )}
      </ScrollView>

      <BotaoAdicionar onPress={() => abrirModalEdicao(null)} />

      <ModalProduto
        visible={modalVisible}
        onClose={fecharModal}
        produto={produtoEditar}
        produtosUnidade={produtos}
      />

      <Menu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  filtroContainer: { paddingHorizontal: 10, paddingTop: 5 },
  content: { padding: 20, paddingBottom: 140 },
});
