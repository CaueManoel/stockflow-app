import { API_BASE_URL } from "./config";

export async function criarPedido(dados) {
  const response = await fetch(`${API_BASE_URL}/pedido.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  const json = await response.json();

  if (!response.ok || json?.message) {
    throw new Error(json.message || "Erro inesperado no servidor");
  }

  return json;
}

export async function buscarPedidos(filtro = { nome: "", status: "" }) {
  const { nome, status } = filtro;

  const url = `${API_BASE_URL}/pedido.php?nome=${encodeURIComponent(
    nome
  )}&status=${encodeURIComponent(status)}`;

  const response = await fetch(url);

  try {
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Erro ao buscar pedidos:", error);
    return [];
  }
}

export async function editarPedido(dados) {
  const response = await fetch(`${API_BASE_URL}/pedido.php`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  const text = await response.text();

  if (!text) {
    return { success: true };
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("Resposta não é JSON:", text);
    return { success: true };
  }
}

export async function buscarPedidoPorId(id) {
  const response = await fetch(`${API_BASE_URL}/pedido.php?id=${id}`);

  const text = await response.text();

  if (!text) {
    throw new Error("API retornou vazio ao buscar pedido");
  }

  return JSON.parse(text);
}

export async function buscarMacImpressora() {
  const url = `${API_BASE_URL}/impressora.php`;
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Erro ao buscar mac:", error);
    return [];
  }
}
