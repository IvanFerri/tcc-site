import { db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const container = document.getElementById("produto-detalhe");

if (!id) {
  container.innerHTML = "<p>Produto não encontrado.</p>";
} else {
  const ref = doc(db, "produtos", id);

  getDoc(ref).then((docSnap) => {
    if (docSnap.exists()) {
      const p = docSnap.data();

      container.innerHTML = `
        <h2>${p.nome}</h2>
        <img src="${p.imagem}" alt="${p.nome}" style="max-width:300px">
        <p>${p.descricao}</p>
        <br>
        <a href="index.html" class="btn-detalhes">Voltar</a>
      `;
    } else {
      container.innerHTML = "<p>Produto não encontrado.</p>";
    }
  });
}
