// Configuração das fontes de dados CSV por aba da planilha Google
const PLANILHA_CSV = {
  resumo: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=1822421314&single=true&output=csv',
  dividas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=405968735&single=true&output=csv',
  listaFuturasCompras: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=142866091&single=true&output=csv'
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec';

// Função para atualizar formulário dinamicamente
function atualizarFormulario() {
  const tipo = document.getElementById("tipo").value;
  document.getElementById("campoCategoria").style.display = tipo === "despesa" ? "block" : "none";
  document.getElementById("campoMetodoPagamento").style.display = tipo === "despesa" ? "block" : "none";
  document.getElementById("campoOndeEntrou").style.display = tipo === "receita" ? "block" : "none";
  document.getElementById("campoDivida").style.display = tipo === "despesa" ? "block" : "none";
  mostrarCamposDivida();
}

function mostrarCamposDivida() {
  const check = document.getElementById("eDivida");
  const campos = document.getElementById("dadosDivida");
  if (check && campos) campos.style.display = check.checked ? "block" : "none";
}

// Parse CSV
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

// Cria tabela a partir de dados
function createTable(containerId, dados) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!dados || dados.length === 0) {
    container.textContent = "Nenhum dado encontrado.";
    return;
  }
  const tabela = document.createElement("table");
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

// Carrega CSV de uma aba
async function carregarTabela(aba) {
  try {
    const resposta = await fetch(PLANILHA_CSV[aba]);
    const texto = await resposta.text();
    const dados = parseCsv(texto);
    createTable(aba, dados);
  } catch (erro) {
    console.error(`Erro ao carregar ${aba}:`, erro);
  }
}

// Envio de lançamento
function configurarFormulario() {
  const form = document.getElementById("formLancamento");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const payload = {
      tipo: form.tipo.value,
      data: form.data.value,
      valor: form.valor.value,
      descricao: form.descricao.value,
      categoria: form.tipo.value === "despesa" ? form.categoria.value : "",
      metodoPagamento: form.tipo.value === "despesa" ? form.metodoPagamento.value : "",
      ondeEntrou: form.tipo.value === "receita" ? form.ondeEntrou.value : "",
      eDivida: form.tipo.value === "despesa" && form.eDivida.checked,
      credor: form.eDivida.checked ? form.credor.value : "",
      statusDivida: form.eDivida.checked ? form.statusDivida.value : "",
      origem: "Lancamentos"
    };
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    alert("Lançamento enviado!");
    form.reset();
    atualizarFormulario();
    setTimeout(() => carregarTabela("resumo"), 2000);
  });
}

// Envio de futura compra
function configurarFormularioCompra() {
  const form = document.getElementById("formFuturaCompra");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const payload = {
      nome: form.nomeItem.value,
      valor: form.valorItem.value,
      parcelas: form.parcelasItem.value,
      link: form.linkItem.value,
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
    form.reset();
    setTimeout(() => carregarTabela("listaFuturasCompras"), 2000);
  });
}

// Inicialização
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("formLancamento")) configurarFormulario();
  if (document.getElementById("formFuturaCompra")) configurarFormularioCompra();
  atualizarFormulario();
  if (document.getElementById("resumo")) carregarTabela("resumo");
  if (document.getElementById("dividas")) carregarTabela("dividas");
  if (document.getElementById("listaFuturasCompras")) carregarTabela("listaFuturasCompras");
  const tipo = document.getElementById("tipo");
  const eDivida = document.getElementById("eDivida");
  if (tipo) tipo.addEventListener("change", atualizarFormulario);
  if (eDivida) eDivida.addEventListener("change", mostrarCamposDivida);
});
