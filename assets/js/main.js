// Número do WhatsApp
const whatsappNumber = "5567999883923"; // formato internacional

document.addEventListener("DOMContentLoaded", () => {
  const msg = "Olá, gostaria de um orçamento de materiais gráficos personalizados.";
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

  document.getElementById("whatsapp-btn").href = waLink;
  document.getElementById("whatsapp-btn2").href = waLink;

  renderProdutos();
});

// Simulação de catálogo
const produtos = [
  {
    nome: "Caneca Personalizada",
    desc: "Impressão de alta qualidade, em ambos os lados, ideal para presentes.",
    img: "assets/images/produto1.jpg"
  },
  {
    nome: "Adesivo Personalizado",
    desc: "Vinil recortado sob medida. Ideal para rótulos e decoração.",
    img: "assets/images/produto2.jpg"
  },
  {
    nome: "Caderno Personalizado",
    desc: "Capa dura, 80 folhas, impressão colorida, ideal para brindes.",
    img: "assets/images/placeholder.jpg"
  }
];

function renderProdutos() {
  const container = document.getElementById("produtos-list");
  produtos.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nome}">
      <div class="card-content">
        <h4>${p.nome}</h4>
        <p>${p.desc}</p>
        <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, tenho interesse em: " + p.nome)}" target="_blank">
          Pedir Orçamento
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}
