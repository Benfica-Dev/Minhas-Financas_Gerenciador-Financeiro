// resumo.js

export function calcularEExibirResumo(salario, dadosFixos, listaDiarios) {
    // 1. Garante a leitura do total dos gastos fixos
    // (Aceita tanto se dadosFixos for um objeto com a propriedade .total quanto um objeto somado)
    let totalFixos = 0;
    if (typeof dadosFixos.total === 'number') {
        totalFixos = dadosFixos.total;
    } else {
        totalFixos = Object.values(dadosFixos).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    }

    // 2. Calcula o total dos gastos diários
    const totalDiarios = listaDiarios.reduce((acc, gasto) => {
        return acc + (parseFloat(gasto.valor) || 0);
    }, 0);

    // 3. Faz os cálculos das sobras
    const sobraAposFixos = salario - totalFixos;
    const saldoFinal = salario - totalFixos - totalDiarios;

    // 4. Descobre qual categoria teve o MAIOR gasto 
    const gastosPorCategoria = {};

    listaDiarios.forEach(gasto => {
        const cat = gasto.categoria || 'Outros';
        const val = parseFloat(gasto.valor) || 0;

        if (!gastosPorCategoria[cat]) {
            gastosPorCategoria[cat] = 0;
        }
        gastosPorCategoria[cat] += val;
    });

    let maiorCategoria = "Nenhum gasto diário registrado";
    let maiorValor = 0;

    for (const [categoria, valor] of Object.entries(gastosPorCategoria)) {
        if (valor > maiorValor) {
            maiorValor = valor;
            maiorCategoria = `${categoria} (R$ ${valor.toFixed(2)})`;
        }
    }

    // 5. Atualiza os elementos na tela (HTML)
    const elTotalFixos = document.getElementById('total-fixos');
    const elSobraFixos = document.getElementById('sobra-apos-fixos');
    const elTotalDiarios = document.getElementById('total-diarios');
    const elSaldoFinal = document.getElementById('saldo-final');
    const elMaiorCategoria = document.getElementById('maior-categoria');

    if (elTotalFixos) elTotalFixos.textContent = `R$ ${totalFixos.toFixed(2)}`;
    if (elSobraFixos) elSobraFixos.textContent = `R$ ${sobraAposFixos.toFixed(2)}`;
    if (elTotalDiarios) elTotalDiarios.textContent = `R$ ${totalDiarios.toFixed(2)}`;
    if (elSaldoFinal) elSaldoFinal.textContent = `R$ ${saldoFinal.toFixed(2)}`;
    if (elMaiorCategoria) elMaiorCategoria.textContent = maiorCategoria;

    // 6. Desenha o gráfico passando os valores e considerando o tipo selecionado no topo
    desenharGrafico(totalFixos, totalDiarios, saldoFinal > 0 ? saldoFinal : 0);
}

// Gráfico dinâmico (suporta Rosca, Pizza, Colunas e Linha)
function desenharGrafico(totalFixos, totalDiarios, saldoFinal) {
    const canvas = document.getElementById('grafico-resumo');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Se já existir um gráfico criado, destrói o anterior para evitar sobreposição
    if (window.meuGrafico) {
        window.meuGrafico.destroy();
    }

    // Lê o tipo de gráfico escolhido pelo usuário no <select id="tipo-grafico"> do topo
    const selectTipoGrafico = document.getElementById('tipo-grafico');
    const tipoGraficoDesejado = selectTipoGrafico ? selectTipoGrafico.value : 'doughnut';

    window.meuGrafico = new Chart(ctx, {
        type: tipoGraficoDesejado, // 'doughnut', 'pie', 'bar', 'line'
        data: {
            labels: ['Gastos Fixos', 'Gastos Diários', 'Saldo Restante'],
            datasets: [{
                label: 'Valores em R$',
                data: [totalFixos, totalDiarios, saldoFinal],
                backgroundColor: ['#ff6384', '#ffce56', '#36a2eb'],
                borderColor: '#36a2eb',
                tension: 0.1, // Suaviza a linha caso o tipo seja 'line'
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}