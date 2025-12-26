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

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const listaMensagens = document.getElementById("mensagens-lista");

async function carregarMensagens() {
  if (!listaMensagens) return;

  const q = query(
    collection(db, "mensagens"),
    orderBy("data", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    listaMensagens.innerHTML = "<p>Nenhuma mensagem recebida.</p>";
    return;
  }

  listaMensagens.innerHTML = "";

  snapshot.forEach(doc => {
    const m = doc.data();

    const div = document.createElement("div");
    div.classList.add("mensagem-card");

    div.innerHTML = `
      <strong>Nome:</strong> ${m.nome}<br>
      <strong>Email:</strong> ${m.email}<br>
      <strong>Mensagem:</strong>
      <p>${m.mensagem}</p>
      <small>${m.data?.toDate().toLocaleString("pt-BR")}</small>
      <hr>
    `;

    listaMensagens.appendChild(div);
  });
}

carregarMensagens();
