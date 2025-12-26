// 🔹 Firebase base
import { auth, db } from "./firebase.js";

// 🔹 Auth
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// 🔹 Firestore
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ===============================
   PROTEÇÃO DA ÁREA ADMIN
================================ */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

/* ===============================
   CADASTRO DE PRODUTOS
================================ */
const formProduto = document.getElementById("form-produto");
const listaProdutos = document.getElementById("lista-produtos");

if (formProduto) {
  formProduto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome-produto").value;
    const descricao = document.getElementById("descricao-produto").value;
    const imagem = document.getElementById("imagem-produto").value;

    try {
      await addDoc(collection(db, "produtos"), {
        nome,
        descricao,
        imagem,
        criadoEm: Timestamp.now()
      });

      alert("Produto cadastrado com sucesso!");
      formProduto.reset();
      carregarProdutos();

    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto");
    }
  });
}

async function carregarProdutos() {
  if (!listaProdutos) return;

  listaProdutos.innerHTML = "";

  const snapshot = await getDocs(collection(db, "produtos"));

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("produto-admin");

    div.innerHTML = `
      <strong>${p.nome}</strong>
      <p>${p.descricao}</p>
      <img src="${p.imagem}" width="100">
    `;

    listaProdutos.appendChild(div);
  });
}

carregarProdutos();

/* ===============================
   MENSAGENS RECEBIDAS
================================ */
async function carregarMensagens() {
  const lista = document.getElementById("mensagens-lista");
  if (!lista) return;

  const q = query(
    collection(db, "mensagens"),
    orderBy("data", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    lista.innerHTML = "<p>Nenhuma mensagem recebida.</p>";
    return;
  }

  lista.innerHTML = "";

  snapshot.forEach(docSnap => {
    const m = docSnap.data();

    lista.innerHTML += `
      <div class="mensagem-card">
        <strong>Nome:</strong> ${m.nome}<br>
        <strong>Email:</strong> ${m.email}<br>
        <p>${m.mensagem}</p>
        <small>${m.data?.toDate().toLocaleString("pt-BR")}</small>
      </div>
    `;
  });
}

carregarMensagens();

/* ===============================
   LOGOUT
================================ */
window.sair = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};
