
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

  // Envio de lançamento para Apps Script
  const formLancamento = document.getElementById("formLancamento");
  if (formLancamento) {
    formLancamento.addEventListener("submit", function (e) {
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
        tipo,
        data,
        valor,
        descricao,
        categoria: tipo === "despesa" ? categoria : "",
        metodoPagamento: tipo === "despesa" ? metodoPagamento : "",
        ondeEntrou: tipo === "receita" ? ondeEntrou : "",
        eDivida: tipo === "despesa" && eDivida,
        credor: tipo === "despesa" && eDivida ? credor : "",
        statusDivida: tipo === "despesa" && eDivida ? statusDivida : "",
        origem: "Lancamentos"
      };

      fetch("https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      });

      alert("Lançamento enviado!");
      this.reset();
      atualizarFormulario();
    });
  }

  // Lançamentos
  fetch("https://opensheet.elk.sh/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/Lancamentos")
    .then(res => res.json())
    .then(dados => {
      const secao = document.getElementById("resumo");
      const tabela = document.createElement("table");
      tabela.innerHTML = "<h2>Lançamentos</h2><tr><th>Data</th><th>Tipo</th><th>Valor</th><th>Descrição</th></tr>";

      dados.forEach(linha => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${linha["Data"]}</td>
          <td>${linha["Tipo"]}</td>
          <td>R$ ${parseFloat(linha["Valor"]).toFixed(2)}</td>
          <td>${linha["Descrição"]}</td>
        `;
        tabela.appendChild(tr);
      });

      secao.appendChild(tabela);
    });

  // Dívidas
  fetch("https://opensheet.elk.sh/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/Dividas")
    .then(res => res.json())
    .then(dados => {
      const secao = document.getElementById("dividas");
      const tabela = document.createElement("table");
      tabela.innerHTML = "<h2>Dívidas</h2><tr><th>Data</th><th>Valor</th><th>Categoria</th><th>Método</th><th>Credor</th><th>Status</th></tr>";

      dados.forEach(linha => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${linha["Data"]}</td>
          <td>R$ ${parseFloat(linha["Valor"]).toFixed(2)}</td>
          <td>${linha["Categoria"]}</td>
          <td>${linha["Método"]}</td>
          <td>${linha["Credor"]}</td>
          <td>${linha["Status"]}</td>
        `;
        tabela.appendChild(tr);
      });

      secao.appendChild(tabela);
    });

  // Futuras Compras
  fetch("https://opensheet.elk.sh/2PACX-1vRIfqgdPpJwoW9GItC8QMaD3fWidJHHocejM6GxW1o3FTJcgbtEl9jnze76pozn6SfWYil_YNdTowV2/FuturasCompras")
    .then(res => res.json())
    .then(dados => {
      const secao = document.getElementById("listaFuturasCompras");
      const tabela = document.createElement("table");
      tabela.innerHTML = "<tr><th>Nome</th><th>Valor</th><th>Parcelas</th><th>Link</th><th>Status</th></tr>";

      dados.forEach(linha => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${linha["Nome"]}</td>
          <td>R$ ${parseFloat(linha["Valor"]).toFixed(2)}</td>
          <td>${linha["Parcelas"]}</td>
          <td><a href="${linha["Link"]}" target="_blank">Ver</a></td>
          <td>${linha["Status"]}</td>
        `;
        tabela.appendChild(tr);
      });

      secao.appendChild(tabela);
    });
});
