let db;
const request = indexedDB.open("ControleVenda");

const form = document.getElementById('vendas-form');
const codigoPedidoInput = document.getElementById('codigo-pedido');
const nomeClienteInput = document.getElementById('nome-cliente');
const formaPagamentoSelect = document.getElementById('forma-pagamento');
const valorVendaInput = document.getElementById('valor-venda');
const vendasBody = document.getElementById('vendas-body');
const totalMesElement = document.getElementById('total-mes');
const btnSalvar = document.getElementById('btn-salvar');
const btnExportar = document.getElementById('btn-exportar');

const ARQUIVO_PLANILHA = "planilha_controle_vendas";

let vendaEditandoId = null;

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains("vendas")) {

        const store = db.createObjectStore("vendas", {
            keyPath: "id",
            autoIncrement: true
        });

        store.createIndex("codigoPedido", "codigoPedido", { unique: false });
        store.createIndex("dataInsercao", "dataInsercao", { unique: false });
        store.createIndex("anoMesInsercao", "anoMesInsercao", { unique: false });
    }
}

request.onsuccess = (event) => {
    db = event.target.result;
    carregarTabela();
};

function inserirVenda(venda) {
    const transaction = db.transaction("vendas", "readwrite");
    const store = transaction.objectStore("vendas");
    store.add(venda);

    transaction.oncomplete = carregarTabela;
}

function atualizarVenda(venda) {
    const transaction = db.transaction("vendas", "readwrite");
    const store = transaction.objectStore("vendas");
    const request = store.put(venda);

    transaction.oncomplete = carregarTabela;
}

function deletarVenda(id) {
    const transaction = db.transaction("vendas", "readwrite");
    const store = transaction.objectStore("vendas");
    store.delete(id);

    transaction.oncomplete = carregarTabela;
}

function carregarTabela() {
    const hoje = new Date();
    const tbody = document.getElementById("vendas-body");
    tbody.innerHTML = "";

    const transaction = db.transaction("vendas", "readonly");
    const store = transaction.objectStore("vendas");

    const index = store.index("anoMesInsercao");
    const request = index.getAll(`${hoje.getFullYear()}-${hoje.getMonth()}`);

    request.onsuccess = () => {
        request.result.forEach(venda => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="acoes">
                    <button class="btn-editar" data-id="${venda.id}">📝</button>
                    <button class="btn-excluir" data-id="${venda.id}">❌</button>
                </td>
                <td>${new Date(venda.dataInsercao).toLocaleDateString()}</td>
                <td>${venda.codigoPedido}</td>
                <td>${venda.nomeCliente}</td>
                <td>${venda.formaPagamento}</td>
                <td class="text-right">
                    R$ ${venda.valorVenda.toFixed(2)}
                </td>
            `;

            tbody.appendChild(tr);
        });
   
        const total = request.result.reduce((soma, venda) => soma + venda.valorVenda, 0);

        document.getElementById("total-mes").innerText =
            total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
    };
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const hoje = new Date();

    const venda = {
        id: vendaEditandoId,
        dataInsercao: hoje.toISOString(),
        anoMesInsercao: `${hoje.getFullYear()}-${hoje.getMonth()}`,
        codigoPedido: codigoPedidoInput.value.trim(),
        nomeCliente: nomeClienteInput.value,
        formaPagamento: formaPagamentoSelect.value,
        valorVenda: parseFloat(valorVendaInput.value)
    };

    try {
        if (vendaEditandoId === null) {
            delete venda.id;
            inserirVenda(venda);

        } else {
            atualizarVenda(venda);
            vendaEditandoId = null;
            btnSalvar.textContent = "Inserir";
        }

        form.reset();
        codigoPedidoInput.focus();
    }
    catch (erro) {
        console.error(erro);
        alert("Erro ao salvar a venda.");
    }
});

btnExportar.addEventListener('click', () => {
    const transaction = db.transaction("vendas", "readonly");
    const store = transaction.objectStore("vendas");
    const index = store.index("anoMesInsercao");
    const request = index.getAll(`${hoje.getFullYear()}-${hoje.getMonth()}`);

    request.onsuccess = () => {
        let csvContent = "data_insercao;codigo_pedido;nome_cliente;forma_pagamento;valor_venda\n";

        request.result.forEach(venda => {

            const valor = venda.valorVenda
            .toFixed(2)
            .replace(".", ",");

            csvContent +=
                `"${new Date(venda.dataInsercao).toLocaleDateString("pt-BR")}";` +
                `"${venda.codigoPedido}";` +
                `"${venda.nomeCliente}";` +
                `"${venda.formaPagamento}";` +
                `"${valor}"\n`;

        })

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = ARQUIVO_PLANILHA; 
        link.click();
    };
});

vendasBody.addEventListener('click', (e) => {
    if (e.target.classList.contains("btn-editar")) {
        const id = Number(e.target.dataset.id);
        vendaEditandoId = id;

        const transaction = db.transaction("vendas", "readonly");
        const store = transaction.objectStore("vendas");
        const request = store.get(id);

        request.onsuccess = () => {
            const venda = request.result;

            if (!venda) return;

            codigoPedidoInput.value = venda.codigoPedido;
            nomeClienteInput.value = venda.nomeCliente;
            formaPagamentoSelect.value = venda.formaPagamento;
            valorVendaInput.value = venda.valorVenda;

            btnSalvar.textContent = "Salvar";
        };
    }

    if (e.target.classList.contains("btn-excluir")) {
        const id = Number(e.target.dataset.id);
        deletarVenda(id)
    }
});