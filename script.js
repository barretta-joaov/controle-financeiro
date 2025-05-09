const SHEET_ID = "10JyoUIge47CAJ1PB1r1NU6bxGAgKKb0qZv-nNQSQvQM";

const URL_LANCAMENTOS    = `https://opensheet.elk.sh/${SHEET_ID}/Lancamentos`;
const URL_DIVIDAS        = `https://opensheet.elk.sh/${SHEET_ID}/Dividas`;
const URL_FUTURASCOMPRAS = `https://opensheet.elk.sh/${SHEET_ID}/FuturasCompras`;

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec";

// Atualiza as seções de tabelas com dados do OpenSheet
function carregarTabela(url, containerId) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      if (!data || data.length === 0) {
        container.innerText = "Nenhum dado encontrado.";
        return;
      }

      const table = document.createElement("table");
      table.innerHTML = `<thead><tr>${Object.keys(data[0]).map(k => `<th>${k}</th>`).join("")}</tr></thead>`;
      const tbody = document.createElement("tbody");

      data.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.appendChild(table);
    })
    .catch(err => {
      console.error("Erro ao carregar", containerId, err);
      document.getElementById(containerId).innerText = "Erro ao carregar dados.";
    });
}

function atualizarTabelas() {
  carregarTabela(URL_LANCAMENTOS, "resumo");
  carregarTabela(URL_DIVIDAS, "dividas");
  carregarTabela(URL_FUTURASCOMPRAS, "listaFuturasCompras");
}

function exibirAba(abaId) {
  document.querySelectorAll("main section.aba").forEach(sec => sec.classList.remove("ativa"));
  const secao = document.getElementById(abaId);
  if (secao) secao.classList.add("ativa");
}

function atualizarFormulario() {
  const tipo = document.getElementById("tipo").value;
  const campoCategoria = document.getElementById("campoCategoria");
  const campoMetodo = document.getElementById("campoMetodoPagamento");
  const campoOndeEntrou = document.getElementById("campoOndeEntrou");
  const campoDivida = document.getElementById("campoDivida");
  const dadosDivida = document.getElementById("dadosDivida");

  campoCategoria.style.display = tipo === "despesa" ? "block" : "none";
  campoMetodo.style.display = tipo === "despesa" ? "block" : "none";
  campoDivida.style.display = tipo === "despesa" ? "block" : "none";
  campoOndeEntrou.style.display = tipo === "receita" ? "block" : "none";
  dadosDivida.style.display = tipo === "despesa" && document.getElementById("eDivida").checked ? "block" : "none";
}

function mostrarCamposDivida() {
  const checkbox = document.getElementById("eDivida");
  const dadosDivida = document.getElementById("dadosDivida");
  dadosDivida.style.display = checkbox.checked ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarFormulario();
  atualizarTabelas();

  // Submit lançamento
  const formLanc = document.getElementById("formLancamento");
  if (formLanc) {
    formLanc.addEventListener("submit", function (e) {
      e.preventDefault();
      const dados = new FormData(formLanc);
      dados.append("origem", "Lancamentos");

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: dados
      });

      formLanc.reset();
      atualizarFormulario();
      setTimeout(atualizarTabelas, 1200);
    });
  }

  // Submit futura compra
  const formCompra = document.getElementById("formFuturaCompra");
  if (formCompra) {
    formCompra.addEventListener("submit", function (e) {
      e.preventDefault();
      const dados = new FormData(formCompra);
      dados.append("origem", "FuturasCompras");

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: dados
      });

      formCompra.reset();
      setTimeout(() => carregarTabela(URL_FUTURASCOMPRAS, "listaFuturasCompras"), 1200);
    });
  }

  document.getElementById("tipo")?.addEventListener("change", atualizarFormulario);
  document.getElementById("eDivida")?.addEventListener("change", mostrarCamposDivida);
});

// Expor funções globalmente (para uso no HTML)
window.exibirAba = exibirAba;
window.atualizarFormulario = atualizarFormulario;
window.mostrarCamposDivida = mostrarCamposDivida;
