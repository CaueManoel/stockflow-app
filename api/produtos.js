import { API_BASE_URL } from "./config";

export async function criarProduto(dados) {
  const response = await fetch(`${API_BASE_URL}/produto.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const text = await response.text();

  try {
    return text ? JSON.parse(text) : { success: true };
  } catch (e) {
    return { success: true };
  }
}

export async function buscarProdutos(filtro = { nome: "", estoque: "" }) {
  const { nome, estoque } = filtro;

  const url = `${API_BASE_URL}/produto.php?nome=${encodeURIComponent(
    nome
  )}&estoque=${estoque}`;

  const response = await fetch(url);

  try {
    const json = await response.json();
    return json;
  } catch (error) {
    console.log("Erro ao parsear JSON:", error);
    return [];
  }
}

export async function editarProduto(dados) {
  const response = await fetch(`${API_BASE_URL}/produto.php`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const text = await response.text();

  try {
    return text ? JSON.parse(text) : { success: true };
  } catch (e) {
    return { success: true };
  }
}