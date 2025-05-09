
const PLANILHA_CSV = {
  resumo: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=1822421314&single=true&output=csv',
  dividas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=405968735&single=true&output=csv',
  listaFuturasCompras: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=142866091&single=true&output=csv'
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec';

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

function createTable(containerId, dados) {
  const container = document.getElementById(containerId);
  if (!container) return;
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

async function carregarTabelas() {
  for (const aba in PLANILHA_CSV) {
    const el = document.getElementById(aba);
    if (!el) continue;
    try {
      const resp = await fetch(PLANILHA_CSV[aba]);
      const text = await resp.text();
      const dados = parseCsv(text);
      createTable(aba, dados);
    } catch (erro) {
      console.error("Erro ao carregar " + aba, erro);
    }
  }
}

function configurarFormulario() {
  const form = document.getElementById("formLancamento");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const payload = {
      tipo: document.getElementById("tipo").value,
      data: document.getElementById("data").value,
      valor: document.getElementById("valor").value,
      descricao: document.getElementById("descricao").value,
      categoria: document.getElementById("categoria")?.value || "",
      metodoPagamento: document.getElementById("metodoPagamento")?.value || "",
      ondeEntrou: document.getElementById("ondeEntrou")?.value || "",
      eDivida: document.getElementById("eDivida")?.checked || false,
      credor: document.getElementById("credor")?.value || "",
      statusDivida: document.getElementById("statusDivida")?.value || "",
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
    setTimeout(carregarTabelas, 2000);
  });
}

function configurarFormularioCompra() {
  const form = document.getElementById("formFuturaCompra");
  if (!form) return;
  form.addEventListener("submit", function (e) {
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
    form.reset();
    setTimeout(carregarTabelas, 2000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarTabelas();
  configurarFormulario();
  configurarFormularioCompra();
  document.getElementById("tipo")?.addEventListener("change", atualizarFormulario);
  document.getElementById("eDivida")?.addEventListener("change", mostrarCamposDivida);
});
