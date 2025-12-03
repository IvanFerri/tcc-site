const listaDiv = document.getElementById("lista-produtos");
let produtosFake = [];

// Carrega produtos simulados ao abrir o painel
function carregarSimulados() {
  fetch("../produtos.json")
    .then(res => res.json())
    .then(data => {
      produtosFake = data;
      renderizar();
    });
}

carregarSimulados();

// Adicionar produto visualmente
document.getElementById("form-produto").addEventListener("submit", e => {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const imagem = document.getElementById("imagem").value;

  produtosFake.push({ nome, descricao, imagem });

  renderizar();
  alert("Produto adicionado COM SUCESSO (simulação)!");

  e.target.reset();
});

// Renderizar lista
function renderizar() {
  listaDiv.innerHTML = "";

  produtosFake.forEach((p, index) => {
    const item = document.createElement("div");
    item.classList.add("produto-item");

    item.innerHTML = `
      <strong>${p.nome}</strong><br>
      <img src="${p.imagem}" alt=""><br>
      <small>${p.descricao}</small>

      <div class="actions">
        <button onclick="editar(${index})">Editar</button>
        <button onclick="remover(${index})">Excluir</button>
      </div>
    `;

    listaDiv.appendChild(item);
  });
}

function remover(index) {
  if (confirm("Deseja realmente remover? (simulação)")) {
    produtosFake.splice(index, 1);
    renderizar();
  }
}

function editar(index) {
  const novoNome = prompt("Novo nome:", produtosFake[index].nome);
  if (novoNome) produtosFake[index].nome = novoNome;

  const novaDesc = prompt("Nova descrição:", produtosFake[index].descricao);
  if (novaDesc) produtosFake[index].descricao = novaDesc;

  renderizar();
  alert("Produto editado (simulação)!");
}
