import { db } from "./firebase.js";
import { collection, getDocs } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const lista = document.getElementById("produtos-list");

async function carregarProdutos() {
  const snapshot = await getDocs(collection(db, "produtos"));
  snapshot.forEach(doc => {
    const p = doc.data();
    lista.innerHTML += `
      <div class="produto">
        <img src="${p.imagem}">
        <h3>${p.nome}</h3>
        <a href="produto.html?id=${doc.id}" class="btn-detalhes">
          Ver detalhes
        </a>

      </div>
    `;
  });
}

document.getElementById("whatsapp-btn").href =
  "https://wa.me/5567999883923";
document.getElementById("whatsapp-btn2").href =
  "https://wa.me/5567999883923";

carregarProdutos();

