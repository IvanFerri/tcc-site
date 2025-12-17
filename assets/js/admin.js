import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Protege admin
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    carregarProdutos();
  }
});

// Logout
window.sair = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

// Cadastrar produto
window.salvarProduto = async function () {
  await addDoc(collection(db, "produtos"), {
    nome: nome.value,
    descricao: descricao.value,
    imagem: imagem.value,
    criadoEm: new Date()
  });

  alert("Produto cadastrado!");
  carregarProdutos();
};

// Listar produtos
async function carregarProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  const snapshot = await getDocs(collection(db, "produtos"));
  snapshot.forEach(docSnap => {
    lista.innerHTML += `
      <li>
        ${docSnap.data().nome}
        <button onclick="excluirProduto('${docSnap.id}')">Excluir</button>
      </li>
    `;
  });
}

// Excluir produto
window.excluirProduto = async function (id) {
  await deleteDoc(doc(db, "produtos", id));
  carregarProdutos();
};
