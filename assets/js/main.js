import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

async function carregarProdutos() {
  const container = document.getElementById("produtos");

  const snapshot = await getDocs(collection(db, "produtos"));
  snapshot.forEach(doc => {
    const p = doc.data();
    container.innerHTML += `
      <div class="produto">
        <img src="${p.imagem}">
        <h3>${p.nome}</h3>
        <a href="produto.html?id=${doc.id}">Ver detalhes</a>
      </div>
    `;
  });
}

carregarProdutos();
