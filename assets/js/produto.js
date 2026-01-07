/**
 * Página de Detalhes do Produto - Gráfica VIP
 * Com Bootstrap Carousel e SweetAlert2
 */

import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  where,
  limit
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ============================================
// DOM Elements
// ============================================
const produtoDetalhe = document.getElementById("produtoDetalhe");
const loadingState = document.getElementById("loadingState");
const breadcrumbNome = document.getElementById("breadcrumbNome");
const relatedSection = document.getElementById("relatedSection");
const relatedGrid = document.getElementById("relatedGrid");

// ============================================
// State
// ============================================
let currentProduct = null;
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

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
// Get Product ID from URL
// ============================================
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ============================================
// Load Product
// ============================================
async function loadProduct() {
  const productId = getProductId();
  
  if (!productId) {
    showError("Produto não encontrado");
    return;
  }

  try {
    const docRef = doc(db, "produtos", productId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      showError("Produto não encontrado");
      return;
    }

    currentProduct = {
      id: docSnap.id,
      ...docSnap.data()
    };

    // Increment view count
    await updateDoc(docRef, {
      visualizacoes: increment(1)
    });

    renderProduct();
    loadRelatedProducts();

  } catch (error) {
    console.error("Erro ao carregar produto:", error);
    showError("Erro ao carregar produto");
  }
}

// ============================================
// Render Product
// ============================================
function renderProduct() {
  if (!currentProduct) return;

  // Update page title and breadcrumb
  document.title = `${currentProduct.nome} - Gráfica VIP`;
  breadcrumbNome.textContent = currentProduct.nome;

  // Hide loading, show content
  loadingState.classList.add("d-none");
  produtoDetalhe.classList.remove("d-none");

  // Get all images
  const images = getProductImages();
  const isFav = favorites.includes(currentProduct.id);
  
  // WhatsApp link
  const numeroWhatsapp = "5567999883923";
  const mensagem = encodeURIComponent(
    `Olá! Vim pelo site da Gráfica VIP e tenho interesse no produto: ${currentProduct.nome}`
  );
  const whatsappLink = `https://wa.me/${numeroWhatsapp}?text=${mensagem}`;

  // Render
  produtoDetalhe.innerHTML = `
    <div class="row g-4 g-lg-5">
      <!-- Galeria -->
      <div class="col-lg-6">
        ${images.length > 1 ? `
          <!-- Carousel para múltiplas imagens -->
          <div id="produtoCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-indicators">
              ${images.map((_, i) => `
                <button type="button" data-bs-target="#produtoCarousel" data-bs-slide-to="${i}" 
                  ${i === 0 ? 'class="active"' : ''} aria-label="Slide ${i + 1}"></button>
              `).join('')}
            </div>
            <div class="carousel-inner rounded-4 overflow-hidden">
              ${images.map((img, i) => `
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                  <img src="${img}" class="d-block w-100" alt="${currentProduct.nome}"
                    style="height: 400px; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/600x400?text=Sem+Imagem'">
                </div>
              `).join('')}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#produtoCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#produtoCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          </div>
          
          <!-- Thumbnails -->
          <div class="d-flex gap-2 mt-3 overflow-auto">
            ${images.map((img, i) => `
              <img src="${img}" class="rounded border ${i === 0 ? 'border-success' : 'border-secondary'}" 
                style="width: 80px; height: 60px; object-fit: cover; cursor: pointer; opacity: ${i === 0 ? '1' : '0.6'}"
                onclick="document.querySelector('[data-bs-slide-to=\\'${i}\\']').click()"
                alt="Miniatura ${i + 1}">
            `).join('')}
          </div>
        ` : `
          <!-- Imagem única -->
          <img src="${images[0]}" class="img-fluid rounded-4 shadow" alt="${currentProduct.nome}"
            onerror="this.src='https://via.placeholder.com/600x400?text=Sem+Imagem'">
        `}
      </div>

      <!-- Info -->
      <div class="col-lg-6">
        <!-- Badges -->
        <div class="d-flex gap-2 mb-3">
          ${isNewProduct(currentProduct.criadoEm) ? 
            '<span class="badge bg-success"><i class="bi bi-stars me-1"></i>Novo</span>' : ''
          }
          ${currentProduct.categoria ? 
            `<span class="badge bg-secondary">${currentProduct.categoria}</span>` : ''
          }
        </div>

        <h1 class="display-6 fw-bold mb-3">${currentProduct.nome}</h1>
        
        <p class="lead text-body-secondary mb-4" style="white-space: pre-line;">
          ${currentProduct.descricao || 'Produto personalizado de alta qualidade da Gráfica VIP.'}
        </p>

        <!-- Meta Info -->
        <div class="card bg-body-tertiary border-0 mb-4">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-auto">
                <div class="d-flex align-items-center text-body-secondary">
                  <i class="bi bi-eye text-success me-2 fs-5"></i>
                  <span>${(currentProduct.visualizacoes || 0) + 1} visualizações</span>
                </div>
              </div>
              ${currentProduct.criadoEm ? `
                <div class="col-auto">
                  <div class="d-flex align-items-center text-body-secondary">
                    <i class="bi bi-calendar3 text-success me-2 fs-5"></i>
                    <span>Adicionado em ${formatDate(currentProduct.criadoEm)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="d-flex flex-wrap gap-3 mb-4">
          <a href="${whatsappLink}" target="_blank" class="btn btn-success btn-lg flex-fill">
            <i class="bi bi-whatsapp me-2"></i>Solicitar Orçamento
          </a>
          <button class="btn ${isFav ? 'btn-danger' : 'btn-outline-secondary'} btn-lg" onclick="window.toggleFavorite()">
            <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'} me-2"></i>${isFav ? 'Remover' : 'Favoritar'}
          </button>
        </div>

        <!-- Share -->
        <div class="border-top pt-4">
          <p class="text-body-secondary mb-2"><i class="bi bi-share me-2"></i>Compartilhar:</p>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary" onclick="window.copyLink()" title="Copiar link" id="copyBtn">
              <i class="bi bi-link-45deg"></i>
            </button>
            <a href="https://wa.me/?text=${encodeURIComponent(window.location.href)}" target="_blank" 
              class="btn btn-outline-success" title="WhatsApp">
              <i class="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// Get Product Images
// ============================================
function getProductImages() {
  if (!currentProduct) return [];
  
  const images = [currentProduct.imagem];
  
  if (currentProduct.imagens && Array.isArray(currentProduct.imagens)) {
    images.push(...currentProduct.imagens);
  } else if (currentProduct.imagens && typeof currentProduct.imagens === 'string') {
    const additionalImages = currentProduct.imagens.split(',').map(url => url.trim()).filter(Boolean);
    images.push(...additionalImages);
  }
  
  return images.filter(Boolean);
}

// ============================================
// Toggle Favorite
// ============================================
window.toggleFavorite = function() {
  if (!currentProduct) return;

  const index = favorites.indexOf(currentProduct.id);
  
  if (index > -1) {
    favorites.splice(index, 1);
    Toast.fire({
      icon: 'info',
      title: 'Removido dos favoritos'
    });
  } else {
    favorites.push(currentProduct.id);
    Toast.fire({
      icon: 'success',
      title: 'Adicionado aos favoritos'
    });
  }
  
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderProduct();
};

// ============================================
// Copy Link
// ============================================
window.copyLink = async function() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.classList.remove('btn-outline-secondary');
    copyBtn.classList.add('btn-success');
    copyBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
    
    Toast.fire({
      icon: 'success',
      title: 'Link copiado!'
    });
    
    setTimeout(() => {
      copyBtn.classList.remove('btn-success');
      copyBtn.classList.add('btn-outline-secondary');
      copyBtn.innerHTML = '<i class="bi bi-link-45deg"></i>';
    }, 2000);
  } catch (err) {
    Toast.fire({
      icon: 'error',
      title: 'Erro ao copiar link'
    });
  }
};

