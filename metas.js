// metas.js
import { supabase } from './supabase.js';

// Carregar e exibir metas do Supabase
export async function carregarMetas() {
    const containerMetas = document.getElementById('lista-metas');
    if (!containerMetas) return;

    const { data: metas, error } = await supabase
        .from('metas')
        .select('*');

    if (error) {
        console.error("Erro ao carregar metas:", error.message);
        return;
    }

    containerMetas.innerHTML = '';

    if (!metas || metas.length === 0) {
        containerMetas.innerHTML = '<p>Nenhuma meta cadastrada ainda. Crie a sua primeira!</p>';
        return;
    }

    metas.forEach((meta) => {
        const percentual = Math.min(((meta.guardado / meta.objetivo) * 100), 100).toFixed(1);
        
        const cardMeta = document.createElement('div');
        cardMeta.classList.add('card-meta');
        cardMeta.innerHTML = `
            <h3>${meta.nome}</h3>
            <p>Meta: R$ ${meta.objetivo.toFixed(2)} | Guardado: R$ ${meta.guardado.toFixed(2)}</p>
            
            <div class="barra-progresso-fundo">
                <div class="barra-progresso-preenchimento" style="width: ${percentual}%;"></div>
            </div>
            <p><strong>${percentual}%</strong> concluído</p>

            <div class="acoes-meta">
                <input type="number" id="input-valor-${meta.id}" placeholder="R$ Adicionar" step="0.01" min="0">
                <button class="btn-add-valor" data-id="${meta.id}">Guardar</button>
                <button class="btn-deletar" data-id="${meta.id}">Excluir</button>
            </div>
        `;

        containerMetas.appendChild(cardMeta);
    });

    // Reconecta os eventos após renderizar os cards na tela
    conectarEventosCards();
}

// Adicionar nova meta no Supabase
export async function adicionarMeta(event) {
    if (event) event.preventDefault();

    const inputNome = document.getElementById('meta-nome');
    const inputObjetivo = document.getElementById('meta-objetivo');

    const nome = inputNome ? inputNome.value.trim() : '';
    const objetivo = inputObjetivo ? parseFloat(inputObjetivo.value) || 0 : 0;

    if (!nome || objetivo <= 0) return;

    const { error } = await supabase
        .from('metas')
        .insert([{ nome, objetivo, guardado: 0 }]);

    if (error) {
        alert('Erro ao criar meta: ' + error.message);
        return;
    }

    const formMeta = document.getElementById('form-meta');
    if (formMeta) formMeta.reset();
    
    await carregarMetas();
}

// Eventos de adicionar e excluir valor usando o ID do banco
export function conectarEventosCards() {
    // Botão de Adicionar Valor
    document.querySelectorAll('.btn-add-valor').forEach(botao => {
        botao.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            const inputValor = document.getElementById(`input-valor-${id}`);
            const valorParaGuardar = parseFloat(inputValor ? inputValor.value : 0) || 0;

            if (valorParaGuardar > 0) {
                // 1. Busca o valor guardado atual da meta no Supabase
                const { data: metaAtual, error: erroBusca } = await supabase
                    .from('metas')
                    .select('guardado')
                    .eq('id', id)
                    .single();

                if (erroBusca) {
                    alert('Erro ao localizar meta.');
                    return;
                }

                const novoTotalGuardado = (metaAtual.guardado || 0) + valorParaGuardar;

                // 2. Atualiza no Supabase
                const { error: erroUpdate } = await supabase
                    .from('metas')
                    .update({ guardado: novoTotalGuardado })
                    .eq('id', id);

                if (erroUpdate) {
                    alert('Erro ao atualizar valor guardado: ' + erroUpdate.message);
                    return;
                }

                await carregarMetas();
            }
        });
    });

    // Botão de Excluir Meta
    document.querySelectorAll('.btn-deletar').forEach(botao => {
        botao.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');

            if (!confirm("Deseja realmente excluir esta meta?")) return;

            const { error } = await supabase
                .from('metas')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Erro ao excluir meta: ' + error.message);
                return;
            }

            await carregarMetas();
        });
    });
}