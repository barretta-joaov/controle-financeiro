
const PLANILHA_ID = "2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2";

function exibirAba(abaId) {
  document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
  document.getElementById(abaId).classList.add('ativa');
}

function atualizarFormulario() {
  const tipoSelecionado = document.getElementById("tipo").value;
  document.getElementById("campoCategoria").style.display = tipoSelecionado === "despesa" ? "block" : "none";
  document.getElementById("campoMetodoPagamento").style.display = tipoSelecionado === "despesa" ? "block" : "none";
  document.getElementById("campoOndeEntrou").style.display = tipoSelecionado === "receita" ? "block" : "none";
  document.getElementById("campoDivida").style.display = tipoSelecionado === "despesa" ? "block" : "none";
  mostrarCamposDivida();
}

function mostrarCamposDivida() {
  const check = document.getElementById("eDivida");
  document.getElementById("dadosDivida").style.display = check && check.checked ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarFormulario();

  const fetchDados = (sheet, callback) => {
    fetch(`https://gsx2json.com/api?id=${PLANILHA_ID}&sheet=${sheet}`)
      .then(res => res.json())
      .then(json => callback(json.rows))
      .catch(err => console.error(`Erro ao buscar ${sheet}:`, err));
  };

  // Lançamentos (Resumo)
  fetchDados("Lancamentos", dados => {
    const secao = document.getElementById("resumo");
    const tabela = document.createElement("table");
    tabela.innerHTML = "<h2>Lançamentos</h2><tr><th>Data</th><th>Tipo</th><th>Valor</th><th>Descrição</th></tr>";

    dados.forEach(linha => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${linha.data}</td>
        <td>${linha.tipo}</td>
        <td>R$ ${parseFloat(linha.valor || 0).toFixed(2)}</td>
        <td>${linha.descricao}</td>
      `;
      tabela.appendChild(tr);
    });

    secao.appendChild(tabela);
  });

  // Dívidas
  fetchDados("Dividas", dados => {
    const secao = document.getElementById("dividas");
    const tabela = document.createElement("table");
    tabela.innerHTML = "<h2>Dívidas</h2><tr><th>Data</th><th>Valor</th><th>Categoria</th><th>Método</th><th>Credor</th><th>Status</th></tr>";

    dados.forEach(linha => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${linha.data}</td>
        <td>R$ ${parseFloat(linha.valor || 0).toFixed(2)}</td>
        <td>${linha.categoria}</td>
        <td>${linha.método}</td>
        <td>${linha.credor}</td>
        <td>${linha.status}</td>
      `;
      tabela.appendChild(tr);
    });

    secao.appendChild(tabela);
  });

  // Futuras Compras
  fetchDados("FuturasCompras", dados => {
    const secao = document.getElementById("listaFuturasCompras");
    const tabela = document.createElement("table");
    tabela.innerHTML = "<tr><th>Nome</th><th>Valor</th><th>Parcelas</th><th>Link</th><th>Status</th></tr>";

    dados.forEach(linha => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${linha.nome}</td>
        <td>R$ ${parseFloat(linha.valor || 0).toFixed(2)}</td>
        <td>${linha.parcelas}</td>
        <td><a href="${linha.link}" target="_blank">Ver</a></td>
        <td>${linha.status}</td>
      `;
      tabela.appendChild(tr);
    });

    secao.appendChild(tabela);
  });
});