// ============================================
// Load Related Products
// ============================================
async function loadRelatedProducts() {
  if (!currentProduct || !currentProduct.categoria) {
    return;
  }

  try {
    const q = query(
      collection(db, "produtos"),
      where("categoria", "==", currentProduct.categoria),
      limit(4)
    );

    const snapshot = await getDocs(q);
    
    const related = [];
    snapshot.forEach(docSnap => {
      if (docSnap.id !== currentProduct.id) {
        related.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      }
    });

    if (related.length === 0) return;

    relatedSection.classList.remove('d-none');
    
    relatedGrid.innerHTML = related.slice(0, 3).map(produto => `
      <div class="col-md-4">
        <div class="card produto-card h-100 shadow-sm">
          <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}"
            style="height: 150px; object-fit: cover;"
            onerror="this.src='https://via.placeholder.com/400x300?text=Sem+Imagem'">
          <div class="card-body">
            <h6 class="card-title">${produto.nome}</h6>
            <a href="produto.html?id=${produto.id}" class="btn btn-sm btn-success w-100">
              Ver Detalhes
            </a>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error("Erro ao carregar relacionados:", error);
  }
}

// ============================================
// Helper Functions
// ============================================
function isNewProduct(criadoEm) {
  if (!criadoEm) return false;
  const createdDate = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return createdDate > sevenDaysAgo;
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
}

function showError(message) {
  loadingState.classList.add("d-none");
  produtoDetalhe.classList.remove("d-none");
  
  produtoDetalhe.innerHTML = `
    <div class="text-center py-5">
      <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
      <h3 class="mt-3">${message}</h3>
      <p class="text-body-secondary">O produto que você está procurando não existe ou foi removido.</p>
      <a href="index.html" class="btn btn-success mt-3">
        <i class="bi bi-arrow-left me-2"></i>Voltar ao Catálogo
      </a>
    </div>
  `;
  
  breadcrumbNome.textContent = "Erro";
}

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", loadProduct);
