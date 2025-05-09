<script>
// URL do endpoint Google Apps Script para onde os dados serão enviados
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec";

// Aguarda o carregamento completo do DOM para garantir que os formulários existam
document.addEventListener('DOMContentLoaded', () => {
  // Seleciona os formulários pelos IDs
  const formLancamento = document.getElementById('formLancamento');
  const formFuturaCompra = document.getElementById('formFuturaCompra');

  // Função auxiliar para enviar dados via fetch e tratar resposta
  function enviarDados(endpointURL, dadosObj, formElement) {
    // Realiza a requisição POST usando fetch
    fetch(endpointURL, {
      method: 'POST',
      mode: 'no-cors',                   // modo no-cors para evitar problemas de CORS
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosObj)     // corpo da requisição em formato JSON string
    })
    .then(() => {
      // Sucesso no envio (nota: no-cors retorna uma resposta opaca, sem detalhes)
      alert('✅ Dados enviados com sucesso!');
      // Reseta o formulário para limpar os campos
      if (formElement) formElement.reset();
    })
    .catch((erro) => {
      // Erro na requisição (falha de rede, por exemplo)
      console.error('Erro ao enviar os dados:', erro);
      alert('⚠️ Erro ao enviar os dados. Por favor, tente novamente.');
    });
  }

  // Configura o listener para o formulário de lançamentos, se existir na página
  if (formLancamento) {
    formLancamento.addEventListener('submit', (event) => {
      event.preventDefault();  // impede o envio padrão do formulário (reload da página)

      // Coleta os campos básicos sempre presentes
      const tipo = formLancamento.querySelector('[name="tipo"]').value;
      const data = formLancamento.querySelector('[name="data"]').value;
      const valor = formLancamento.querySelector('[name="valor"]').value;
      const descricao = formLancamento.querySelector('[name="descricao"]').value;
      const eDividaElem = formLancamento.querySelector('[name="eDivida"]');
      const eDivida = eDividaElem ? eDividaElem.checked : false;

      // Monta o objeto de dados para enviar
      const dadosLanc = {
        tipo: tipo,
        data: data,
        valor: valor,
        descricao: descricao,
        eDivida: eDivida ? "Sim" : "Não",   // envia "Sim"/"Não" ou poderia ser true/false
        origem: "Lancamentos"
      };

      // Campos condicionais conforme o tipo de lançamento
      if (tipo === "despesa") {
        // Se for despesa, inclui categoria e método de pagamento (se estiverem presentes)
        const categoriaElem = formLancamento.querySelector('[name="categoria"]');
        const metodoElem = formLancamento.querySelector('[name="metodoPagamento"]');
        if (categoriaElem) dadosLanc.categoria = categoriaElem.value;
        if (metodoElem) dadosLanc.metodoPagamento = metodoElem.value;
      } else if (tipo === "receita") {
        // Se for receita, inclui o campo "ondeEntrou"
        const ondeElem = formLancamento.querySelector('[name="ondeEntrou"]');
        if (ondeElem) dadosLanc.ondeEntrou = ondeElem.value;
      }

      // Campos condicionais para dívidas, se marcada como dívida
      if (eDivida) {
        const credorElem = formLancamento.querySelector('[name="credor"]');
        const statusElem = formLancamento.querySelector('[name="statusDivida"]');
        if (credorElem) dadosLanc.credor = credorElem.value;
        if (statusElem) dadosLanc.statusDivida = statusElem.value;
      }

      // Envia os dados do lançamento usando a função auxiliar
      enviarDados(SCRIPT_URL, dadosLanc, formLancamento);
    });
  }

  // Configura o listener para o formulário de futuras compras, se existir na página
  if (formFuturaCompra) {
    formFuturaCompra.addEventListener('submit', (event) => {
      event.preventDefault();  // previne o comportamento padrão do form

      // Coleta os valores dos campos da futura compra
      const nomeItem = formFuturaCompra.querySelector('[name="nomeItem"]').value;
      const valorItem = formFuturaCompra.querySelector('[name="valorItem"]').value;
      const parcelasItem = formFuturaCompra.querySelector('[name="parcelasItem"]').value;
      const linkItem = formFuturaCompra.querySelector('[name="linkItem"]').value;

      // Monta o objeto de dados para futura compra
      const dadosCompra = {
        nomeItem: nomeItem,
        valorItem: valorItem,
        parcelasItem: parcelasItem,
        linkItem: linkItem,
        origem: "FuturasCompras"
      };

      // Envia os dados da futura compra usando a função auxiliar
      enviarDados(SCRIPT_URL, dadosCompra, formFuturaCompra);
    });
  }
});
</script>
