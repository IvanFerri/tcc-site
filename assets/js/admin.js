import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    carregarProdutos();
  }
});

window.sair = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

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

window.excluirProduto = async function (id) {
  await deleteDoc(doc(db, "produtos", id));
  carregarProdutos();
};

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

async function carregarMensagens() {
  const lista = document.getElementById("mensagens-lista");

  if (!lista) {
    console.warn("mensagens-lista não encontrado");
    return;
  }

  const q = query(
    collection(db, "mensagens"),
    orderBy("data", "desc")
  );

  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nenhuma mensagem recebida.</p>";
      return;
    }

    lista.innerHTML = "";

    snapshot.forEach(doc => {
      const m = doc.data();

      lista.innerHTML += `
        <div class="mensagem-card">
          <strong>Nome:</strong> ${m.nome}<br>
          <strong>Email:</strong> ${m.email}<br>
          <p>${m.mensagem}</p>
          <small>${m.data?.toDate().toLocaleString("pt-BR")}</small>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar mensagens:", error);
  }
}

document.addEventListener("DOMContentLoaded", carregarMensagens);
