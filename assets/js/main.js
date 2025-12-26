import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const listaProdutos = document.getElementById("produtos-list");

async function carregarProdutos() {
  listaProdutos.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "produtos"));

  if (querySnapshot.empty) {
    listaProdutos.innerHTML = "<p>Nenhum produto cadastrado.</p>";
    return;
  }

  querySnapshot.forEach((doc) => {
    const produto = doc.data();

    const card = document.createElement("div");
    card.classList.add("produto-card");

    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h4>${produto.nome}</h4>
      <p>${produto.descricao}</p>
      <a class="btn-detalhes" href="produto.html?id=${doc.id}">
        Detalhes
      </a>
    `;

    listaProdutos.appendChild(card);
  });
}

carregarProdutos();
