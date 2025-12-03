const whatsappNumber = "5567999883923";

document.addEventListener("DOMContentLoaded", () => {
  const msg = "Olá, gostaria de um orçamento de materiais gráficos personalizados.";
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  
  document.getElementById("whatsapp-btn").href = waLink;
  document.getElementById("whatsapp-btn2").href = waLink;

  carregarProdutos();
});

function carregarProdutos() {
  fetch("produtos.json")
    .then(res => res.json())
    .then(data => renderizarProdutos(data))
    .catch(err => console.error("Erro ao carregar produtos:", err));
}

function renderizarProdutos(lista) {
  const container = document.getElementById("produtos-list");
  container.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="card-content">
        <h4>${p.nome}</h4>
        <p>${p.descricao}</p>
        <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, tenho interesse em: " + p.nome)}" target="_blank">
          Pedir Orçamento
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}
