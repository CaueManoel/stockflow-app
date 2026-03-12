import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { criarProduto, editarProduto } from "../api/produtos";
import { useError } from "../context/ErrorContext";

export default function ModalProduto({
  visible,
  onClose,
  produto,
  onUpdate,
  produtosUnidade = [],
}) {
  const [tipo, setTipo] = useState("unidade");
  const [nome, setNome] = useState("");
  const [estoque, setEstoque] = useState("");
  const [qtdVenda, setQtdVenda] = useState("");
  const [preco, setPreco] = useState("");
  const [image, setImage] = useState(null);
  const [linkFoto, setLinkFoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(produto?.id);
  const isKitOriginal = isEdit && Number(produto?.qtdvenda) > 1;
  const isUnidadeOriginal = isEdit && Number(produto?.qtdvenda) === 1;
  const [produtoKit, setProdutoKit] = useState(null);
  const { showError } = useError();
  const produtosBase = produtosUnidade.filter((p) => Number(p.qtdvenda) === 1);

  useEffect(() => {
    if (visible) {
      if (produto) {
        const isKit = Number(produto.qtdvenda) > 1;

        setTipo(isKit ? "kit" : "unidade");
        setNome(produto.nome);
        setQtdVenda(String(produto.qtdvenda));
        setPreco(Number(produto.precovenda).toFixed(2).replace(".", ","));
        setImage(produto.linkfoto);
        setLinkFoto(produto.linkfoto);

        if (isKit) {
          setProdutoKit(Number(produto.tbproduto_id));
          setEstoque("");
        } else {
          setProdutoKit(null);
          setEstoque(String(produto.qtdestoque));
        }
      } else {
        resetCampos();
      }
    } else {
      resetCampos();
    }
  }, [produto, visible]);

  useEffect(() => {
    if (
      visible &&
      produto &&
      Number(produto.qtdvenda) > 1 &&
      produtosUnidade.length > 0
    ) {
      setProdutoKit(Number(produto.tbproduto_id));
    }
  }, [produtosUnidade]);

  function resetCampos() {
    setTipo("unidade");
    setNome("");
    setEstoque("");
    setQtdVenda("1");
    setPreco("");
    setImage(null);
    setLinkFoto(null);
    setProdutoKit(null);
  }

  useEffect(() => {
    if (tipo === "unidade") {
      setQtdVenda("1");
    } else if (!isEdit) {
      setQtdVenda("");
    }
  }, [tipo]);

  useEffect(() => {
    if (tipo === "kit" && produtoKit && !isEdit) {
      const prod = produtosUnidade.find(
        (p) => Number(p.tbproduto_id) === Number(produtoKit)
      );

      if (prod) {
        setNome(`KIT ${prod.nome}`);
        setQtdVenda("");
        setPreco("");
        setImage("");
        setLinkFoto("");
      }
    }
  }, [produtoKit, tipo]);

  async function escolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permissão para acessar a galeria é necessária!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setLinkFoto(result.assets[0].uri);
    }
  }

  async function tirarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permissão para acessar a câmera é necessária!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setLinkFoto(result.assets[0].uri);
    }
  }

  async function uploadParaCloudinary(localUri) {
    const data = new FormData();
    data.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "produto.jpg",
    });
    data.append("upload_preset", "bilapromo");
    data.append("cloud_name", "dq23jsbig");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dq23jsbig/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    return json.secure_url;
  }

  async function salvar() {
    if (!nome || !qtdVenda || !preco) {
      showError("Preencha todos os campos!");
      return;
    }

    const qtdVendaNum = Number(qtdVenda);

    if (qtdVendaNum === 1 && !estoque) {
      showError("Informe a quantidade em estoque.");
      return;
    }

    if (qtdVendaNum > 1 && !produtoKit) {
      showError("Selecione o produto base do kit.");
      return;
    }

    try {
      setUploading(true);

      let finalFoto = linkFoto;
      if (finalFoto && finalFoto.startsWith("file")) {
        finalFoto = await uploadParaCloudinary(finalFoto);
      }

      const produtoBase =
        qtdVendaNum > 1
          ? produtosUnidade.find(
              (p) =>
                Number(p.tbproduto_id) === Number(produtoKit) &&
                Number(p.qtdvenda) === 1
            )
          : null;

      if (qtdVendaNum > 1 && produtoBase) {
        const estoqueBase = Number(produtoBase.qtdestoque);

        if (qtdVendaNum > estoqueBase) {
          showError(
            `Quantidade do kit (${qtdVendaNum}) maior que o estoque do produto base (${estoqueBase}).`
          );
          setUploading(false);
          return;
        }
      }

      const estoqueFinal =
        qtdVendaNum === 1
          ? Number(estoque)
          : produtoBase
          ? Number(produtoBase.qtdestoque)
          : 0;

      const payload = {
        id: produto?.id ?? "",
        nome,
        qtdestoque: estoqueFinal,
        qtdvenda: qtdVendaNum,
        precovenda: Number(preco.replace(/\./g, "").replace(",", ".")),
        linkfoto: finalFoto ?? "",
        tbproduto_id: qtdVendaNum > 1 ? Number(produtoKit) : null,
      };

      produto?.id ? await editarProduto(payload) : await criarProduto(payload);

      onClose();
      onUpdate?.();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      showError(error.message || "Erro ao salvar produto.");
    } finally {
      setUploading(false);
    }
  }

  function maskMoney(value) {
    if (!value) return "";
    let numeric = value.replace(/\D/g, "");
    let floatValue = (Number(numeric) / 100).toFixed(2);
    return floatValue.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 40}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text style={styles.title}>
                {produto?.id ? "Editar Produto" : "Cadastrar Produto"}
              </Text>

              <View style={styles.tipoContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  disabled={isEdit && isKitOriginal}
                  onPress={() => {
                    setTipo("unidade");
                    setQtdVenda("1");
                    setProdutoKit(null);
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      tipo === "unidade" && styles.checked,
                      isEdit && isKitOriginal && styles.disabledCheckbox,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxText,
                      isEdit && isKitOriginal && styles.disabledText,
                    ]}
                  >
                    Unidade
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  disabled={isEdit && isUnidadeOriginal}
                  onPress={() => {
                    setTipo("kit");
                    setQtdVenda("");
                    setEstoque("");
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      tipo === "kit" && styles.checked,
                      isEdit && isUnidadeOriginal && styles.disabledCheckbox,
                    ]}
                  />
                  <Text
                    style={[
                      styles.checkboxText,
                      isEdit && isUnidadeOriginal && styles.disabledText,
                    ]}
                  >
                    Kit
                  </Text>
                </TouchableOpacity>
              </View>

              {tipo === "kit" && (
                <>
                  <Text style={styles.label}>Selecione o produto base:</Text>
                  <Picker
                    style={[
                      styles.input,
                      isEdit && tipo === "kit" && styles.inputDisabled,
                    ]}
                    enabled={!(isEdit && tipo === "kit")}
                    selectedValue={produtoKit}
                    onValueChange={setProdutoKit}
                  >
                    <Picker.Item label="Selecione..." value={null} />
                    {produtosBase.map((p) => (
                      <Picker.Item
                        key={p.tbproduto_id}
                        label={`${p.nome} - R$ ${p.precovenda}`}
                        value={p.tbproduto_id}
                      />
                    ))}
                  </Picker>
                </>
              )}

              <View style={styles.field}>
                {tipo === "unidade" && (
                  <Text style={styles.fieldLabel}>Nome do produto</Text>
                )}
                {tipo === "kit" && (
                  <Text style={styles.fieldLabel}>Nome do kit</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome"
                  value={nome}
                  onChangeText={setNome}
                  maxLength={32}
                />
              </View>

              {tipo === "unidade" && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Quantidade em estoque</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={estoque}
                    onChangeText={setEstoque}
                    placeholder="Ex: 50"
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Quantidade para venda</Text>
                <TextInput
                  style={[
                    styles.input,
                    tipo === "unidade" && styles.inputDisabled,
                  ]}
                  keyboardType="numeric"
                  value={qtdVenda}
                  onChangeText={setQtdVenda}
                  editable={tipo === "kit"}
                  placeholder={tipo === "kit" ? "Ex: 6" : ""}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Preço de venda</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={preco}
                  onChangeText={(text) => setPreco(maskMoney(text))}
                  placeholder="R$ 0,00"
                />
              </View>

              <View style={styles.previewContainer}>
                {image && (
                  <Image source={{ uri: image }} style={styles.preview} />
                )}
              </View>

              <View style={styles.row}>
                <TouchableOpacity style={styles.btnFoto} onPress={escolherFoto}>
                  <MaterialIcons name="photo" size={24} color="#fff" />
                  <Text style={styles.btnText}>Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnFoto} onPress={tirarFoto}>
                  <MaterialIcons name="photo-camera" size={24} color="#fff" />
                  <Text style={styles.btnText}>Câmera</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
                <Text style={styles.btnSalvarText}>
                  {uploading ? "Enviando..." : "Salvar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnCancelar} onPress={onClose}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: "90%",
    marginTop: "auto",
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#b71c1c",
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 35,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#b71c1c",
    marginRight: 8,
    borderRadius: 4,
  },
  checked: {
    backgroundColor: "#b71c1c",
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b71c1c",
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#000000ff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnFoto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b71c1c",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  previewContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 5,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  btnSalvar: {
    backgroundColor: "#b71c1c",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
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
  field: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginLeft: 4,
  },

  inputDisabled: {
    backgroundColor: "#f2f2f2",
    color: "#888",
  },
  disabledCheckbox: {
    backgroundColor: "#eee",
    borderColor: "#ccc",
  },

  disabledText: {
    color: "#aaa",
  },
});
