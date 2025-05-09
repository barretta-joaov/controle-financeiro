
function exibirAba(abaId) {
  document.querySelectorAll('.aba').forEach(aba => aba.classList.remove('ativa'));
  document.getElementById(abaId).classList.add('ativa');
}

document.addEventListener("DOMContentLoaded", () => {
  const tipo = document.getElementById("tipo");
  const campoCategoria = document.getElementById("campoCategoria");
  const campoMetodoPagamento = document.getElementById("campoMetodoPagamento");
  const campoOndeEntrou = document.getElementById("campoOndeEntrou");
  const campoDivida = document.getElementById("campoDivida");
  const dadosDivida = document.getElementById("dadosDivida");

  tipo.addEventListener("change", atualizarFormulario);
  document.getElementById("eDivida").addEventListener("change", mostrarCamposDivida);

  function atualizarFormulario() {
    const tipoSelecionado = tipo.value;
    campoCategoria.style.display = tipoSelecionado === "despesa" ? "block" : "none";
    campoMetodoPagamento.style.display = tipoSelecionado === "despesa" ? "block" : "none";
    campoOndeEntrou.style.display = tipoSelecionado === "receita" ? "block" : "none";
    campoDivida.style.display = tipoSelecionado === "despesa" ? "block" : "none";
    dadosDivida.style.display = document.getElementById("eDivida").checked ? "block" : "none";
  }

  function mostrarCamposDivida() {
    dadosDivida.style.display = this.checked ? "block" : "none";
  }

  const GAS_URL = "https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec";

  // Enviar lançamento
  document.getElementById("formLancamento").addEventListener("submit", function (e) {
    e.preventDefault();
    const tipo = document.getElementById("tipo").value;
    const data = document.getElementById("data").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const descricao = document.getElementById("descricao").value;
    const categoria = document.getElementById("categoria").value;
    const metodoPagamento = document.getElementById("metodoPagamento").value;
    const ondeEntrou = document.getElementById("ondeEntrou").value;
    const eDivida = document.getElementById("eDivida").checked;
    const credor = document.getElementById("credor").value;
    const statusDivida = document.getElementById("statusDivida").value;

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

    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(() => {
      alert("Lançamento enviado com sucesso!");
      this.reset();
      atualizarFormulario();
      carregarLancamentos(); // Atualiza lista ao vivo
    }).catch(err => {
      alert("Erro ao enviar lançamento.");
      console.error("Erro POST:", err);
    });
  });

  // Carregar lançamentos com GET (modo cors)
  function carregarLancamentos() {
    fetch(GAS_URL, {
      method: "GET",
      mode: "cors"
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar dados");
        return res.json();
      })
      .then(dados => {
        const secao = document.getElementById("lancamentos");
        if (!secao) return;

        const antigaTabela = secao.querySelector("table");
        if (antigaTabela) secao.removeChild(antigaTabela);

        const tabela = document.createElement("table");
        tabela.innerHTML = "<tr><th>Data</th><th>Tipo</th><th>Valor</th><th>Descrição</th><th>Categoria</th><th>Método</th><th>Origem</th><th>É Dívida?</th><th>Credor</th><th>Status</th></tr>";

        for (let i = 1; i < dados.length; i++) {
          const linha = dados[i];
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${linha[0]}</td>
            <td>${linha[1]}</td>
            <td>R$ ${parseFloat(linha[2]).toFixed(2)}</td>
            <td>${linha[3]}</td>
            <td>${linha[4]}</td>
            <td>${linha[5]}</td>
            <td>${linha[6]}</td>
            <td>${linha[7]}</td>
            <td>${linha[8]}</td>
            <td>${linha[9]}</td>
          `;
          tabela.appendChild(tr);
        }

        secao.appendChild(tabela);
      })
      .catch(err => {
        console.error("Erro ao buscar dados (GET):", err);
      });
  }

  carregarLancamentos(); // Carrega ao iniciar
});
