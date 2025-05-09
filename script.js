// Configuração
const PLANILHA_CSV = {
  resumo: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=1822421314&single=true&output=csv',
  dividas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=405968735&single=true&output=csv',
  listaFuturasCompras: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=142866091&single=true&output=csv'
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec';

// Funções para abas
function exibirAba(abaId) {
  document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
  document.getElementById(abaId).classList.add('ativa');
}

// Formulário dinâmico
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

// CSV parser
function parseCsv(text) {
  const linhas = text.trim().split('\n');
  const headers = linhas[0].split(',');
  return linhas.slice(1).map(linha => {
    const dados = linha.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = dados[i]?.trim());
    return obj;
  });
}

// Tabela visual
function createTable(containerId, dados) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!dados || dados.length === 0) {
    container.textContent = "Nenhum dado encontrado.";
    return;
  }

  const tabela = document.createElement("table");
  tabela.classList.add("dados-financeiros");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  Object.keys(dados[0]).forEach(coluna => {
    const th = document.createElement("th");
    th.textContent = coluna;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tabela.appendChild(thead);

  const tbody = document.createElement("tbody");
  dados.forEach(linha => {
    const tr = document.createElement("tr");
    Object.values(linha).forEach(valor => {
      const td = document.createElement("td");
      td.textContent = valor || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  container.appendChild(tabela);
}

// Carrega CSV para as abas
async function carregarTabelas() {
  for (const aba in PLANILHA_CSV) {
    try {
      const resposta = await fetch(PLANILHA_CSV[aba]);
      const texto = await resposta.text();
      const dados = parseCsv(texto);
      createTable(aba, dados);
    } catch (erro) {
      console.error(`Erro ao carregar ${aba}:`, erro);
    }
  }
}

// Envio de lançamento
function configurarFormulario() {
  const formLanc = document.getElementById("formLancamento");
  formLanc.addEventListener("submit", function (e) {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const valor = document.getElementById("valor").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria")?.value || "";
    const metodoPagamento = document.getElementById("metodoPagamento")?.value || "";
    const ondeEntrou = document.getElementById("ondeEntrou")?.value || "";
    const eDivida = document.getElementById("eDivida")?.checked || false;
    const credor = document.getElementById("credor")?.value || "";
    const statusDivida = document.getElementById("statusDivida")?.value || "";

    const payload = {
      tipo, data, valor, descricao,
      categoria: tipo === "despesa" ? categoria : "",
      metodoPagamento: tipo === "despesa" ? metodoPagamento : "",
      ondeEntrou: tipo === "receita" ? ondeEntrou : "",
      eDivida: tipo === "despesa" && eDivida,
      credor: tipo === "despesa" && eDivida ? credor : "",
      statusDivida: tipo === "despesa" && eDivida ? statusDivida : "",
      origem: "Lancamentos"
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    alert("Lançamento enviado!");
    formLanc.reset();
    atualizarFormulario();
    setTimeout(carregarTabelas, 2000);
  });
}

// Envio de futura compra
function configurarFormularioCompra() {
  const formCompra = document.getElementById("formFuturaCompra");
  formCompra.addEventListener("submit", function (e) {
    e.preventDefault();

    const payload = {
      nome: document.getElementById("nomeItem").value,
      valor: document.getElementById("valorItem").value,
      parcelas: document.getElementById("parcelasItem").value,
      link: document.getElementById("linkItem").value,
      status: "Pendente",
      comprado: false,
      origem: "FuturasCompras"
    };

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    alert("Compra enviada!");
    formCompra.reset();
    setTimeout(() => carregarTabelas(), 2000);
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  atualizarFormulario();
  carregarTabelas();
  configurarFormulario();
  configurarFormularioCompra();
  document.getElementById("tipo").addEventListener("change", atualizarFormulario);
  document.getElementById("eDivida").addEventListener("change", mostrarCamposDivida);
});
