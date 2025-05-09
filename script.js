// Substitua pelo ID da sua planilha Google (string entre "/d/" e "/edit" na URL da planilha)
const SHEET_ID = "10JyoUIge47CAJ1PB1r1NU6bxGAgKKb0qZv-nNQSQvQM";

// URLs das abas da planilha via OpenSheet (usando o serviço opensheet.elk.sh)
const URL_LANCAMENTOS   = `https://opensheet.elk.sh/${SHEET_ID}/Lancamentos`;
const URL_DIVIDAS       = `https://opensheet.elk.sh/${SHEET_ID}/Dividas`;
const URL_FUTURASCOMPRAS = `https://opensheet.elk.sh/${SHEET_ID}/FuturasCompras`;

// URL do Google Apps Script para envio (fornecido pelo usuário)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbweMhI9Gy6Kwsy5sCLUNd4Ru0kVlg6njrBsSVDyBdbZwluJlza4k8VYOjQYnQWruBnIgg/exec";

// Função para obter dados de uma aba e exibir na tabela correspondente
function carregarTabela(url, containerId) {
    fetch(url)
        .then(response => response.json())
        .then(dados => {
            const container = document.getElementById(containerId);
            container.innerHTML = "";  // limpa conteúdo anterior
            if (!dados || dados.length === 0) {
                container.textContent = "Nenhum dado encontrado.";
                return;
            }
            // Cria tabela
            const tabela = document.createElement("table");
            tabela.className = "dados-financeiros";
            // Cabeçalho da tabela
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            Object.keys(dados[0]).forEach(coluna => {
                const th = document.createElement("th");
                th.textContent = coluna;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            tabela.appendChild(thead);
            // Corpo da tabela
            const tbody = document.createElement("tbody");
            dados.forEach(linha => {
                const tr = document.createElement("tr");
                Object.keys(linha).forEach(coluna => {
                    const td = document.createElement("td");
                    td.textContent = linha[coluna] || "";  // insere valor ou vazio se undefined
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            tabela.appendChild(tbody);
            container.appendChild(tabela);
        })
        .catch(err => {
            console.error("Erro ao carregar dados da aba", containerId, err);
            const container = document.getElementById(containerId);
            container.textContent = "Erro ao carregar dados.";
        });
}

// Função para recarregar todas as tabelas (usada na inicialização e pós-envio)
function atualizarTabelas() {
    carregarTabela(URL_LANCAMENTOS, "resumo");
    carregarTabela(URL_DIVIDAS, "dividas");
    carregarTabela(URL_FUTURASCOMPRAS, "listaFuturasCompras");
}

// Função para exibir a seção/aba solicitada e ocultar as demais
function exibirAba(abaId) {
    const secoes = ["lancar", "resumo", "dividas", "listaFuturasCompras", "graficos"];
    secoes.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) {
            sec.style.display = (id === abaId ? "block" : "none");
        }
    });
}

// Função para atualizar campos do formulário de lançamento conforme o tipo selecionado
function atualizarFormulario() {
    const tipo = document.getElementById("tipo").value;  // valor selecionado (ex: "receita" ou "despesa")
    const campoCategoria       = document.getElementById("categoria");
    const campoMetodoPagamento = document.getElementById("metodoPagamento");
    const campoOndeEntrou      = document.getElementById("ondeEntrou");
    const campoEDivida         = document.getElementById("eDivida");
    const divCamposDivida      = document.getElementById("camposDivida");  // container dos campos Credor/Status
    
    if (tipo === "receita") {
        // Para receita: esconde categoria, método, e opção de dívida; mostra ondeEntrou
        if(campoCategoria) campoCategoria.parentElement.style.display = "none";
        if(campoMetodoPagamento) campoMetodoPagamento.parentElement.style.display = "none";
        if(campoEDivida) {
            campoEDivida.checked = false;
            campoEDivida.parentElement.style.display = "none";
        }
        if(divCamposDivida) {
            // Limpa valores de credor/status e esconde a seção de campos de dívida
            divCamposDivida.style.display = "none";
            const credor = document.getElementById("credor");
            const statusDivida = document.getElementById("statusDivida");
            if (credor) credor.value = "";
            if (statusDivida) statusDivida.value = "Em aberto";  // volta ao padrão
        }
        if(campoOndeEntrou) campoOndeEntrou.parentElement.style.display = "block";
    } else if (tipo === "despesa") {
        // Para despesa: mostra categoria, método, e opção de dívida; esconde ondeEntrou
        if(campoCategoria) campoCategoria.parentElement.style.display = "block";
        if(campoMetodoPagamento) campoMetodoPagamento.parentElement.style.display = "block";
        if(campoEDivida) campoEDivida.parentElement.style.display = "block";
        if(campoOndeEntrou) {
            campoOndeEntrou.value = "";
            campoOndeEntrou.parentElement.style.display = "none";
        }
        // Se a opção "É Dívida?" estiver desmarcada, certifique-se de esconder campos de dívida
        if (campoEDivida && !campoEDivida.checked && divCamposDivida) {
            divCamposDivida.style.display = "none";
        }
    }
}

// Função para exibir ou ocultar os campos de Credor/Status conforme checkbox "É Dívida?"
function mostrarCamposDivida() {
    const campoEDivida = document.getElementById("eDivida");
    const divCamposDivida = document.getElementById("camposDivida");
    if (!campoEDivida || !divCamposDivida) return;
    if (campoEDivida.checked) {
        // Se marcado, mostrar campos de dívidas
        divCamposDivida.style.display = "block";
        // (Poderíamos definir defaults, ex: statusDivida = "Em aberto", mas assumimos HTML já define)
    } else {
        // Se desmarcado, ocultar e limpar campos de dívidas
        divCamposDivida.style.display = "none";
        const credor = document.getElementById("credor");
        const statusDivida = document.getElementById("statusDivida");
        if (credor) credor.value = "";
        if (statusDivida) statusDivida.value = "Em aberto";
    }
}

// Aguarda o carregamento completo do DOM para executar a inicialização
document.addEventListener("DOMContentLoaded", function() {
    // Carrega os dados das tabelas iniciais
    atualizarTabelas();
    
    // Atrela eventos aos formulários de lançamento e futuras compras
    const formLanc = document.getElementById("formLancamento");
    if (formLanc) {
        formLanc.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formLanc);
            formData.append("origem", "Lancamentos");
            // Envia via fetch para o Google Apps Script (no-cors)
            fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData })
                .catch(err => console.error("Erro no envio do formulário de lançamento:", err));
            // Limpa o formulário e atualiza interface
            formLanc.reset();
            atualizarFormulario();  // reconfigura campos após reset (tipo volta ao default)
            // Atualiza tabelas (com pequena espera para dar tempo de processamento, se desejado)
            setTimeout(atualizarTabelas, 1000);
        });
        // Evento de mudança do tipo para ajustar formulário dinâmico
        const selectTipo = document.getElementById("tipo");
        if (selectTipo) {
            selectTipo.addEventListener("change", atualizarFormulario);
        }
        // Evento de mudança no checkbox de dívida
        const chkDivida = document.getElementById("eDivida");
        if (chkDivida) {
            chkDivida.addEventListener("change", mostrarCamposDivida);
        }
    }
    
    const formCompra = document.getElementById("formFuturaCompra");
    if (formCompra) {
        formCompra.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(formCompra);
            formData.append("origem", "FuturasCompras");
            fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: formData })
                .catch(err => console.error("Erro no envio do formulário de futura compra:", err));
            formCompra.reset();
            // Atualiza lista de futuras compras após um pequeno delay
            setTimeout(() => carregarTabela(URL_FUTURASCOMPRAS, "listaFuturasCompras"), 1000);
        });
    }
    
    // (Opcional) Poderíamos atrelar também eventos de clique nos botões de menu para chamar exibirAba(),
    // caso não estejamos usando atributos onclick no HTML.
    // Exemplo:
    // document.getElementById("btnResumo").addEventListener("click", () => exibirAba('resumo'));
    // ... (repetir para btnLancar, btnDividas, btnFuturasCompras, btnGraficos, conforme IDs dos botões)
});

// Torna as funções de aba e form acessíveis globalmente (caso sejam chamadas via atributos HTML)
window.exibirAba = exibirAba;
window.atualizarFormulario = atualizarFormulario;
window.mostrarCamposDivida = mostrarCamposDivida;
