import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  PermissionsAndroid,
  Platform,
} from "react-native";

import Menu from "../components/Menu";
import FiltroPedidos from "../components/FiltroPedido";
import BotaoAdicionar from "../components/BotaoAdicionar";
import PedidoCard from "../components/CardPedido";
import ModalPedido from "../components/ModalPedido";
import {
  buscarMacImpressora,
  buscarPedidos,
  editarPedido,
} from "../api/pedidos";
import { buscarProdutos } from "../api/produtos";

import RNBluetoothClassic from "react-native-bluetooth-classic";

export default function PedidoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [dispositivo, setDispositivo] = useState(null);
  const [bluetoothInit, setBluetoothInit] = useState(false);
  const [filtroAtual, setFiltroAtual] = useState({
    nome: "",
    status: "PENDENTE",
  });
  const COL_QTD = 4;
  const COL_NOME = 20;
  const COL_VALOR = 7;
  const COL_VALOR_INICIO = COL_QTD + COL_NOME;

  useEffect(() => {
    if (!filtroAtual) return;

    const interval = setInterval(() => {
      aplicarFiltro(filtroAtual);
    }, 60000);

    return () => clearInterval(interval);
  }, [filtroAtual]);

  const avancarPapel = async (device, lines = 3) => {
    await device.write("\n".repeat(lines));
  };

  async function requestBluetoothPermissions() {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      return (
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  }

  const initBluetooth = async () => {
    if (bluetoothInit) return;

    try {
      const granted = await requestBluetoothPermissions();
      if (!granted) {
        console.log("Permissão Bluetooth negada");
        return;
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      if (!enabled) {
        RNBluetoothClassic.requestEnable();
        return;
      }

      const data = await buscarMacImpressora();

      if (data?.mac) {
        const devices = await RNBluetoothClassic.getBondedDevices();
        const found = devices.find((d) => d.address === data.mac);

        if (found) {
          setDispositivo(found);
          console.log("Impressora pronta:", found.name);
        } else {
          console.log("Impressora não pareada no Android");
        }
      }
    } catch (error) {
      console.log("Erro ao inicializar Bluetooth:", error);
    } finally {
      setBluetoothInit(true);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      initBluetooth();
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  const filtroInicial = { nome: "", status: "PENDENTE" };
  const valorNumero = (v) => Number(v).toFixed(2).replace(".", ",");

  const gerarTextoCupom = (pedido) => {
    let texto = "";

    // Cabeçalho
    texto += "--------------------------------\n";
    texto += "          BILA PROMO\n";
    texto += "--------------------------------\n";

    // Dados do pedido
    texto += `Pedido: ${pedido.id}\n`;

    if (pedido.datacad && pedido.horacad) {
      const dataFormatada = pedido.datacad.split("-").reverse().join("/");
      texto += `Data: ${dataFormatada} ${pedido.horacad}\n`;
    }

    texto += "\nCliente: ";
    texto += `${pedido.nome}\n`;

    if (pedido.telefone) {
      texto += "Telefone: ";
      texto += `${pedido.telefone}\n`;
    }

    // Pagamento
    texto += `Pagamento: ${pedido.pagamento}\n`;

    // Entrega
    if ((pedido.nome != "CLIENTE BALCAO") & (pedido.telefone != "")) {
      texto += `\nEntrega: ${pedido.entrega === "S" ? "SIM" : "NAO"}\n`;
    }

    if (pedido.entrega === "S" && pedido.endereco) {
      texto += "Endereço: ";
      texto += `${pedido.endereco}\n`;
    }

    // Itens
    texto += "\nItens:\n";

    pedido.itens.forEach((item) => {
      const LARGURA_TOTAL = 32;
      const COL_VALOR = 7;
      const COL_TEXTO = LARGURA_TOTAL - COL_VALOR;

      const nome = item.nome.toUpperCase();
      for (let i = 0; i < nome.length; i += LARGURA_TOTAL) {
        texto += nome.substring(i, i + LARGURA_TOTAL) + "\n";
      }

      const qtd = item.qtd;
      const unitario = Number(item.precovenda).toFixed(2).replace(".", ",");
      const subtotal = Number(item.subtotal).toFixed(2).replace(".", ",");

      const linhaTexto = `${qtd} x ${valorNumero(item.precovenda)} =`
        .slice(0, COL_TEXTO)
        .padEnd(COL_TEXTO);

      const linhaValor = valorNumero(item.subtotal).padStart(COL_VALOR);

      texto += linhaTexto + linhaValor + "\n";
    });

    // Total
    texto += "--------------------------------\n";

    let totalFinal = pedido.total;
    const VALOR_ENTREGA = 6;
    const TAXA_CARTAO = 0.05;

    const temEntrega = pedido.entrega === "S";
    const isCartao =
      pedido.pagamento === "CARTAO DE CREDITO" ||
      pedido.pagamento === "CARTAO DE DEBITO";

    let taxaEntrega = temEntrega ? VALOR_ENTREGA : 0;
    let taxaCartao = 0;
    let subtotal = 0;

    if (temEntrega && !isCartao) {
      subtotal = totalFinal - taxaEntrega;
    } else if (isCartao && !temEntrega) {
      subtotal = totalFinal / (1 + TAXA_CARTAO);
      taxaCartao = subtotal * TAXA_CARTAO;
    } else if (isCartao && temEntrega) {
      subtotal = totalFinal / (1 + TAXA_CARTAO);
      taxaCartao = subtotal * TAXA_CARTAO;
      subtotal -= taxaEntrega;
    } else {
      subtotal = totalFinal;
    }

    // SUBTOTAL
    texto +=
      "Subtotal:".padEnd(COL_VALOR_INICIO) +
      valorNumero(temEntrega || isCartao ? subtotal : totalFinal).padStart(
        COL_VALOR
      ) +
      "\n";

    // TAXA ENTREGA
    texto +=
      "Taxa entrega:".padEnd(COL_VALOR_INICIO) +
      valorNumero(temEntrega ? taxaEntrega : 0).padStart(COL_VALOR) +
      "\n";

    // TAXA CARTÃO
    texto +=
      "Taxa cartão (5%):".padEnd(COL_VALOR_INICIO) +
      valorNumero(isCartao ? taxaCartao : 0).padStart(COL_VALOR) +
      "\n";

    // TOTAL
    texto +=
      "TOTAL:".padEnd(COL_VALOR_INICIO) +
      valorNumero(totalFinal).padStart(COL_VALOR) +
      "\n";

    texto += "--------------------------------\n";
    texto += "Obrigado pela preferência!\n\n";

    return texto;
  };

  const aplicarFiltro = async ({ nome, status }) => {
    setLoading(true);
    try {
      setFiltroAtual({ nome, status });
      const resultado = await buscarPedidos({ nome, status });
      setPedidos(resultado);
    } catch (error) {
      console.log("Erro ao buscar pedidos:", error);
    }
    setLoading(false);
  };

  const carregarProdutos = async () => {
    try {
      const resultado = await buscarProdutos();
      setProdutos(resultado);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    aplicarFiltro(filtroAtual);
    carregarProdutos();
  }, []);

  const handlePrint = async (pedido) => {
    if (!dispositivo) {
      console.log("Impressora não definida");
      return;
    }

    try {
      const connected = await dispositivo.connect();
      if (!connected) {
        console.log("Não foi possível conectar à impressora");
        return;
      }

      const texto = gerarTextoCupom(pedido);

      await dispositivo.write(texto);
      await avancarPapel(dispositivo, 4);

      await editarPedido({
        ...pedido,
        status: "IMPRESSO",
      });

      aplicarFiltro(filtroAtual);
    } catch (error) {
      console.log("Erro ao imprimir:", error);
    } finally {
      try {
        await dispositivo.disconnect();
      } catch {}
    }
  };

  const abrirModal = () => setModalVisible(true);

  const fecharModal = () => {
    setModalVisible(false);
    aplicarFiltro(filtroAtual);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.filtroContainer}>
        <FiltroPedidos onFilter={aplicarFiltro} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#b71c1c"
            style={{ marginTop: 20 }}
          />
        ) : pedidos.length > 0 ? (
          pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onPrint={() => handlePrint(pedido)}
              onAtualizar={() => aplicarFiltro(filtroAtual)}
            />
          ))
        ) : (
          <Text style={{ textAlign: "center" }}>Nenhum pedido encontrado</Text>
        )}
      </ScrollView>

      <BotaoAdicionar onPress={abrirModal} />

      <ModalPedido
        visible={modalVisible}
        onClose={fecharModal}
        produtos={produtos}
        handlePrint={handlePrint}
      />

      <Menu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filtroContainer: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
});
