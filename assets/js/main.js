/**
 * Main Application - Gráfica VIP
 * Catálogo com busca, filtros, favoritos e SweetAlert2
 */

import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ============================================
// DOM Elements
// ============================================
const searchInput = document.getElementById("searchInput");
const filtersWrapper = document.getElementById("filtersWrapper");
const sortSelect = document.getElementById("sortSelect");
const produtosGrid = document.getElementById("produtosGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");
const statProdutos = document.getElementById("statProdutos");
const statCategorias = document.getElementById("statCategorias");

// ============================================
// State
// ============================================
let allProducts = [];
let filteredProducts = [];
let currentCategory = "todos";
let currentSearch = "";
let currentSort = "recentes";
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// ============================================
// Toast Helper (SweetAlert2)
// ============================================
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// ============================================
// WhatsApp Button
// ============================================
const numeroWhatsapp = "5567999883923";
const mensagemPadrao = encodeURIComponent(
  "Olá! Vim pelo site da Gráfica VIP e gostaria de solicitar um orçamento."
);
const whatsappLink = `https://wa.me/${numeroWhatsapp}?text=${mensagemPadrao}`;

const btnWhatsapp = document.getElementById("whatsapp-btn");
if (btnWhatsapp) {
  btnWhatsapp.href = whatsappLink;
}

// ============================================
// Favorites
// ============================================
function toggleFavorite(productId) {
  const index = favorites.indexOf(productId);
  
  if (index > -1) {
    favorites.splice(index, 1);
    Toast.fire({
      icon: 'info',
      title: 'Removido dos favoritos'
    });
  } else {
    favorites.push(productId);
    Toast.fire({
      icon: 'success',
      title: 'Adicionado aos favoritos'
    });
  }
  
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderProducts();
}

function isFavorite(productId) {
  return favorites.includes(productId);
}

// ============================================
// Check if product is new (less than 7 days old)
// ============================================
function isNewProduct(criadoEm) {
  if (!criadoEm) return false;
  const createdDate = criadoEm.toDate ? criadoEm.toDate() : new Date(criadoEm);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return createdDate > sevenDaysAgo;
}

// ============================================
// Load Products
// ============================================
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    
    allProducts = [];
    querySnapshot.forEach((docSnap) => {
      allProducts.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Update stats
    updateStats();
    
    // Apply filters and render
    applyFiltersAndRender();

  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    Toast.fire({
      icon: 'error',
      title: 'Erro ao carregar produtos'
    });
    showEmptyState();
  }
}

// ============================================
// Update Stats with Animation
// ============================================
function updateStats() {
  animateCounter(statProdutos, allProducts.length);
  
  const categories = new Set(allProducts.map(p => p.categoria || "outros"));
  animateCounter(statCategorias, categories.size);
}

function animateCounter(element, target) {
  if (!element) return;
  
  let current = 0;
  const step = Math.ceil(target / 20);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = current;
    element.classList.add('counter-animate');
  }, 50);
}

// ============================================
// Filter and Sort
// ============================================
function applyFiltersAndRender() {
  filteredProducts = [...allProducts];

  // Category filter
  if (currentCategory !== "todos") {
    filteredProducts = filteredProducts.filter(p => 
      (p.categoria || "outros").toLowerCase() === currentCategory
    );
  }

  // Search filter
  if (currentSearch) {
    const searchLower = currentSearch.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.nome.toLowerCase().includes(searchLower) ||
      (p.descricao && p.descricao.toLowerCase().includes(searchLower))
    );
  }

  // Sorting
  switch (currentSort) {
    case "az":
      filteredProducts.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case "za":
      filteredProducts.sort((a, b) => b.nome.localeCompare(a.nome));
      break;
    case "recentes":
    default:
      filteredProducts.sort((a, b) => {
        const dateA = a.criadoEm?.toDate?.() || new Date(0);
        const dateB = b.criadoEm?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
  }

  renderProducts();
}

// ============================================
// Render Products
// ============================================
function renderProducts() {
  // Hide loading
  if (loadingSpinner) loadingSpinner.classList.add("d-none");

  // Empty state
  if (filteredProducts.length === 0) {
    showEmptyState();
    return;
  }

  // Hide empty state
  if (emptyState) emptyState.classList.add("d-none");

  // Render cards
  produtosGrid.innerHTML = filteredProducts.map((produto, index) => `
    <div class="col-sm-6 col-lg-4 col-xl-3 loading-fade" style="animation-delay: ${index * 0.05}s">
      <div class="card produto-card h-100 shadow-sm position-relative">
        <!-- Badge Novo -->
        ${isNewProduct(produto.criadoEm) ? 
          '<span class="badge bg-success badge-novo"><i class="bi bi-stars me-1"></i>Novo</span>' : ''
        }
        
        <!-- Botão Favorito -->
        <button 
          class="btn-favorito ${isFavorite(produto.id) ? 'active' : ''}" 
          onclick="window.toggleFavorite('${produto.id}')"
          title="${isFavorite(produto.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
        >
          <i class="bi ${isFavorite(produto.id) ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
        
        <!-- Imagem -->
        <img 
          src="${produto.imagem}" 
          class="card-img-top" 
          alt="${produto.nome}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300?text=Sem+Imagem'"
        >
        
        <!-- Conteúdo -->
        <div class="card-body d-flex flex-column">
          ${produto.categoria ? 
            `<span class="badge bg-secondary mb-2 align-self-start">${produto.categoria}</span>` : ''
          }
          <h5 class="card-title">${produto.nome}</h5>
          <p class="card-text text-body-secondary small flex-grow-1">
            ${(produto.descricao || 'Produto personalizado de alta qualidade.').substring(0, 80)}${produto.descricao?.length > 80 ? '...' : ''}
          </p>
          
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <small class="text-body-secondary">
              <i class="bi bi-eye me-1"></i>${produto.visualizacoes || 0} views
            </small>
            <a href="produto.html?id=${produto.id}" class="btn btn-sm btn-success">
              Ver Detalhes <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function showEmptyState() {
  if (loadingSpinner) loadingSpinner.classList.add("d-none");
  if (produtosGrid) produtosGrid.innerHTML = "";
  if (emptyState) emptyState.classList.remove("d-none");
}

// ============================================
// Event Listeners
// ============================================

// Search
if (searchInput) {
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value.trim();
      applyFiltersAndRender();
    }, 300);
  });
}

// Filters
if (filtersWrapper) {
  filtersWrapper.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    // Update active state
    filtersWrapper.querySelectorAll("button").forEach(b => {
      b.classList.remove("btn-success");
      b.classList.add("btn-outline-secondary");
    });
    btn.classList.remove("btn-outline-secondary");
    btn.classList.add("btn-success");

    // Update category and filter
    currentCategory = btn.dataset.category;
    applyFiltersAndRender();
  });
}

// Sort
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    applyFiltersAndRender();
  });
}

// ============================================
// Smooth Scroll
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href === "#") return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// ============================================
// Global Functions
// ============================================
window.toggleFavorite = toggleFavorite;

// ============================================
// Initialize
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
