/**
 * Admin Panel - Gráfica VIP
 * CRUD completo com SweetAlert2
 */

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ============================================
// Toast Helper (SweetAlert2)
// ============================================
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

// ============================================
// Auth Protection
// ============================================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// ============================================
// Logout
// ============================================
window.sair = async function() {
  const result = await Swal.fire({
    title: 'Sair do sistema?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Sim, sair',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    await signOut(auth);
    window.location.href = "login.html";
  }
};

// ============================================
// DOM Elements
// ============================================
const formProduto = document.getElementById("formProduto");
const listaProdutos = document.getElementById("listaProdutos");
const listaMensagens = document.getElementById("listaMensagens");
const produtoIdInput = document.getElementById("produtoId");
const formTitle = document.getElementById("formTitle");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const imagemInput = document.getElementById("imagemProduto");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

// Stats elements
const statTotalProdutos = document.getElementById("statTotalProdutos");
const statTotalMensagens = document.getElementById("statTotalMensagens");
const statNaoLidas = document.getElementById("statNaoLidas");
const badgeProdutos = document.getElementById("badgeProdutos");
const badgeMensagens = document.getElementById("badgeMensagens");

// ============================================
// Image Preview
// ============================================
if (imagemInput) {
  imagemInput.addEventListener("input", (e) => {
    const url = e.target.value.trim();
    if (url) {
      imagePreview.src = url;
      imagePreviewContainer.classList.remove("d-none");
      imagePreview.onerror = () => {
        imagePreviewContainer.classList.add("d-none");
      };
    } else {
      imagePreviewContainer.classList.add("d-none");
    }
  });
}

// ============================================
// CRUD - Create/Update Product
// ============================================
if (formProduto) {
  formProduto.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const produtoId = produtoIdInput.value;
    const nome = document.getElementById("nomeProduto").value.trim();
    const categoria = document.getElementById("categoriaProduto").value;
    const imagem = document.getElementById("imagemProduto").value.trim();
    const imagensExtras = document.getElementById("imagensExtras").value.trim();
    const descricao = document.getElementById("descricaoProduto").value.trim();

    // Disable form
    formProduto.classList.add("form-loading");
    btnSalvar.disabled = true;

    try {
      const produtoData = {
        nome,
        categoria,
        imagem,
        descricao,
        imagens: imagensExtras ? imagensExtras.split(",").map(s => s.trim()).filter(Boolean) : []
      };

      if (produtoId) {
        // Update existing
        await updateDoc(doc(db, "produtos", produtoId), produtoData);
        Toast.fire({ icon: 'success', title: 'Produto atualizado!' });
      } else {
        // Create new
        produtoData.criadoEm = Timestamp.now();
        produtoData.visualizacoes = 0;
        await addDoc(collection(db, "produtos"), produtoData);
        Toast.fire({ icon: 'success', title: 'Produto cadastrado!' });
      }

      formProduto.reset();
      cancelarEdicao();
      carregarProdutos();

    } catch (error) {
      console.error("Erro ao salvar:", error);
      Toast.fire({ icon: 'error', title: 'Erro ao salvar produto' });
    } finally {
      formProduto.classList.remove("form-loading");
      btnSalvar.disabled = false;
    }
  });
}

// ============================================
// Edit Product
// ============================================
window.editarProduto = async function(id) {
  try {
    const docSnap = await getDoc(doc(db, "produtos", id));
    
    if (!docSnap.exists()) {
      Toast.fire({ icon: 'error', title: 'Produto não encontrado' });
      return;
    }

    const produto = docSnap.data();
    
    // Fill form
    produtoIdInput.value = id;
    document.getElementById("nomeProduto").value = produto.nome || '';
    document.getElementById("categoriaProduto").value = produto.categoria || '';
    document.getElementById("imagemProduto").value = produto.imagem || '';
    document.getElementById("imagensExtras").value = Array.isArray(produto.imagens) ? produto.imagens.join(", ") : '';
    document.getElementById("descricaoProduto").value = produto.descricao || '';
    
    // Show image preview
    if (produto.imagem) {
      imagePreview.src = produto.imagem;
      imagePreviewContainer.classList.remove("d-none");
    }
    
    // Update UI
    formTitle.textContent = "Editar Produto";
    btnSalvar.innerHTML = '<i class="bi bi-check-lg me-1"></i>Atualizar';
    btnCancelar.classList.remove("d-none");
    
    // Scroll to form
    formProduto.scrollIntoView({ behavior: 'smooth' });

  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    Toast.fire({ icon: 'error', title: 'Erro ao carregar produto' });
  }
};

// ============================================
// Cancel Edit
// ============================================
window.cancelarEdicao = function() {
  produtoIdInput.value = '';
  formProduto.reset();
  formTitle.textContent = "Cadastrar Produto";
  btnSalvar.innerHTML = '<i class="bi bi-check-lg me-1"></i>Salvar Produto';
  btnCancelar.classList.add("d-none");
  imagePreviewContainer.classList.add("d-none");
};

