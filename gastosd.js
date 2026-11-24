// gastosd.js
import { supabase } from './supabase.js';

// Carregar categorias do Supabase para o select
export async function carregarCategorias() {
    const selectCategorias = document.getElementById('gasto-type');
    if (!selectCategorias) return;

    const { data: categoriasSalvas, error } = await supabase
        .from('categorias')
        .select('*');

    if (error) {
        console.error("Erro ao carregar categorias:", error.message);
        return;
    }

    selectCategorias.innerHTML = '<option value="" disabled selected>-- Selecione uma categoria --</option>';

    // Adiciona no menu as categorias vindas da nuvem
    categoriasSalvas.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.nome;
        option.textContent = cat.nome;
        selectCategorias.appendChild(option);
    });
}

// Salvar nova categoria criada pelo usuário no Supabase
export async function adicionarCategoria(event) {
    if (event) event.preventDefault();
    const inputNovaCategoria = document.getElementById('new-category');
    
    if (!inputNovaCategoria) return;
    
    const nomeCategoria = inputNovaCategoria.value.trim();
    if (!nomeCategoria) return;

    // Verifica se já existe no banco
    const { data: existente } = await supabase
        .from('categorias')
        .select('*')
        .eq('nome', nomeCategoria)
        .single();

    if (existente) {
        alert('Você já criou uma categoria com esse nome!');
        return;
    }

    // Insere no Supabase
    const { error } = await supabase
        .from('categorias')
        .insert([{ nome: nomeCategoria }]);

    if (error) {
        alert('Erro ao criar categoria: ' + error.message);
        return;
    }

    alert(`Categoria "${nomeCategoria}" criada com sucesso!`);
    inputNovaCategoria.value = '';
    await carregarCategorias(); // Atualiza o select
}

// Salvar o gasto diário no Supabase
export async function adicionarGastoDiario(event) {
    if (event) event.preventDefault();

    const inputNome = document.getElementById('gasto-nome');
    const inputValor = document.getElementById('gasto-valor');
    const selectCategoria = document.getElementById('gasto-type');

    const nome = inputNome ? inputNome.value.trim() : '';
    const valor = parseFloat(inputValor ? inputValor.value : 0) || 0;
    const categoria = selectCategoria ? selectCategoria.value : '';

    if (!categoria) {
        alert('Crie e selecione uma categoria primeiro!');
        return;
    }

    if (valor <= 0) {
        alert('Digite um valor maior que zero!');
        return;
    }

    const novoGasto = {
        nome,
        valor,
        categoria,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Salva no Supabase
    const { error } = await supabase
        .from('gastos_diarios')
        .insert([novoGasto]);

    if (error) {
        alert('Erro ao registrar gasto: ' + error.message);
        return;
    }

    alert('Gasto registrado na nuvem!');
    
    const formGasto = document.getElementById('gasto-form');
    if (formGasto) {
        formGasto.reset();
    }
}