// Função para fazer parse de uma string CSV em um array de arrays (linhas e colunas)
function parseCsv(data) {
  const regex = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
  const result = [[]];
  let matches;
  while ((matches = regex.exec(data))) {
    // Quando encontrarmos um separador de registro (quebra de linha), iniciamos um novo array para a próxima linha
    if (matches[1] && matches[1] !== ',') {
      result.push([]);
    }
    // O valor capturado está em matches[2] se estava entre aspas, ou em matches[3] se era um campo não entre aspas
    const matchedValue = matches[2] !== undefined 
                           ? matches[2].replace(/""/g, '"')  // substitui aspas duplas escapadas por aspas simples
                           : matches[3];
    result[result.length - 1].push(matchedValue);
  }
  return result;
}

// Função para converter array de arrays em array de objetos usando a primeira linha como cabeçalho
function arrayToObjects(csvArray) {
  const rows = csvArray.slice(1);             // copia todas as linhas menos o cabeçalho
  const headers = csvArray[0] || [];          // primeira linha são os cabeçalhos
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";             // associa cada coluna ao valor correspondente ou "" se indefinido
    });
    return obj;
  });
}

// Função para criar uma tabela HTML a partir de uma lista de objetos e anexá-la em um container DOM
function createTable(containerId, dataObjects) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contêiner #${containerId} não encontrado no DOM.`);
    return;
  }
  // Limpa qualquer conteúdo existente no container
  container.innerHTML = "";
  // Cria elementos da tabela
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  // Cabeçalhos da tabela (usando as chaves do primeiro objeto de dados, se houver)
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
    // Linhas de dados
    dataObjects.forEach(item => {
      const row = document.createElement('tr');
      Object.values(item).forEach(value => {   // pega os valores na ordem dos headers
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

// URLs públicas CSV de cada aba (planilha deve estar "Publish to web" ativada)
const urls = [
  { id: 'resumo', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=1822421314&single=true&output=csv' },
  { id: 'dividas', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=405968735&single=true&output=csv' },
  { id: 'listaFuturasCompras', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/pub?gid=142866091&single=true&output=csv' }
];

// Quando o DOM estiver pronto, iniciar a carga dos dados
window.addEventListener('DOMContentLoaded', async () => {
  for (const sheet of urls) {
    try {
      const response = await fetch(sheet.url);
      if (!response.ok) {
        console.error(`Erro ${response.status} ao carregar ${sheet.id}: ${response.statusText}`);
        continue; // pula para a próxima aba em caso de erro nesta
      }
      const csvText = await response.text();
      const dataArray = parseCsv(csvText);
      const dataObjects = arrayToObjects(dataArray);
      createTable(sheet.id, dataObjects);
      console.log(`Dados da aba '${sheet.id}' carregados com sucesso.`);
    } catch (err) {
      console.error(`Falha ao buscar os dados da aba '${sheet.id}':`, err);
    }
  }
});
