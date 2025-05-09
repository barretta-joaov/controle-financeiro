const SHEET_ID = "10JyoUIge47CAJ1PB1r1NU6bxGAgKKb0qZv-nNQSQvQM";
const URL_LANCAMENTOS = `https://opensheet.elk.sh/${SHEET_ID}/Lancamentos`;
const URL_DIVIDAS = `https://opensheet.elk.sh/${SHEET_ID}/Dividas`;
const URL_FUTURAS = `https://opensheet.elk.sh/${SHEET_ID}/FuturasCompras`;
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec";

function exibirAba(abaId) {
  document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
  document.getElementById(abaId)?.classList.add('ativa');
}

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
  document.getElementById("dadosDivida").style.display = check && check.checked ? "block" : "none";
}

function enviarFormulario(formId, origem) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", e => {
    e.preventDefault();
    const dados = new FormData(form);
    dados.append("origem", origem);

    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: dados
    }).then(() => {
      alert("Enviado com sucesso!");
      form.reset();
      atualizarFormulario();
      setTimeout(() => {
        carregarTabela(URL_LANCAMENTOS, "resumo");
        carregarTabela(URL_DIVIDAS, "dividas");
        carregarTabela(URL_FUTURAS, "listaFuturasCompras");
      }, 1500);
    });
  });
}

function carregarTabela(url, containerId) {
  fetch(url)
    .then(res => res.json())
    .then(dados => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      if (!dados || dados.length === 0) {
        container.textContent = "Nenhum dado encontrado.";
        return;
      }

      const tabela = document.createElement("table");
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      Object.keys(dados[0]).forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      tabela.appendChild(thead);

      const tbody = document.createElement("tbody");
      dados.forEach(linha => {
        const tr = document.createElement("tr");
        Object.values(linha).forEach(valor => {
          const td = document.createElement("td");
          td.textContent = valor;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      tabela.appendChild(tbody);
      container.appendChild(tabela);
    })
    .catch(err => {
      document.getElementById(containerId).textContent = "Erro ao carregar dados.";
      console.error("Erro ao buscar dados:", err);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarFormulario();
  carregarTabela(URL_LANCAMENTOS, "resumo");
  carregarTabela(URL_DIVIDAS, "dividas");
  carregarTabela(URL_FUTURAS, "listaFuturasCompras");

  enviarFormulario("formLancamento", "Lancamentos");
  enviarFormulario("formFuturaCompra", "FuturasCompras");

  document.getElementById("tipo").addEventListener("change", atualizarFormulario);
  document.getElementById("eDivida").addEventListener("change", mostrarCamposDivida);
});
