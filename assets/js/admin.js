// ===============================
// IMPORTAÇÕES FIREBASE
// ===============================
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

// ===============================
// PROTEÇÃO DA PÁGINA ADMIN
// ===============================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ===============================
// FUNÇÃO DE RESIZE DA IMAGEM
// ===============================
function resizeImage(file, maxWidth = 400, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const scale = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(resizedBase64);
      };
    };

    reader.readAsDataURL(file);
  });
}

// ===============================
// CADASTRAR PRODUTO
// ===============================
const formProduto = document.getElementById("formProduto");

if (formProduto) {
  formProduto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nomeProduto").value;
    const descricao = document.getElementById("descricaoProduto").value;
    const preco = document.getElementById("precoProduto").value;
    const imagemInput = document.getElementById("imagemProduto");
    const file = imagemInput.files[0];

    if (!file) {
      alert("Selecione uma imagem");
      return;
    }

    try {
      const imagemBase64 = await resizeImage(file);

      await addDoc(collection(db, "produtos"), {
        nome,
        descricao,
        preco,
        imagem: imagemBase64,
        criadoEm: new Date()
      });

      alert("Produto cadastrado com sucesso!");
      formProduto.reset();
      listarProdutos();

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto");
    }
  });
}

// ===============================
// LISTAR PRODUTOS
// ===============================
async function listarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;

  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "produtos"));

  querySnapshot.forEach((docSnap) => {
    const produto = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("produto-admin");

    div.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h4>${produto.nome}</h4>
      <p>${produto.descricao}</p>
      <p><strong>R$ ${produto.preco}</strong></p>
      <button onclick="excluirProduto('${docSnap.id}')">Excluir</button>
    `;

    lista.appendChild(div);
  });
}

// ===============================
// EXCLUIR PRODUTO
// ===============================
window.excluirProduto = async function (id) {
  if (confirm("Deseja excluir este produto?")) {
    await deleteDoc(doc(db, "produtos", id));
    listarProdutos();
  }
};

// ===============================
// LOGOUT
// ===============================
const btnSair = document.getElementById("btnSair");

if (btnSair) {
  btnSair.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// ===============================
// INICIALIZA LISTAGEM
// ===============================
listarProdutos();
