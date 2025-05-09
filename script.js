
const PLANILHA_ID = "10JyoUIge47CAJ1PB1r1NU6bxGAgKKb0qZv-nNQSQvQM";

// Função para parse de CSV (mantida)
function parseCsv(data) {
  const regex = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
  const result = [[]];
  let matches;
  while ((matches = regex.exec(data))) {
    if (matches[1] && matches[1] !== ',') result.push([]);
    const matchedValue = matches[2] !== undefined
      ? matches[2].replace(/""/g, '"')
      : matches[3];
    result[result.length - 1].push(matchedValue);
  }
  return result;
}

function arrayToObjects(csvArray) {
  const rows = csvArray.slice(1);
  const headers = csvArray[0] || [];
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i] || "");
    return obj;
  });
}

function createTable(containerId, dataObjects) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  if (dataObjects.length > 0) {
    const headerRow = document.createElement('tr');
    const headers = Object.keys(dataObjects[0]);
    headers.forEach(colName => {
      const th = document.createElement('th');
      th.textContent = colName;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    dataObjects.forEach(item => {
      const row = document.createElement('tr');
      Object.values(item).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
  }
  container.appendChild(table);
}

function fetchCsvToTable(sheetName, containerId) {
  const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=${sheetName}&single=true&output=csv`;
  fetch(url)
    .then(res => res.text())
    .then(csv => {
      const dataArray = parseCsv(csv);
      const dataObjects = arrayToObjects(dataArray);
      createTable(containerId, dataObjects);
    })
    .catch(err => console.error("Erro ao buscar dados:", err));
}

function atualizarTabelas() {
  fetchCsvToTable("1822421314", "resumo");
  fetchCsvToTable("405968735", "dividas");
  fetchCsvToTable("142866091", "listaFuturasCompras");
}

// ENVIO DE DADOS PARA APPS SCRIPT
function enviarParaPlanilha(payload) {
  fetch("https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec", {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  }).then(() => {
    alert("Enviado com sucesso!");
    atualizarTabelas(); // atualiza visualmente
  }).catch(() => alert("Erro ao enviar dados."));
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarTabelas();

  // Formulário de lançamento
  const formLancamento = document.getElementById("formLancamento");
  if (formLancamento) {
    formLancamento.addEventListener("submit", function(e) {
      e.preventDefault();
      const tipo = document.getElementById("tipo").value;
      const data = document.getElementById("data").value;
      const valor = parseFloat(document.getElementById("valor").value);
      const descricao = document.getElementById("descricao").value;
      const categoria = document.getElementById("categoria")?.value || "";
      const metodoPagamento = document.getElementById("metodoPagamento")?.value || "";
      const ondeEntrou = document.getElementById("ondeEntrou")?.value || "";
      const eDivida = document.getElementById("eDivida")?.checked || false;
      const credor = document.getElementById("credor")?.value || "";
      const statusDivida = document.getElementById("statusDivida")?.value || "";

      const payload = {
        tipo,
        data,
        valor,
        descricao,
        categoria,
        metodoPagamento,
        ondeEntrou,
        eDivida,
        credor,
        statusDivida,
        origem: "Lancamentos"
      };

      enviarParaPlanilha(payload);
      this.reset();
    });
  }

  // Formulário de futuras compras
  const formCompra = document.getElementById("formFuturaCompra");
  if (formCompra) {
    formCompra.addEventListener("submit", function(e) {
      e.preventDefault();
      const nome = document.getElementById("nomeItem").value;
      const valor = parseFloat(document.getElementById("valorItem").value);
      const parcelas = parseInt(document.getElementById("parcelasItem").value);
      const link = document.getElementById("linkItem").value;

      const payload = {
        nome,
        valor,
        parcelas,
        link,
        status: "Pendente",
        comprado: false,
        origem: "FuturasCompras"
      };

      enviarParaPlanilha(payload);
      this.reset();
    });
  }
});