// ============================================
// Delete Product
// ============================================
window.excluirProduto = async function(id, nome) {
  const result = await Swal.fire({
    title: 'Excluir produto?',
    html: `Você está prestes a excluir <strong>${nome}</strong>.<br>Esta ação não pode ser desfeita.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: '<i class="bi bi-trash me-1"></i>Sim, excluir',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, "produtos", id));
      Toast.fire({ icon: 'success', title: 'Produto excluído!' });
      carregarProdutos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      Toast.fire({ icon: 'error', title: 'Erro ao excluir produto' });
    }
  }
};

// ============================================
// Load Products
// ============================================
async function carregarProdutos() {
  try {
    const q = query(collection(db, "produtos"), orderBy("criadoEm", "desc"));
    const snapshot = await getDocs(q);
    
    const total = snapshot.size;
    if (statTotalProdutos) statTotalProdutos.textContent = total;
    if (badgeProdutos) badgeProdutos.textContent = total;

    if (snapshot.empty) {
      listaProdutos.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4 text-body-secondary">
            <i class="bi bi-inbox display-6 d-block mb-2"></i>
            Nenhum produto cadastrado
          </td>
        </tr>
      `;
      return;
    }

    listaProdutos.innerHTML = '';
    
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const tr = document.createElement("tr");
      
      tr.innerHTML = `
        <td>
          <img src="${p.imagem}" alt="${p.nome}" 
            onerror="this.src='https://via.placeholder.com/50x40?text=?'">
        </td>
        <td>
          <strong>${p.nome}</strong>
          <br><small class="text-body-secondary">${(p.descricao || '').substring(0, 40)}...</small>
        </td>
        <td><span class="badge bg-secondary">${p.categoria || 'N/A'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary btn-action me-1" 
            onclick="editarProduto('${docSnap.id}')" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger btn-action" 
            onclick="excluirProduto('${docSnap.id}', '${p.nome.replace(/'/g, "\\'")}')" title="Excluir">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      
      listaProdutos.appendChild(tr);
    });

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    listaProdutos.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>Erro ao carregar produtos
        </td>
      </tr>
    `;
  }
}

// ============================================
// Load Messages
// ============================================
async function carregarMensagens() {
  try {
    const q = query(collection(db, "mensagens"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);
    
    let total = 0;
    let naoLidas = 0;
    
    snapshot.forEach(docSnap => {
      total++;
      if (!docSnap.data().lida) naoLidas++;
    });
    
    if (statTotalMensagens) statTotalMensagens.textContent = total;
    if (statNaoLidas) statNaoLidas.textContent = naoLidas;
    if (badgeMensagens) badgeMensagens.textContent = total;

    if (snapshot.empty) {
      listaMensagens.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-envelope-open"></i>
          <p class="mt-2 mb-0">Nenhuma mensagem recebida</p>
        </div>
      `;
      return;
    }

    listaMensagens.innerHTML = '';
    
    let index = 0;
    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      const id = docSnap.id;
      const isNaoLida = !m.lida;
      
      const item = document.createElement("div");
      item.className = `accordion-item ${isNaoLida ? 'mensagem-nao-lida' : ''}`;
      item.id = `msg-${id}`;
      
      const dataFormatada = m.data?.toDate?.().toLocaleString("pt-BR") || 'Data não disponível';
      
      // WhatsApp link para resposta
      const whatsappMsg = encodeURIComponent(`Olá ${m.nome}, recebi sua mensagem pelo site da Gráfica VIP...`);
      
      item.innerHTML = `
        <h2 class="accordion-header">
          <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" 
            data-bs-toggle="collapse" data-bs-target="#collapse-${id}">
            <div class="d-flex justify-content-between align-items-center w-100 me-3">
              <div>
                ${isNaoLida ? '<span class="badge bg-warning me-2">Nova</span>' : ''}
                <strong>${m.nome}</strong>
                <small class="text-body-secondary ms-2">${m.email}</small>
              </div>
              <small class="text-body-secondary">${dataFormatada}</small>
            </div>
          </button>
        </h2>
        <div id="collapse-${id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
          data-bs-parent="#accordionMensagens">
          <div class="accordion-body">
            <p class="mb-3" style="white-space: pre-line;">${m.mensagem}</p>
            <div class="d-flex gap-2 flex-wrap">
              ${isNaoLida ? `
                <button class="btn btn-sm btn-outline-success" onclick="marcarComoLida('${id}')">
                  <i class="bi bi-check2 me-1"></i>Marcar como lida
                </button>
              ` : ''}
              <a href="https://wa.me/${m.email?.includes('@') ? '' : m.email}?text=${whatsappMsg}" 
                target="_blank" class="btn btn-sm btn-outline-success">
                <i class="bi bi-whatsapp me-1"></i>Responder
              </a>
              <button class="btn btn-sm btn-outline-danger" onclick="excluirMensagem('${id}')">
                <i class="bi bi-trash me-1"></i>Excluir
              </button>
            </div>
          </div>
        </div>
      `;
      
      listaMensagens.appendChild(item);
      index++;
    });

  } catch (error) {
    console.error("Erro ao carregar mensagens:", error);
    listaMensagens.innerHTML = `
      <div class="empty-state text-danger">
        <i class="bi bi-exclamation-triangle"></i>
        <p class="mt-2 mb-0">Erro ao carregar mensagens</p>
      </div>
    `;
  }
}

// ============================================
// Mark Message as Read
// ============================================
window.marcarComoLida = async function(id) {
  try {
    await updateDoc(doc(db, "mensagens", id), { lida: true });
    Toast.fire({ icon: 'success', title: 'Marcada como lida' });
    carregarMensagens();
  } catch (error) {
    console.error("Erro:", error);
    Toast.fire({ icon: 'error', title: 'Erro ao atualizar' });
  }
};

// ============================================
// Delete Message
// ============================================
window.excluirMensagem = async function(id) {
  const result = await Swal.fire({
    title: 'Excluir mensagem?',
    text: 'Esta ação não pode ser desfeita.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, "mensagens", id));
      Toast.fire({ icon: 'success', title: 'Mensagem excluída!' });
      carregarMensagens();
    } catch (error) {
      console.error("Erro:", error);
      Toast.fire({ icon: 'error', title: 'Erro ao excluir' });
    }
  }
};

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  carregarMensagens();
});
