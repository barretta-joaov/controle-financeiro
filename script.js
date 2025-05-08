
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

  // Submissão do formulário de lançamento
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

    fetch("https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => alert("Lançamento salvo com sucesso!"));
    this.reset();
    atualizarFormulario();
  });

  // Submissão do formulário de futuras compras
  document.getElementById("formFuturaCompra").addEventListener("submit", function (e) {
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

    fetch("https://script.google.com/macros/s/AKfycbxpi3p_FNDap1csgelTakOv2FSGjyabw8DMn-mwt6XZT1aGaRpQ4CufAg_gz1cPpbSp6A/exec", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(res => alert("Futura compra registrada!"));
    this.reset();
  });
});
